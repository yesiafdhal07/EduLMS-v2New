'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ClassData, Student, Subject } from '@/types';
import { toast } from 'sonner';

// Type for Supabase nested query result
interface ClassMemberQueryResult {
    users: {
        id: string;
        full_name: string;
        email: string;
    };
}

// Query keys for React Query
export const classKeys = {
    all: ['classes'] as const,
    list: (teacherId: string) => [...classKeys.all, 'list', teacherId] as const,
    details: (classId: string) => [...classKeys.all, 'details', classId] as const,
    students: (classId: string) => [...classKeys.all, 'students', classId] as const,
    subject: (classId: string) => [...classKeys.all, 'subject', classId] as const,
};

// Fetch functions
async function fetchClasses(teacherId: string): Promise<ClassData[]> {
    const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', teacherId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

async function fetchClassStudents(classId: string): Promise<Student[]> {
    const { data, error } = await supabase
        .from('class_members')
        .select(`users (id, full_name, email)`)
        .eq('class_id', classId);

    if (error) throw error;

    return (data as unknown as ClassMemberQueryResult[])?.map((m) => ({
        id: m.users.id,
        name: m.users.full_name,
        email: m.users.email
    })) || [];
}

async function fetchClassSubject(classId: string): Promise<Subject | null> {
    const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('class_id', classId)
        .maybeSingle();

    if (error) throw error;
    return data;
}

interface UseClassesReturn {
    classes: ClassData[];
    selectedClassId: string | null;
    setSelectedClassId: (id: string | null) => void;
    students: Student[];
    subject: Subject | null;
    loading: boolean;
    refetch: () => Promise<void>;
    createClass: (name: string) => Promise<boolean>;
    updateClass: (id: string, name: string) => Promise<boolean>;
    deleteClass: (id: string) => Promise<boolean>;
}

export function useClasses(teacherId?: string): UseClassesReturn {
    const queryClient = useQueryClient();
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

    // Query: Fetch classes
    const { data: classes = [], isLoading: classesLoading } = useQuery({
        queryKey: classKeys.list(teacherId || ''),
        queryFn: () => fetchClasses(teacherId!),
        enabled: !!teacherId,
        // DO NOT use select() for side effects like setState - causes infinite loops!
    });

    // Auto-select first class when classes are loaded (correct pattern)
    useEffect(() => {
        if (classes.length > 0 && !selectedClassId) {
            setSelectedClassId(classes[0].id);
        }
    }, [classes, selectedClassId]);

    // Query: Fetch students for selected class
    const { data: students = [] } = useQuery({
        queryKey: classKeys.students(selectedClassId || ''),
        queryFn: () => fetchClassStudents(selectedClassId!),
        enabled: !!selectedClassId,
    });

    // Query: Fetch subject for selected class
    const { data: subject = null } = useQuery({
        queryKey: classKeys.subject(selectedClassId || ''),
        queryFn: () => fetchClassSubject(selectedClassId!),
        enabled: !!selectedClassId,
    });

    // Mutation: Create class
    const createMutation = useMutation({
        mutationFn: async (name: string) => {
            if (!teacherId || !name.trim()) throw new Error('Invalid input');

            const { data, error } = await supabase
                .from('classes')
                .insert({ name: name.trim(), teacher_id: teacherId })
                .select();

            if (error) {
                console.error('[useClasses] Create class error:', {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                });
                // Wrap Supabase error with proper message for better debugging
                const err = new Error(error.message) as Error & { code?: string };
                err.code = error.code;
                throw err;
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: classKeys.list(teacherId!) });
        },
        onError: (error: Error & { code?: string }) => {
            console.error('Error creating class:', error);
            if (error.code === '23505') {
                toast.error('Nama kelas sudah ada. Mohon gunakan nama lain.');
            } else if (error.message?.includes('RLS') || error.message?.includes('policy')) {
                toast.error('Akses ditolak. Pastikan Anda terdaftar sebagai Guru.');
            } else {
                toast.error(`Gagal membuat kelas: ${error.message || 'Silakan coba lagi.'}`);
            }
        },
    });

    // Mutation: Update class
    const updateMutation = useMutation({
        mutationFn: async ({ id, name }: { id: string; name: string }) => {
            if (!name.trim()) throw new Error('Invalid name');
            const { error } = await supabase
                .from('classes')
                .update({ name: name.trim() })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Kelas berhasil diperbarui!');
            queryClient.invalidateQueries({ queryKey: classKeys.list(teacherId!) });
        },
        onError: (error: Error & { code?: string }) => {
            console.error('Error updating class:', error);
            if (error.code === '23505') {
                toast.error('Nama kelas sudah ada. Mohon gunakan nama lain.');
            } else {
                toast.error('Gagal memperbarui kelas. Silakan coba lagi.');
            }
        },
    });

    // Mutation: Delete class
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            if (!teacherId) throw new Error('User tidak terautentikasi');

            // Direct delete with count check - Faster & Atomic
            // RLS policies already ensure teachers can only delete their own classes
            // Soft Delete: Mark as deleted instead of removing row
            const { error, count } = await supabase
                .from('classes')
                .update({ deleted_at: new Date().toISOString() }, { count: 'exact' })
                .eq('id', id)
                .eq('teacher_id', teacherId);

            if (error) {
                console.error('Delete error details:', error);
                throw error;
            }

            // If no rows deleted, it means either class doesn't exist or doesn't belong to teacher
            if (count === 0) {
                // Fallback: check if it exists but belongs to someone else, or just generic error
                // For now, just throw a clear error
                throw new Error('Kelas tidak ditemukan atau Anda tidak memiliki izin untuk menghapusnya.');
            }

            return id;
        },
        onSuccess: (deletedId) => {
            toast.success('Kelas berhasil dihapus!');
            if (deletedId === selectedClassId) {
                setSelectedClassId(null);
            }
            queryClient.invalidateQueries({ queryKey: classKeys.list(teacherId!) });
        },
        onError: (error: Error) => {
            console.error('Error deleting class:', error);
            toast.error(`Gagal menghapus kelas: ${error.message || 'Silakan coba lagi.'}`);
        },
    });

    // Wrapper functions for backward compatibility
    const createClass = async (name: string): Promise<boolean> => {
        try {
            await createMutation.mutateAsync(name);
            return true;
        } catch {
            return false;
        }
    };

    const updateClass = async (id: string, name: string): Promise<boolean> => {
        try {
            await updateMutation.mutateAsync({ id, name });
            return true;
        } catch {
            return false;
        }
    };

    const deleteClass = async (id: string): Promise<boolean> => {
        try {
            await deleteMutation.mutateAsync(id);
            return true;
        } catch {
            return false;
        }
    };

    const refetch = async (): Promise<void> => {
        await queryClient.invalidateQueries({ queryKey: classKeys.list(teacherId!) });
    };

    return {
        classes,
        selectedClassId,
        setSelectedClassId,
        students,
        subject,
        loading: classesLoading,
        refetch,
        createClass,
        updateClass,
        deleteClass,
    };
}
