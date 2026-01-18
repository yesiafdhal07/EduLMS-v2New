// =====================================================
// Zod Validation Schemas untuk Math-LMS
// Digunakan untuk validasi input form di sisi client
// =====================================================

import { z } from 'zod';

// ========================================================
// AUTH VALIDATION
// ========================================================

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email wajib diisi')
        .email('Format email tidak valid'),
    password: z
        .string()
        .min(1, 'Password wajib diisi')
        .min(6, 'Password minimal 6 karakter'),
});

export const registerSchema = z.object({
    fullName: z
        .string()
        .min(1, 'Nama lengkap wajib diisi')
        .min(3, 'Nama minimal 3 karakter')
        .max(100, 'Nama maksimal 100 karakter'),
    email: z
        .string()
        .min(1, 'Email wajib diisi')
        .email('Format email tidak valid'),
    password: z
        .string()
        .min(1, 'Password wajib diisi')
        .min(8, 'Password minimal 8 karakter')
        .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
        .regex(/[0-9]/, 'Password harus mengandung angka'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
    role: z.enum(['siswa', 'guru'], { message: 'Pilih role yang valid' }),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// ========================================================
// ASSIGNMENT VALIDATION
// ========================================================

export const assignmentSchema = z.object({
    title: z
        .string()
        .min(1, 'Judul tugas wajib diisi')
        .min(5, 'Judul minimal 5 karakter')
        .max(200, 'Judul maksimal 200 karakter'),
    description: z
        .string()
        .max(2000, 'Deskripsi maksimal 2000 karakter')
        .optional(),
    deadline: z
        .string()
        .min(1, 'Deadline wajib diisi')
        .refine((val) => new Date(val) > new Date(), {
            message: 'Deadline harus di masa depan',
        }),
    requiredFormat: z.enum(['PDF', 'DOC', 'DOCX', 'ANY'], { message: 'Pilih format file yang valid' }),
    subjectId: z.string().uuid('Subject ID tidak valid'),
});

export type AssignmentInput = z.infer<typeof assignmentSchema>;

// ========================================================
// MATERIAL VALIDATION
// ========================================================

export const materialSchema = z.object({
    title: z
        .string()
        .min(1, 'Judul materi wajib diisi')
        .min(3, 'Judul minimal 3 karakter')
        .max(200, 'Judul maksimal 200 karakter'),
    description: z
        .string()
        .max(1000, 'Deskripsi maksimal 1000 karakter')
        .optional(),
    contentUrl: z
        .string()
        .url('URL tidak valid')
        .optional()
        .or(z.literal('')),
    subjectId: z.string().uuid('Subject ID tidak valid'),
});

export type MaterialInput = z.infer<typeof materialSchema>;

// ========================================================
// GRADE VALIDATION
// ========================================================

export const gradeSchema = z.object({
    score: z
        .number()
        .min(0, 'Nilai minimal 0')
        .max(100, 'Nilai maksimal 100'),
    feedback: z
        .string()
        .max(500, 'Feedback maksimal 500 karakter')
        .optional(),
    type: z.enum(['tugas', 'keaktifan', 'ujian'], { message: 'Pilih tipe nilai yang valid' }),
});

export type GradeInput = z.infer<typeof gradeSchema>;

// ========================================================
// CLASS VALIDATION
// ========================================================

export const classSchema = z.object({
    name: z
        .string()
        .min(1, 'Nama kelas wajib diisi')
        .min(3, 'Nama kelas minimal 3 karakter')
        .max(50, 'Nama kelas maksimal 50 karakter')
        .regex(/^[a-zA-Z0-9\s\-]+$/, 'Nama kelas hanya boleh huruf, angka, spasi, dan strip'),
});

export type ClassInput = z.infer<typeof classSchema>;

// ========================================================
// WEIGHTAGE VALIDATION
// ========================================================

export const weightageSchema = z.object({
    tugas: z.number().min(0).max(100),
    keaktifan: z.number().min(0).max(100),
    ujian: z.number().min(0).max(100),
}).refine((data) => data.tugas + data.keaktifan + data.ujian === 100, {
    message: 'Total bobot harus 100%',
});

export type WeightageInput = z.infer<typeof weightageSchema>;

// ========================================================
// HELPER: Validate and return errors
// ========================================================

export function validateForm<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (path && !errors[path]) {
            errors[path] = issue.message;
        }
    });

    return { success: false, errors };
}
