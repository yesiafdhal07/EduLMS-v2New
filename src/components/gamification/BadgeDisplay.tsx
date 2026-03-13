'use client';

import { useEffect, useState, useRef } from 'react';
import type { Badge } from '@/hooks/useGamification';
import { HoloCard } from '@/components/ui';
import { useGSAP } from '@gsap/react';
import { gsap, Flip } from '@/lib/gsap';

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

    const rarityColors: Record<Badge['rarity'], string> = {
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

type BadgeFilter = 'all' | 'earned' | 'locked';

export function BadgeDisplay({ badges, allBadges, compact = false }: BadgeDisplayProps) {
    const [filter, setFilter] = useState<BadgeFilter>('all');
    const containerRef = useRef<HTMLDivElement>(null);
    const flipStateRef = useRef<any>(null);
    const earnedBadgeIds = new Set(badges.map(b => b.badge.id));

    // Handle filter change with Flip capture
    const handleFilterChange = (newFilter: BadgeFilter) => {
        if (newFilter === filter) return;
        
        // 1. Capture current state
        flipStateRef.current = Flip.getState(".badge-item");
        
        // 2. Update React state
        setFilter(newFilter);
    };

    useGSAP(() => {
        if (!flipStateRef.current) return;

        // 3. Animate from captured state
        Flip.from(flipStateRef.current, {
            duration: 0.6,
            ease: "power3.inOut",
            stagger: 0.02,
            fade: true,
            absolute: true, // Smooth layout re-flow
            onComplete: () => {
                flipStateRef.current = null;
            }
        });
    }, [filter]);

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

    const filteredBadges = allBadges.filter(badge => {
        const isEarned = earnedBadgeIds.has(badge.id);
        if (filter === 'earned') return isEarned;
        if (filter === 'locked') return !isEarned;
        return true;
    });

    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-6 border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                    Badge Saya
                </h3>
                
                {/* Filter Controls */}
                <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                    {(['all', 'earned', 'locked'] as BadgeFilter[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => handleFilterChange(f)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                filter === f 
                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {f === 'all' ? 'Semua' : f === 'earned' ? 'Didapat' : 'Terkunci'}
                        </button>
                    ))}
                </div>
            </div>

            <div ref={containerRef} className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-4 min-h-[100px]">
                {filteredBadges.map((badge) => {
                    const isEarned = earnedBadgeIds.has(badge.id);
                    
                    return (
                        <div 
                            key={badge.id} 
                            className="badge-item" 
                            data-flip-id={badge.id}
                        >
                            {isEarned ? (
                                <HoloCard
                                    rarityColor={
                                        badge.rarity === 'legendary' ? 'from-amber-400 to-amber-600' :
                                        badge.rarity === 'epic' ? 'from-purple-400 to-purple-600' :
                                        badge.rarity === 'rare' ? 'from-blue-400 to-blue-600' :
                                        'from-slate-400 to-slate-600'
                                    }
                                    className="w-full aspect-square flex flex-col items-center justify-center text-center p-2"
                                    title={badge.description}
                                >
                                    <span className="text-3xl sm:text-4xl mb-2 drop-shadow-md">{badge.icon}</span>
                                    <span className="text-[10px] sm:text-xs text-white font-black truncate w-full uppercase tracking-wider drop-shadow-md">
                                        {badge.name}
                                    </span>
                                </HoloCard>
                            ) : (
                                <div
                                    className="bg-white/5 opacity-40 grayscale flex flex-col items-center justify-center p-3 rounded-2xl border border-white/5 transition-all aspect-square text-center h-full w-full"
                                    title="Belum didapat"
                                >
                                    <span className="text-3xl mb-1">{badge.icon}</span>
                                    <span className="text-[10px] text-center text-slate-300 font-bold truncate w-full">
                                        {badge.name}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {filteredBadges.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-slate-500 font-bold italic">Belum ada badge di kategori ini.</p>
                </div>
            )}
        </div>
    );
}
