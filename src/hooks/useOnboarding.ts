'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface OnboardingStatus {
    isComplete: boolean;
    currentStep: number;
    loading: boolean;
    isOpen: boolean;
}

export interface TutorialStep {
    id: string;
    title: string;
    description: string;
    targetSelector?: string;
    position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

// Tutorial steps with content
const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 'welcome',
        title: '👋 Selamat Datang!',
        description: 'Halo! Ini adalah panduan singkat untuk membantu kamu memahami fitur-fitur di dashboard siswa.',
        position: 'center',
    },
    {
        id: 'dashboard',
        title: '📊 Dashboard',
        description: 'Di sini kamu bisa melihat ringkasan tugas, jadwal, dan progres belajarmu.',
        targetSelector: '[data-tour="dashboard"]',
        position: 'bottom',
    },
    {
        id: 'pembelajaran',
        title: '📚 Pembelajaran',
        description: 'Akses materi pelajaran, video, dan tugas dari gurumu.',
        targetSelector: '[data-tour="pembelajaran"]',
        position: 'bottom',
    },
    {
        id: 'analytics',
        title: '📈 Analitik',
        description: 'Lihat perkembangan nilai dan kehadiranmu dalam grafik yang mudah dipahami.',
        targetSelector: '[data-tour="analytics"]',
        position: 'bottom',
    },
    {
        id: 'absensi',
        title: '⏰ Absensi',
        description: 'Catat kehadiranmu dengan scan QR code atau absensi manual.',
        targetSelector: '[data-tour="absensi"]',
        position: 'bottom',
    },
    {
        id: 'complete',
        title: '🎉 Selesai!',
        description: 'Kamu sudah siap menggunakan dashboard. Jika butuh bantuan, klik tombol "?" di pojok kanan atas.',
        position: 'center',
    },
];

export function useOnboarding(userId?: string) {
    const [status, setStatus] = useState<OnboardingStatus>({
        isComplete: true,
        currentStep: 0,
        loading: true,
        isOpen: false,
    });

    useEffect(() => {
        if (!userId) {
            setStatus(prev => ({ ...prev, loading: false }));
            return;
        }

        checkOnboardingStatus();
    }, [userId]);

    async function checkOnboardingStatus() {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('onboarding_completed, onboarding_step')
                .eq('id', userId)
                .single();

            if (error) {
                setStatus({
                    isComplete: true,
                    currentStep: TUTORIAL_STEPS.length - 1,
                    loading: false,
                    isOpen: false,
                });
                return;
            }

            const isComplete = data?.onboarding_completed ?? true;
            setStatus({
                isComplete,
                currentStep: data?.onboarding_step ?? 0,
                loading: false,
                isOpen: !isComplete,
            });
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            setStatus(prev => ({ ...prev, loading: false, isComplete: true }));
        }
    }

    const nextStep = useCallback(async () => {
        const newStep = Math.min(status.currentStep + 1, TUTORIAL_STEPS.length - 1);
        const isComplete = newStep === TUTORIAL_STEPS.length - 1;

        setStatus(prev => ({
            ...prev,
            currentStep: newStep,
            isComplete,
            isOpen: !isComplete,
        }));

        if (userId) {
            await supabase
                .from('users')
                .update({
                    onboarding_step: newStep,
                    onboarding_completed: isComplete,
                })
                .eq('id', userId);
        }
    }, [status.currentStep, userId]);

    const prevStep = useCallback(async () => {
        const newStep = Math.max(status.currentStep - 1, 0);
        setStatus(prev => ({ ...prev, currentStep: newStep }));
    }, [status.currentStep]);

    const startTutorial = useCallback(() => {
        setStatus(prev => ({
            ...prev,
            isOpen: true,
            currentStep: 0,
        }));
    }, []);

    const skipTutorial = useCallback(async () => {
        setStatus({
            isComplete: true,
            currentStep: TUTORIAL_STEPS.length - 1,
            loading: false,
            isOpen: false,
        });

        if (userId) {
            await supabase
                .from('users')
                .update({
                    onboarding_completed: true,
                    onboarding_step: TUTORIAL_STEPS.length - 1,
                })
                .eq('id', userId);
        }
    }, [userId]);

    const closeTutorial = useCallback(() => {
        setStatus(prev => ({ ...prev, isOpen: false }));
    }, []);

    const resetOnboarding = useCallback(async () => {
        setStatus({
            isComplete: false,
            currentStep: 0,
            loading: false,
            isOpen: true,
        });

        if (userId) {
            await supabase
                .from('users')
                .update({
                    onboarding_completed: false,
                    onboarding_step: 0,
                })
                .eq('id', userId);
        }
    }, [userId]);

    const progress = ((status.currentStep + 1) / TUTORIAL_STEPS.length) * 100;

    return {
        // Status
        ...status,
        isOpen: status.isOpen,
        progress,
        
        // Steps
        steps: TUTORIAL_STEPS,
        currentStep: status.currentStep,
        stepName: TUTORIAL_STEPS[status.currentStep]?.id,
        totalSteps: TUTORIAL_STEPS.length,
        
        // Actions
        nextStep,
        prevStep,
        startTutorial,
        skipTutorial,
        closeTutorial,
        skipOnboarding: skipTutorial,
        resetOnboarding,
    };
}
