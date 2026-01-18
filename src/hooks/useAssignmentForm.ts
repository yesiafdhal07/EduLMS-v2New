// ============================================================
// useAssignmentForm Hook
// Custom hook untuk mengelola form pembuatan tugas baru
// Memisahkan logic dari UI untuk maintainability yang lebih baik
// ============================================================

'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { NewAssignmentForm, Student } from '@/types';

// ============================================================
// TYPES
// ============================================================

/**
 * Type untuk hasil join query class_members dengan users
 * Supabase mengembalikan relasi sebagai array
 */
interface ClassMemberRow {
    users: {
        id: string;
        full_name: string;
    }[];
}

/**
 * Return type dari useAssignmentForm hook
 */
export interface UseAssignmentFormReturn {
    // State
    form: NewAssignmentForm;
    students: Student[];
    uploading: boolean;
    submitting: boolean;

    // Actions
    setForm: React.Dispatch<React.SetStateAction<NewAssignmentForm>>;
    updateField: <K extends keyof NewAssignmentForm>(key: K, value: NewAssignmentForm[K]) => void;
    fetchStudents: (classId: string) => Promise<void>;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    handleSubmit: () => Promise<boolean>;
    resetForm: () => void;
}

// ============================================================
// INITIAL STATE
// ============================================================

const initialFormState: NewAssignmentForm = {
    title: '',
    description: '',
    deadline: '',
    targetType: 'class',
    targetId: '',
    classId: '',
    requiredFormat: 'PDF',
    fileUrl: ''
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Ekstrak pesan error dengan aman dari unknown error
 */
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

// ============================================================
// HOOK IMPLEMENTATION
// ============================================================

/**
 * Custom hook untuk mengelola form assignment
 * 
 * @param selectedClassId - ID kelas yang dipilih (dari parent)
 * @param onSuccess - Callback setelah submit berhasil
 * @returns Object dengan state dan actions untuk form
 * 
 * @example
 * ```tsx
 * const { form, handleSubmit, updateField } = useAssignmentForm(classId, onSuccess);
 * ```
 */
export function useAssignmentForm(
    selectedClassId: string | null,
    onSuccess?: () => void
): UseAssignmentFormReturn {
    // Form state
    const [form, setForm] = useState<NewAssignmentForm>({
        ...initialFormState,
        classId: selectedClassId || ''
    });

    // Students untuk dropdown (jika targetType = 'student')
    const [students, setStudents] = useState<Student[]>([]);

    // Loading states
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    /**
     * Update satu field di form
     */
    const updateField = useCallback(<K extends keyof NewAssignmentForm>(
        key: K,
        value: NewAssignmentForm[K]
    ) => {
        setForm(prev => ({ ...prev, [key]: value }));
    }, []);

    /**
     * Fetch daftar siswa dari kelas tertentu
     */
    const fetchStudents = useCallback(async (classId: string) => {
        if (!classId) return;

        const { data } = await supabase
            .from('class_members')
            .select(`users (id, full_name)`)
            .eq('class_id', classId);

        const studentList = data
            ?.filter((m): m is ClassMemberRow => m.users?.length > 0)
            .map((m) => ({
                id: m.users[0].id,
                name: m.users[0].full_name
            })) || [];

        setStudents(studentList);
    }, []);

    /**
     * Handle upload file tugas ke Supabase Storage
     */
    const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // Generate unique filename dengan timestamp
            const fileName = `assignments/${Date.now()}-${file.name}`;
            const { error } = await supabase.storage.from('materials').upload(fileName, file);
            if (error) throw error;

            // Get public URL setelah upload berhasil
            const { data: { publicUrl } } = supabase.storage.from('materials').getPublicUrl(fileName);
            setForm(prev => ({ ...prev, fileUrl: publicUrl }));

            toast.success('File berhasil diupload');
        } catch (error: unknown) {
            toast.error(`Upload gagal: ${getErrorMessage(error)}`);
        } finally {
            setUploading(false);
        }
    }, []);

    /**
     * Submit form untuk membuat tugas baru
     * @returns true jika berhasil, false jika gagal
     */
    const handleSubmit = useCallback(async (): Promise<boolean> => {
        // Validasi required fields
        if (!form.title || !form.deadline || !form.classId) {
            toast.warning('Judul, Deadline, dan Kelas wajib diisi!');
            return false;
        }

        setSubmitting(true);
        try {
            // 1. Get atau create subject untuk kelas
            let subjectId: string | null = null;
            const { data: subjectData } = await supabase
                .from('subjects')
                .select('id')
                .eq('class_id', form.classId)
                .maybeSingle();

            if (subjectData) {
                subjectId = subjectData.id;
            } else {
                // Buat subject baru jika belum ada
                const { data: newSub, error: subErr } = await supabase
                    .from('subjects')
                    .insert({ title: 'Matematika Umum', class_id: form.classId })
                    .select()
                    .single();
                if (subErr) throw subErr;
                subjectId = newSub.id;
            }

            // 2. Insert assignment
            const { data: newAssignment, error } = await supabase.from('assignments').insert({
                title: form.title,
                description: form.description,
                deadline: form.deadline,
                file_url: form.fileUrl,
                required_format: form.requiredFormat,
                subject_id: subjectId,
                student_id: form.targetType === 'student' ? form.targetId : null,
            }).select('id').single();

            if (error) throw error;

            // 3. Broadcast notification jika tugas untuk seluruh kelas
            if (form.targetType === 'class' && newAssignment) {
                await supabase.rpc('broadcast_new_assignment', { assignment_id: newAssignment.id });
            }

            toast.success('Tugas berhasil dibuat & notifikasi dikirim!');
            onSuccess?.();
            return true;

        } catch (error: unknown) {
            toast.error(`Gagal membuat tugas: ${getErrorMessage(error)}`);
            return false;
        } finally {
            setSubmitting(false);
        }
    }, [form, onSuccess]);

    /**
     * Reset form ke initial state
     */
    const resetForm = useCallback(() => {
        setForm({
            ...initialFormState,
            classId: selectedClassId || ''
        });
        setStudents([]);
    }, [selectedClassId]);

    return {
        form,
        students,
        uploading,
        submitting,
        setForm,
        updateField,
        fetchStudents,
        handleFileUpload,
        handleSubmit,
        resetForm
    };
}
