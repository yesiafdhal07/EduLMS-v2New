'use client';

import { useEffect, useState } from 'react';
import type { Badge } from '@/hooks/useGamification';

interface BadgeCelebrationProps {
    badge: Badge | null;
    onClose: () => void;
}

/**
 * Celebration modal when a new badge is earned
 * Shows with confetti animation and sound effect
 */
export function BadgeCelebration({ badge, onClose }: BadgeCelebrationProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (badge) {
            setVisible(true);
            // Auto-close after 5 seconds
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onClose, 300);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [badge, onClose]);

    if (!badge) return null;

    const rarityColors = {
        common: 'from-slate-400 to-slate-600',
        rare: 'from-blue-400 to-blue-600',
        epic: 'from-purple-400 to-purple-600',
        legendary: 'from-amber-400 to-amber-600',
    };

    return (
        <div 
            className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            {/* Backdrop with confetti effect */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Confetti Animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 50 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-3 h-3 animate-confetti"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#9B59B6', '#3498DB'][i % 5],
                            transform: `rotate(${Math.random() * 360}deg)`,
                        }}
                    />
                ))}
            </div>

            {/* Modal Content */}
            <div className={`relative bg-gradient-to-br ${rarityColors[badge.rarity]} p-1 rounded-[3rem] animate-in zoom-in-95 duration-500`}>
                <div className="bg-slate-900 rounded-[2.8rem] p-8 text-center">
                    {/* Badge Icon */}
                    <div className="text-8xl mb-4 animate-bounce">
                        {badge.icon}
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">
                        Badge Baru!
                    </h2>

                    {/* Badge Name */}
                    <p className={`text-xl font-bold bg-gradient-to-r ${rarityColors[badge.rarity]} bg-clip-text text-transparent mb-4`}>
                        {badge.name}
                    </p>

                    {/* Description */}
                    <p className="text-slate-400 mb-6 max-w-xs mx-auto">
                        {badge.description}
                    </p>

                    {/* Points Earned */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full font-bold">
                        <span>+{badge.points}</span>
                        <span>Poin</span>
                    </div>

                    {/* Rarity Badge */}
                    <div className={`mt-4 inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-gradient-to-r ${rarityColors[badge.rarity]} text-white`}>
                        {badge.rarity}
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="mt-6 w-full py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all"
                    >
                        Keren! 🎉
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Grid display of user's earned badges
 */
interface BadgeDisplayProps {
    badges: Array<{ badge: Badge; earned_at: string }>;
    allBadges: Badge[];
    compact?: boolean;
}

export function BadgeDisplay({ badges, allBadges, compact = false }: BadgeDisplayProps) {
    const earnedBadgeIds = new Set(badges.map(b => b.badge.id));

    if (compact) {
        return (
            <div className="flex flex-wrap gap-2">
                {badges.slice(0, 5).map(({ badge }) => (
                    <span key={badge.id} className="text-2xl" title={badge.name}>
                        {badge.icon}
                    </span>
                ))}
                {badges.length > 5 && (
                    <span className="text-sm text-slate-400 font-bold">
                        +{badges.length - 5}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-6 border border-white/10">
            <h3 className="text-lg font-black text-white mb-4 uppercase tracking-tight">
                Badge Saya
            </h3>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                {allBadges.map((badge) => {
                    const isEarned = earnedBadgeIds.has(badge.id);
                    return (
                        <div
                            key={badge.id}
                            className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                                isEarned 
                                    ? 'bg-white/10 hover:bg-white/20' 
                                    : 'bg-white/5 opacity-40 grayscale'
                            }`}
                            title={isEarned ? badge.description : 'Belum didapat'}
                        >
                            <span className="text-3xl mb-1">{badge.icon}</span>
                            <span className="text-[10px] text-center text-slate-300 font-bold truncate w-full">
                                {badge.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
