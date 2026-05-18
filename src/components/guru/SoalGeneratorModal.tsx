'use client';

import { useState } from 'react';
import {
    Sparkles, Loader2, BookOpen, X, ChevronDown, Copy, Check,
    RefreshCw, AlertCircle, Lightbulb
} from 'lucide-react';
import {
    generateSoal,
    type GeneratorInput, type SoalItem, type SoalType, type TingkatKesulitan,
} from '@/lib/services/soal-generator.service';

// ============================================================
// SOAL GENERATOR AI — Modal for KontenTab
// ============================================================

interface SoalGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    mataPelajaran?: string;
    kelasName?: string;
}

const BLOOM_LEVELS: { key: TingkatKesulitan; label: string; color: string }[] = [
    { key: 'C1', label: 'C1 – Mengingat', color: 'text-slate-400' },
    { key: 'C2', label: 'C2 – Memahami', color: 'text-blue-400' },
    { key: 'C3', label: 'C3 – Mengaplikasikan', color: 'text-emerald-400' },
    { key: 'C4', label: 'C4 – Menganalisis', color: 'text-amber-400' },
    { key: 'C5', label: 'C5 – Mengevaluasi', color: 'text-orange-400' },
    { key: 'C6', label: 'C6 – Mencipta', color: 'text-rose-400' },
];

const TIPE_OPTIONS: { key: SoalType; label: string; icon: string }[] = [
    { key: 'pilihan_ganda', label: 'Pilihan Ganda', icon: '🔵' },
    { key: 'essay', label: 'Essay', icon: '✏️' },
    { key: 'benar_salah', label: 'Benar/Salah', icon: '✅' },
    { key: 'isian_singkat', label: 'Isian Singkat', icon: '📝' },
];

