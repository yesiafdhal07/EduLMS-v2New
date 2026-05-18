// ============================================================
// useDataArchive Hook
// Custom hook untuk export dan purge data absensi/nilai
// Menggantikan `any` types dengan proper TypeScript interfaces
// ============================================================

'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { exportToExcel, type ExcelColumn } from '@/lib/utils/excel';

// ============================================================
// HOOK TYPES
// ============================================================

export type ArchiveType = 'attendance' | 'grades';
export type ArchiveStep = 'select' | 'confirm' | 'processing' | 'success';

export interface ArchiveStats {
    count: number;
    label: string;
}

export interface UseDataArchiveReturn {
    loading: boolean;
    step: ArchiveStep;
    stats: ArchiveStats | null;
    fetchStats: (classId: string, type: ArchiveType) => Promise<void>;
    exportAndPurge: (classId: string, className: string, type: ArchiveType) => Promise<boolean>;
    resetState: () => void;
    setStep: (step: ArchiveStep) => void;
}

// ============================================================
// DATABASE QUERY RESULT TYPES
// ============================================================

// Supabase join query types
interface AttendanceRecordWithUser {
    status: string;
    student_id: string;
    users: { full_name: string } | { full_name: string }[];
}

interface AttendanceSessionResult {
    date: string;
    attendance_records: AttendanceRecordWithUser[] | null;
}

interface SubmissionWithGrade {
    student_id: string;
    users: { full_name: string } | { full_name: string }[];
    grades: { score: number; type: string; feedback: string | null }[] | null;
}

interface AssignmentWithSubmissions {
    id: string;
    title: string;
    submissions: SubmissionWithGrade[] | null;
}

interface ParticipationGrade {
    score: number;
    type: string;
    feedback: string | null;
    student_id: string;
    created_at: string;
    users: { full_name: string } | { full_name: string }[];
}

// ============================================================
// HOOK IMPLEMENTATION
// ============================================================

