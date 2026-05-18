'use client';

import { useState, useCallback } from 'react';
import { Sparkles, Copy, Check, RefreshCw } from 'lucide-react';

interface Props {
    score: number;
    maxScore?: number;
    assignmentTitle?: string;
    onApply?: (feedback: string) => void;
}

const FEEDBACK_TEMPLATES: Record<string, { condition: (pct: number) => boolean; templates: string[] }> = {
    excellent: {
        condition: (pct) => pct >= 90,
        templates: [
            'Kerja yang sangat luar biasa! Jawaban kamu menunjukkan pemahaman yang mendalam terhadap materi. Pertahankan prestasi ini!',
            'Excellent! Kamu menunjukkan penguasaan materi yang sangat baik. Terus kembangkan kemampuanmu!',
            'Luar biasa! Kualitas pekerjaanmu sangat bagus. Kamu bisa menjadi panutan bagi teman-temanmu.',
        ],
    },
    good: {
        condition: (pct) => pct >= 75,
        templates: [
            'Kerja bagus! Kamu sudah menunjukkan pemahaman yang baik. Ada beberapa area kecil yang bisa ditingkatkan lagi.',
            'Bagus sekali! Pemahaman kamu sudah di atas rata-rata. Coba perdalam lagi di bagian analisis untuk hasil yang lebih maksimal.',
            'Hasilnya baik! Kamu sudah di jalur yang benar. Coba review kembali jawaban untuk mendapatkan nilai sempurna.',
        ],
    },
    average: {
        condition: (pct) => pct >= 60,
        templates: [
            'Cukup baik, tapi masih ada ruang untuk perbaikan. Coba pelajari kembali materi terkait dan jangan ragu bertanya jika ada yang kurang jelas.',
            'Usaha yang cukup, namun beberapa konsep masih perlu diperkuat. Saya sarankan untuk membaca ulang materi dan mengerjakan latihan tambahan.',
            'Nilaimu sudah memenuhi standar minimal. Untuk meningkatkan, coba fokus pada pemahaman konsep dasar sebelum ke materi lanjutan.',
        ],
    },
    needsWork: {
        condition: () => true,
        templates: [
            'Masih perlu banyak perbaikan. Jangan berkecil hati - coba pelajari kembali materi dari awal dan kerjakan latihan tambahan. Kamu pasti bisa!',
            'Nilaimu belum mencapai standar. Saya sarankan untuk membuat catatan ringkas materi dan diskusi dengan teman atau guru. Semangat!',
            'Perlu usaha lebih. Coba identifikasi bagian mana yang paling sulit dan fokus pelajari itu dulu. Saya siap membantu jika ada pertanyaan.',
        ],
    },
};

export function AutoFeedback({ score, maxScore = 100, assignmentTitle, onApply }: Props) {
    const [feedback, setFeedback] = useState('');
    const [copied, setCopied] = useState(false);

    const pct = (score / maxScore) * 100;

    const generateFeedback = useCallback(() => {
        const category = Object.values(FEEDBACK_TEMPLATES).find(c => c.condition(pct));
        if (!category) return;
        const templates = category.templates;
        const selected = templates[Math.floor(Math.random() * templates.length)];
        const prefix = assignmentTitle ? `Untuk tugas "${assignmentTitle}": ` : '';
        setFeedback(`${prefix}${selected}`);
    }, [pct, assignmentTitle]);

    const handleCopy = () => {
        navigator.clipboard.writeText(feedback);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gradient-to-r from-violet-500/5 to-indigo-500/5 border border-violet-500/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-violet-400" />
                    <span className="text-xs font-black text-white">Auto-Feedback</span>
                    <span className="text-[9px] text-slate-500 font-bold">Nilai: {score}/{maxScore}</span>
                </div>
                <button onClick={generateFeedback}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/20 border border-violet-500/20 rounded-lg text-violet-400 text-[10px] font-bold hover:bg-violet-500/30 transition-colors">
                    <RefreshCw size={10} /> Generate
                </button>
            </div>

            {feedback ? (
                <div className="space-y-2">
                    <div className="bg-[#0F1014] rounded-xl p-3 text-sm text-slate-300 leading-relaxed">
                        {feedback}
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleCopy}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg text-slate-400 text-[10px] font-bold hover:text-white transition-colors">
                            {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                            {copied ? 'Tersalin' : 'Salin'}
                        </button>
                        {onApply && (
                            <button onClick={() => onApply(feedback)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-violet-500/20 rounded-lg text-violet-400 text-[10px] font-bold hover:bg-violet-500/30 transition-colors">
                                <Check size={10} /> Terapkan
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <p className="text-xs text-slate-600 text-center py-3">Klik "Generate" untuk membuat feedback otomatis.</p>
            )}
        </div>
    );
}
