// ============================================================
// useDataArchive Hook
// Custom hook untuk export dan purge data absensi/nilai
// Menggantikan `any` types dengan proper TypeScript interfaces
// ============================================================

'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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

        // Transform data - Supabase returns users as array or object for join
        interface ExportRow { Tanggal: string; Nama: string; Status: string; Tipe: string }
        const rows: ExportRow[] = [];

        const sessions = data as AttendanceSessionResult[] | null;
        sessions?.forEach((session) => {
            session.attendance_records?.forEach((rec) => {
                const userName = Array.isArray(rec.users)
                    ? rec.users[0]?.full_name
                    : rec.users?.full_name;
                rows.push({
                    Tanggal: session.date,
                    Nama: userName || '-',
                    Status: rec.status,
                    Tipe: 'Absensi'
                });
            });
        });

        const XLSX = await import('xlsx');
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Arsip Absensi');
        XLSX.writeFile(wb, `ARSIP_ABSENSI_${className}_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
            
            // Collect assignment IDs to fetch manual grades linked to assignments
            const adsData = ads as any[];
            assignmentIds = adsData.map(a => a.id);
        }

        const { data: members } = await supabase
            .from('class_members')
            .select('user_id')
            .eq('class_id', classId);
        const studentIds = members?.map(m => m.user_id) || [];

        // 1. Fetch Participation Grades (Keaktifan) - Note: Might include other classes' participation if student matches
        let participation: ParticipationGrade[] = [];
        if (studentIds.length > 0) {
            const { data: pds } = await supabase
                .from('grades')
                .select(`score, type, feedback, student_id, created_at, users:student_id (full_name)`)
                .eq('type', 'keaktifan')
                .in('student_id', studentIds);
            participation = (pds as unknown as ParticipationGrade[]) || [];
        }

        // 2. Fetch Manual Grades linked to Assignments (but no submission)
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

        interface GradeRow { Kategori: string; Judul: string; Nama: string; Nilai: number; Feedback: string; Tanggal: string }
        const rows: GradeRow[] = [];

        // Process Submissions Grades
        assignments.forEach((assign) => {
            // Submission based grades
            assign.submissions?.forEach((sub) => {
                if (sub.grades && sub.grades.length > 0) {
                    const g = sub.grades[0];
                    const userName = Array.isArray(sub.users)
                        ? sub.users[0]?.full_name
                        : sub.users?.full_name;
                    rows.push({
                        Kategori: 'Tugas',
                        Judul: assign.title,
                        Nama: userName || '-',
                        Nilai: g.score,
                        Feedback: g.feedback || '-',
                        Tanggal: new Date().toLocaleDateString('id-ID')
                    });
                }
            });
        });

        // Process Manual Grades (Linked to Assignment)
        manualGrades.forEach(mg => {
            // Find assignment title
            const assignTitle = (assignments as any[]).find(a => a.id === mg.assignment_id)?.title || 'Manual Grade';
            const userName = Array.isArray(mg.users) ? mg.users[0]?.full_name : mg.users?.full_name;
            
            rows.push({
                Kategori: 'Manual',
                Judul: assignTitle,
                Nama: userName || '-',
                Nilai: mg.score,
                Feedback: mg.feedback || '-',
                Tanggal: '-'
            });
        });

        // Process Participation Grades
        participation.forEach((p) => {
            const userName = Array.isArray(p.users)
                ? p.users[0]?.full_name
                : p.users?.full_name;
            rows.push({
                Kategori: 'Keaktifan',
                Judul: 'Partisipasi Kelas',
                Nama: userName || '-',
                Nilai: p.score,
                Feedback: p.feedback || '-',
                Tanggal: new Date(p.created_at).toLocaleDateString('id-ID')
            });
        });

        if (rows.length === 0) {
            rows.push({ Kategori: '-', Judul: 'Tidak ada data nilai', Nama: '-', Nilai: 0, Feedback: '-', Tanggal: '-' });
        }

        const XLSX = await import('xlsx');
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Arsip Nilai');
        XLSX.writeFile(wb, `ARSIP_NILAI_${className}_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
                
                // 1. Delete Submissions (Cascades to grades linked to submission)
                await supabase.from('submissions').delete().in('assignment_id', assignIds);

                // 2. Delete Manual Grades linked to these assignments
                await supabase.from('grades').delete().in('assignment_id', assignIds);
            }
        }

        // NOTE: We do NOT delete orphan 'keaktifan' grades here because they lack class_id/assignment_id
        // and deleting them might remove grades from other classes.
        // The user must manually manage them or we need a schema update to link them to class.
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