export function useDataArchive(): UseDataArchiveReturn {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<ArchiveStep>('select');
    const [stats, setStats] = useState<ArchiveStats | null>(null);

    // Helper: Get subject ID untuk kelas
    const getSubjectId = async (classId: string): Promise<string | null> => {
        const { data } = await supabase
            .from('subjects')
            .select('id')
            .eq('class_id', classId)
            .single();
        return data?.id ?? null;
    };

    // Fetch statistik data sebelum archive
    const fetchStats = useCallback(async (classId: string, type: ArchiveType) => {
        setLoading(true);
        try {
            if (type === 'attendance') {
                const { count, error } = await supabase
                    .from('attendance')
                    .select('*', { count: 'exact', head: true })
                    .eq('class_id', classId);
                if (error) throw error;
                setStats({ count: count || 0, label: 'Sesi Absensi' });
            } else {
                setStats({ count: 999, label: 'Data Nilai (Estimasi)' });
            }
            setStep('confirm');
        } catch (error) {
            console.error('Fetch stats error:', error);
            toast.error('Gagal mengambil data statistik');
        } finally {
            setLoading(false);
        }
    }, []);

    // Export data absensi ke Excel
    const exportAttendance = async (classId: string, className: string) => {
        const { data, error } = await supabase
            .from('attendance')
            .select(`date, attendance_records (status, student_id, users:student_id (full_name))`)
            .eq('class_id', classId)
            .order('date', { ascending: false });

        if (error) throw error;

        const columns: ExcelColumn[] = [
            { header: 'Tanggal', key: 'date', width: 15 },
            { header: 'Nama Siswa', key: 'name', width: 30 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Tipe', key: 'type', width: 15 }
        ];

        const rows: any[] = [];
        const sessions = data as AttendanceSessionResult[] | null;
        sessions?.forEach((session) => {
            session.attendance_records?.forEach((rec) => {
                const userName = Array.isArray(rec.users)
                    ? rec.users[0]?.full_name
                    : rec.users?.full_name;
                rows.push({
                    date: session.date,
                    name: userName || '-',
                    status: rec.status.toUpperCase(),
                    type: 'Absensi'
                });
            });
        });

        await exportToExcel(
            rows, 
            columns, 
            `ARSIP_ABSENSI_${className}_${new Date().toISOString().slice(0, 10)}`,
            'Arsip Absensi'
        );
    };

    // Purge data absensi
    const purgeAttendance = async (classId: string) => {
        const { error } = await supabase
            .from('attendance')
            .delete()
            .eq('class_id', classId);
        if (error) throw error;
    };

    // Export data nilai ke Excel
    const exportGrades = async (classId: string, className: string) => {
        const subjectId = await getSubjectId(classId);

        let assignments: AssignmentWithSubmissions[] = [];
        let assignmentIds: string[] = [];
        
        if (subjectId) {
            const { data: ads, error } = await supabase
                .from('assignments')
                .select(`id, title, submissions (student_id, users:student_id (full_name), grades (score, type, feedback))`)
                .eq('subject_id', subjectId);
            if (error) throw error;
            assignments = (ads as unknown as AssignmentWithSubmissions[]) || [];
            assignmentIds = assignments.map(a => a.id);
        }

        const { data: members } = await supabase
            .from('class_members')
            .select('user_id')
            .eq('class_id', classId);
        const studentIds = members?.map(m => m.user_id) || [];

        // 1. Fetch Participation Grades (Keaktifan)
        let participation: ParticipationGrade[] = [];
        if (studentIds.length > 0) {
            const { data: pds } = await supabase
                .from('grades')
                .select(`score, type, feedback, student_id, created_at, users:student_id (full_name)`)
                .eq('type', 'keaktifan')
                .in('student_id', studentIds);
            participation = (pds as unknown as ParticipationGrade[]) || [];
        }

        // 2. Fetch Manual Grades linked to Assignments
        let manualGrades: any[] = [];
        if (assignmentIds.length > 0 && studentIds.length > 0) {
             const { data: mds } = await supabase
                .from('grades')
                .select(`score, type, feedback, student_id, assignment_id, users:student_id (full_name)`)
                .eq('type', 'manual')
                .in('assignment_id', assignmentIds)
                .in('student_id', studentIds);
             manualGrades = mds || [];
        }

        const columns: ExcelColumn[] = [
            { header: 'Kategori', key: 'category', width: 15 },
            { header: 'Judul', key: 'title', width: 30 },
            { header: 'Nama Siswa', key: 'name', width: 30 },
            { header: 'Nilai', key: 'score', width: 10 },
            { header: 'Feedback', key: 'feedback', width: 40 },
            { header: 'Tanggal', key: 'date', width: 15 }
        ];

        const rows: any[] = [];

        // Process Submissions Grades
        assignments.forEach((assign) => {
            assign.submissions?.forEach((sub) => {
                if (sub.grades && sub.grades.length > 0) {
                    const g = sub.grades[0];
                    const userName = Array.isArray(sub.users)
                        ? sub.users[0]?.full_name
                        : sub.users?.full_name;
                    rows.push({
                        category: 'Tugas',
                        title: assign.title,
                        name: userName || '-',
                        score: g.score,
                        feedback: g.feedback || '-',
                        date: new Date().toLocaleDateString('id-ID')
                    });
                }
            });
        });

        // Process Manual Grades
        manualGrades.forEach(mg => {
            const assignTitle = assignments.find(a => a.id === mg.assignment_id)?.title || 'Manual Grade';
            const userName = Array.isArray(mg.users) ? mg.users[0]?.full_name : mg.users?.full_name;
            rows.push({
                category: 'Manual',
                title: assignTitle,
                name: userName || '-',
                score: mg.score,
                feedback: mg.feedback || '-',
                date: '-'
            });
        });

        // Process Participation Grades
        participation.forEach((p) => {
            const userName = Array.isArray(p.users)
                ? p.users[0]?.full_name
                : p.users?.full_name;
            rows.push({
                category: 'Keaktifan',
                title: 'Partisipasi Kelas',
                name: userName || '-',
                score: p.score,
                feedback: p.feedback || '-',
                date: new Date(p.created_at).toLocaleDateString('id-ID')
            });
        });

        if (rows.length === 0) {
            rows.push({ category: '-', title: 'Tidak ada data nilai', name: '-', score: 0, feedback: '-', date: '-' });
        }

        await exportToExcel(
            rows, 
            columns, 
            `ARSIP_NILAI_${className}_${new Date().toISOString().slice(0, 10)}`,
            'Arsip Nilai'
        );
    };

    // Purge data nilai
    const purgeGrades = async (classId: string) => {
        const subjectId = await getSubjectId(classId);
        if (subjectId) {
            const { data: assignments } = await supabase
                .from('assignments')
                .select('id')
                .eq('subject_id', subjectId);

            if (assignments && assignments.length > 0) {
                const assignIds = assignments.map(a => a.id);
                await supabase.from('submissions').delete().in('assignment_id', assignIds);
                await supabase.from('grades').delete().in('assignment_id', assignIds);
            }
        }
    };

    // Main: Export lalu purge
    const exportAndPurge = useCallback(async (
        classId: string,
        className: string,
        type: ArchiveType
    ): Promise<boolean> => {
        setStep('processing');
        setLoading(true);

        try {
            if (type === 'attendance') {
                await exportAttendance(classId, className);
                await purgeAttendance(classId);
            } else {
                await exportGrades(classId, className);
                await purgeGrades(classId);
            }

            setStep('success');
            toast.success('Data berhasil diarsipkan dan dihapus!');
            return true;
        } catch (error) {
            console.error('Archive error:', error);
            toast.error('Gagal mengarsipkan data');
            setStep('select');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Reset state
    const resetState = useCallback(() => {
        setStep('select');
        setStats(null);
        setLoading(false);
    }, []);

    return {
        loading,
        step,
        stats,
        fetchStats,
        exportAndPurge,
        resetState,
        setStep
    };
}
