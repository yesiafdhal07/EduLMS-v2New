'use client';

import { ReactNode } from 'react';
import { FolderOpen, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon = <FolderOpen size={48} />,
    title,
    description,
    actionLabel,
    onAction
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center text-slate-400 dark:text-slate-500 mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 text-center">
                {title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm mb-6">
                {description}
            </p>
            {actionLabel && onAction && (
                <button
                    type="button"
                    onClick={onAction}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5"
                >
                    <PlusCircle size={18} />
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
