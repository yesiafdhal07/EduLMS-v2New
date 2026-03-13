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
                relative group rounded-3xl p-6 transition-all duration-300 overflow-hidden cursor-default
                ${isUnlocked
                    ? `bg-gradient-to-br ${getRarityColor(badge.rarity)} border-t border-white/20 shadow-lg hover:shadow-2xl hover:-translate-y-2`
                    : 'bg-white/5 border border-white/5 grayscale opacity-60 hover:opacity-80 hover:scale-105'
                }
            `}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Shiny Effect for unlocked badges */}
            {isUnlocked && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine z-10 pointer-events-none"></div>
            )}

            <div className="relative z-20 flex flex-col items-center text-center gap-4">
                <div className={`
                    w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-inner
                    ${isUnlocked ? 'bg-black/20 backdrop-blur-sm' : 'bg-white/5'}
                `}>
                    {isUnlocked ? (
                        <span className="transform group-hover:scale-110 transition-transform duration-300">{badge.icon}</span>
                    ) : (
                        <Lock size={24} className="text-slate-500" />
                    )}
                </div>
                
                <div>
                    <h4 className={`font-black text-lg mb-1 ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                        {badge.name}
                    </h4>
                    <p className="text-xs font-medium opacity-80 leading-relaxed mb-3 text-slate-200">
                        {badge.description}
                    </p>
                    <span className={`
                        inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                        ${isUnlocked ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}
                    `}>
                        {badge.rarity}
                    </span>
                    {isUnlocked && badge.unlockedAt && (
                        <p className="text-[9px] text-white/60 mt-2 border-t border-white/10 pt-2">
                            Diraih: {new Date(badge.unlockedAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
