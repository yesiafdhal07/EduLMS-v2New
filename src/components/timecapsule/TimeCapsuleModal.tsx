'use client';

import { useState } from 'react';
import { X, Sparkles, Lock, Target, Heart, Zap, Compass, Brain } from 'lucide-react';
import type { TimeCapsule } from '@/hooks/useTimeCapsule';

interface TimeCapsuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        title: string;
        message: string;
        goals: string[];
        mood: TimeCapsule['mood_at_creation'];
        unlockDate: Date;
    }) => Promise<boolean>;
}

const MOODS = [
    { value: 'excited', label: 'Bersemangat', icon: Zap, color: 'text-yellow-400' },
    { value: 'hopeful', label: 'Penuh Harapan', icon: Heart, color: 'text-pink-400' },
    { value: 'nervous', label: 'Gugup', icon: Sparkles, color: 'text-purple-400' },
    { value: 'determined', label: 'Tekad Kuat', icon: Target, color: 'text-emerald-400' },
    { value: 'curious', label: 'Penasaran', icon: Compass, color: 'text-blue-400' },
] as const;

export function TimeCapsuleModal({ isOpen, onClose, onSubmit }: TimeCapsuleModalProps) {
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [goals, setGoals] = useState(['', '', '']);
    const [mood, setMood] = useState<TimeCapsule['mood_at_creation']>('determined');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Default unlock date: end of current semester
    // Semester 1 (Ganjil): July - December -> unlock December 20
    // Semester 2 (Genap): January - June -> unlock June 20
    const getDefaultUnlockDate = () => {
        const now = new Date();
        const month = now.getMonth() + 1; // 1-12
        const year = now.getFullYear();
        
        if (month >= 7 && month <= 12) {
            // Semester Ganjil (July-Dec) -> unlock end of December
            return new Date(year, 11, 20); // December 20
        } else {
            // Semester Genap (Jan-June) -> unlock end of June
            return new Date(year, 5, 20); // June 20
        }
    };

    const [unlockDate] = useState(getDefaultUnlockDate());

    const handleGoalChange = (index: number, value: string) => {
        const newGoals = [...goals];
        newGoals[index] = value;
        setGoals(newGoals);
    };

    const handleSubmit = async () => {
        if (!title.trim() || !message.trim()) return;
        
        setIsSubmitting(true);
        const success = await onSubmit({
            title: title.trim(),
            message: message.trim(),
            goals: goals.filter(g => g.trim()),
            mood,
            unlockDate
        });
        
        if (success) {
            // Reset form
            setTitle('');
            setMessage('');
            setGoals(['', '', '']);
            setMood('determined');
            setStep(1);
            onClose();
        }
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="relative p-6 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Lock size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white">Kapsul Waktu</h2>
                            <p className="text-sm text-slate-400">Pesan untuk dirimu di masa depan</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>

                    {/* Step Indicator */}
                    <div className="flex gap-2 mt-4">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-1.5 flex-1 rounded-full transition-all ${
                                    s <= step ? 'bg-amber-500' : 'bg-white/10'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">
                                    Judul Kapsul
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Contoh: Targetku di Kelas 12"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">
                                    Bagaimana perasaanmu sekarang?
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {MOODS.map((m) => (
                                        <button
                                            key={m.value}
                                            type="button"
                                            onClick={() => setMood(m.value)}
                                            className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                                                mood === m.value
                                                    ? 'bg-amber-500/20 border-amber-500/50'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                            }`}
                                        >
                                            <m.icon size={20} className={m.color} />
                                            <span className="text-[10px] text-slate-400">{m.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">
                                    <Brain className="inline-block mr-2 text-amber-400" size={16} />
                                    Tulis pesan untuk dirimu di masa depan
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Hai, aku dari masa lalu! Saat menulis ini, aku sedang..."
                                    rows={5}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">
                                    <Target className="inline-block mr-2 text-emerald-400" size={16} />
                                    Target yang ingin kamu capai
                                </label>
                                {goals.map((goal, i) => (
                                    <input
                                        key={i}
                                        type="text"
                                        value={goal}
                                        onChange={(e) => handleGoalChange(i, e.target.value)}
                                        placeholder={`Target ${i + 1}`}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all mb-3"
                                    />
                                ))}
                            </div>

                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                <p className="text-sm text-amber-300 font-medium">
                                    🔒 Kapsul ini akan terkunci sampai <strong>{unlockDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 pt-4 border-t border-white/10 flex gap-3">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={() => setStep(step - 1)}
                            className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all"
                        >
                            Kembali
                        </button>
                    )}
                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={() => setStep(step + 1)}
                            disabled={step === 1 && !title.trim()}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-black hover:from-amber-400 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Lanjut
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !message.trim()}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-black hover:from-amber-400 hover:to-orange-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                'Menyegel...'
                            ) : (
                                <>
                                    <Lock size={18} />
                                    Segel Kapsul
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
