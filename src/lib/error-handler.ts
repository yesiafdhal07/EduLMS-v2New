// =====================================================
// Centralized Error Handler Utility
// Standarisasi penanganan error di seluruh aplikasi
// =====================================================

import { toast } from 'sonner';

/**
 * Handle error dengan menampilkan toast dan logging
 * @param error - Error object atau unknown
 * @param fallbackMessage - Pesan default jika error tidak memiliki message
 * @returns string - Pesan error yang ditampilkan
 */
export function handleError(error: unknown, fallbackMessage = 'Terjadi kesalahan'): string {
    const message = error instanceof Error ? error.message : fallbackMessage;
    toast.error(message);
    console.error('[Error]:', error);
    return message;
}

/**
 * Handle error tanpa toast (untuk background operations)
 * @param error - Error object atau unknown
 * @param context - Konteks untuk logging
 */
export function logError(error: unknown, context?: string): void {
    const prefix = context ? `[${context}]` : '[Error]';
    console.error(prefix, error);
}

/**
 * Extract message dari error object
 * @param error - Error object atau unknown
 * @param fallback - Pesan fallback
 * @returns string - Pesan error
 */
export function getErrorMessage(error: unknown, fallback = 'Terjadi kesalahan'): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return fallback;
}

/**
 * Wrap async function dengan error handling
 * @param fn - Async function to wrap
 * @param errorMessage - Custom error message
 */
export async function withErrorHandling<T>(
    fn: () => Promise<T>,
    errorMessage?: string
): Promise<T | null> {
    try {
        return await fn();
    } catch (error) {
        handleError(error, errorMessage);
        return null;
    }
}
