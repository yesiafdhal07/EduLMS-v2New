'use client';

import { ReactNode, memo } from 'react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: ReactNode;
    gradient: string;
}

/**
 * StatCard - Memoized for performance
 * Only re-renders when props change
 */
export const StatCard = memo(function StatCard({ label, value, icon, gradient }: StatCardProps) {
    return (
        <div className={`bg-white/5 backdrop-blur-md p-10 rounded-[3.5rem] border border-white/10 shadow-xl shadow-indigo-900/20 relative overflow-hidden group hover:-translate-y-3 transition-all duration-700`}>
            <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${gradient} to-transparent opacity-20 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000`}></div>
            <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 bg-white/10 border border-white/10 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-12 transition-all shadow-inner text-white">
                    {icon}
                </div>
                <div>
                    <h4 className="text-5xl font-black text-white tracking-tighter mb-2 leading-none">{value}</h4>
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">{label}</p>
                </div>
            </div>
        </div>
    );
});

// Display name for React DevTools
StatCard.displayName = 'StatCard';
