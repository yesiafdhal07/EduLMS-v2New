'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';

const MOOD_CHECKIN_KEY = 'edulms_last_mood_checkin';

interface MoodLog {
    id: string;
    user_id: string;
    mood: number;
    created_at: string;
}

interface UseMoodCheckinOptions {
    userId?: string;
    enabled?: boolean;
}

/**
 * Hook for managing daily mood check-ins
 */
export function useMoodCheckin({ userId, enabled = true }: UseMoodCheckinOptions) {
    const [shouldShowModal, setShouldShowModal] = useState(false);
    const [recentMoods, setRecentMoods] = useState<MoodLog[]>([]);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    // Check if user should see mood modal today
    useEffect(() => {
        if (!userId || !enabled) return;

        const lastCheckin = localStorage.getItem(MOOD_CHECKIN_KEY);
        const today = new Date().toDateString();

        if (lastCheckin !== today) {
            // Small delay to not interrupt page load
            const timer = setTimeout(() => {
                setShouldShowModal(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [userId, enabled]);

    // Submit mood to database
    const submitMood = useCallback(async (mood: number) => {
        if (!userId) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('mood_logs')
                .insert({
                    user_id: userId,
                    mood: mood
                });

            if (error) throw error;

            // Mark as done for today
            localStorage.setItem(MOOD_CHECKIN_KEY, new Date().toDateString());
            setShouldShowModal(false);
        } catch (err) {
            console.error('Failed to save mood:', err);
        } finally {
            setLoading(false);
        }
    }, [userId, supabase]);

    // Fetch recent moods for a class (for teacher dashboard)
    const fetchClassMoods = useCallback(async (classId: string, days: number = 7) => {
        setLoading(true);
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const { data, error } = await supabase
                .from('mood_logs')
                .select(`
                    id,
                    mood,
                    created_at,
                    user:users!mood_logs_user_id_fkey(id, full_name)
                `)
                .gte('created_at', startDate.toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRecentMoods(data || []);
            return data;
        } catch (err) {
            console.error('Failed to fetch moods:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    // Close modal without submitting
    const dismissModal = useCallback(() => {
        localStorage.setItem(MOOD_CHECKIN_KEY, new Date().toDateString());
        setShouldShowModal(false);
    }, []);

    return {
        shouldShowModal,
        submitMood,
        dismissModal,
        fetchClassMoods,
        recentMoods,
        loading
    };
}

export default useMoodCheckin;
