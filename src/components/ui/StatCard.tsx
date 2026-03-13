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
        <div className={`
            bg-white/5 backdrop-blur-md p-8 rounded-[3rem] border border-white/10 
            shadow-xl shadow-indigo-900/20 relative overflow-hidden group 
            hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20
            transition-all duration-500
        `}>
            {/* Background Gradient Blob */}
            <div className={`
                absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${gradient} to-transparent 
                opacity-20 rounded-full -mr-20 -mt-20 group-hover:scale-150 group-hover:opacity-30 
                transition-all duration-700 ease-out
            `}></div>
            
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
                <div className="w-14 h-14 bg-white/10 border border-white/10 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner text-white">
                    {icon}
                </div>
                <div>
                    <h4 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2 leading-none group-hover:translate-x-1 transition-transform duration-300">{value}</h4>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] group-hover:text-indigo-200 transition-colors">{label}</p>
                </div>
            </div>
        </div>
    );
});

// Display name for React DevTools
StatCard.displayName = 'StatCard';
