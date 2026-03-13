'use client';

import { ReactNode } from 'react';
import { FolderOpen, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    icon = <FolderOpen size={48} />,
    title,
    description,
    actionLabel,
    onAction,
    className
}: EmptyStateProps) {
    return (
        <div className={cn("relative flex flex-col items-center justify-center py-20 px-8 text-center animate-in fade-in zoom-in-95 duration-500 overflow-hidden", className)}>
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 blur-[64px] rounded-full pointer-events-none" />

            {/* Icon Container with Glassmorphism */}
            <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-24 h-24 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2rem] flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-2xl shadow-indigo-500/10 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                    {icon}
                </div>
                {/* Decorative floating dots */}
                <div className="absolute -top-4 -right-4 w-4 h-4 rounded-full bg-indigo-400/50 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="absolute -bottom-2 -left-4 w-3 h-3 rounded-full bg-purple-400/50 animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>

            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-3">
                {title}
            </h3>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-sm mb-8 leading-relaxed">
                {description}
            </p>

            {actionLabel && onAction && (
                <button
                    type="button"
                    onClick={onAction}
                    className="relative inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-500 transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:-translate-y-1 group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />
                    <PlusCircle size={20} className="transition-transform group-hover:rotate-90 duration-300" />
                    <span>{actionLabel}</span>
                </button>
            )}
        </div>
    );
}
