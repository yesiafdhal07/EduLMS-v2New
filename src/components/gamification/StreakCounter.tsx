'use client';

import type { UserStreak } from '@/hooks/useGamification';

interface StreakCounterProps {
    streak: UserStreak | null;
    compact?: boolean;
}

/**
 * Displays the user's current streak with fire animation
 */
export function StreakCounter({ streak, compact = false }: StreakCounterProps) {
    const currentStreak = streak?.current_streak || 0;
    const longestStreak = streak?.longest_streak || 0;

    // Get motivational message based on streak
    const getMessage = (days: number): string => {
        if (days === 0) return 'Mulai streak hari ini!';
        if (days === 1) return 'Awal yang bagus!';
        if (days < 7) return 'Pertahankan!';
        if (days < 14) return 'Semangat belajar!';
        if (days < 30) return 'Luar biasa!';
        return 'LEGENDARIS! 🏆';
    };

    // Get fire intensity based on streak
    const getFireLevel = (days: number): number => {
        if (days === 0) return 0;
        if (days < 3) return 1;
        if (days < 7) return 2;
        if (days < 14) return 3;
        return 4;
    };

    const fireLevel = getFireLevel(currentStreak);
    const fires = '🔥'.repeat(Math.min(fireLevel, 4));

    if (compact) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 rounded-full">
                <span className="text-lg">{currentStreak > 0 ? '🔥' : '❄️'}</span>
                <span className="text-sm font-bold text-orange-400">
                    {currentStreak} hari
                </span>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-[2rem] p-6 border border-orange-500/30">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                    Streak
                </h3>
                <span className="text-xs text-slate-400">
                    Rekor: {longestStreak} hari
                </span>
            </div>

            <div className="flex items-center gap-4">
                {/* Fire Animation */}
                <div className="relative">
                    <span className={`text-5xl ${currentStreak > 0 ? 'animate-pulse' : ''}`}>
                        {currentStreak > 0 ? fires || '🔥' : '❄️'}
                    </span>
                    {currentStreak >= 7 && (
                        <span className="absolute -top-2 -right-2 text-2xl animate-bounce">⚡</span>
                    )}
                </div>

                {/* Stats */}
                <div className="flex-1">
                    <p className="text-4xl font-black text-white">
                        {currentStreak}
                        <span className="text-lg text-slate-400 ml-2">hari</span>
                    </p>
                    <p className="text-sm text-orange-400 font-bold mt-1">
                        {getMessage(currentStreak)}
                    </p>
                </div>
            </div>

            {/* Progress to next milestone */}
            {currentStreak > 0 && (
                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span>Menuju milestone</span>
                        <span>
                            {currentStreak < 7 ? '7 hari' : 
                             currentStreak < 14 ? '14 hari' : 
                             currentStreak < 30 ? '30 hari' : '🏆 Legend'}
                        </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                            style={{ 
                                width: `${Math.min(100, 
                                    currentStreak < 7 ? (currentStreak / 7) * 100 :
                                    currentStreak < 14 ? ((currentStreak - 7) / 7) * 100 :
                                    currentStreak < 30 ? ((currentStreak - 14) / 16) * 100 : 100
                                )}%` 
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
