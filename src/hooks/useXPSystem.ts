'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// XP Rules Configuration
export const XP_RULES = {
    SUBMIT_ON_TIME: 50,
    SUBMIT_LATE: 20,
    ATTEND_CLASS: 10,
    GRADE_A: 30,
    GRADE_B: 20,
    GRADE_C: 10,
    DAILY_LOGIN: 5,
    MOOD_CHECKIN: 3,
} as const;

// Level thresholds
export const LEVEL_THRESHOLDS = [
    0,      // Level 1
    100,    // Level 2
    250,    // Level 3
    500,    // Level 4
    800,    // Level 5
    1200,   // Level 6
    1700,   // Level 7
    2300,   // Level 8
    3000,   // Level 9
    4000,   // Level 10
];

export interface UserXP {
    xp_total: number;
    level: number;
    updated_at: string;
}

export interface XPLog {
    id: string;
    action: string;
    xp_earned: number;
    created_at: string;
}

interface UseXPSystemOptions {
    userId?: string;
}

/**
 * Calculate level from total XP
 */
export function calculateLevel(xp: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_THRESHOLDS[i]) {
            return i + 1;
        }
    }
    return 1;
}

/**
 * Calculate progress to next level (0-100%)
 */
export function calculateLevelProgress(xp: number): number {
    const level = calculateLevel(xp);
    const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[level - 1] + 1000;
    
    const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
}

/**
 * Hook for managing student XP and levels
 */
export function useXPSystem({ userId }: UseXPSystemOptions) {
    const [userXP, setUserXP] = useState<UserXP | null>(null);
    const [recentLogs, setRecentLogs] = useState<XPLog[]>([]);
    const [loading, setLoading] = useState(true);
    // Using the module-level supabase instance imported at top

    // Fetch user XP data
    const fetchUserXP = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        try {
            // Get or create user_xp record
            const { data: initialData, error } = await supabase
                .from('user_xp')
                .select('*')
                .eq('user_id', userId)
                .single();

            let data = initialData;

            if (error && error.code === 'PGRST116') {
                // Record doesn't exist, create it
                const { data: newData, error: insertError } = await supabase
                    .from('user_xp')
                    .insert({ user_id: userId, xp_total: 0, level: 1 })
                    .select()
                    .single();

                if (insertError) throw insertError;
                data = newData;
            } else if (error) {
                throw error;
            }

            setUserXP(data);

            // Fetch recent XP logs
            const { data: logs } = await supabase
                .from('xp_logs')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10);

            setRecentLogs(logs || []);
        } catch (err) {
            console.error('Failed to fetch XP:', err);
        } finally {
            setLoading(false);
        }
    }, [userId, supabase]);

    // Award XP to user - SECURITY: Uses server-side RPC to prevent client manipulation
    const awardXP = useCallback(async (action: string, xpAmount: number) => {
        if (!userId) return false;

        try {
            // SECURITY FIX: Call secure RPC function instead of direct table manipulation
            // The RPC function validates action type and XP amount on the server
            const { data, error } = await supabase.rpc('award_xp_secure', {
                p_action: action,
                p_xp: xpAmount
            });

            if (error) {
                console.error('Secure XP award failed:', error);
                return false;
            }

            // Check if RPC returned success
            if (!data?.success) {
                console.error('XP award rejected by server:', data?.error);
                return false;
            }

            // Update local state with server response
            setUserXP(prev => prev ? {
                ...prev,
                xp_total: data.new_total,
                level: data.new_level,
                updated_at: new Date().toISOString()
            } : null);

            return true;
        } catch (err) {
            console.error('Failed to award XP:', err);
            return false;
        }
    }, [userId, supabase]);

    // Load on mount
    useEffect(() => {
        fetchUserXP();
    }, [fetchUserXP]);

    return {
        userXP,
        recentLogs,
        loading,
        awardXP,
        refreshXP: fetchUserXP,
        level: userXP?.level || 1,
        xpTotal: userXP?.xp_total || 0,
        levelProgress: calculateLevelProgress(userXP?.xp_total || 0),
        xpToNextLevel: LEVEL_THRESHOLDS[userXP?.level || 1] - (userXP?.xp_total || 0)
    };
}

export default useXPSystem;
