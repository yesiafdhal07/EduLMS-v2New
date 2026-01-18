/**
 * Debounce Utility
 * Prevents rapid successive calls by delaying execution
 * Used to prevent realtime subscription storms
 */

export function debounce<T extends (...args: unknown[]) => void>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
            timeoutId = null;
        }, delay);
    };
}

/**
 * Creates a debounced callback that can be cancelled
 * Returns both the debounced function and a cancel function
 */
export function createDebouncedCallback<T extends (...args: unknown[]) => void>(
    fn: T,
    delay: number
): { debouncedFn: (...args: Parameters<T>) => void; cancel: () => void } {
    let timeoutId: NodeJS.Timeout | null = null;

    const debouncedFn = (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
            timeoutId = null;
        }, delay);
    };

    const cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    return { debouncedFn, cancel };
}

// Default debounce delay for realtime subscriptions (5 seconds)
export const REALTIME_DEBOUNCE_DELAY = 5000;
