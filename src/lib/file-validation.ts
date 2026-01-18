/**
 * File Validation Utilities
 * Validates file uploads for security and correctness
 */

// Allowed MIME types for different upload contexts
export const ALLOWED_MIME_TYPES = {
    assignment: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif',
    ],
    material: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'video/mp4',
        'video/webm',
    ],
} as const;

// Max file sizes in bytes
export const MAX_FILE_SIZES = {
    assignment: 10 * 1024 * 1024, // 10MB
    material: 50 * 1024 * 1024, // 50MB
    image: 5 * 1024 * 1024, // 5MB
};

interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validates a file for assignment submission
 */
export function validateAssignmentFile(file: File): ValidationResult {
    // Check file size
    if (file.size > MAX_FILE_SIZES.assignment) {
        return {
            valid: false,
            error: `Ukuran file terlalu besar. Maksimal ${MAX_FILE_SIZES.assignment / (1024 * 1024)}MB`,
        };
    }

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.assignment.includes(file.type as never)) {
        return {
            valid: false,
            error: 'Format file tidak didukung. Gunakan PDF, DOC, DOCX, atau gambar.',
        };
    }

    // Check file extension matches MIME type (prevent spoofing)
    const extension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions: Record<string, string[]> = {
        'application/pdf': ['pdf'],
        'application/msword': ['doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
        'image/jpeg': ['jpg', 'jpeg'],
        'image/png': ['png'],
        'image/gif': ['gif'],
    };

    const allowedExts = validExtensions[file.type];
    if (allowedExts && extension && !allowedExts.includes(extension)) {
        return {
            valid: false,
            error: 'Ekstensi file tidak sesuai dengan tipe file.',
        };
    }

    return { valid: true };
}

/**
 * Validates a file for material upload
 */
export function validateMaterialFile(file: File): ValidationResult {
    if (file.size > MAX_FILE_SIZES.material) {
        return {
            valid: false,
            error: `Ukuran file terlalu besar. Maksimal ${MAX_FILE_SIZES.material / (1024 * 1024)}MB`,
        };
    }

    if (!ALLOWED_MIME_TYPES.material.includes(file.type as never)) {
        return {
            valid: false,
            error: 'Format file tidak didukung.',
        };
    }

    return { valid: true };
}

/**
 * Sanitizes a filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
    // Remove path separators and null bytes
    let sanitized = filename.replace(/[/\\:\0]/g, '_');

    // Remove leading dots (hidden files)
    sanitized = sanitized.replace(/^\.+/, '');

    // Limit length
    if (sanitized.length > 200) {
        const ext = sanitized.split('.').pop() || '';
        const name = sanitized.slice(0, 190 - ext.length);
        sanitized = `${name}.${ext}`;
    }

    return sanitized || 'unnamed_file';
}

/**
 * Validates a URL to ensure it's from allowed domains
 */
export function validateStorageUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        const allowedHosts = [
            'supabase.co',
            'supabase.com',
            process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').replace('http://', '') || '',
        ];

        return allowedHosts.some(host => parsed.host.endsWith(host));
    } catch {
        return false;
    }
}
