// ============================================================
// useManualGrade Hook
// Custom hook untuk pengelolaan nilai manual & keaktifan
// ============================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ============================================================
// TYPES
// ============================================================

export type GradeMode = 'manual' | 'keaktifan';

export interface Student {
    id: string;
    full_name: string;
    existingGrade?: number;
}

export interface GradeEntry {
    score: string;
    feedback: string;
}

export interface UseManualGradeReturn {
    students: Student[];
    grades: Record<string, GradeEntry>;
    loading: boolean;
    saving: string | null;
    updateGrade: (studentId: string, field: 'score' | 'feedback', value: string) => void;
    saveGrade: (studentId: string) => Promise<void>;
    fetchStudents: () => Promise<void>;
}

// Type for class member join query result
interface ClassMemberWithUser {
    user_id: string;
    users: {
        id: string;
        full_name: string;
    };
}

// Type for existing grade query result
interface ExistingGrade {
    student_id: string;
    score: number;
}

// Type for grade insert/update payload
interface GradePayload {
    score: number;
    feedback: string | null;
    type: GradeMode;
    student_id: string;
    assignment_id?: string;
}

// ============================================================
// HOOK IMPLEMENTATION
// ============================================================

export function useManualGrade(
    classId: string | null,
    mode: GradeMode,
    assignment?: { id: string; title: string } | null
): UseManualGradeReturn {
    const [students, setStudents] = useState<Student[]>([]);
    const [grades, setGrades] = useState<Record<string, GradeEntry>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    // Fetch students in class (with keaktifan attendance filter)
    const fetchStudents = useCallback(async () => {
        if (!classId) return;

        setLoading(true);
        try {
            // Fetch class members
            const { data: membersData, error: membersError } = await supabase
                .from('class_members')
                .select(`user_id, users!inner(id, full_name)`)
                .eq('class_id', classId);

            if (membersError) throw membersError;

            const members = membersData as unknown as ClassMemberWithUser[];
            let studentList: Student[] = (members || []).map((m) => ({
                id: m.users.id,
                full_name: m.users.full_name
            }));

            // Keaktifan mode: filter only students with today's attendance
            if (mode === 'keaktifan') {
                const today = new Date().toISOString().split('T')[0];

                const { data: sessionData } = await supabase
                    .from('attendance')
                    .select('id')
                    .eq('class_id', classId)
                    .eq('date', today)
                    .maybeSingle();

                if (!sessionData) {
                    setStudents([]);
                    setGrades({});
                    setLoading(false);
                    toast.info('Tidak ada sesi absensi hari ini.');
                    return;
                }

                const { data: attendanceRecords } = await supabase
                    .from('attendance_records')
                    .select('student_id')
                    .eq('attendance_id', sessionData.id);

                const attendedIds = (attendanceRecords || []).map(r => r.student_id);
                studentList = studentList.filter(s => attendedIds.includes(s.id));

                if (studentList.length === 0) {
                    setStudents([]);
                    setGrades({});
                    setLoading(false);
                    toast.info('Belum ada siswa yang absen hari ini.');
                    return;
                }
            }

            // Fetch existing grades
            let existingGrades: ExistingGrade[] = [];
            if (mode === 'keaktifan') {
                const { data } = await supabase
                    .from('grades')
                    .select('student_id, score')
                    .eq('type', 'keaktifan')
                    .in('student_id', studentList.map(s => s.id));
                existingGrades = (data as ExistingGrade[]) || [];
            } else if (assignment) {
                const { data } = await supabase
                    .from('grades')
                    .select('student_id, score')
                    .eq('type', 'manual')
                    .eq('assignment_id', assignment.id)
                    .in('student_id', studentList.map(s => s.id));
                existingGrades = (data as ExistingGrade[]) || [];
            }

            // Merge existing grades
            const studentsWithGrades = studentList.map(s => ({
                ...s,
                existingGrade: existingGrades.find(g => g.student_id === s.id)?.score
            }));

            setStudents(studentsWithGrades);

            // Initialize grades form
            const initialGrades: Record<string, GradeEntry> = {};
            studentsWithGrades.forEach(s => {
                initialGrades[s.id] = {
                    score: s.existingGrade?.toString() || '',
                    feedback: ''
                };
            });
            setGrades(initialGrades);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Gagal memuat daftar siswa');
        } finally {
            setLoading(false);
        }
    }, [classId, mode, assignment]);

    // Auto-fetch on mount
    useEffect(() => {
        if (classId) {
            fetchStudents();
        }
    }, [classId, fetchStudents]);

    // Update grade field
    const updateGrade = useCallback((studentId: string, field: 'score' | 'feedback', value: string) => {
        setGrades(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], [field]: value }
        }));
    }, []);

    // Save grade to database
    const saveGrade = useCallback(async (studentId: string) => {
        const gradeData = grades[studentId];
        const score = parseInt(gradeData.score);

        if (isNaN(score) || score < 0 || score > 100) {
            toast.warning('Nilai harus antara 0-100');
            return;
        }

        setSaving(studentId);
        try {
            const gradePayload: GradePayload = {
                score,
                feedback: gradeData.feedback || null,
                type: mode,
                student_id: studentId
            };

            if (mode === 'manual' && assignment) {
                gradePayload.assignment_id = assignment.id;
            }

            // Check existing grade
            let existingQuery = supabase
                .from('grades')
                .select('id')
                .eq('student_id', studentId)
                .eq('type', mode);

            if (mode === 'manual' && assignment) {
                existingQuery = existingQuery.eq('assignment_id', assignment.id);
            }

            const { data: existing } = await existingQuery.maybeSingle();

            if (existing) {
                // Update
                const { error } = await supabase
                    .from('grades')
                    .update({ score, feedback: gradeData.feedback })
                    .eq('id', existing.id);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase.from('grades').insert(gradePayload);
                if (error) throw error;
            }

            toast.success(`Nilai ${mode === 'keaktifan' ? 'keaktifan' : ''} berhasil disimpan!`);

            // Update local state
            setStudents(prev => prev.map(s =>
                s.id === studentId ? { ...s, existingGrade: score } : s
            ));
        } catch (error: unknown) {
            // Log full error details for debugging
            console.error('Error saving grade - Full error object:', JSON.stringify(error, null, 2));
            console.error('Error saving grade - Raw:', error);

            let message = 'Gagal menyimpan nilai';
            if (error && typeof error === 'object') {
                const err = error as { message?: string; details?: string; hint?: string; code?: string };
                if (err.message) message = err.message;
                if (err.details) console.error('Details:', err.details);
                if (err.hint) console.error('Hint:', err.hint);
                if (err.code) console.error('Code:', err.code);
            }
            toast.error(message);
        } finally {
            setSaving(null);
        }
    }, [grades, mode, assignment]);

    return {
        students,
        grades,
        loading,
        saving,
        updateGrade,
        saveGrade,
        fetchStudents
    };
}
