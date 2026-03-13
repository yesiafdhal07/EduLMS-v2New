import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Badge } from '@/components/widgets/BadgeList';
import { triggerXPEffect } from '@/components/widgets/XPFlowParticles';
export type { Badge };

export interface UserStreak {
    current: number;
    longest: number;
}

export interface LeaderboardEntry {
    user_id: string;
    full_name: string;
    total_points: number;
    level: number;
    rank: number;
    avatar?: string;
}

export interface GamificationStats {
    totalXP: number;
    level: number;
    nextLevelXP: number;
    streak: UserStreak;
    badges: Badge[];
    leaderboard: LeaderboardEntry[];
}

export function useGamification() {
    const [stats, setStats] = useState<GamificationStats>({
        totalXP: 0,
        level: 1,
        nextLevelXP: 100,
        streak: { current: 0, longest: 0 },
        badges: [],
        leaderboard: []
    });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch User XP & Level
            const { data: xpData } = await supabase
                .from('user_points')
                .select('total_points, level')
                .eq('user_id', user.id)
                .single();

            // 2. Fetch User Streak
            const { data: streakData } = await supabase
                .from('user_streaks')
                .select('current_streak, longest_streak')
                .eq('user_id', user.id)
                .single();

            // 3. Fetch Badges (All badges + User unlocked status)
            const { data: allBadges } = await supabase
                .from('badges')
                .select('*');
            
            const { data: userBadges } = await supabase
                .from('user_badges')
                .select('badge_id, earned_at')
                .eq('user_id', user.id);

            const userBadgeMap = new Map(userBadges?.map(ub => [ub.badge_id, ub.earned_at]) || []);

            const formattedBadges: Badge[] = allBadges?.map(badge => ({
                id: badge.id,
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
                rarity: badge.rarity,
                unlockedAt: userBadgeMap.get(badge.id) || null
            })) || [];

            // 4. Fetch Leaderboard (Top 10)
            const { data: leaderboardData } = await supabase
                .from('user_points')
                .select('user_id, total_points, level, users(full_name, avatar_url)')
                .order('total_points', { ascending: false })
                .limit(10);

            const leaderboard: LeaderboardEntry[] = leaderboardData?.map((entry: any, index: number) => ({
                user_id: entry.user_id,
                full_name: entry.users?.full_name || 'Anonymous',
                avatar: entry.users?.avatar_url,
                total_points: entry.total_points,
                level: entry.level,
                rank: index + 1
            })) || [];

            setStats({
                totalXP: xpData?.total_points || 0,
                level: xpData?.level || 1,
                nextLevelXP: (xpData?.level || 1) * 100, // Simple formula: level * 100
                streak: {
                    current: streakData?.current_streak || 0,
                    longest: streakData?.longest_streak || 0
                },
                badges: formattedBadges,
                leaderboard
            });

        } catch (error) {
            console.error('Error fetching gamification data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Subscribe to changes
        const channels = [
            supabase.channel('gamification_xp')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'user_points' }, fetchData)
                .subscribe(),
            supabase.channel('gamification_badges')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'user_badges' }, fetchData)
                .subscribe()
        ];

        return () => {
            channels.forEach(channel => supabase.removeChannel(channel));
        };
    }, []);

    // Track XP changes to trigger particles
    useEffect(() => {
        const prevXP = localStorage.getItem('last_known_xp');
        const currentXP = stats.totalXP;
        
        if (prevXP && parseInt(prevXP) < currentXP) {
            triggerXPEffect(currentXP - parseInt(prevXP));
        }
        
        localStorage.setItem('last_known_xp', currentXP.toString());
    }, [stats.totalXP]);

    return { stats, loading, refresh: fetchData };
}
