'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Helper to extract error message safely
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

interface Grade {
    id: string;
    score: number | null;
    type: 'formatif' | 'sumatif';
    feedback: string | null;
}

export interface Submission {
    id: string;
    file_url: string;
    submitted_at: string;
    student_id: string;
    users: {
        full_name: string;
    };
    grades: Grade | null;
}

export interface GradeForm {
    score: string;
    type: 'formatif' | 'sumatif';
    feedback: string;
}

interface UseSubmissionGradingReturn {
    submissions: Submission[];
    loading: boolean;
    gradeForms: Record<string, GradeForm>;
    savingGrade: string | null;
    fetchSubmissions: (assignmentId: string) => Promise<void>;
    saveGrade: (submissionId: string, assignmentId: string) => Promise<boolean>;
    updateGradeForm: (submissionId: string, field: keyof GradeForm, value: string) => void;
}

export function useSubmissionGrading(): UseSubmissionGradingReturn {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(false);
    const [gradeForms, setGradeForms] = useState<Record<string, GradeForm>>({});
    const [savingGrade, setSavingGrade] = useState<string | null>(null);

    const fetchSubmissions = useCallback(async (assignmentId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('submissions')
                .select(`
                    id,
                    file_url,
                    submitted_at,
                    student_id,
                    users (full_name),
                    grades (id, score, type, feedback)
                `)
                .eq('assignment_id', assignmentId)
                .order('submitted_at', { ascending: false });

            if (error) throw error;

            const subs = data as unknown as Submission[];
            setSubmissions(subs);

            // Initialize grade forms with existing data
            const forms: Record<string, GradeForm> = {};
            subs.forEach(sub => {
                forms[sub.id] = {
                    score: sub.grades?.score?.toString() || '',
                    type: sub.grades?.type || 'formatif',
                    feedback: sub.grades?.feedback || ''
                };
            });
            setGradeForms(forms);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            toast.error('Gagal mengambil data pengumpulan.');
        } finally {
            setLoading(false);
        }
    }, []);

    const saveGrade = useCallback(async (submissionId: string, assignmentId: string): Promise<boolean> => {
        const form = gradeForms[submissionId];
        if (!form?.score) {
            toast.warning('Nilai wajib diisi!');
            return false;
        }

        const score = parseFloat(form.score);
        if (isNaN(score) || score < 0 || score > 100) {
            toast.warning('Nilai harus antara 0 dan 100!');
            return false;
        }

        setSavingGrade(submissionId);
        try {
            const submission = submissions.find(s => s.id === submissionId);
            const existingGrade = submission?.grades;

            if (existingGrade?.id) {
                const { error } = await supabase
                    .from('grades')
                    .update({
                        score: score,
                        type: form.type,
                        feedback: form.feedback || null
                    })
                    .eq('id', existingGrade.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('grades')
                    .insert({
                        submission_id: submissionId,
                        score: score,
                        type: form.type,
                        feedback: form.feedback || null
                    });

                if (error) throw error;
            }

            toast.success('Nilai berhasil disimpan!');
            await fetchSubmissions(assignmentId);
            return true;
        } catch (error: unknown) {
            console.error('Error saving grade:', error);
            toast.error(`Gagal menyimpan nilai: ${getErrorMessage(error)}`);
            return false;
        } finally {
            setSavingGrade(null);
        }
    }, [gradeForms, submissions, fetchSubmissions]);

    const updateGradeForm = useCallback((submissionId: string, field: keyof GradeForm, value: string) => {
        setGradeForms(prev => ({
            ...prev,
            [submissionId]: {
                ...prev[submissionId],
                [field]: value
            }
        }));
    }, []);

    return {
        submissions,
        loading,
        gradeForms,
        savingGrade,
        fetchSubmissions,
        saveGrade,
        updateGradeForm
    };
}
