'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useClasses } from '@/hooks/useClasses';
import { useAttendance } from '@/hooks/useAttendance';
import { logError } from '@/lib/error-handler';
import { useGuruStats } from '@/hooks/useGuruStats';
import { useGuruMaterials } from '@/hooks/useGuruMaterials';
import { useGuruAssignments } from '@/hooks/useGuruAssignments';
import { useGuruUI } from '@/hooks/useGuruUI';
import type { TeacherProfile, PortfolioStats } from '@/types';

// ========================================================
// HOOK
// ========================================================
export function useGuruDashboard() {
    const router = useRouter();

    // End of Session handling
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    // Auth & Classes Hooks
    const { user, loading: authLoading } = useAuth('guru');
    const {
        classes,
        selectedClassId,
        setSelectedClassId,
        loading: classesLoading,
        refetch: refetchClasses,
        createClass,
        updateClass,
        deleteClass
    } = useClasses(user?.id);

    // UI Hook (Separated State)
    const ui = useGuruUI();

    // Atomic Data Hooks (TanStack Query)
    const { 
        students, 
        stats, 
        pagination: statsPagination,
        loading: statsLoading, 
        refetch: refetchStats 
    } = useGuruStats({ classId: selectedClassId, page: ui.statsPage, pageSize: 50 });

    const { 
        materials, 
        pagination: materialsPagination,
        loading: materialsLoading, 
        refetch: refetchMaterials 
    } = useGuruMaterials({ classId: selectedClassId, page: ui.materialsPage, pageSize: 50 });

    const { 
        assignments, 
        pagination: assignmentsPagination,
        loading: assignmentsLoading, 
        refetch: refetchAssignments 
    } = useGuruAssignments({ classId: selectedClassId, page: ui.assignmentsPage, pageSize: 50 });

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
    // DATA STATE (Still here for now as they involve fetching)
    // ========================================================
    const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
    const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({ total_students: 0, total_classes: 0 });
    const [teacherName, setTeacherName] = useState('Guru');

    const loading = authLoading || classesLoading || statsLoading || materialsLoading || assignmentsLoading;

    // ========================================================
    // MANUAL FETCHING (Portfolio Only)
    // ========================================================
    const fetchTeacherPortfolio = useCallback(async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) return;

            setTeacherName(authUser.user_metadata?.full_name || 'Guru');

            const { data: profile } = await supabase.from('teacher_profiles').select('*').eq('id', authUser.id).maybeSingle();
            setTeacherProfile(profile || { id: authUser.id, teaching_experience: '', education_history: '', achievements: '' });

            const { data: statsData } = await supabase.from('teacher_stats').select('*').eq('teacher_id', authUser.id).maybeSingle();
            if (statsData) setPortfolioStats({ total_students: statsData.total_students, total_classes: statsData.total_classes });
        } catch (error) {
            logError(error, 'useGuruDashboard.fetchTeacherPortfolio');
        }
    }, []);

    // ========================================================
    // EFFECTS
    // ========================================================
    useEffect(() => {
        if (user?.full_name) {
            setTeacherName(user.full_name);
        }
    }, [user]);

    useEffect(() => {
        if (!selectedClassId) return;

        let debounceTimeout: NodeJS.Timeout | null = null;
        const debouncedRefetchAll = () => {
             if (debounceTimeout) clearTimeout(debounceTimeout);
             debounceTimeout = setTimeout(() => {
                 refetchMaterials();
                 refetchAssignments();
                 refetchAttendance();
                 refetchStats();
             }, 2000);
        };

        const classChannel = supabase
            .channel(`class_sync_${selectedClassId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance', filter: `class_id=eq.${selectedClassId}` }, debouncedRefetchAll)
            .subscribe();

        return () => {
            if (debounceTimeout) clearTimeout(debounceTimeout);
            supabase.removeChannel(classChannel);
        };
    }, [selectedClassId, refetchMaterials, refetchAssignments, refetchAttendance, refetchStats]);

    useEffect(() => {
        if (ui.activeTab === 'portofolio') {
            fetchTeacherPortfolio();
        }
    }, [ui.activeTab, fetchTeacherPortfolio]);

    useEffect(() => {
        if (!attendanceSession?.id) return;

        const channel = supabase
            .channel(`attendance_records_${attendanceSession.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_records', filter: `attendance_id=eq.${attendanceSession.id}` }, () => refetchAttendance())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [attendanceSession?.id, refetchAttendance]);

    // ========================================================
    // ACTIONS
    // ========================================================
    const handleCreateClass = async () => {
        if (!ui.newClassName.trim()) {
            toast.warning('Nama kelas wajib diisi!');
            return;
        }
        const success = await createClass(ui.newClassName);
        if (success) {
            toast.success('Kelas berhasil dibuat!');
            ui.setNewClassName('');
            ui.setShowClassModal(false);
            ui.setActiveTab('dashboard');
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

    // ========================================================
    // RETURN
    // ========================================================
    return {
        // Auth & Loading
        user,
        loading,

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
        
        // Pagination
        statsPagination,
        materialsPagination,
        assignmentsPagination,

        // UI Exposed State & Setters (Proxy from UI Hook)
        ...ui,

        // Portfolio
        teacherName,
        teacherProfile,
        portfolioStats,
        setTeacherProfile,

        // Actions
        handleCreateClass,
        handleToggleAttendance,
        handleLogout,
        fetchMaterials: refetchMaterials,
        fetchAssignments: refetchAssignments,
        fetchStudents: refetchStats,
    };
}
