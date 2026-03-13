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
            // Use current cache state for toggle logic 
            // Note: In onMutate we already flipped it, but for the actual API call we need to know the *intended* state
            // OR rely on the server to handle the toggle? 
            // Better: trust the optimistic intent.
            const newIsOpen = !session?.is_open; 

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
        onMutate: async (newType) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: attendanceKeys.session(classId!, today) });

            // Snapshot the previous value
            const previousSession = queryClient.getQueryData<AttendanceSession | null>(attendanceKeys.session(classId!, today));

            // Optimistically update to the new value
            queryClient.setQueryData<AttendanceSession | null>(attendanceKeys.session(classId!, today), (old) => {
                if (!old) return {
                    id: 'temp-id', // Temporary ID
                    class_id: classId!,
                    date: today,
                    is_open: true,
                    type: newType,
                    created_at: new Date().toISOString()
                };
                return {
                    ...old,
                    is_open: !old.is_open,
                    type: !old.is_open ? newType : old.type
                };
            });

            // Return a context object with the snapshotted value
            return { previousSession };
        },
        onError: (err, newType, context) => {
            queryClient.setQueryData(attendanceKeys.session(classId!, today), context?.previousSession);
            toast.error('Gagal mengubah status absensi. Mengembalikan status sebelumnya.');
        },
        onSettled: () => {
             // Always refetch after error or success:
             queryClient.invalidateQueries({ queryKey: attendanceKeys.session(classId!, today) });
        },
    });

    // Mutation: Set student attendance status (teacher manual - auto verified)
    const setStatusMutation = useMutation({
        mutationFn: async ({ studentId, status }: { studentId: string; status: 'hadir' | 'izin' | 'sakit' | 'alpa' }) => {
            if (!session?.id) throw new Error('No active session');

            // Optimistic update happens before this, so we just perform the write
            const { error } = await supabase
                .from('attendance_records')
                .upsert({
                    attendance_id: session.id,
                    student_id: studentId,
                    status: status,
                    is_verified: true,
                    recorded_at: new Date().toISOString()
                }, { onConflict: 'attendance_id,student_id' });

            if (error) throw error;
        },
        onMutate: async ({ studentId, status }) => {
            if (!session?.id) return;
            const logKey = attendanceKeys.logs(session.id);

            await queryClient.cancelQueries({ queryKey: logKey });

            const previousLogs = queryClient.getQueryData(logKey);

            queryClient.setQueryData(logKey, (old: any) => {
                if (!old) return old;
                
                // Clone old state
                const newLogs = { ...old.logs };
                const newCheckedInIds = [...old.checkedInIds];

                // Find if checking in for first time or changing status
                const wasCheckedIn = newCheckedInIds.includes(studentId);
                
                // If checking in for first time
                if (!wasCheckedIn) {
                    newCheckedInIds.push(studentId);
                    newLogs[status] = (newLogs[status] || 0) + 1;
                } else {
                    // Changing status: we can't easily know the OLD status without complex lookups
                    // For simplicity in this specific optimistic update, we might SKIP decrementing the old status 
                    // if we don't have it easily available, OR we rely on the fact that the UI usually knows.
                    // BUT, to be safe and avoid negative numbers/inconsistencies, for manual status changes,
                    // we might want to just mark it as "processing" in UI?
                    // Actually, let's try to be smart.
                    // The UI typically knows the previous status. 
                    // However, `setStatus` is often used when a student has NO status or changing it.
                    // If we want perfection, we need the old status.
                    // Allow imperfect optimistic update: Just increment new status, eventually it corrects.
                    newLogs[status] = (newLogs[status] || 0) + 1;
                }

                return {
                    ...old,
                    logs: newLogs,
                    checkedInIds: newCheckedInIds
                };
            });

            return { previousLogs };
        },
        onError: (_err, _newTodo, context) => {
            if (session?.id) {
                queryClient.setQueryData(attendanceKeys.logs(session.id), context?.previousLogs);
            }
            toast.error('Gagal menyimpan absensi.');
        },
        onSettled: () => {
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

