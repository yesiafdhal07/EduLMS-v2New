'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { logError } from '@/lib/error-handler';
import type { Assignment, Material, AttendanceSession, AttendanceRecord, StudentAssignment, StudentUser } from '@/types';

// ========================================================
// TYPES
// ========================================================
interface KeaktifanGrade {
    score: number;
    feedback?: string;
}

type Tab = 'dashboard' | 'pembelajaran' | 'kuis' | 'absensi' | 'profil' | 'analytics';

// ========================================================
// HELPER
// ========================================================
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

// ========================================================
// HOOK
// ========================================================
export function useSiswaDashboard() {
    const router = useRouter();

    // ========================================================
    // STATE
    // ========================================================
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [attendanceSession, setAttendanceSession] = useState<AttendanceSession | null>(null);
    const [attendanceRecord, setAttendanceRecord] = useState<AttendanceRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<string | null>(null);
    const [user, setUser] = useState<StudentUser | null>(null);
    const [keaktifanGrades, setKeaktifanGrades] = useState<KeaktifanGrade[]>([]);
    const [showExportModal, setShowExportModal] = useState(false);
    const [studentClassId, setStudentClassId] = useState<string | null>(null); // NEW: For filtered subscriptions

    // ========================================================
    // DATA FETCHING
    // ========================================================
    const fetchInitialData = useCallback(async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) {
                router.push('/login');
                return;
            }

            // Security check - verify role from DB
            const { data: dbUser, error: dbError } = await supabase
                .from('users')
                .select('role')
                .eq('id', authUser.id)
                .single();

            if (dbError || dbUser?.role !== 'siswa') {
                if (dbUser?.role === 'guru') {
                    toast.info('Mengalihkan ke Dashboard Guru...');
                    router.push('/guru');
                } else {
                    await supabase.auth.signOut();
                    router.push('/login');
                }
                return;
            }

            setUser({
                id: authUser.id,
                email: authUser.email || '',
                role: dbUser.role,
                full_name: authUser.user_metadata?.full_name
            });

            // Fetch class membership
            const { data: classMemberData, error: classError } = await supabase
                .from('class_members')
                .select(`class_id, classes (name)`)
                .eq('user_id', authUser.id)
                .single();

            if (classError || !classMemberData) {
                console.warn('Student not enrolled in any class');
                setLoading(false);
                return;
            }

            const classId = classMemberData.class_id;
            const className = (classMemberData.classes as { name?: string })?.name;

            // Store classId for filtered real-time subscriptions
            setStudentClassId(classId);

            // Parallel fetch
            const [assignResult, matResult, sessResult, keaktifanResult] = await Promise.all([
                // Assignments
                supabase
                    .from('assignments')
                    .select(`id, title, deadline, required_format, submissions(id, file_url, submitted_at, grades(id, score, type, feedback)), subjects!inner(class_id)`)
                    .eq('subjects.class_id', classId)
                    .order('deadline', { ascending: true }),
                // Materials
                supabase
                    .from('materials')
                    .select(`*, subjects!inner(class_id)`)
                    .eq('subjects.class_id', classId),
                // Today's attendance
                supabase
                    .from('attendance')
                    .select('*')
                    .eq('date', new Date().toISOString().split('T')[0])
                    .eq('class_id', classId)
                    .maybeSingle(),
                // Keaktifan grades
                supabase
                    .from('grades')
                    .select('score, feedback')
                    .eq('type', 'keaktifan')
                    .eq('student_id', authUser.id)
            ]);

            setAssignments((assignResult.data || []) as unknown as StudentAssignment[]);
            setMaterials((matResult.data || []) as Material[]);
            setAttendanceSession(sessResult.data as AttendanceSession | null);
            setKeaktifanGrades((keaktifanResult.data || []) as KeaktifanGrade[]);

            // Fetch attendance record if session exists
            if (sessResult.data) {
                const { data: recData } = await supabase
                    .from('attendance_records')
                    .select('*')
                    .eq('attendance_id', sessResult.data.id)
                    .eq('student_id', authUser.id)
                    .maybeSingle();
                setAttendanceRecord(recData as AttendanceRecord | null);
            }

            setUser(prev => prev ? ({ ...prev, className }) : null);
        } catch (error) {
            logError(error, 'useSiswaDashboard.fetchInitialData');
        } finally {
            setLoading(false);
        }
    }, [router]);

    // ========================================================
    // EFFECTS
    // ========================================================

    // Initial data fetch (runs once on mount)
    useEffect(() => {
        fetchInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty deps - run ONCE on mount. fetchInitialData is stable (useCallback with [router])

    // Real-time subscriptions (only after classId is known)
    // Uses debouncing to prevent rapid refetches from multiple events
    useEffect(() => {
        // CRITICAL: Only subscribe AFTER we know the student's class
        if (!studentClassId) return;

        // Debounce refetch to prevent storm (5 second delay)
        let debounceTimeout: NodeJS.Timeout | null = null;
        const debouncedRefetch = () => {
            if (debounceTimeout) clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                fetchInitialData();
            }, 5000); // 5 second debounce
        };

        const channel = supabase
            .channel(`student_sync_${studentClassId}`)
            // FILTERED subscriptions - Only react to changes in THIS student's class
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'attendance',
                filter: `class_id=eq.${studentClassId}`
            }, debouncedRefetch)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'attendance_records'
            }, debouncedRefetch)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'submissions'
            }, debouncedRefetch)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'materials'
            }, debouncedRefetch)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'assignments'
            }, debouncedRefetch)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'grades'
            }, debouncedRefetch)
            .subscribe();

        return () => {
            if (debounceTimeout) clearTimeout(debounceTimeout);
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentClassId]); // Only re-subscribe when classId changes. fetchInitialData is stable.

    // ========================================================
    // ACTIONS
    // ========================================================
    const handleCheckIn = async () => {
        if (!attendanceSession || !attendanceSession.is_open) return;

        try {
            const { data, error } = await supabase.from('attendance_records').upsert({
                attendance_id: attendanceSession.id,
                student_id: user?.id,
                status: 'hadir',
                recorded_at: new Date().toISOString()
            }).select().single();

            if (error) throw error;
            setAttendanceRecord(data);
            toast.success('Berhasil! Kehadiran Anda hari ini telah dicatat.');
        } catch (error: unknown) {
            toast.error(`Gagal Absen: ${getErrorMessage(error)}`);
        }
    };

    const handleUpload = async (assignmentId: string, event: React.ChangeEvent<HTMLInputElement>, format: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const ext = file.name.split('.').pop()?.toLowerCase();
        if (format !== 'ANY' && ext !== format.toLowerCase()) {
            toast.warning(`Format salah! Guru mewajibkan file .${format}`);
            return;
        }

        setUploading(assignmentId);
        try {
            const fileName = `${user?.id}/${assignmentId}-${Date.now()}.${ext}`;
            const { error } = await supabase.storage.from('assignments').upload(fileName, file);
            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage.from('assignments').getPublicUrl(fileName);
            await supabase.from('submissions').upsert({
                assignment_id: assignmentId,
                student_id: user?.id,
                file_url: publicUrl,
                submitted_at: new Date().toISOString()
            });

            toast.success('Tugas berhasil dikirim!');
            fetchInitialData();
        } catch (error: unknown) {
            toast.error(`Gagal: ${getErrorMessage(error)}`);
        } finally {
            setUploading(null);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    // ========================================================
    // COMPUTED
    // ========================================================
    const progressData = assignments
        .filter(a => a.submissions?.[0]?.grades?.score !== undefined && a.submissions?.[0]?.grades?.score !== null)
        .map((a, idx) => ({
            week: `Tugas ${idx + 1}`,
            nilai: a.submissions?.[0]?.grades?.score || 0,
            target: 75
        }));

    // ========================================================
    // RETURN
    // ========================================================
    return {
        // State
        activeTab,
        setActiveTab,
        user,
        loading,
        uploading,

        // Data
        assignments,
        materials,
        attendanceSession,
        attendanceRecord,
        keaktifanGrades,
        progressData,
        studentClassId,

        // Modal
        showExportModal,
        setShowExportModal,

        // Actions
        handleCheckIn,
        handleUpload,
        handleLogout,
    };
}
