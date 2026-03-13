'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface TimeCapsule {
    id: string;
    user_id: string;
    title: string;
    message_to_future_self: string;
    goals: string[];
    mood_at_creation: 'excited' | 'hopeful' | 'nervous' | 'determined' | 'curious';
    created_at: string;
    academic_year: string;
    unlock_date: string;
    is_unlocked: boolean;
    unlocked_at: string | null;
    reflection: string | null;
}

interface UseTimeCapsuleReturn {
    capsules: TimeCapsule[];
    activeCapsule: TimeCapsule | null;
    unlockedCapsules: TimeCapsule[];
    newlyUnlocked: TimeCapsule[];
    loading: boolean;
    createCapsule: (data: CreateCapsuleData) => Promise<boolean>;
    addReflection: (capsuleId: string, reflection: string) => Promise<boolean>;
    dismissNewlyUnlocked: (capsuleId: string) => void;
    refresh: () => Promise<void>;
}

interface CreateCapsuleData {
    title: string;
    message: string;
    goals: string[];
    mood: TimeCapsule['mood_at_creation'];
    unlockDate: Date;
}

export function useTimeCapsule(): UseTimeCapsuleReturn {
    const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
    const [newlyUnlocked, setNewlyUnlocked] = useState<TimeCapsule[]>([]);
    const [loading, setLoading] = useState(true);
    const hasCheckedUnlock = useRef(false);

    /**
     * Auto-unlock capsules that have reached their unlock date.
     * This runs client-side when the student opens their dashboard.
     * No email needed — notification happens directly in the app.
     */
    const autoUnlockCapsules = useCallback(async (fetchedCapsules: TimeCapsule[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find capsules that should be unlocked (date has passed but still locked)
        const readyToUnlock = fetchedCapsules.filter(c => {
            const unlockDate = new Date(c.unlock_date);
            unlockDate.setHours(0, 0, 0, 0);
            return !c.is_unlocked && unlockDate <= today;
        });

        if (readyToUnlock.length === 0) return fetchedCapsules;

        // Unlock them in the database
        const unlockIds = readyToUnlock.map(c => c.id);
        const { error } = await supabase
            .from('time_capsules')
            .update({ 
                is_unlocked: true, 
                unlocked_at: new Date().toISOString() 
            })
            .in('id', unlockIds);

        if (error) {
            console.error('Error auto-unlocking capsules:', error);
            return fetchedCapsules;
        }

        // Track newly unlocked capsules for in-app notification
        setNewlyUnlocked(readyToUnlock);

        // Show toast notification for each unlocked capsule
        readyToUnlock.forEach(capsule => {
            toast('🎉 Kapsul Waktu Terbuka!', {
                description: `"${capsule.title}" yang kamu tulis sudah bisa dibuka sekarang!`,
                duration: 8000,
                action: {
                    label: 'Lihat',
                    onClick: () => {
                        // The UI will handle showing the reveal modal
                        // via the newlyUnlocked state
                    }
                }
            });
        });

        // Return updated capsules with is_unlocked = true
        return fetchedCapsules.map(c => 
            unlockIds.includes(c.id) 
                ? { ...c, is_unlocked: true, unlocked_at: new Date().toISOString() }
                : c
        );
    }, []);

    const fetchCapsules = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('time_capsules')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            let capsuleData = data || [];

            // Auto-unlock check runs once per session
            if (!hasCheckedUnlock.current) {
                hasCheckedUnlock.current = true;
                capsuleData = await autoUnlockCapsules(capsuleData);
            }

            setCapsules(capsuleData);
        } catch (error) {
            console.error('Error fetching time capsules:', error);
        } finally {
            setLoading(false);
        }
    }, [autoUnlockCapsules]);

    const createCapsule = async (data: CreateCapsuleData): Promise<boolean> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('Anda harus login terlebih dahulu');
                return false;
            }

            // Get current semester
            const now = new Date();
            const month = now.getMonth() + 1;
            const year = now.getFullYear();
            
            let academicYear: string;
            if (month >= 7) {
                academicYear = `${year}/${year + 1} Semester 1`;
            } else {
                academicYear = `${year - 1}/${year} Semester 2`;
            }

            const { error } = await supabase
                .from('time_capsules')
                .insert({
                    user_id: user.id,
                    title: data.title,
                    message_to_future_self: data.message,
                    goals: data.goals,
                    mood_at_creation: data.mood,
                    academic_year: academicYear,
                    unlock_date: data.unlockDate.toISOString().split('T')[0]
                });

            if (error) throw error;

            toast.success('🎉 Kapsul waktu berhasil dibuat dan disegel!');
            await fetchCapsules();
            return true;
        } catch (error) {
            console.error('Error creating time capsule:', error);
            toast.error('Gagal membuat kapsul waktu');
            return false;
        }
    };

    const addReflection = async (capsuleId: string, reflection: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('time_capsules')
                .update({ reflection })
                .eq('id', capsuleId);

            if (error) throw error;

            toast.success('Refleksi berhasil disimpan!');
            await fetchCapsules();
            return true;
        } catch (error) {
            console.error('Error adding reflection:', error);
            toast.error('Gagal menyimpan refleksi');
            return false;
        }
    };

    /**
     * Dismiss a newly unlocked capsule from the notification list.
     * Called after the student has seen/opened the capsule reveal modal.
     */
    const dismissNewlyUnlocked = (capsuleId: string) => {
        setNewlyUnlocked(prev => prev.filter(c => c.id !== capsuleId));
    };

    useEffect(() => {
        fetchCapsules();
    }, [fetchCapsules]);

    // Derived state
    const activeCapsule = capsules.find(c => !c.is_unlocked) || null;
    const unlockedCapsules = capsules.filter(c => c.is_unlocked);

    return {
        capsules,
        activeCapsule,
        unlockedCapsules,
        newlyUnlocked,
        loading,
        createCapsule,
        addReflection,
        dismissNewlyUnlocked,
        refresh: fetchCapsules
    };
}

