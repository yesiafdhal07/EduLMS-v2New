'use client';

import { ReactNode, useState } from 'react';
import type { AppRole } from '@/types';
import { getRoleTheme } from '@/lib/theme/roleTheme';

interface NavItemProps {
    icon: ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
    variant?: 'sidebar' | 'mobile';
    role?: AppRole;
    description?: string;
}

export function NavItem({ icon, label, active, onClick, variant = 'sidebar', role = 'guru', description }: NavItemProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const theme = getRoleTheme(role);
    const mobileActive = `${theme.accentText} ${theme.accentBgSoft} ${theme.accentBorder}`;

    if (variant === 'mobile') {
        return (
            <button
                type="button"
                onClick={onClick}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all relative ${active ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                <div className={`p-2 rounded-2xl transition-all duration-300 ${active ? `${mobileActive} shadow-lg scale-110` : 'bg-transparent'}`}>
                    {icon}
                </div>
                <span className={`text-[10px] font-bold tracking-tight transition-all ${active ? 'opacity-100 scale-105' : 'opacity-70'}`}>{label}</span>
            </button>
        );
    }

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={`
                flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 group relative overflow-hidden 
                active:scale-95 
                ${active 
                    ? `${theme.navItemActive} shadow-lg` 
                    : 'hover:bg-white/5 hover:border hover:border-white/5 border border-transparent'
                }
            `}
        >
            <div className={`
                relative z-10 p-2.5 rounded-xl transition-all duration-300 
                ${active ? 'bg-white/10 shadow-inner' : 'bg-white/5 group-hover:bg-white/10 group-hover:scale-110'} 
                ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}
            `}>
                {icon}
            </div>
            <div className="relative z-10 flex-1">
                <span className={`font-bold text-sm block transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{label}</span>
                {description && (
                    <span className={`text-[10px] font-medium transition-opacity ${active ? 'text-slate-400' : 'text-slate-500 opacity-0 group-hover:opacity-100'}`}>
                        {description}
                    </span>
                )}
            </div>

            {active && (
                <div className={`relative z-10 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${theme.accentBgStrong} ${theme.accentText} border ${theme.accentBorder}`}>
                    Aktif
                </div>
            )}

            {active && <div className={`absolute inset-0 opacity-20 bg-gradient-to-r ${theme.navItemGlow}`} />}
            {!active && <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}
        </div>
    );
}
