'use client';

import { Lock } from 'lucide-react';
import { useState } from 'react';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    points?: number;
    unlockedAt?: string | null; // If null, it's locked
}

interface BadgeListProps {
    badges: Badge[];
    className?: string;
}

export function BadgeList({ badges, className = '' }: BadgeListProps) {
    return (
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 ${className}`}>
            {badges.map((badge, idx) => (
                <BadgeCard key={badge.id} badge={badge} index={idx} />
            ))}
        </div>
    );
}

function getRarityColor(rarity: Badge['rarity']) {
    const colors = {
        common: 'from-slate-500 to-slate-700',
        rare: 'from-blue-500 to-indigo-600',
        epic: 'from-purple-500 to-fuchsia-600',
        legendary: 'from-amber-400 to-orange-600',
    };
    return colors[rarity] || colors.common;
}

function BadgeCard({ badge, index }: { badge: Badge; index: number }) {
    const isUnlocked = !!badge.unlockedAt;
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
                relative group rounded-[2.5rem] p-8 transition-all duration-500 overflow-hidden cursor-default
                ${isUnlocked
                    ? `bg-gradient-to-br ${getRarityColor(badge.rarity)} border-t border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_80px_rgba(180,163,255,0.4)] hover:-translate-y-3`
                    : 'bg-white/5 border border-white/5 grayscale opacity-40 hover:opacity-60 hover:scale-105'
                }
            `}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Holographic / Glass Shine Effect */}
            {isUnlocked && (
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-white/20 transition-colors duration-500"></div>
                </div>
            )}

            <div className="relative z-20 flex flex-col items-center text-center">
                <div className={`
                    w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl mb-6 shadow-2xl relative
                    ${isUnlocked ? 'bg-black/30 backdrop-blur-xl border border-white/20' : 'bg-white/5'}
                `}>
                    {isUnlocked ? (
                        <span className="transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                            {badge.icon}
                        </span>
                    ) : (
                        <Lock size={28} className="text-slate-600" />
                    )}
                    
                    {/* Rare Aura */}
                    {isUnlocked && (badge.rarity === 'epic' || badge.rarity === 'legendary') && (
                        <div className={`absolute inset-0 rounded-[2rem] animate-pulse opacity-50 ${badge.rarity === 'legendary' ? 'bg-amber-400/30' : 'bg-purple-400/30'}`}></div>
                    )}
                </div>
                
                <div className="space-y-2">
                    <h4 className={`font-black text-xl tracking-tight leading-tight ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                        {badge.name}
                    </h4>
                    <p className={`text-xs font-bold leading-relaxed px-2 ${isUnlocked ? 'text-white/70' : 'text-slate-600'}`}>
                        {badge.description}
                    </p>
                    
                    <div className="pt-4 flex flex-col items-center gap-3">
                        <span className={`
                            px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border
                            ${isUnlocked 
                                ? 'bg-white/20 text-white border-white/20' 
                                : 'bg-white/5 text-slate-700 border-white/5'}
                        `}>
                            {badge.rarity}
                        </span>
                        
                        {isUnlocked && badge.unlockedAt && (
                            <div className="w-full pt-3 border-t border-white/10">
                                <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">
                                    Unlocked On {new Date(badge.unlockedAt).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
