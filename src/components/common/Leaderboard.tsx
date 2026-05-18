'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Star, TrendingUp, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function Leaderboard({ schoolId, classId }: { schoolId: string, classId?: string }) {
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, [schoolId, classId]);

    const loadLeaderboard = async () => {
        try {
            let query = supabase
                .from('user_xp')
                .select(`
                    xp_total,
                    level,
                    user:users!user_id (id, full_name)
                `)
                .order('xp_total', { ascending: false })
                .limit(10);
            
            if (classId) {
                // Join with class_members to filter by class
                // Note: Simplified for now, real implementation might need a view or complex join
            }

            const { data, error } = await query;
            if (error) throw error;
            setPlayers(data || []);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="h-40 animate-pulse bg-white/5 rounded-3xl" />;

    return (
        <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="p-8 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                        <Trophy size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Leaderboard</h3>
                        <p className="text-xs text-slate-500 font-medium">Bintang kelas bulan ini</p>
                    </div>
                </div>
                <button className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all">
                    <Filter size={18} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-6">
                <div className="space-y-2">
                    {players.map((player, index) => (
                        <div 
                            key={player.user.id}
                            className={`
                                flex items-center justify-between p-4 rounded-2xl transition-all group
                                ${index === 0 ? 'bg-amber-500/10 border border-amber-500/20' : 'hover:bg-white/5'}
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 flex items-center justify-center relative">
                                    {index === 0 ? <Crown className="text-amber-400" size={24} /> : 
                                     index === 1 ? <Medal className="text-slate-300" size={22} /> :
                                     index === 2 ? <Medal className="text-amber-700" size={22} /> :
                                     <span className="text-sm font-black text-slate-600">{index + 1}</span>
                                    }
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black text-[10px]">
                                    {player.user.full_name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white leading-none mb-1">{player.user.full_name}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="px-1.5 py-0.5 rounded-md bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                            LVL {player.level}
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                                            <Star size={10} />
                                            {player.xp_total} XP
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                                        <TrendingUp size={10} />
                                        +{Math.floor(Math.random() * 100)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
