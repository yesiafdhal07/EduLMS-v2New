'use client';

import { useState, useEffect, useCallback } from 'react';
import { Smile, Frown, Meh, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ClassMoodOverviewProps {
    classId: string;
    className?: string;
}

interface MoodData {
    avgMood: number;
    totalCheckins: number;
    trend: 'up' | 'down' | 'stable';
    distribution: number[];
}

const MOOD_EMOJIS = ['😢', '😔', '😐', '🙂', '😄'];
const MOOD_COLORS = ['bg-rose-500', 'bg-amber-500', 'bg-slate-400', 'bg-emerald-400', 'bg-emerald-500'];

/**
 * Class Mood Overview Widget
 * Shows aggregated mood data for a class
 */
export function ClassMoodOverview({ classId, className = '' }: ClassMoodOverviewProps) {
    const [moodData, setMoodData] = useState<MoodData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchMoodData = useCallback(async () => {
        if (!classId) return;

        setLoading(true);
        try {
            // Get class members
            const { data: members } = await supabase
                .from('class_members')
                .select('user_id')
                .eq('class_id', classId);

            if (!members || members.length === 0) {
                setMoodData(null);
                return;
            }

            const userIds = members.map(m => m.user_id);

            // Get recent moods (last 7 days)
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);

            const { data: moods } = await supabase
                .from('mood_logs')
                .select('mood, created_at')
                .in('user_id', userIds)
                .gte('created_at', weekAgo.toISOString());

            if (!moods || moods.length === 0) {
                setMoodData(null);
                return;
            }

            // Calculate metrics
            const avgMood = moods.reduce((sum, m) => sum + m.mood, 0) / moods.length;
            
            // Distribution (count per mood level)
            const distribution = [0, 0, 0, 0, 0];
            moods.forEach(m => {
                distribution[m.mood - 1]++;
            });

            // Calculate trend (compare first half vs second half of week)
            const midPoint = new Date(weekAgo.getTime() + (Date.now() - weekAgo.getTime()) / 2);
            const firstHalf = moods.filter(m => new Date(m.created_at) < midPoint);
            const secondHalf = moods.filter(m => new Date(m.created_at) >= midPoint);

            const firstAvg = firstHalf.length > 0 
                ? firstHalf.reduce((sum, m) => sum + m.mood, 0) / firstHalf.length 
                : 0;
            const secondAvg = secondHalf.length > 0 
                ? secondHalf.reduce((sum, m) => sum + m.mood, 0) / secondHalf.length 
                : 0;

            let trend: 'up' | 'down' | 'stable' = 'stable';
            if (secondAvg - firstAvg > 0.3) trend = 'up';
            else if (firstAvg - secondAvg > 0.3) trend = 'down';

            setMoodData({
                avgMood,
                totalCheckins: moods.length,
                trend,
                distribution
            });
        } catch (err) {
            console.error('Failed to fetch mood data:', err);
        } finally {
            setLoading(false);
        }
    }, [classId, supabase]);

    useEffect(() => {
        fetchMoodData();
    }, [fetchMoodData]);

    if (loading) {
        return (
            <div className={`bg-white/5 backdrop-blur-lg rounded-2xl p-5 border border-white/10 animate-pulse h-40 ${className}`} />
        );
    }

    if (!moodData) {
        return (
            <div className={`bg-white/5 backdrop-blur-lg rounded-2xl p-5 border border-white/10 ${className}`}>
                <div className="flex items-center gap-3 mb-4">
                    <Smile className="text-slate-500" size={24} />
                    <span className="font-bold text-slate-400">Mood Kelas</span>
                </div>
                <p className="text-sm text-slate-500">Belum ada data mood minggu ini.</p>
            </div>
        );
    }

    const getMoodIcon = (avg: number) => {
        if (avg >= 4) return <Smile className="text-emerald-400" size={28} />;
        if (avg >= 3) return <Meh className="text-slate-400" size={28} />;
        return <Frown className="text-rose-400" size={28} />;
    };

    const getMoodLabel = (avg: number) => {
        if (avg >= 4) return 'Sangat Baik';
        if (avg >= 3.5) return 'Baik';
        if (avg >= 2.5) return 'Cukup';
        if (avg >= 2) return 'Kurang';
        return 'Perlu Perhatian';
    };

    return (
        <div className={`universe-card p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        {getMoodIcon(moodData.avgMood)}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base">Class Mood</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{moodData.totalCheckins} check-ins</p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 ${
                    moodData.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 
                    moodData.trend === 'down' ? 'bg-rose-500/10 text-rose-400' : 'bg-white/5 text-slate-400'
                }`}>
                    {moodData.trend === 'up' && <TrendingUp size={12} />}
                    {moodData.trend === 'down' && <TrendingDown size={12} />}
                    {getMoodLabel(moodData.avgMood)}
                </div>
            </div>

            {/* Mood Distribution Bar */}
            <div className="flex gap-1 h-6 mb-6 px-1">
                {moodData.distribution.map((count, i) => {
                    const percentage = (count / moodData.totalCheckins) * 100;
                    if (percentage === 0) return null;
                    return (
                        <div
                            key={i}
                            className={`${MOOD_COLORS[i]} rounded-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-[1.02]`}
                            style={{ width: `${Math.max(percentage, 8)}%` }}
                            title={`${MOOD_EMOJIS[i]}: ${count} siswa`}
                        >
                            <span className="text-[10px]">{MOOD_EMOJIS[i]}</span>
                        </div>
                    );
                })}
            </div>

            {/* Average Score */}
            <div className="flex items-center justify-center gap-3 bg-white/[0.02] border border-white/5 rounded-2xl py-3 group-hover:bg-white/[0.04] transition-all">
                <span className="text-3xl font-black text-white tracking-tighter tabular-nums">{moodData.avgMood.toFixed(1)}</span>
                <div className="h-6 w-px bg-white/10" />
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Global Index</span>
            </div>
        </div>
    );
}

export default ClassMoodOverview;
