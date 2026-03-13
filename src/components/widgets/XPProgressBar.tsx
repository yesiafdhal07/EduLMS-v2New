'use client';

import { useRef, useState, useEffect } from 'react';
import { Trophy, Star } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';

interface XPProgressBarProps {
    currentXP: number;
    level: number;
    nextLevelXP: number;
    className?: string;
    variant?: 'default' | 'compact' | 'minimal';
}

export function XPProgressBar({ currentXP, level, nextLevelXP, className = '', variant = 'default' }: XPProgressBarProps) {
    const [displayXP, setDisplayXP] = useState(currentXP);
    const xpContainerRef = useRef<HTMLDivElement>(null);
    const xpValRef = useRef({ val: currentXP });
    
    const progress = Math.min(100, Math.max(0, (displayXP / nextLevelXP) * 100));
    const xpRemaining = Math.max(0, nextLevelXP - displayXP);

    // Number Ticking Animation
    useGSAP(() => {
        gsap.to(xpValRef.current, {
            val: currentXP,
            duration: 1.5,
            ease: "power2.out",
            onUpdate: () => {
                setDisplayXP(Math.round(xpValRef.current.val));
            }
        });
    }, [currentXP]);

    // Level-up celebration animation (burst effect)
    useGSAP(() => {
        if (level > 1) { // Skip on initial load
            gsap.fromTo(".level-badge", 
                { scale: 0.8, rotate: -10 },
                { scale: 1.2, rotate: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" }
            );
        }
    }, [level]);

    if (variant === 'minimal') {
        return (
            <div className={`flex items-center gap-3 ${className}`}>
                <div className="level-badge w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-black text-xs border border-amber-500/30">
                    {level}
                </div>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className={`bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-4 ${className}`}>
                <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                        <div className="level-badge bg-amber-500/10 p-1.5 rounded-lg">
                            <Trophy size={16} className="text-amber-500" />
                        </div>
                        <span className="text-sm font-bold text-white">Level {level}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                        <span className="text-amber-400 font-bold">{displayXP}</span> / {nextLevelXP} XP
                    </span>
                </div>
                <div className={`w-full bg-slate-800 rounded-full overflow-hidden border border-white/5 h-3`}>
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_100%] animate-gradient-x shadow-[0_0_20px_rgba(99,102,241,0.5)] relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={xpContainerRef} className={`glass-panel p-6 rounded-[2rem] relative overflow-hidden group ${className}`}>
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="level-badge w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 transform -rotate-3 group-hover:rotate-0 transition-transform duration-300">
                    <span className="text-2xl font-black text-white drop-shadow-md">{level}</span>
                </div>
                <div>
                    <h3 className="text-lg font-black text-white tracking-tight">Level {level}</h3>
                    <p className="text-amber-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                        <Star size={12} className="fill-amber-400" />
                        {level < 5 ? 'Pemula' : level < 10 ? 'Menengah' : 'Ahli'}
                    </p>
                </div>
                <div className="ml-auto text-right">
                    <p className="text-2xl font-black text-white tracking-tighter">{displayXP}</p>
                    <p className="text-xs text-slate-400 font-medium">/ {nextLevelXP} XP</p>
                </div>
            </div>

            <div className="relative h-4 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
                <div 
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 shadow-[0_0_20px_rgba(251,191,36,0.4)] relative"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
                </div>
            </div>

            <p className="text-center text-xs text-slate-500 mt-4 font-medium">
                Butuh <span className="text-white font-bold">{Math.round(xpRemaining)} XP</span> lagi untuk naik level berikutnya!
            </p>
        </div>
    );
}
