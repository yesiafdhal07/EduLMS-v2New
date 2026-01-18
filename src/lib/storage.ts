import { supabase } from './supabase';

export const uploadAssignmentFile = async (
    file: File,
    assignmentId: string,
    studentId: string,
    requiredFormat: string = 'PDF'
) => {
    // 1. Check Auth first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Anda harus login untuk mengunggah file.');

    // 2. Validate format
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const isAllowedFormat = requiredFormat === 'ANY' || fileExt === requiredFormat.toLowerCase();

    if (!isAllowedFormat) {
        throw new Error(`Format file tidak sesuai. Diperlukan: .${requiredFormat}`);
    }

    // 3. Size validation (Max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        throw new Error('Ukuran file maksimal adalah 10MB.');
    }

    // 4. Path Organization: assignments / {student_id} / {assignment_id}_{timestamp}.{ext}
    // Matching the RLS policy: auth.uid()::text = (storage.foldername(name))[1]
    const fileName = `${assignmentId}_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { data, error } = await supabase.storage
        .from('assignments')
        .upload(filePath, file, {
            upsert: true
        });

    if (error) {
        throw new Error(`Gagal mengunggah ke Storage: ${error.message}`);
    }

    // 5. Public URL fetching
    const { data: { publicUrl } } = supabase.storage
        .from('assignments')
        .getPublicUrl(filePath);

    return publicUrl;
};
