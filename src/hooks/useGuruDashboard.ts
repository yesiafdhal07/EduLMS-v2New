'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useClasses } from '@/hooks/useClasses';
import { useAttendance } from '@/hooks/useAttendance';
import { logError } from '@/lib/error-handler';
import type { TeacherProfile, Assignment, Material } from '@/types';

// ========================================================
// TYPES
// ========================================================
interface PartialSubmission {
    id: string;
    grades: { score: number }[];
}

interface DashboardStudent {
    id: string;
    name: string;
    avg: string;
    status: 'TUNTAS' | 'REMEDIAL';
    submissions: PartialSubmission[];
}

interface MemberRow {
    user_id: string;
    // Supabase join can return array OR single object depending on query
    // We need to handle both cases
    users: {
        id: string;
        full_name: string;
        submissions: { id: string; grades: { score: number }[] }[];
    } | {
        id: string;
        full_name: string;
        submissions: { id: string; grades: { score: number }[] }[];
    }[];
}

interface DashboardStats {
    avg: number;
    attendance: number;
    submissions: number;
}

interface PortfolioStats {
    total_students: number;
    total_classes: number;
}

type Tab = 'dashboard' | 'pembelajaran' | 'kuis' | 'analytics' | 'absensi' | 'portofolio' | 'trash';

