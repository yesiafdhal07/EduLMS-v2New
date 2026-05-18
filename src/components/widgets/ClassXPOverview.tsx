'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trophy, Star, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LEVEL_THRESHOLDS } from '@/hooks/useXPSystem';

interface ClassXPOverviewProps {
    classId: string;
    className?: string;
}

interface StudentXP {
    user_id: string;
    full_name: string;
    xp_total: number;
    level: number;
}

const LEVEL_COLORS = [
    'from-slate-400 to-slate-500',
    'from-emerald-400 to-emerald-600',
    'from-blue-400 to-blue-600',
    'from-violet-400 to-violet-600',
    'from-amber-400 to-amber-600',
];

/**
 * Class XP Overview Widget
 * Shows top students by XP/level
 */
export function ClassXPOverview({ classId, className = '' }: ClassXPOverviewProps) {
    const [leaderboard, setLeaderboard] = useState<StudentXP[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaderboard = useCallback(async () => {
        if (!classId) return;

        setLoading(true);
        try {
            // First get class members
            const { data: members, error: membersError } = await supabase
                .from('class_members')
                .select('user_id')
                .eq('class_id', classId);

            if (membersError || !members?.length) {
                setLeaderboard([]);
                return;
            }

            const userIds = members.map(m => m.user_id);

            // Get user names
            const { data: users } = await supabase
                .from('users')
                .select('id, full_name')
                .in('id', userIds);

            // Try to get XP data
            let xpData: { user_id: string; total_points: number; level: number }[] = [];
            try {
                const { data } = await supabase
                    .from('user_points')
                    .select('user_id, total_points, level')
                    .in('user_id', userIds);
                xpData = data || [];
            } catch {
                // table doesn't exist yet, use empty array
            }

            // Combine data
            const formattedData: StudentXP[] = userIds
                .map(userId => {
                    const user = users?.find(u => u.id === userId);
                    const xp = xpData.find(x => x.user_id === userId);
                    return {
                        user_id: userId,
                        full_name: user?.full_name || 'Siswa',
                        xp_total: xp?.total_points || 0,
                        level: xp?.level || 1
                    };
                })
                .sort((a, b) => b.xp_total - a.xp_total)
                .slice(0, 5);

            setLeaderboard(formattedData);
        } catch (err) {
            // Silently handle table not found errors
            console.warn('XP data not available:', err);
            setLeaderboard([]);
        } finally {
            setLoading(false);
        }
    }, [classId]);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    if (loading) {
        return (
            <div className={`bg-white/5 backdrop-blur-lg rounded-2xl p-5 border border-white/10 animate-pulse h-60 ${className}`} />
        );
    }

    if (leaderboard.length === 0) {
        return (
            <div className={`bg-white/5 backdrop-blur-lg rounded-2xl p-5 border border-white/10 ${className}`}>
                <div className="flex items-center gap-3 mb-4">
                    <Trophy className="text-amber-400" size={24} />
                    <span className="font-bold text-white">Top Siswa XP</span>
                </div>
                <p className="text-sm text-slate-500">Belum ada data XP siswa.</p>
            </div>
        );
    }

    return (
        <div className={`universe-card p-6 ${className}`}>
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                    <Trophy className="text-amber-400" size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-white text-base">Top Performance</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">XP Leaderboard</p>
                </div>
            </div>

            <div className="space-y-2">
                {leaderboard.map((student, index) => {
                    const levelColor = LEVEL_COLORS[Math.min(student.level - 1, LEVEL_COLORS.length - 1)];
                    return (
                        <div 
                            key={student.user_id}
                            className="flex items-center gap-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-2xl p-3 transition-all group/item"
                        >
                            {/* Rank Badge */}
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] ${
                                index === 0 ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' :
                                index === 1 ? 'bg-slate-400 text-white' :
                                index === 2 ? 'bg-amber-700 text-white' :
                                'bg-white/5 text-slate-500'
                            }`}>
                                {index + 1}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-xs truncate group-hover/item:text-indigo-400 transition-colors">{student.full_name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className={`w-3.5 h-3.5 rounded-sm bg-gradient-to-br ${levelColor} flex items-center justify-center shadow-sm`}>
                                        <span className="text-[7px] font-black text-white">{student.level}</span>
                                    </div>
                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">LVL {student.level}</span>
                                </div>
                            </div>

                            {/* XP Value */}
                            <div className="flex items-center gap-1 text-amber-400 bg-amber-400/5 px-2 py-1 rounded-lg border border-amber-400/10">
                                <Star size={10} fill="currentColor" />
                                <span className="text-xs font-black tabular-nums">{student.xp_total}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ClassXPOverview;
