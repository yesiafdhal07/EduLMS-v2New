'use client';

import { useEffect } from 'react';
import { Trophy, Medal, Award, Star, Crown } from 'lucide-react';
import type { LeaderboardEntry } from '@/hooks/useGamification';

interface LeaderboardProps {
    entries: LeaderboardEntry[];
    currentUserId?: string;
    onRefresh?: () => void;
    loading?: boolean;
}

/**
 * Leaderboard component showing top students by points
 */
export function Leaderboard({ entries, currentUserId, onRefresh, loading }: LeaderboardProps) {
    // Get rank icon/style
    const getRankDisplay = (rank: number) => {
        switch (rank) {
            case 1:
                return { icon: <Crown className="text-amber-400" size={24} />, bg: 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30', border: 'border-amber-500/50' };
            case 2:
                return { icon: <Medal className="text-slate-300" size={22} />, bg: 'bg-gradient-to-r from-slate-400/20 to-slate-300/20', border: 'border-slate-400/50' };
            case 3:
                return { icon: <Award className="text-amber-700" size={22} />, bg: 'bg-gradient-to-r from-amber-700/20 to-orange-700/20', border: 'border-amber-700/50' };
            default:
                return { icon: <span className="text-slate-400 font-bold">{rank}</span>, bg: 'bg-white/5', border: 'border-white/10' };
        }
    };

    // Calculate level from points
    const getLevel = (points: number) => Math.floor(points / 100) + 1;

    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Trophy className="text-amber-400" size={24} />
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">
                        Leaderboard
                    </h3>
                </div>
                {onRefresh && (
                    <button 
                        onClick={onRefresh}
                        disabled={loading}
                        className="text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Memuat...' : '↻ Refresh'}
                    </button>
                )}
            </div>

            {/* Entries */}
            <div className="divide-y divide-white/5">
                {entries.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        <Star className="mx-auto mb-3 opacity-50" size={32} />
                        <p>Belum ada data leaderboard</p>
                    </div>
                ) : (
                    entries.map((entry) => {
                        const { icon, bg, border } = getRankDisplay(entry.rank);
                        const isCurrentUser = entry.user_id === currentUserId;

                        return (
                            <div 
                                key={entry.user_id}
                                className={`flex items-center gap-4 p-4 ${bg} ${isCurrentUser ? 'ring-2 ring-indigo-500/50' : ''} transition-all hover:bg-white/10`}
                            >
                                {/* Rank */}
                                <div className={`w-10 h-10 rounded-xl ${border} border flex items-center justify-center`}>
                                    {icon}
                                </div>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <p className={`font-bold truncate ${isCurrentUser ? 'text-indigo-400' : 'text-white'}`}>
                                        {entry.full_name}
                                        {isCurrentUser && <span className="text-xs ml-2">(Kamu)</span>}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Level {entry.level}
                                    </p>
                                </div>

                                {/* Points */}
                                <div className="text-right">
                                    <p className="text-lg font-black text-white">
                                        {entry.total_points.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-slate-400">poin</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Current User Position (if not in top) */}
            {currentUserId && !entries.find(e => e.user_id === currentUserId) && (
                <div className="p-4 border-t border-white/10 bg-indigo-500/10">
                    <p className="text-center text-sm text-slate-400">
                        Kumpulkan lebih banyak poin untuk masuk leaderboard! 💪
                    </p>
                </div>
            )}
        </div>
    );
}

/**
 * Compact leaderboard for sidebar/widget
 */
export function LeaderboardCompact({ entries, currentUserId }: { entries: LeaderboardEntry[]; currentUserId?: string }) {
    const top3 = entries.slice(0, 3);
    
    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
                <Trophy className="text-amber-400" size={18} />
                <span className="text-sm font-bold text-white">Top 3</span>
            </div>
            
            <div className="space-y-2">
                {top3.map((entry, i) => (
                    <div key={entry.user_id} className="flex items-center gap-2">
                        <span className="text-lg">{['🥇', '🥈', '🥉'][i]}</span>
                        <span className={`text-sm truncate flex-1 ${entry.user_id === currentUserId ? 'text-indigo-400 font-bold' : 'text-slate-300'}`}>
                            {entry.full_name}
                        </span>
                        <span className="text-xs text-slate-400">{entry.total_points}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
