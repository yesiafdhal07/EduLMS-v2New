'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { logError } from '@/lib/error-handler';
import { triggerXPEffect } from '@/components/widgets/XPFlowParticles';
import type { Assignment, Material, AttendanceSession, AttendanceRecord, StudentAssignment, StudentUser } from '@/types';

// ========================================================
// TYPES
// ========================================================
interface KeaktifanGrade {
    score: number;
    feedback?: string;
}

type Tab = 'dashboard' | 'pembelajaran' | 'kuis' | 'absensi' | 'profil' | 'analytics' | 'diskusi' | 'prestasi';

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

    // Gamification State
    const [currentXP, setCurrentXP] = useState(0);
    const [level, setLevel] = useState(1);
    const nextLevelXP = level * 100;

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
                const roleRoutes: Record<string, string> = {
                    admin: '/admin',
                    kepala_sekolah: '/kepala-sekolah',
                    guru: '/guru',
                };
                const redirect = roleRoutes[dbUser?.role || ''];
                if (redirect) {
                    toast.info('Mengalihkan ke dashboard Anda...');
                    router.push(redirect);
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
                .select(`class_id, classes!inner(name, deleted_at)`)
                .eq('user_id', authUser.id)
                .is('classes.deleted_at', null)
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
            const [assignResult, matResult, sessResult, keaktifanResult, pointsResult] = await Promise.all([
                // Assignments
                supabase
                    .from('assignments')
                    .select(`id, title, deadline, required_format, submissions(id, file_url, submitted_at, grades(id, score, type, feedback)), subjects!inner(class_id)`)
                    .eq('subjects.class_id', classId)
                    .order('deadline', { ascending: true })
                    .limit(50),
                // Materials
                supabase
                    .from('materials')
                    .select(`*, subjects!inner(class_id)`)
                    .eq('subjects.class_id', classId)
                    .limit(50),
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
                    .eq('student_id', authUser.id),
                // User points
                supabase
                    .from('user_points')
                    .select('total_points, level')
                    .eq('user_id', authUser.id)
                    .maybeSingle()
            ]);

            setAssignments((assignResult.data || []) as unknown as StudentAssignment[]);
            setMaterials((matResult.data || []) as Material[]);
            setAttendanceSession(sessResult.data as AttendanceSession | null);
            setKeaktifanGrades((keaktifanResult.data || []) as KeaktifanGrade[]);
            
            if (pointsResult.data) {
                setCurrentXP(pointsResult.data.total_points);
                setLevel(pointsResult.data.level);
            } else {
                setCurrentXP(0);
                setLevel(1);
            }

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
            .channel(`student_sync_${studentClassId}_${user?.id}`)
            // FILTERED subscriptions
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'attendance',
                filter: `class_id=eq.${studentClassId}`
            }, debouncedRefetch)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'attendance_records',
                filter: `student_id=eq.${user?.id}`
            }, debouncedRefetch)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'submissions',
                filter: `student_id=eq.${user?.id}`
            }, debouncedRefetch)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'grades',
                filter: `student_id=eq.${user?.id}`
            }, debouncedRefetch)
            .subscribe();

        return () => {
            if (debounceTimeout) clearTimeout(debounceTimeout);
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentClassId, user?.id]); // Only re-subscribe when classId or userId changes.

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
            
            // Sprint 4: XP Reward
            void gainXPLocal(20, 'Absensi Harian');
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
            
            // Sprint 4: XP Reward
            void gainXPLocal(50, 'Pengumpulan Tugas');
            
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
        .filter(a => {
            const gradeObj = a.submissions?.[0]?.grades as unknown as { score: number | null } | { score: number | null }[];
            const score = Array.isArray(gradeObj) ? gradeObj[0]?.score : gradeObj?.score;
            return score !== undefined && score !== null;
        })
        .map((a, idx) => {
            const gradeObj = a.submissions?.[0]?.grades as unknown as { score: number | null } | { score: number | null }[];
            const score = Array.isArray(gradeObj) ? gradeObj[0]?.score : gradeObj?.score;
            return {
                week: `Tugas ${idx + 1}`,
                nilai: score || 0,
                target: 75
            };
        });

    // ========================================================
    // GAMIFICATION ACTIONS (Sprint 4)
    // ========================================================
    const gainXPLocal = async (points: number, reason: string) => {
        if (!user) return;
        
        const newXP = currentXP + points;
        const newLevel = Math.max(1, Math.floor(newXP / 100) + 1);
        
        setCurrentXP(newXP);
        triggerXPEffect(points);
        
        // Simulating DB update for zero-cost immediate feedback
        if (newLevel > level) {
            setLevel(newLevel);
            toast.success(`🎉 LEVEL UP! Kamu sekarang Level ${newLevel}!`, {
                description: `Selamat! Kamu mendapatkan ${points} XP dari ${reason}.`,
                duration: 5000,
            });
        } else {
            toast.success(`+${points} XP Diperoleh!`, {
                description: `Dari ${reason}`,
            });
        }

        // Real DB update via RPC (if exists)
        try {
            await supabase.rpc('add_points', {
                p_user_id: user.id,
                p_points: points,
                p_source: 'activity',
                p_description: reason
            });
        } catch (e) {
            console.warn('DB Points update failed, using local state only', e);
        }
    };

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
        currentXP,
        level,
        nextLevelXP,

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
        gainXPLocal,
    };
}
