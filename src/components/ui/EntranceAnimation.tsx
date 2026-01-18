'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, BookOpen } from 'lucide-react';

// ========================================================
// ENTRANCE ANIMATION / SPLASH SCREEN
// Role-specific themed entrance animations:
// - Guru: Indigo/Purple theme with BookOpen icon
// - Siswa: Emerald/Green theme with GraduationCap icon
// - Default: Neutral indigo theme
// ========================================================

type Role = 'guru' | 'siswa' | 'default';

interface EntranceAnimationProps {
    children: React.ReactNode;
    role?: Role;
}

// Theme configurations for each role
const themes = {
    guru: {
        gradient: 'from-slate-900 via-indigo-950 to-slate-900',
        iconBg: 'from-indigo-500 to-purple-600',
        iconShadow: 'shadow-indigo-500/40',
        iconGlow: 'bg-indigo-500/20',
        textAccent: 'text-indigo-400',
        dots: ['bg-indigo-500', 'bg-indigo-400', 'bg-indigo-300'],
        bgBlob1: 'bg-indigo-500/10',
        bgBlob2: 'bg-purple-500/10',
        icon: BookOpen,
        title: 'EDU',
        titleAccent: 'Guru',
        subtitle: 'Panel Pengajar',
    },
    siswa: {
        gradient: 'from-slate-900 via-emerald-950 to-slate-900',
        iconBg: 'from-emerald-500 to-teal-600',
        iconShadow: 'shadow-emerald-500/40',
        iconGlow: 'bg-emerald-500/20',
        textAccent: 'text-emerald-400',
        dots: ['bg-emerald-500', 'bg-emerald-400', 'bg-emerald-300'],
        bgBlob1: 'bg-emerald-500/10',
        bgBlob2: 'bg-teal-500/10',
        icon: GraduationCap,
        title: 'EDU',
        titleAccent: 'Siswa',
        subtitle: 'Portal Pelajar',
    },
    default: {
        gradient: 'from-slate-900 via-indigo-950 to-slate-900',
        iconBg: 'from-indigo-500 to-purple-600',
        iconShadow: 'shadow-indigo-500/40',
        iconGlow: 'bg-indigo-500/20',
        textAccent: 'text-indigo-400',
        dots: ['bg-indigo-500', 'bg-indigo-400', 'bg-indigo-300'],
        bgBlob1: 'bg-indigo-500/10',
        bgBlob2: 'bg-purple-500/10',
        icon: GraduationCap,
        title: 'EDU',
        titleAccent: 'LMS',
        subtitle: 'Learning Platform',
    },
};

export function EntranceAnimation({ children, role = 'default' }: EntranceAnimationProps) {
    const [showSplash, setShowSplash] = useState(true);
    const [animationPhase, setAnimationPhase] = useState<'logo' | 'text' | 'exit'>('logo');

    const theme = themes[role];
    const IconComponent = theme.icon;

    useEffect(() => {
        // Animation sequence - runs on every page load
        const logoTimer = setTimeout(() => setAnimationPhase('text'), 400);
        const exitTimer = setTimeout(() => setAnimationPhase('exit'), 1400);
        const hideTimer = setTimeout(() => setShowSplash(false), 1900);

        return () => {
            clearTimeout(logoTimer);
            clearTimeout(exitTimer);
            clearTimeout(hideTimer);
        };
    }, []);

    if (!showSplash) {
        return <>{children}</>;
    }

    return (
        <>
            {/* Splash Screen */}
            <div
                className={`fixed inset-0 z-[99999] bg-gradient-to-br ${theme.gradient} flex flex-col items-center justify-center transition-all duration-500 ${
                    animationPhase === 'exit' 
                        ? 'opacity-0 scale-110 pointer-events-none' 
                        : 'opacity-100 scale-100 pointer-events-auto'
                }`}
            >
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className={`absolute -top-1/2 -left-1/2 w-full h-full ${theme.bgBlob1} rounded-full blur-3xl animate-pulse`} />
                    <div className={`absolute -bottom-1/2 -right-1/2 w-full h-full ${theme.bgBlob2} rounded-full blur-3xl animate-pulse delay-300`} />
                </div>

                {/* Logo */}
                <div
                    className={`relative transition-all duration-500 ease-out ${animationPhase === 'logo'
                            ? 'scale-150 opacity-0'
                            : 'scale-100 opacity-100'
                        }`}
                >
                    <div className={`w-24 h-24 bg-gradient-to-br ${theme.iconBg} rounded-[1.75rem] flex items-center justify-center shadow-2xl ${theme.iconShadow} rotate-3 animate-bounce-subtle`}>
                        <IconComponent size={48} className="text-white drop-shadow-lg" />
                    </div>

                    {/* Glow ring */}
                    <div className={`absolute inset-0 rounded-[1.75rem] ${theme.iconGlow} blur-xl animate-ping-slow`} />
                </div>

                {/* Text */}
                <div
                    className={`mt-6 text-center transition-all duration-500 delay-100 ${animationPhase === 'text' || animationPhase === 'exit'
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-4'
                        }`}
                >
                    <h1 className="text-4xl font-black text-white tracking-tight mb-1">
                        {theme.title}<span className={theme.textAccent}>{theme.titleAccent}</span>
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.25em]">
                        {theme.subtitle}
                    </p>
                </div>

                {/* Loading dots */}
                <div
                    className={`mt-8 flex gap-1.5 transition-all duration-300 delay-200 ${animationPhase === 'text' || animationPhase === 'exit'
                            ? 'opacity-100'
                            : 'opacity-0'
                        }`}
                >
                    <div className={`w-2 h-2 ${theme.dots[0]} rounded-full animate-bounce [animation-delay:-0.3s]`} />
                    <div className={`w-2 h-2 ${theme.dots[1]} rounded-full animate-bounce [animation-delay:-0.15s]`} />
                    <div className={`w-2 h-2 ${theme.dots[2]} rounded-full animate-bounce`} />
                </div>
            </div>

            {/* Content (hidden during splash) */}
            <div className={animationPhase === 'exit' ? 'opacity-100' : 'opacity-0'}>
                {children}
            </div>
        </>
    );
}
