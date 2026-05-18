'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface AttendanceEntry {
    student_id: string;
    attendance_id: string;
    status: 'hadir' | 'izin' | 'sakit' | 'alpa';
    method?: 'manual' | 'qr_code';
}

export function useAttendanceSync(sessionId: string) {
    const queryClient = useQueryClient();

    // 1. Fetch current records
    const { data: records = [], isLoading } = useQuery({
        queryKey: ['attendance_records', sessionId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('attendance_records')
                .select('*')
                .eq('attendance_id', sessionId);
            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60, // 1 minute
    });

    // 2. Optimistic Mutation for marking attendance
    const markAttendance = useMutation({
        mutationFn: async (entry: AttendanceEntry) => {
            const { data, error } = await supabase
                .from('attendance_records')
                .upsert(entry, { onConflict: 'attendance_id,student_id' })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onMutate: async (newEntry) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['attendance_records', sessionId] });

            // Snapshot the previous value
            const previousRecords = queryClient.getQueryData(['attendance_records', sessionId]);

            // Optimistically update to the new value
            queryClient.setQueryData(['attendance_records', sessionId], (old: any[] = []) => {
                const existingIndex = old.findIndex(r => r.student_id === newEntry.student_id);
                if (existingIndex > -1) {
                    const updated = [...old];
                    updated[existingIndex] = { ...updated[existingIndex], ...newEntry, recorded_at: new Date().toISOString() };
                    return updated;
                }
                return [...old, { ...newEntry, id: 'temp-' + Date.now(), recorded_at: new Date().toISOString() }];
            });

            return { previousRecords };
        },
        onError: (err, newEntry, context: any) => {
            queryClient.setQueryData(['attendance_records', sessionId], context.previousRecords);
            toast.error("Gagal menyimpan absensi. Sinyal mungkin bermasalah.");
        },
        onSuccess: () => {
            // No need to invalidate immediately, the optimistic update is enough
            // but we can background refresh
            queryClient.invalidateQueries({ queryKey: ['attendance_records', sessionId] });
        },
    });

    return {
        records,
        isLoading,
        markAttendance: markAttendance.mutate,
        isSyncing: markAttendance.isPending
    };
}
