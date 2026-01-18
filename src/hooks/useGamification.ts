'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ========================================================
// TYPES
// ========================================================

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'achievement' | 'streak' | 'milestone';
    criteria: Record<string, unknown>;
    points: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserBadge {
    id: string;
    badge: Badge;
    earned_at: string;
}

export interface UserStreak {
    current_streak: number;
    longest_streak: number;
    last_activity_date: string | null;
}

export interface UserPoints {
    total_points: number;
    level: number;
}

export interface LeaderboardEntry {
    user_id: string;
    full_name: string;
    total_points: number;
    level: number;
    rank: number;
}

// ========================================================
// HOOK
// ========================================================

export function useGamification(userId?: string) {
    const [badges, setBadges] = useState<UserBadge[]>([]);
    const [allBadges, setAllBadges] = useState<Badge[]>([]);
    const [streak, setStreak] = useState<UserStreak | null>(null);
    const [points, setPoints] = useState<UserPoints | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [newBadge, setNewBadge] = useState<Badge | null>(null); // For celebration modal

    // Fetch all gamification data
    const fetchGamificationData = useCallback(async () => {
        if (!userId) return;
        setLoading(true);

        try {
            const [badgesRes, userBadgesRes, streakRes, pointsRes] = await Promise.all([
                supabase.from('badges').select('*'),
                supabase.from('user_badges').select('*, badge:badges(*)').eq('user_id', userId),
                supabase.from('user_streaks').select('*').eq('user_id', userId).maybeSingle(),
                supabase.from('user_points').select('*').eq('user_id', userId).maybeSingle(),
            ]);

            if (badgesRes.data) setAllBadges(badgesRes.data);
            if (userBadgesRes.data) {
                setBadges(userBadgesRes.data.map(ub => ({
                    id: ub.id,
                    badge: ub.badge as Badge,
                    earned_at: ub.earned_at,
                })));
            }
            if (streakRes.data) setStreak(streakRes.data);
            if (pointsRes.data) setPoints(pointsRes.data);
        } catch (error) {
            console.error('[Gamification] Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Fetch leaderboard
    const fetchLeaderboard = useCallback(async (classId?: string, limit = 10) => {
        try {
            let result;
            
            if (classId) {
                // Query with class filter
                const { data, error } = await supabase
                    .from('user_points')
                    .select('user_id, total_points, level')
                    .order('total_points', { ascending: false })
                    .limit(limit);
                
                if (error) throw error;
                result = data;
            } else {
                // Query all users
                const { data, error } = await supabase
                    .from('user_points')
                    .select('user_id, total_points, level')
                    .order('total_points', { ascending: false })
                    .limit(limit);
                
                if (error) throw error;
                result = data;
            }

            if (result) {
                // Fetch user names separately to avoid complex join type issues
                const userIds = result.map(r => r.user_id);
                const { data: users } = await supabase
                    .from('users')
                    .select('id, full_name')
                    .in('id', userIds);

                const userMap = new Map(users?.map(u => [u.id, u.full_name]) || []);

                setLeaderboard(result.map((entry, index) => ({
                    user_id: entry.user_id,
                    full_name: userMap.get(entry.user_id) || 'Unknown',
                    total_points: entry.total_points,
                    level: entry.level,
                    rank: index + 1,
                })));
            }
        } catch (error) {
            console.error('[Leaderboard] Error:', error);
        }
    }, []);

    // Add points
    const addPoints = useCallback(async (
        amount: number,
        source: string,
        sourceId?: string,
        description?: string
    ) => {
        if (!userId) return;

        const { error } = await supabase.rpc('add_points', {
            p_user_id: userId,
            p_points: amount,
            p_source: source,
            p_source_id: sourceId || null,
            p_description: description || null,
        });

        if (error) {
            console.error('[Points] Error adding:', error);
            return;
        }

        // Refresh points data
        const { data } = await supabase
            .from('user_points')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (data) {
            setPoints(data);
            toast.success(`+${amount} poin!`);
        }
    }, [userId]);

    // Update streak (call on login/activity)
    const updateStreak = useCallback(async () => {
        if (!userId) return;

        const { error } = await supabase.rpc('update_streak', {
            p_user_id: userId,
        });

        if (error) {
            console.error('[Streak] Error updating:', error);
            return;
        }

        // Refresh streak data
        const { data } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (data) setStreak(data);
    }, [userId]);

    // Award badge
    const awardBadge = useCallback(async (badgeId: string) => {
        if (!userId) return false;

        // Check if already earned
        const { data: existing } = await supabase
            .from('user_badges')
            .select('id')
            .eq('user_id', userId)
            .eq('badge_id', badgeId)
            .maybeSingle();

        if (existing) return false; // Already has badge

        const { error } = await supabase
            .from('user_badges')
            .insert({ user_id: userId, badge_id: badgeId });

        if (error) {
            console.error('[Badge] Error awarding:', error);
            return false;
        }

        // Get badge details for celebration
        const badge = allBadges.find(b => b.id === badgeId);
        if (badge) {
            setNewBadge(badge);
            // Add points for badge
            await addPoints(badge.points, 'badge', badgeId, `Badge: ${badge.name}`);
        }

        // Refresh badges
        await fetchGamificationData();
        return true;
    }, [userId, allBadges, addPoints, fetchGamificationData]);

    // Clear new badge celebration
    const clearNewBadge = useCallback(() => {
        setNewBadge(null);
    }, []);

    // Get level progress
    const getLevelProgress = useCallback(() => {
        if (!points) return { current: 0, next: 100, progress: 0 };
        const pointsInLevel = points.total_points % 100;
        return {
            current: pointsInLevel,
            next: 100,
            progress: pointsInLevel / 100,
        };
    }, [points]);

    // Initial fetch
    useEffect(() => {
        fetchGamificationData();
    }, [fetchGamificationData]);

    return {
        // Data
        badges,
        allBadges,
        streak,
        points,
        leaderboard,
        loading,
        newBadge,

        // Actions
        fetchGamificationData,
        fetchLeaderboard,
        addPoints,
        updateStreak,
        awardBadge,
        clearNewBadge,

        // Helpers
        getLevelProgress,
    };
}
