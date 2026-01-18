'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { AttendanceSession, AttendanceLogs } from '@/types';

// Local type for database row returned from attendance_records query
interface AttendanceRecordRow {
    student_id: string;
    status: 'hadir' | 'izin' | 'sakit' | 'alpa';
    is_verified: boolean;
    recorded_at: string;
}

// Query keys for React Query
export const attendanceKeys = {
    all: ['attendance'] as const,
    session: (classId: string, date: string) => [...attendanceKeys.all, 'session', classId, date] as const,
    logs: (attendanceId: string) => [...attendanceKeys.all, 'logs', attendanceId] as const,
};

// Fetch functions
async function fetchSession(classId: string): Promise<AttendanceSession | null> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', classId)
        .eq('date', today)
        .maybeSingle();

    if (error) throw error;
    return data;
}

async function fetchLogs(attendanceId: string): Promise<{
    logs: AttendanceLogs;
    checkedInIds: string[];
    pendingRecords: { studentId: string; status: string; timestamp: string }[]
}> {
    const { data, error } = await supabase
        .from('attendance_records')
        .select('student_id, status, is_verified, recorded_at')
        .eq('attendance_id', attendanceId);

    if (error) throw error;

    const counts: AttendanceLogs = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
    const ids: string[] = [];
    const pending: { studentId: string; status: string; timestamp: string }[] = [];

    (data as AttendanceRecordRow[])?.forEach((record) => {
        // Count only verified records (or consider unverified as not-counted yet? 
        // Typically unverified = not official count yet. But checkedInIds usually means "attempted").
        // Let's count them but mark as pending? 
        // Actually, if approval is needed, they shouldn't be counted in "Hadir" stat yet 
        // OR they are counted but marked pending.
        // Let's assume unverified are NOT counted in logs yet to avoid confusion.

        if (record.is_verified) {
            if (record.status in counts) {
                counts[record.status as keyof AttendanceLogs]++;
            }
            ids.push(record.student_id);
        } else {
            // Pending records
            pending.push({
                studentId: record.student_id,
                status: record.status,
                timestamp: record.recorded_at
            });
            // We ALSo add them to checkedInIds so they don't appear in "Missing Students" list?
            // If we don't add them, they appear as "Missing". 
            // If they appear as Missing, teacher might try to Manual Mark them.
            // Better to exclude them from Missing list if they have a pending record.
            ids.push(record.student_id);
        }
    });

    return { logs: counts, checkedInIds: ids, pendingRecords: pending };
}

interface UseAttendanceReturn {
    session: AttendanceSession | null;
    isOpen: boolean;
    logs: AttendanceLogs;
    checkedInIds: string[];
    pendingRecords: { studentId: string; status: string; timestamp: string }[];
    processing: boolean;
    toggle: (type?: 'manual' | 'qr_code') => Promise<void>;
    refetch: () => Promise<void>;
    setStudentStatus: (studentId: string, status: 'hadir' | 'izin' | 'sakit' | 'alpa') => Promise<void>;
    approveCheckIn: (studentId: string) => Promise<void>;
    rejectCheckIn: (studentId: string) => Promise<void>;
}

