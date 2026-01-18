'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
    className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
    const { resolvedTheme, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group ${className}`}
            aria-label={resolvedTheme === 'dark' ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
            title={resolvedTheme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
        >
            {resolvedTheme === 'dark' ? (
                <Sun size={20} className="text-amber-400 group-hover:rotate-45 transition-transform" />
            ) : (
                <Moon size={20} className="text-indigo-400 group-hover:-rotate-12 transition-transform" />
            )}
        </button>
    );
}
