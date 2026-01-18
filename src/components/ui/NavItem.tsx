'use client';

import { ReactNode, useState } from 'react';

interface NavItemProps {
    icon: ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
    variant?: 'sidebar' | 'mobile';
    role?: 'guru' | 'siswa';
    description?: string; // Optional description for better UX
}

export function NavItem({ icon, label, active, onClick, variant = 'sidebar', role = 'guru', description }: NavItemProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    // Theme colors based on role
    const activeColors = role === 'siswa'
        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';

    const accentColor = role === 'siswa' ? 'text-emerald-400' : 'text-indigo-400';
    const mobileActiveColors = role === 'siswa'
        ? 'text-emerald-300 bg-emerald-900/50 border border-emerald-500/20'
        : 'text-indigo-300 bg-indigo-900/50 border border-indigo-500/20';

    if (variant === 'mobile') {
        return (
            <button
                type="button"
                onClick={onClick}
                className={`flex flex-col items-center gap-1.5 transition-all relative ${active ? `${mobileActiveColors} px-4 py-2 rounded-2xl` : 'text-slate-400'}`}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                {icon}
                <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>

                {/* Mobile Tooltip */}
                {showTooltip && description && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap shadow-xl border border-white/10 animate-in fade-in zoom-in-95 duration-150">
                        {description}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45 border-r border-b border-white/10"></div>
                    </div>
                )}
            </button>
        );
    }

    // Default: sidebar variant
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 group relative overflow-hidden ${active ? activeColors : 'hover:bg-white/5'}`}
        >
            <div className={`relative z-10 p-2 rounded-xl transition-colors ${active ? 'bg-white/10' : 'bg-white/5 group-hover:bg-white/10'} ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                {icon}
            </div>
            <div className="relative z-10 flex-1">
                <span className={`font-bold text-sm block ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{label}</span>
                {description && (
                    <span className={`text-[10px] font-medium transition-opacity ${active ? 'text-slate-400' : 'text-slate-500 opacity-0 group-hover:opacity-100'}`}>
                        {description}
                    </span>
                )}
            </div>

            {/* Active Badge */}
            {active && (
                <div className={`relative z-10 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${role === 'siswa' ? 'bg-emerald-500/30 text-emerald-300' : 'bg-indigo-500/30 text-indigo-300'}`}>
                    Aktif
                </div>
            )}

            {/* Glow Effect */}
            {active && <div className={`absolute inset-0 opacity-20 bg-gradient-to-r ${role === 'siswa' ? 'from-emerald-500/20 to-transparent' : 'from-indigo-500/20 to-transparent'}`} />}
        </div>
    );
}

