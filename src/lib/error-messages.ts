/**
 * User-Friendly Error Messages
 * Translate technical errors to Indonesian user-friendly messages
 */

// Common error codes and their translations
export const ERROR_MESSAGES: Record<string, string> = {
    // Authentication
    'PGRST301': 'Sesi Anda telah berakhir. Silakan login kembali.',
    'PGRST302': 'Anda tidak memiliki akses ke halaman ini.',
    'JWT expired': 'Sesi login habis. Silakan refresh halaman.',
    'Invalid login credentials': 'Email atau password salah.',
    'Email not confirmed': 'Email belum dikonfirmasi. Cek inbox Anda.',
    
    // Database
    'PGRST116': 'Data tidak ditemukan.',
    'duplicate key': 'Data sudah ada. Tidak dapat ditambahkan lagi.',
    '23505': 'Data dengan nilai yang sama sudah ada.',
    '23503': 'Tidak dapat menghapus karena masih ada data terkait.',
    'foreign key violation': 'Data ini memiliki relasi dengan data lain.',
    
    // Network
    'Failed to fetch': 'Koneksi internet terputus. Coba lagi.',
    'NetworkError': 'Gagal terhubung ke server. Periksa koneksi internet.',
    'TimeoutError': 'Server tidak merespons. Coba lagi nanti.',
    
    // Rate Limit
    '429': 'Terlalu banyak permintaan. Tunggu beberapa saat.',
    
    // File Upload
    'File too large': 'Ukuran file terlalu besar. Maksimal 10MB.',
    'Invalid file type': 'Tipe file tidak didukung.',
    
    // Generic
    'Something went wrong': 'Terjadi kesalahan. Silakan coba lagi.',
};

/**
 * Get user-friendly error message from error object
 */
export function getErrorMessage(error: unknown): string {
    if (!error) return ERROR_MESSAGES['Something went wrong'];
    
    // Handle string errors
    if (typeof error === 'string') {
        for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
            if (error.toLowerCase().includes(key.toLowerCase())) {
                return value;
            }
        }
        return error;
    }
    
    // Handle Error objects
    if (error instanceof Error) {
        const message = error.message;
        for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
            if (message.toLowerCase().includes(key.toLowerCase())) {
                return value;
            }
        }
        // Don't expose technical errors in production
        if (process.env.NODE_ENV === 'production') {
            return ERROR_MESSAGES['Something went wrong'];
        }
        return message;
    }
    
    // Handle Supabase/API error objects
    if (typeof error === 'object' && error !== null) {
        const err = error as { message?: string; code?: string; error?: string };
        
        // Check error code
        if (err.code && ERROR_MESSAGES[err.code]) {
            return ERROR_MESSAGES[err.code];
        }
        
        // Check error message
        if (err.message) {
            for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
                if (err.message.toLowerCase().includes(key.toLowerCase())) {
                    return value;
                }
            }
        }
        
        // Check error string
        if (err.error) {
            for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
                if (err.error.toLowerCase().includes(key.toLowerCase())) {
                    return value;
                }
            }
        }
    }
    
    return ERROR_MESSAGES['Something went wrong'];
}

/**
 * Log error to console (dev) and optionally to error tracking (prod)
 */
export function logError(error: unknown, context?: string): void {
    const message = getErrorMessage(error);
    
    if (process.env.NODE_ENV === 'development') {
        console.error(`[${context || 'Error'}]`, error);
    } else {
        // In production, only log sanitized message
        console.error(`[${context || 'Error'}] ${message}`);
    }
}