export function SoalGeneratorModal({ isOpen, onClose, mataPelajaran = '', kelasName = '' }: SoalGeneratorModalProps) {
    const [form, setForm] = useState<GeneratorInput>({
        topik: '',
        mataPelajaran,
        kelas: kelasName,
        jumlah: 5,
        tipe: 'pilihan_ganda',
        tingkat: 'C3',
    });
    const [soalList, setSoalList] = useState<SoalItem[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const [showPembahasan, setShowPembahasan] = useState<number | null>(null);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!form.topik.trim()) return;
        setIsGenerating(true);
        setSoalList([]);
        const result = await generateSoal(form);
        setSoalList(result);
        setIsGenerating(false);
    };

    const handleCopy = async (idx: number, text: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    const copyAll = async () => {
        const text = soalList.map((s, i) => {
            const num = i + 1;
            if (s.type === 'pilihan_ganda') {
                const opsiText = s.opsi.map(o => `   ${o.key}. ${o.teks}`).join('\n');
                return `${num}. ${s.pertanyaan}\n${opsiText}\n   Jawaban: ${s.jawaban}`;
            }
            if (s.type === 'essay') return `${num}. ${s.pertanyaan}\n   [Essay - Skor Maks: ${s.skor_max}]`;
            if (s.type === 'benar_salah') return `${num}. ${s.pernyataan}\n   Jawaban: ${s.jawaban ? 'BENAR' : 'SALAH'}`;
            if (s.type === 'isian_singkat') return `${num}. ${s.pertanyaan}\n   Jawaban: ${s.jawaban}`;
            return '';
        }).join('\n\n');
        await navigator.clipboard.writeText(text);
        setCopiedIdx(-1);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-3xl bg-[#0C0B12] border border-[var(--guru-border-default)] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--guru-accent-soft)] rounded-xl flex items-center justify-center border border-[var(--guru-border-accent)]">
                            <Sparkles size={20} className="text-[var(--guru-accent-text)]" />
                        </div>
                        <div>
                            <h2 className="gs-title text-xl">Generator Soal AI</h2>
                            <p className="gs-body text-xs mt-0.5">Buat soal berkualitas dalam hitungan detik</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 p-6 space-y-6">
                    {/* Form */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="gs-label text-xs mb-2 block">Topik / Kompetensi Dasar *</label>
                            <input
                                type="text"
                                placeholder="cth: Sistem Pernapasan Manusia, Persamaan Linear, Proklamasi..."
                                value={form.topik}
                                onChange={e => setForm(f => ({ ...f, topik: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[var(--guru-accent)] transition-colors"
                            />
                        </div>

                        <div>
                            <label className="gs-label text-xs mb-2 block">Mata Pelajaran</label>
                            <input
                                type="text"
                                value={form.mataPelajaran}
                                onChange={e => setForm(f => ({ ...f, mataPelajaran: e.target.value }))}
                                placeholder="cth: Biologi, Matematika..."
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[var(--guru-accent)] transition-colors"
                            />
                        </div>

                        <div>
                            <label className="gs-label text-xs mb-2 block">Kelas</label>
                            <input
                                type="text"
                                value={form.kelas}
                                onChange={e => setForm(f => ({ ...f, kelas: e.target.value }))}
                                placeholder="cth: X, XI, 12"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[var(--guru-accent)] transition-colors"
                            />
                        </div>

                        <div>
                            <label className="gs-label text-xs mb-2 block">Tipe Soal</label>
                            <div className="grid grid-cols-2 gap-2">
                                {TIPE_OPTIONS.map(opt => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setForm(f => ({ ...f, tipe: opt.key }))}
                                        className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-2 ${form.tipe === opt.key ? 'border-[var(--guru-accent)] bg-[var(--guru-accent-soft)] text-[var(--guru-accent-text)]' : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'}`}
                                    >
                                        <span>{opt.icon}</span> {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="gs-label text-xs mb-2 block">Jumlah Soal: <span className="text-[var(--guru-accent-text)]">{form.jumlah}</span></label>
                            <input
                                type="range" min={1} max={20} value={form.jumlah}
                                onChange={e => setForm(f => ({ ...f, jumlah: parseInt(e.target.value) }))}
                                className="w-full accent-indigo-500"
                            />
                            <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                                <span>1</span><span>10</span><span>20</span>
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="gs-label text-xs mb-2 block">Taksonomi Bloom</label>
                            <div className="flex flex-wrap gap-2">
                                {BLOOM_LEVELS.map(lvl => (
                                    <button
                                        key={lvl.key}
                                        onClick={() => setForm(f => ({ ...f, tingkat: lvl.key }))}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${form.tingkat === lvl.key ? `border-current ${lvl.color} bg-white/10` : 'border-white/10 text-slate-500 hover:border-white/20'}`}
                                    >
                                        {lvl.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Generate button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !form.topik.trim()}
                        className="w-full py-4 rounded-xl bg-[var(--guru-accent)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg"
                    >
                        {isGenerating ? <><Loader2 size={16} className="animate-spin" /> Membuat soal...</> : <><Sparkles size={16} /> Generate {form.jumlah} Soal</>}
                    </button>

                    {/* Results */}
                    {soalList.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Check size={14} className="text-emerald-400" />
                                    <span className="text-sm font-bold text-emerald-400">{soalList.length} soal berhasil dibuat</span>
                                </div>
                                <button onClick={copyAll} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-400 hover:text-white border border-white/5 transition-all">
                                    {copiedIdx === -1 ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                    Salin Semua
                                </button>
                            </div>

                            {soalList.map((soal, idx) => (
                                <SoalCard
                                    key={idx}
                                    soal={soal}
                                    nomor={idx + 1}
                                    isCopied={copiedIdx === idx}
                                    showPembahasan={showPembahasan === idx}
                                    onCopy={() => {
                                        const text = soal.type === 'pilihan_ganda'
                                            ? `${soal.pertanyaan}\n${soal.opsi.map(o => `${o.key}. ${o.teks}`).join('\n')}`
                                            : soal.type === 'essay' ? soal.pertanyaan
                                            : soal.type === 'benar_salah' ? soal.pernyataan
                                            : soal.pertanyaan;
                                        handleCopy(idx, text);
                                    }}
                                    onTogglePembahasan={() => setShowPembahasan(showPembahasan === idx ? null : idx)}
                                />
                            ))}

                            <button
                                onClick={handleGenerate}
                                className="w-full py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                <RefreshCw size={13} /> Regenerate Soal Baru
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Soal Card ───────────────────────────────────────────────

function SoalCard({
    soal, nomor, isCopied, showPembahasan, onCopy, onTogglePembahasan
}: {
    soal: SoalItem; nomor: number; isCopied: boolean; showPembahasan: boolean;
    onCopy: () => void; onTogglePembahasan: () => void;
}) {
    return (
        <div className="gs-card p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                    <span className="gs-badge gs-badge-accent text-[10px] shrink-0 mt-0.5">#{nomor}</span>
                    <p className="text-sm text-white font-medium leading-relaxed">
                        {soal.type === 'pilihan_ganda' ? soal.pertanyaan
                         : soal.type === 'essay' ? soal.pertanyaan
                         : soal.type === 'benar_salah' ? soal.pernyataan
                         : soal.pertanyaan}
                    </p>
                </div>
                <button onClick={onCopy} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all shrink-0">
                    {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
            </div>

            {soal.type === 'pilihan_ganda' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                    {soal.opsi.map(o => (
                        <div key={o.key} className={`px-3 py-2 rounded-lg text-xs ${o.key === soal.jawaban ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-bold' : 'bg-white/[0.03] border border-white/5 text-slate-400'}`}>
                            <span className="font-black mr-2">{o.key}.</span>{o.teks}
                        </div>
                    ))}
                </div>
            )}

            {soal.type === 'benar_salah' && (
                <div className="pl-7 flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black border ${soal.jawaban ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-rose-500/10 border-rose-500/25 text-rose-400'}`}>
                        {soal.jawaban ? 'BENAR ✓' : 'SALAH ✗'}
                    </span>
                </div>
            )}

            {soal.type === 'isian_singkat' && (
                <div className="pl-7">
                    <span className="text-xs text-slate-500 font-bold">Jawaban: </span>
                    <span className="text-xs text-emerald-400 font-bold">{soal.jawaban}</span>
                </div>
            )}

            {soal.type === 'essay' && (
                <div className="pl-7 flex items-center gap-2">
                    <span className="gs-badge text-[10px] bg-blue-500/10 border-blue-500/20 text-blue-400">Skor Maks: {soal.skor_max}</span>
                </div>
            )}

            {/* Pembahasan toggle */}
            {(soal.type === 'pilihan_ganda' || soal.type === 'benar_salah' || soal.type === 'essay') && (
                <div className="pl-7">
                    <button onClick={onTogglePembahasan} className="flex items-center gap-2 text-xs text-slate-500 hover:text-[var(--guru-accent-text)] transition-colors">
                        <Lightbulb size={11} />
                        <span>{showPembahasan ? 'Sembunyikan' : 'Lihat'} Pembahasan</span>
                        <ChevronDown size={11} className={`transition-transform ${showPembahasan ? 'rotate-180' : ''}`} />
                    </button>
                    {showPembahasan && (
                        <div className="mt-2 px-3 py-2.5 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                            <p className="text-xs text-amber-300/80 leading-relaxed">
                                {soal.type === 'pilihan_ganda' ? soal.pembahasan
                                 : soal.type === 'benar_salah' ? soal.penjelasan
                                 : soal.panduan_jawaban}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
