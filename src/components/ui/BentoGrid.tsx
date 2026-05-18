'use client';

import { ReactNode } from 'react';

interface BentoGridProps {
    children: ReactNode;
    className?: string;
}

export function BentoGrid({ children, className = '' }: BentoGridProps) {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
            {children}
        </div>
    );
}

// Grid span variants for bento cards
interface BentoItemProps {
    children: ReactNode;
    colSpan?: 1 | 2 | 3 | 4;
    rowSpan?: 1 | 2 | 3;
    className?: string;
}

export function BentoItem({ children, colSpan = 1, rowSpan = 1, className = '' }: BentoItemProps) {
    const colClasses = {
        1: '',
        2: 'md:col-span-2',
        3: 'md:col-span-3',
        4: 'md:col-span-4',
    };
    
    const rowClasses = {
        1: '',
        2: 'md:row-span-2',
        3: 'md:row-span-3',
    };

    return (
        <div className={`${colClasses[colSpan]} ${rowClasses[rowSpan]} ${className}`}>
            {children}
        </div>
    );
}

// Widget wrapper with proper bento styling
interface WidgetWrapperProps {
    children: ReactNode;
    className?: string;
    gradient?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet';
}

export function WidgetWrapper({ children, className = '', gradient = 'indigo' }: WidgetWrapperProps) {
    const gradients = {
        indigo: 'from-indigo-500/10 to-blue-500/5 hover:from-indigo-500/15',
        emerald: 'from-emerald-500/10 to-teal-500/5 hover:from-emerald-500/15',
        amber: 'from-amber-500/10 to-orange-500/5 hover:from-amber-500/15',
        rose: 'from-rose-500/10 to-red-500/5 hover:from-rose-500/15',
        violet: 'from-violet-500/10 to-purple-500/5 hover:from-violet-500/15',
    };

    return (
        <div 
            className={`
                relative overflow-hidden rounded-2xl border border-white/5
                bg-gradient-to-br ${gradients[gradient]}
                hover:border-indigo-500/20 hover:-translate-y-1
                transition-all duration-300 shadow-lg shadow-black/10
                hover:shadow-indigo-500/10 hover:shadow-xl
                ${className}
            `}
        >
            {children}
        </div>
    );
}