export function useAttendance(classId: string | null): UseAttendanceReturn {
    const queryClient = useQueryClient();
    const today = new Date().toISOString().split('T')[0];

    // Query: Fetch session
    const { data: session = null, isLoading: sessionLoading } = useQuery({
        queryKey: attendanceKeys.session(classId || '', today),
        queryFn: () => fetchSession(classId!),
        enabled: !!classId,
    });

    // Query: Fetch logs (depends on session)
    const { data: logsData } = useQuery({
        queryKey: attendanceKeys.logs(session?.id || ''),
        queryFn: () => fetchLogs(session!.id),
        enabled: !!session?.id,
    });

    // Mutation: Toggle attendance session
    const toggleMutation = useMutation({
        mutationFn: async (type: 'manual' | 'qr_code' = 'manual') => {
            if (!classId) throw new Error('No class selected');

            const today = new Date().toISOString().split('T')[0];
            const newIsOpen = session ? !session.is_open : true;

            const updates: {
                class_id: string;
                date: string;
                is_open: boolean;
                type?: 'manual' | 'qr_code';
                id?: string;
            } = {
                class_id: classId,
                date: today,
                is_open: newIsOpen,
            };

            if (newIsOpen) {
                updates.type = type;
            }

            if (session?.id) {
                updates.id = session.id;
            }

            const { error } = await supabase
                .from('attendance')
                .upsert(updates, { onConflict: 'class_id,date' })
                .select()
                .single();

            if (error) throw new Error(error.message || 'Gagal mengubah status absensi');
        },
        onSuccess: () => {
            const today = new Date().toISOString().split('T')[0];
            queryClient.invalidateQueries({ queryKey: attendanceKeys.session(classId!, today) });
            toast.success('Status absensi berhasil diperbarui!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Gagal mengubah status absensi.');
        },
    });

    // Mutation: Set student attendance status (teacher manual - auto verified)
    const setStatusMutation = useMutation({
        mutationFn: async ({ studentId, status }: { studentId: string; status: 'hadir' | 'izin' | 'sakit' | 'alpa' }) => {
            if (!session?.id) throw new Error('No active session');

            const { error } = await supabase
                .from('attendance_records')
                .upsert({
                    attendance_id: session.id,
                    student_id: studentId,
                    status: status,
                    is_verified: true, // Teacher actions are auto-verified
                    recorded_at: new Date().toISOString()
                }, { onConflict: 'attendance_id,student_id' });

            if (error) throw error;
        },
        onSuccess: () => {
            if (session?.id) {
                queryClient.invalidateQueries({ queryKey: attendanceKeys.logs(session.id) });
            }
        },
    });

    // Mutation: Approve Check-in
    const approveMutation = useMutation({
        mutationFn: async (studentId: string) => {
            if (!session?.id) throw new Error('No session');
            const { error } = await supabase
                .from('attendance_records')
                .update({ is_verified: true })
                .eq('attendance_id', session.id)
                .eq('student_id', studentId);
            if (error) throw error;
        },
        onSuccess: () => {
            if (session?.id) queryClient.invalidateQueries({ queryKey: attendanceKeys.logs(session.id) });
            toast.success('Absensi disetujui');
        }
    });

    // Mutation: Reject Check-in (Delete)
    const rejectMutation = useMutation({
        mutationFn: async (studentId: string) => {
            if (!session?.id) throw new Error('No session');
            const { error } = await supabase
                .from('attendance_records')
                .delete()
                .eq('attendance_id', session.id)
                .eq('student_id', studentId);
            if (error) throw error;
        },
        onSuccess: () => {
            if (session?.id) queryClient.invalidateQueries({ queryKey: attendanceKeys.logs(session.id) });
            toast.success('Absensi ditolak');
        }
    });

    const toggle = async (type: 'manual' | 'qr_code' = 'manual'): Promise<void> => {
        await toggleMutation.mutateAsync(type);
    };

    const setStudentStatus = async (studentId: string, status: 'hadir' | 'izin' | 'sakit' | 'alpa'): Promise<void> => {
        await setStatusMutation.mutateAsync({ studentId, status });
    };

    const approveCheckIn = async (studentId: string) => {
        await approveMutation.mutateAsync(studentId);
    };

    const rejectCheckIn = async (studentId: string) => {
        await rejectMutation.mutateAsync(studentId);
    };

    const refetch = async (): Promise<void> => {
        await queryClient.invalidateQueries({ queryKey: attendanceKeys.session(classId!, today) });
        if (session?.id) {
            await queryClient.invalidateQueries({ queryKey: attendanceKeys.logs(session.id) });
        }
    };

    return {
        session,
        isOpen: session?.is_open ?? false,
        logs: logsData?.logs ?? { hadir: 0, izin: 0, sakit: 0, alpa: 0 },
        checkedInIds: logsData?.checkedInIds ?? [],
        pendingRecords: logsData?.pendingRecords ?? [],
        processing: sessionLoading || toggleMutation.isPending || setStatusMutation.isPending || approveMutation.isPending || rejectMutation.isPending,
        toggle,
        refetch,
        setStudentStatus,
        approveCheckIn,
        rejectCheckIn
    };
}

