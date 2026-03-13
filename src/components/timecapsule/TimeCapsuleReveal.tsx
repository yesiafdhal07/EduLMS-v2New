'use client';

import { useState } from 'react';
import { X, Sparkles, Target, Heart, Zap, Compass, Brain, CheckCircle2, Circle, PenLine } from 'lucide-react';
import type { TimeCapsule } from '@/hooks/useTimeCapsule';

interface TimeCapsuleRevealProps {
    capsule: TimeCapsule;
    isOpen: boolean;
    onClose: () => void;
    onSaveReflection: (reflection: string) => Promise<boolean>;
}

const MOOD_INFO = {
    excited: { label: 'Bersemangat', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    hopeful: { label: 'Penuh Harapan', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/20' },
    nervous: { label: 'Gugup', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    determined: { label: 'Tekad Kuat', icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    curious: { label: 'Penasaran', icon: Compass, color: 'text-blue-400', bg: 'bg-blue-500/20' },
};

export function TimeCapsuleReveal({ capsule, isOpen, onClose, onSaveReflection }: TimeCapsuleRevealProps) {
    const [showReflection, setShowReflection] = useState(false);
    const [reflection, setReflection] = useState(capsule.reflection || '');
    const [isSaving, setIsSaving] = useState(false);
    const [checkedGoals, setCheckedGoals] = useState<Set<number>>(new Set());

    const moodInfo = MOOD_INFO[capsule.mood_at_creation];
    const MoodIcon = moodInfo.icon;
    const createdDate = new Date(capsule.created_at);
    const goals = capsule.goals || [];

    const toggleGoal = (index: number) => {
        const newChecked = new Set(checkedGoals);
        if (newChecked.has(index)) {
            newChecked.delete(index);
        } else {
            newChecked.add(index);
        }
        setCheckedGoals(newChecked);
    };

    const handleSaveReflection = async () => {
        setIsSaving(true);
        await onSaveReflection(reflection);
        setIsSaving(false);
        setShowReflection(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with confetti-like effect */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            
            {/* Sparkle decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${3 + Math.random() * 2}s`
                        }}
                    >
                        <Sparkles size={Math.random() * 12 + 8} className="text-amber-500/30" />
                    </div>
                ))}
            </div>

            {/* Modal */}
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2rem] border border-amber-500/30 shadow-2xl shadow-amber-500/10 animate-in zoom-in-95 duration-500">
                {/* Glowing header */}
                <div className="relative p-8 pb-6 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-transparent to-orange-500/10">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 animate-pulse">
                            <Sparkles size={32} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-1">
                                ✨ Kapsul Waktu Terbuka!
                            </p>
                            <h2 className="text-2xl font-black text-white">{capsule.title}</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>Ditulis: {createdDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>Tahun Ajaran: {capsule.academic_year}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {/* Mood at creation */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 ${moodInfo.bg} rounded-full`}>
                        <MoodIcon size={18} className={moodInfo.color} />
                        <span className={`text-sm font-bold ${moodInfo.color}`}>
                            Perasaanmu saat itu: {moodInfo.label}
                        </span>
                    </div>

                    {/* Message */}
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Brain size={18} className="text-amber-400" />
                            <h3 className="font-bold text-white">Pesan dari Dirimu di Masa Lalu</h3>
                        </div>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {capsule.message_to_future_self}
                        </p>
                    </div>

                    {/* Goals */}
                    {goals.length > 0 && (
                        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <Target size={18} className="text-emerald-400" />
                                <h3 className="font-bold text-white">Target yang Kamu Tulis</h3>
                                <span className="text-xs text-slate-500 ml-auto">Klik untuk tandai yang tercapai</span>
                            </div>
                            <div className="space-y-3">
                                {goals.map((goal, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => toggleGoal(i)}
                                        className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                                            checkedGoals.has(i)
                                                ? 'bg-emerald-500/20 border-emerald-500/30'
                                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        {checkedGoals.has(i) ? (
                                            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                                        ) : (
                                            <Circle size={20} className="text-slate-500 shrink-0" />
                                        )}
                                        <span className={`${checkedGoals.has(i) ? 'text-emerald-300 line-through' : 'text-white'}`}>
                                            {goal}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            {checkedGoals.size > 0 && (
                                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                                    <p className="text-emerald-300 font-bold">
                                        🎉 Kamu mencapai {checkedGoals.size} dari {goals.length} target!
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reflection section */}
                    {!showReflection && !capsule.reflection && (
                        <button
                            type="button"
                            onClick={() => setShowReflection(true)}
                            className="w-full p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 font-bold hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <PenLine size={18} />
                            Tulis Refleksi
                        </button>
                    )}

                    {showReflection && (
                        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-center gap-2">
                                <PenLine size={18} className="text-amber-400" />
                                <h3 className="font-bold text-white">Refleksimu Sekarang</h3>
                            </div>
                            <textarea
                                value={reflection}
                                onChange={(e) => setReflection(e.target.value)}
                                placeholder="Bagaimana perasaanmu membaca pesan ini? Apa yang sudah berubah?"
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all resize-none"
                            />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowReflection(false)}
                                    className="px-4 py-2 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveReflection}
                                    disabled={isSaving || !reflection.trim()}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold hover:from-amber-400 hover:to-orange-500 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? 'Menyimpan...' : 'Simpan Refleksi'}
                                </button>
                            </div>
                        </div>
                    )}

                    {capsule.reflection && !showReflection && (
                        <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                            <div className="flex items-center gap-2 mb-3">
                                <PenLine size={18} className="text-amber-400" />
                                <h3 className="font-bold text-white">Refleksimu</h3>
                            </div>
                            <p className="text-amber-100 leading-relaxed whitespace-pre-wrap">
                                {capsule.reflection}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