// ========================================================
// HOOK
// ========================================================
export function useGuruDashboard() {
    const router = useRouter();

    // Auth & Classes Hooks
    const { user, loading: authLoading } = useAuth('guru');
    const {
        classes,
        selectedClassId,
        setSelectedClassId,
        students: hookStudents,
        subject: hookSubject,
        loading: classesLoading,
        refetch: refetchClasses,
        createClass,
        updateClass,
        deleteClass
    } = useClasses(user?.id);

    const {
        session: attendanceSession,
        isOpen: isAttendanceOpen,
        logs: attendanceLogs,
        checkedInIds,
        pendingRecords,
        processing: processingAttendance,
        toggle: toggleAttendanceHook,
        refetch: refetchAttendance,
        setStudentStatus,
        approveCheckIn,
        rejectCheckIn
    } = useAttendance(selectedClassId);

    // ========================================================
    // UI STATE
    // ========================================================
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [stats, setStats] = useState<DashboardStats>({ avg: 0, attendance: 0, submissions: 0 });

    // Data State
    const [materials, setMaterials] = useState<Material[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [students, setStudents] = useState<DashboardStudent[]>([]);

    // Portfolio State
    const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
    const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({ total_students: 0, total_classes: 0 });
    const [teacherName, setTeacherName] = useState('Guru');
    const [teacherSubjectId, setTeacherSubjectId] = useState<string | null>(null);

    // Loading & Error
    const [localLoading, setLocalLoading] = useState(false);
    const [dashboardError, setDashboardError] = useState<string | null>(null);

    // Modal States
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [showClassModal, setShowClassModal] = useState(false);
    const [showManualGradeModal, setShowManualGradeModal] = useState(false);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [manualGradeAssignment, setManualGradeAssignment] = useState<Assignment | null>(null);

    // Form State
    const [newClassName, setNewClassName] = useState('');

    const loading = authLoading || classesLoading;

    // Ref to track if initial load is done (prevents double-fetch)
    const initialLoadDone = useRef(false);
    const lastFetchedClassId = useRef<string | null>(null);

    // ========================================================
    // DATA FETCHING
    // ========================================================
    const fetchDashboardData = useCallback(async () => {
        try {
            setLocalLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            if (!classes || classes.length === 0) {
                setLocalLoading(false);
                return;
            }

            const targetClassId = selectedClassId || classes[0].id;
            setTeacherSubjectId(hookSubject?.id || null);

            // Parallel queries
            // Parallel queries with 15s timeout
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout - Check connection')), 15000));

            const queriesPromise = Promise.all([
                supabase.from('users').select('full_name').eq('id', user.id).maybeSingle(),
                supabase
                    .from('class_members')
                    .select(`user_id, users!inner (id, full_name, submissions(id, grades(score)))`)
                    .eq('class_id', targetClassId)
                    .limit(100), // Pagination: limit to 100 students per class
                supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('class_id', targetClassId)
            ]);

            const [teacherResult, membersResult, attendanceResult] = await Promise.race([queriesPromise, timeoutPromise]) as [any, any, any];

            // Robust Error Handling for each query
            if (teacherResult.error) {
                console.warn('Error fetching teacher profile:', teacherResult.error);
                // Non-critical, continue
            }

            if (membersResult.error) {
                throw new Error(`Gagal memuat data siswa: ${membersResult.error.message}`);
            }

            if (attendanceResult.error) {
                console.warn('Error fetching attendance count:', attendanceResult.error);
                // Non-critical, continue with 0
            }

            if (teacherResult.data) setTeacherName(teacherResult.data.full_name);

            const processedStudents: DashboardStudent[] = (membersResult.data || [])
                .filter((m: MemberRow) => {
                    // Handle both array and object cases from Supabase join
                    if (Array.isArray(m.users)) {
                        return m.users.length > 0;
                    }
                    return m.users != null;
                })
                .map((m: MemberRow) => {
                    // Handle both array and object cases
                    const s = Array.isArray(m.users) ? m.users[0] : m.users;
                    const submissions = s.submissions || [];
                    const totalScore = submissions.reduce((acc, sub) => acc + (sub.grades?.[0]?.score || 0), 0);
                    const avg = submissions.length > 0 ? totalScore / submissions.length : 0;
                    return {
                        id: s.id,
                        name: s.full_name,
                        avg: avg.toFixed(1),
                        status: avg >= 75 ? 'TUNTAS' as const : 'REMEDIAL' as const,
                        submissions
                    };
                });

            setStudents(processedStudents);

            const totalAvg = processedStudents.length > 0
                ? processedStudents.reduce((acc, s) => acc + parseFloat(s.avg), 0) / processedStudents.length
                : 0;

            setStats({
                avg: parseFloat(totalAvg.toFixed(1)),
                attendance: Math.min(100, Math.round((attendanceResult.count || 0) / (processedStudents.length || 1) * 100)),
                submissions: processedStudents.reduce((acc, s) => acc + (s.submissions?.length || 0), 0)
            });
        } catch (error: unknown) {
            console.error('[useGuruDashboard] Fetch Error:', error);

            // Handle Auth Errors (Invalid Session)
            const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
            if (errorMsg.includes('Refresh Token') || errorMsg.includes('JWT')) {
                toast.error('Sesi berakhir. Silakan login kembali.');
                await supabase.auth.signOut();
                router.push('/login');
                return;
            }

            // Ensure we don't set [object Object] as error message
            setDashboardError(error instanceof Error ? error.message : 'Gagal memuat data dashboard.');
            // Do NOT throw here, just handle internal UI state
        } finally {
            setLocalLoading(false);
        }
    }, [classes, selectedClassId, hookSubject]);

    const fetchTeacherPortfolio = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase.from('teacher_profiles').select('*').eq('id', user.id).maybeSingle();
            setTeacherProfile(profile || { id: user.id, teaching_experience: '', education_history: '', achievements: '' });

            const { data: statsData } = await supabase.from('teacher_stats').select('*').eq('teacher_id', user.id).maybeSingle();
            if (statsData) setPortfolioStats({ total_students: statsData.total_students, total_classes: statsData.total_classes });
        } catch (error) {
            logError(error, 'useGuruDashboard.fetchTeacherPortfolio');
        }
    }, []);

    const fetchAssignments = useCallback(async () => {
        if (!selectedClassId) return;
        const { data } = await supabase
            .from('assignments')
            .select('*, subjects!inner(class_id)')
            .eq('subjects.class_id', selectedClassId)
            .is('deleted_at', null)
            .order('deadline', { ascending: false })
            .limit(50); // Pagination: limit to 50 assignments
        setAssignments(data || []);
    }, [selectedClassId]);

    const fetchMaterials = useCallback(async () => {
        if (!selectedClassId) return;
        const { data } = await supabase
            .from('materials')
            .select(`*, subjects!inner(class_id)`)
            .eq('subjects.class_id', selectedClassId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(50); // Pagination: limit to 50 materials
        setMaterials(data || []);
    }, [selectedClassId]);

    // ========================================================
    // EFFECTS
    // ========================================================
    useEffect(() => {
        if (!selectedClassId) return;

        // Skip if we already fetched this class (prevents duplicate fetches)
        if (lastFetchedClassId.current === selectedClassId && initialLoadDone.current) {
            return;
        }

        // Mark as fetched
        lastFetchedClassId.current = selectedClassId;
        initialLoadDone.current = true;

        // Use a small delay to batch rapid class switches
        const timeoutId = setTimeout(() => {
            fetchDashboardData();
            fetchMaterials();
            fetchAssignments();
            refetchAttendance();
        }, 100);

        // Debounce realtime refetches to prevent storm (5 second delay)
        let debounceTimeout: NodeJS.Timeout | null = null;
        const debouncedMaterials = () => {
            if (debounceTimeout) clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => fetchMaterials(), 5000);
        };
        const debouncedAssignments = () => {
            if (debounceTimeout) clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => fetchAssignments(), 5000);
        };
        const debouncedAttendance = () => {
            if (debounceTimeout) clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => refetchAttendance(), 5000);
        };

        // Set up realtime subscription (only subscribe once per class)
        const classChannel = supabase
            .channel(`class_sync_${selectedClassId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'materials' }, debouncedMaterials)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, debouncedAssignments)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance', filter: `class_id=eq.${selectedClassId}` }, debouncedAttendance)
            .subscribe();

        return () => {
            clearTimeout(timeoutId);
            if (debounceTimeout) clearTimeout(debounceTimeout);
            supabase.removeChannel(classChannel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClassId]); // Intentionally minimal dependencies to prevent excessive re-runs

    useEffect(() => {
        if (activeTab === 'portofolio') {
            fetchTeacherPortfolio();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]); // fetchTeacherPortfolio is stable (useCallback with [])

    useEffect(() => {
        if (!attendanceSession?.id) return;

        const channel = supabase
            .channel(`attendance_records_${attendanceSession.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_records', filter: `attendance_id=eq.${attendanceSession.id}` }, () => refetchAttendance())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attendanceSession?.id]); // refetchAttendance is from useAttendance hook, stable

    // ========================================================
    // ACTIONS
    // ========================================================
    const handleCreateClass = async () => {
        if (!newClassName.trim()) {
            toast.warning('Nama kelas wajib diisi!');
            return;
        }
        const success = await createClass(newClassName);
        if (success) {
            toast.success('Kelas berhasil dibuat!');
            setNewClassName('');
            setShowClassModal(false);
            setActiveTab('dashboard');
        } else {
            toast.error('Gagal membuat kelas.');
        }
    };

    const handleToggleAttendance = async (type: 'manual' | 'qr_code' = 'manual') => {
        const willBeOpen = !attendanceSession?.is_open;
        try {
            await toggleAttendanceHook(type);
            toast.success(`Sesi Absensi Berhasil ${willBeOpen ? 'DIBUKA' : 'DITUTUP'}`);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            toast.error(`Gagal Toggle Absensi: ${message}`);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    // ========================================================
    // RETURN
    // ========================================================
    return {
        // Auth & Loading
        user,
        loading,
        localLoading,
        dashboardError,

        // Classes
        classes,
        selectedClassId,
        setSelectedClassId,
        refetchClasses,
        createClass,
        updateClass,
        deleteClass,

        // Attendance
        attendanceSession,
        isAttendanceOpen,
        attendanceLogs,
        checkedInIds,
        pendingRecords,
        processingAttendance,
        setStudentStatus,
        approveCheckIn,
        rejectCheckIn,

        // Data
        students,
        materials,
        assignments,
        stats,
        teacherName,
        teacherSubjectId,
        teacherProfile,
        portfolioStats,
        setTeacherProfile,

        // Tab
        activeTab,
        setActiveTab,

        // Modals
        showMaterialModal,
        setShowMaterialModal,
        showAssignmentModal,
        setShowAssignmentModal,
        showSubmissionModal,
        setShowSubmissionModal,
        selectedAssignment,
        setSelectedAssignment,
        showClassModal,
        setShowClassModal,
        showManualGradeModal,
        setShowManualGradeModal,
        showArchiveModal,
        setShowArchiveModal,
        manualGradeAssignment,
        setManualGradeAssignment,

        // Form
        newClassName,
        setNewClassName,

        // Actions
        handleCreateClass,
        handleToggleAttendance,
        handleLogout,
        fetchMaterials,
        fetchAssignments,
    };
}
