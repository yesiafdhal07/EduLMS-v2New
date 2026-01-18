'use client';

import React, { forwardRef, KeyboardEvent, MouseEvent } from 'react';
import { cn } from '@/lib/utils';

/**
 * Keyboard accessible button component
 * Supports Enter and Space key activation
 */
interface AccessibleButtonProps extends React.HTMLAttributes<HTMLDivElement> {
    onClick?: (e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void;
    disabled?: boolean;
    children: React.ReactNode;
}

export const AccessibleButton = forwardRef<HTMLDivElement, AccessibleButtonProps>(
    ({ onClick, disabled, children, className, ...props }, ref) => {
        const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
            if (disabled) return;
            
            // Activate on Enter or Space
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.(e);
            }
        };

        return (
            <div
                ref={ref}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-disabled={disabled}
                onClick={disabled ? undefined : onClick}
                onKeyDown={handleKeyDown}
                className={cn(
                    'cursor-pointer select-none',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                    disabled && 'opacity-50 cursor-not-allowed',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

AccessibleButton.displayName = 'AccessibleButton';

/**
 * Keyboard accessible card component
 * For clickable cards with proper focus handling
 */
interface AccessibleCardProps extends React.HTMLAttributes<HTMLDivElement> {
    onClick?: (e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void;
    selected?: boolean;
    children: React.ReactNode;
}

export const AccessibleCard = forwardRef<HTMLDivElement, AccessibleCardProps>(
    ({ onClick, selected, children, className, ...props }, ref) => {
        const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.(e);
            }
        };

        return (
            <div
                ref={ref}
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                onClick={onClick}
                onKeyDown={handleKeyDown}
                className={cn(
                    'transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900',
                    selected && 'ring-2 ring-indigo-500',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

AccessibleCard.displayName = 'AccessibleCard';

/**
 * Skip to main content link for keyboard users
 */
export function SkipToMain() {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-500 focus:text-white focus:rounded-lg focus:shadow-lg"
        >
            Skip to main content
        </a>
    );
}

/**
 * Visually hidden component for screen readers
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
    return (
        <span className="sr-only">
            {children}
        </span>
    );
}

/**
 * Focus trap for modals and dialogs
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>) {
    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        const handleKeyDown = (e: globalThis.KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        container.addEventListener('keydown', handleKeyDown);
        firstElement?.focus();

        return () => container.removeEventListener('keydown', handleKeyDown);
    }, [containerRef]);
}

/**
 * Announce messages to screen readers
 */
export function useAnnounce() {
    const announce = React.useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }, []);

    return announce;
}
