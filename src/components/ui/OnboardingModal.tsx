'use client';

import { useEffect, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles, HelpCircle } from 'lucide-react';
import type { TutorialStep } from '@/hooks/useOnboarding';

// ========================================================
// ONBOARDING MODAL
// Animated tutorial overlay with step-by-step guide
// ========================================================

interface OnboardingModalProps {
    isOpen: boolean;
    currentStep: number;
    steps: TutorialStep[];
    totalSteps: number;
    progress: number;
    onNext: () => void;
    onPrev: () => void;
    onSkip: () => void;
    onClose: () => void;
}

export function OnboardingModal({
    isOpen,
    currentStep,
    steps,
    totalSteps,
    progress,
    onNext,
    onPrev,
    onSkip,
    onClose,
}: OnboardingModalProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});
    const modalRef = useRef<HTMLDivElement>(null);

    const step = steps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalSteps - 1;
    const isCenterPosition = step?.position === 'center';

    // Handle spotlight positioning
    useEffect(() => {
        if (!isOpen || !step?.targetSelector) {
            setSpotlightStyle({});
            return;
        }

        const target = document.querySelector(step.targetSelector);
        if (target) {
            const rect = target.getBoundingClientRect();
            setSpotlightStyle({
                top: rect.top - 8,
                left: rect.left - 8,
                width: rect.width + 16,
                height: rect.height + 16,
            });
        }
    }, [isOpen, step, currentStep]);

    // Handle step transition animation
    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 300);
            return () => clearTimeout(timer);
        }
    }, [currentStep, isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onSkip();
            if (e.key === 'ArrowRight') onNext();
            if (e.key === 'ArrowLeft' && !isFirstStep) onPrev();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onSkip, onNext, onPrev, isFirstStep]);

    if (!isOpen || !step) return null;

    // Calculate tooltip position
    const getTooltipPosition = () => {
        if (isCenterPosition) {
            return 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
        }
        // For non-center positions, position near the spotlight
        return 'fixed';
    };

    return (
        <div className="fixed inset-0 z-[9999] overflow-hidden" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity duration-500"
                onClick={onSkip}
            />

            {/* Spotlight (only if target exists) */}
            {step.targetSelector && spotlightStyle.top !== undefined && (
                <div
                    className="absolute rounded-2xl ring-4 ring-indigo-500/50 ring-offset-4 ring-offset-transparent shadow-2xl shadow-indigo-500/30 transition-all duration-500 ease-out pointer-events-none z-10"
                    style={{
                        ...spotlightStyle,
                        boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.85)',
                    }}
                />
            )}

            {/* Tutorial Card */}
            <div
                ref={modalRef}
                className={`${getTooltipPosition()} w-[90vw] max-w-md bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-white/10 overflow-hidden transition-all duration-500 z-20 ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
                    }`}
                style={
                    !isCenterPosition && spotlightStyle.top !== undefined
                        ? {
                            top: Math.min(
                                Math.max((spotlightStyle.top as number) + (spotlightStyle.height as number) + 20, 20),
                                window.innerHeight - 350
                            ),
                            left: Math.max((spotlightStyle.left as number), 20),
                        }
                        : undefined
                }
            >
                {/* Header */}
                <div className="relative p-6 pb-4">
                    {/* Progress bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-slate-700">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-indigo-400" />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Tutorial {currentStep + 1}/{totalSteps}
                            </span>
                        </div>
                        <button
                            onClick={onSkip}
                            className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            aria-label="Lewati tutorial"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-4">
                    <h2 className="text-2xl font-black text-white mb-3 tracking-tight">
                        {step.title}
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        {step.description}
                    </p>
                </div>

                {/* Navigation */}
                <div className="p-6 pt-4 bg-slate-800/50 flex items-center justify-between gap-4">
                    <button
                        onClick={onPrev}
                        disabled={isFirstStep}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${isFirstStep
                                ? 'opacity-0 pointer-events-none'
                                : 'text-slate-300 hover:bg-white/10'
                            }`}
                    >
                        <ChevronLeft size={18} />
                        Kembali
                    </button>

                    <div className="flex gap-1.5">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentStep
                                        ? 'w-6 bg-indigo-500'
                                        : i < currentStep
                                            ? 'bg-indigo-500/50'
                                            : 'bg-slate-600'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={onNext}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
                    >
                        {isLastStep ? 'Selesai' : 'Lanjut'}
                        {!isLastStep && <ChevronRight size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ========================================================
// HELP BUTTON
// Floating button to re-open tutorial
// ========================================================

interface HelpButtonProps {
    onClick: () => void;
}

export function HelpButton({ onClick }: HelpButtonProps) {
    return (
        <button
            data-tour="help-button"
            onClick={onClick}
            className="p-2.5 bg-white/10 hover:bg-indigo-500/20 text-white rounded-xl transition-all relative group"
            title="Lihat Tutorial"
            aria-label="Buka tutorial bantuan"
        >
            <HelpCircle size={20} />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Bantuan
            </span>
        </button>
    );
}
