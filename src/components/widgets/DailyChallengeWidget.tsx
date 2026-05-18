'use client';

import { useState, useEffect, useCallback } from 'react';
import { Zap, CheckCircle2, Clock, Loader2, Trophy, BookOpen, Brain, Target } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ============================================================
// DAILY CHALLENGE WIDGET — USP #9
// A small, high-dopamine engagement loop:
// 1 fresh challenge per day per student, +XP on completion.
// ============================================================

interface DailyChallenge {
    id: string;
    question: string;
    options: string[];
    correct: number;
    topic: string;
    xp: number;
    type: 'mcq' | 'reflection';
}

interface DailyChallengeWidgetProps {
    studentId: string;
    classId?: string;
    onXPEarned?: (xp: number) => void;
}

// Static challenge pool — rotates by day of year
const CHALLENGE_POOL: DailyChallenge[] = [
    {
        id: 'dc-1',
        question: 'Apakah perbedaan utama antara vektor dan skalar dalam fisika?',
        options: ['Vektor memiliki arah, skalar tidak', 'Skalar lebih besar', 'Vektor tidak bisa dijumlahkan', 'Tidak ada perbedaan'],
        correct: 0,
        topic: 'Fisika',
        xp: 25,
        type: 'mcq',
    },
    {
        id: 'dc-2',
        question: 'Manakah yang merupakan contoh reaksi kimia eksoterm?',
        options: ['Memasak telur', 'Pembakaran kayu', 'Fotosintesis', 'Melarutkan garam'],
        correct: 1,
        topic: 'Kimia',
        xp: 25,
        type: 'mcq',
    },
    {
        id: 'dc-3',
        question: 'Nilai dari log₁₀(1000) adalah...',
        options: ['2', '3', '4', '10'],
        correct: 1,
        topic: 'Matematika',
        xp: 25,
        type: 'mcq',
    },
    {
        id: 'dc-4',
        question: 'Apa tujuan utama dari Sumpah Pemuda 1928?',
        options: ['Membentuk tentara nasional', 'Mempersatukan pemuda Indonesia', 'Menolak penjajahan Belanda', 'Mendirikan partai politik'],
        correct: 1,
        topic: 'Sejarah',
        xp: 25,
        type: 'mcq',
    },
    {
        id: 'dc-5',
        question: 'Proses fotosintesis menghasilkan...',
        options: ['CO₂ dan H₂O', 'O₂ dan glukosa', 'O₂ dan CO₂', 'Glukosa dan H₂O'],
        correct: 1,
        topic: 'Biologi',
        xp: 25,
        type: 'mcq',
    },
    {
        id: 'dc-6',
        question: 'Dalam pemrograman, rekursi adalah...',
        options: ['Fungsi yang memanggil dirinya sendiri', 'Loop yang tidak berhenti', 'Variabel global', 'Method dari class'],
        correct: 0,
        topic: 'TIK',
        xp: 30,
        type: 'mcq',
    },
    {
        id: 'dc-7',
        question: 'Hukum Newton III menyatakan bahwa...',
        options: ['F = ma', 'Setiap aksi ada reaksi yang setara', 'Benda diam akan diam', 'Kecepatan konstan tanpa gaya'],
        correct: 1,
        topic: 'Fisika',
        xp: 25,
        type: 'mcq',
    },
];

function todaysChallenge(): DailyChallenge {
    const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return CHALLENGE_POOL[dayOfYear % CHALLENGE_POOL.length];
}

function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function DailyChallengeWidget({ studentId, onXPEarned }: DailyChallengeWidgetProps) {
    const challenge = todaysChallenge();
    const storageKey = `daily_challenge_${studentId}_${todayKey()}`;

    const [selected, setSelected] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [alreadyDone, setAlreadyDone] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Check localStorage first (fast path)
        if (localStorage.getItem(storageKey) === 'done') {
            setAlreadyDone(true);
        }
    }, [storageKey]);

    const handleSubmit = useCallback(async () => {
        if (selected === null || saving) return;
        setSaving(true);

        const isCorrect = selected === challenge.correct;
        const earnedXP = isCorrect ? challenge.xp : Math.floor(challenge.xp * 0.3); // Partial XP for trying

        try {
            // Award XP via supabase rpc (best-effort)
            await supabase.rpc('increment_student_xp', {
                p_student_id: studentId,
                p_xp: earnedXP,
            }).then(() => {});

            localStorage.setItem(storageKey, 'done');
            setSubmitted(true);
            setAlreadyDone(true);
            onXPEarned?.(earnedXP);

            if (isCorrect) {
                toast.success(`🎉 Benar! +${earnedXP} XP`);
            } else {
                toast.info(`Salah — tapi kamu tetap dapat +${earnedXP} XP karena sudah mencoba!`);
            }
        } finally {
            setSaving(false);
        }
    }, [selected, saving, challenge, studentId, storageKey, onXPEarned]);

    const topicIcon = {
        Fisika: '⚡',
        Kimia: '🧪',
        Matematika: '🔢',
        Sejarah: '📜',
        Biologi: '🌿',
        TIK: '💻',
    }[challenge.topic] ?? '📚';

    if (alreadyDone && !submitted) {
        return (
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center border border-emerald-500/25">
                        <CheckCircle2 size={20} className="text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-white">Tantangan Hari Ini Selesai ✓</p>
                        <p className="text-xs text-slate-500">Kembali besok untuk tantangan baru!</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-xs text-amber-400 font-black">
                        <Clock size={12} />
                        <span>Besok</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900/80 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30 shrink-0">
                    <Zap size={18} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Tantangan Hari Ini</p>
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/25 px-1.5 py-0.5 rounded-full font-black">
                            +{challenge.xp} XP
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{topicIcon} {challenge.topic}</p>
                </div>
            </div>

            {/* Question */}
            <p className="text-sm font-bold text-white leading-relaxed">{challenge.question}</p>

            {/* Options */}
            {!submitted ? (
                <div className="space-y-2">
                    {challenge.options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => !submitted && setSelected(i)}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                                selected === i
                                    ? 'bg-indigo-600/30 border-indigo-500/60 text-white'
                                    : 'bg-white/[0.03] border-white/8 text-slate-400 hover:border-white/20 hover:text-white'
                            }`}
                        >
                            <span className="text-[10px] font-black text-slate-600 mr-2">{String.fromCharCode(65 + i)}.</span>
                            {opt}
                        </button>
                    ))}

                    <button
                        onClick={handleSubmit}
                        disabled={selected === null || saving}
                        className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl text-sm font-black text-white transition-all flex items-center justify-center gap-2"
                    >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Target size={14} />}
                        {saving ? 'Menyimpan...' : 'Kunci Jawaban'}
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {challenge.options.map((opt, i) => (
                        <div
                            key={i}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium border ${
                                i === challenge.correct
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                    : i === selected
                                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                                    : 'bg-white/[0.02] border-white/5 text-slate-600'
                            }`}
                        >
                            <span className="text-[10px] font-black mr-2">{String.fromCharCode(65 + i)}.</span>
                            {opt}
                            {i === challenge.correct && <span className="ml-2 text-emerald-400">✓</span>}
                        </div>
                    ))}
                    <div className="mt-3 text-center text-xs text-slate-500">
                        {selected === challenge.correct ? '🎉 Jawaban tepat!' : '💡 Jawaban yang benar ditandai hijau.'}
                    </div>
                </div>
            )}
        </div>
    );
}
