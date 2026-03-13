'use client';

import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface MoodCheckinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (mood: number) => void;
    userName?: string;
}

const MOODS = [
    { emoji: '😢', label: 'Sangat Sedih', value: 1, color: 'bg-rose-500' },
    { emoji: '😔', label: 'Sedih', value: 2, color: 'bg-amber-500' },
    { emoji: '😐', label: 'Biasa', value: 3, color: 'bg-slate-400' },
    { emoji: '🙂', label: 'Senang', value: 4, color: 'bg-emerald-400' },
    { emoji: '😄', label: 'Sangat Senang', value: 5, color: 'bg-emerald-500' },
];

/**
 * Mood Check-in Modal
 * Daily emotional check for students
 */
export function MoodCheckinModal({ isOpen, onClose, onSubmit, userName }: MoodCheckinModalProps) {
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = useCallback(async () => {
        if (selectedMood === null) return;
        
        setIsSubmitting(true);
        try {
            await onSubmit(selectedMood);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedMood, onSubmit, onClose]);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedMood(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                    <X size={20} className="text-slate-400" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-white mb-2">
                        Hai, {userName || 'Pelajar'}! 👋
                    </h2>
                    <p className="text-slate-400 text-sm">
                        Bagaimana perasaanmu hari ini?
                    </p>
                </div>

                {/* Mood Selector */}
                <div className="flex justify-center gap-4 mb-8">
                    {MOODS.map((mood) => (
                        <button
                            key={mood.value}
                            onClick={() => setSelectedMood(mood.value)}
                            className={`
                                flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300
                                ${selectedMood === mood.value 
                                    ? `${mood.color} scale-110 shadow-lg` 
                                    : 'hover:bg-white/10 hover:scale-105'
                                }
                            `}
                            title={mood.label}
                        >
                            <span className="text-4xl">{mood.emoji}</span>
                            {selectedMood === mood.value && (
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                                    {mood.label}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={selectedMood === null || isSubmitting}
                    className={`
                        w-full py-4 rounded-2xl font-bold text-white transition-all duration-300
                        ${selectedMood !== null 
                            ? 'bg-violet-500 hover:bg-violet-600 shadow-lg shadow-violet-500/30' 
                            : 'bg-slate-700 cursor-not-allowed opacity-50'
                        }
                    `}
                >
                    {isSubmitting ? 'Menyimpan...' : 'Lanjutkan Belajar'}
                </button>

                {/* Skip */}
                <p className="text-center mt-4">
                    <button 
                        onClick={onClose}
                        className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
                    >
                        Lewati untuk hari ini
                    </button>
                </p>
            </div>
        </div>
    );
}

export default MoodCheckinModal;
