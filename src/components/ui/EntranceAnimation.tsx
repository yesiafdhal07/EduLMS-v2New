'use client';

import { useState, useEffect } from 'react';
import { getRoleTheme } from '@/lib/theme/roleTheme';

type Role = 'admin' | 'kepala_sekolah' | 'guru' | 'siswa' | 'default';

interface EntranceAnimationProps {
    children: React.ReactNode;
    role?: Role;
}

export function EntranceAnimation({ children, role = 'default' }: EntranceAnimationProps) {
    const [showSplash, setShowSplash] = useState(true);
    const [animationPhase, setAnimationPhase] = useState<'logo' | 'text' | 'exit'>('logo');

    const theme = getRoleTheme(role);
    const IconComponent = theme.icon;

    useEffect(() => {
        const logoTimer = setTimeout(() => setAnimationPhase('text'), 400);
        const exitTimer = setTimeout(() => setAnimationPhase('exit'), 1400);
        const hideTimer = setTimeout(() => setShowSplash(false), 1900);

        return () => {
            clearTimeout(logoTimer);
            clearTimeout(exitTimer);
            clearTimeout(hideTimer);
        };
    }, []);

    return (
        <>
            {showSplash && (
                <div
                    key="splash-screen"
                    className={`fixed inset-0 z-[99999] bg-gradient-to-br ${theme.splashGradient} flex flex-col items-center justify-center transition-all duration-500 ${
                        animationPhase === 'exit' 
                            ? 'opacity-0 scale-110 pointer-events-none' 
                            : 'opacity-100 scale-100 pointer-events-auto'
                    }`}
                >
                    <div className="absolute inset-0 overflow-hidden">
                        <div className={`absolute -top-1/2 -left-1/2 w-full h-full ${theme.splashBlob1} rounded-full blur-3xl animate-pulse`} />
                        <div className={`absolute -bottom-1/2 -right-1/2 w-full h-full ${theme.splashBlob2} rounded-full blur-3xl animate-pulse delay-300`} />
                    </div>

                    <div
                        className={`relative transition-all duration-500 ease-out ${animationPhase === 'logo'
                                ? 'scale-150 opacity-0'
                                : 'scale-100 opacity-100'
                            }`}
                    >
                        <div className={`w-24 h-24 bg-gradient-to-br ${theme.splashIconBg} rounded-[1.75rem] flex items-center justify-center shadow-2xl ${theme.splashIconShadow} rotate-3 animate-bounce-subtle`}>
                            <IconComponent size={48} className="text-white drop-shadow-lg" />
                        </div>
                        <div className={`absolute inset-0 rounded-[1.75rem] ${theme.splashIconGlow} blur-xl animate-ping-slow`} />
                    </div>

                    <div
                        className={`mt-6 text-center transition-all duration-500 delay-100 ${animationPhase === 'text' || animationPhase === 'exit'
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-4'
                            }`}
                    >
                        <h1 className="text-4xl font-black text-white tracking-tight mb-1">
                            Klolakelas <span className={theme.splashTextAccent}> {theme.label}</span>
                        </h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.25em]">
                            {theme.subtitle}
                        </p>
                    </div>

                    <div
                        className={`mt-8 flex gap-1.5 transition-all duration-300 delay-200 ${animationPhase === 'text' || animationPhase === 'exit'
                                ? 'opacity-100'
                                : 'opacity-0'
                            }`}
                    >
                        <div className={`w-2 h-2 ${theme.splashDots[0]} rounded-full animate-bounce [animation-delay:-0.3s]`} />
                        <div className={`w-2 h-2 ${theme.splashDots[1]} rounded-full animate-bounce [animation-delay:-0.15s]`} />
                        <div className={`w-2 h-2 ${theme.splashDots[2]} rounded-full animate-bounce`} />
                    </div>
                </div>
            )}

            <div key="content-wrapper" className={!showSplash || animationPhase === 'exit' ? 'opacity-100' : 'opacity-0'}>
                {children}
            </div>
        </>
    );
}
