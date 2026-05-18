'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Sparkles } from 'lucide-react';

interface XPProgressBarProps {
    currentXP: number;
    level: number;
    nextLevelXP: number;
    className?: string;
    variant?: 'default' | 'compact' | 'minimal';
}

export function XPProgressBar({ currentXP, level, nextLevelXP, className = '', variant = 'default' }: XPProgressBarProps) {
    const [displayXP, setDisplayXP] = useState(currentXP);
    
    // Simple count-up effect without GSAP for stability
    useEffect(() => {
        const start = displayXP;
        const end = currentXP;
        if (start === end) return;

        const duration = 1000;
        const startTime = performance.now();

        function update(currentTime: number) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.round(start + (end - start) * progress);
            setDisplayXP(current);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }, [currentXP]);

    const progress = Math.min(100, Math.max(0, (displayXP / nextLevelXP) * 100));
    const xpRemaining = Math.max(0, nextLevelXP - displayXP);

    // SISWA UNIVERSE DNA — emerald/cyan/neon
    if (variant === 'minimal') {
        return (
            <div className={`flex items-center gap-3 font-space-grotesk ${className}`}>
                <div className="level-badge w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs border border-emerald-500/30">
                    {level}
                </div>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className={`universe-card p-4 font-space-grotesk ${className}`}>
                <div className="flex justify-between items-end mb-2.5">
                    <div className="flex items-center gap-2">
                        <div className="level-badge bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20">
                            <Trophy size={14} className="text-emerald-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-emerald-500/70 uppercase tracking-widest leading-none mb-1">Level</span>
                            <span className="text-sm font-black text-white leading-none">{level}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-500 block mb-0.5 uppercase tracking-wider">Progress XP</span>
                        <span className="text-xs font-black text-emerald-400">
                            {displayXP.toLocaleString()} <span className="text-slate-600">/ {nextLevelXP.toLocaleString()}</span>
                        </span>
                    </div>
                </div>
                <div className="w-full bg-white/5 rounded-full overflow-hidden border border-white/8 h-3.5 relative">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500 bg-[length:200%_100%] transition-all duration-1000 ease-out relative"
                        style={{ width: `${progress}%`, animation: 'nebulaFloat 3s linear infinite' }}
                    >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`universe-card p-6 relative overflow-hidden group font-space-grotesk ${className}`}>
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-500"></div>

            <div className="flex items-center gap-5 mb-5 relative z-10">
                <div className="level-badge w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 transform -rotate-3 group-hover:rotate-0 transition-all duration-500 border border-white/10">
                    <span className="text-3xl font-black text-white drop-shadow-md">{level}</span>
                    <Sparkles className="absolute -top-2 -right-2 text-yellow-300 w-5 h-5 animate-pulse" />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Star size={12} className="fill-emerald-400 text-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                            {level < 5 ? 'Novice' : level < 15 ? 'Apprentice' : 'Grandmaster'}
                        </span>
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight leading-none">Power Rank</h3>
                </div>
                <div className="ml-auto text-right">
                    <p className="text-2xl font-black text-white tracking-tighter tabular-nums">{displayXP.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">/ {nextLevelXP.toLocaleString()} XP</p>
                </div>
            </div>

            <div className="relative h-5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
                <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-teal-400 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                </div>
            </div>

            <p className="text-center text-[11px] text-slate-500 mt-5 font-medium tracking-wide">
                Kumpulkan <span className="text-emerald-400 font-black">{Math.round(xpRemaining).toLocaleString()} XP</span> lagi untuk mencapai <span className="text-white font-black">Level {level + 1}</span>
            </p>
        </div>
    );
}
