'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useFocusMode } from '@/context/FocusModeContext';

interface FocusModeToggleProps {
    className?: string;
}

/**
 * Focus Mode Toggle Button
 * Hides sidebar, notifications, and other distracting elements
 */
export function FocusModeToggle({ className = '' }: FocusModeToggleProps) {
    const { isFocusMode, toggleFocusMode } = useFocusMode();

    return (
        <button
            onClick={toggleFocusMode}
            className={`
                p-2.5 rounded-xl transition-all duration-300 relative group
                ${isFocusMode 
                    ? 'bg-violet-500/20 text-violet-400 ring-2 ring-violet-500/50' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }
                ${className}
            `}
            title={isFocusMode ? 'Matikan Focus Mode' : 'Aktifkan Focus Mode'}
            aria-label={isFocusMode ? 'Disable Focus Mode' : 'Enable Focus Mode'}
        >
            {isFocusMode ? <EyeOff size={20} /> : <Eye size={20} />}
            
            {/* Tooltip */}
            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {isFocusMode ? 'Keluar Focus Mode' : 'Focus Mode'}
            </span>
        </button>
    );
}

export default FocusModeToggle;
