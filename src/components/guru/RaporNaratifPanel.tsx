'use client';

import { useState, useCallback } from 'react';
import { FileText, Loader2, Copy, Check, RefreshCw, Sparkles, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { generateNaratifBatch, type NaratifResult, type StudentNaratifInput } from '@/lib/services/naratif-ai.service';

// ============================================================
// RAPOR NARATIF AI — InsightTab panel
// Generates per-student narrative descriptions for report cards
// ============================================================

interface Student {
    id: string;
    name: string;
    avg: string;
    status: 'TUNTAS' | 'REMEDIAL';
}

interface RaporNaratifPanelProps {
    students: Student[];
    stats?: { avg: number; attendance: number; submissions: number };
}

export function RaporNaratifPanel({ students, stats }: RaporNaratifPanelProps) {
    const [results, setResults] = useState<NaratifResult[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState({ done: 0, total: 0 });
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (students.length === 0) return;
        setIsGenerating(true);
        setResults([]);
        setProgress({ done: 0, total: students.length });

        const inputs: StudentNaratifInput[] = students.map(s => ({
            name: s.name,
            avgGrade: parseFloat(s.avg) || 0,
            attendanceRate: stats?.attendance ?? 85,
            submissionRate: stats?.submissions ?? 80,
        }));

        const generated = await generateNaratifBatch(inputs, (done, total) => {
            setProgress({ done, total });
        });

        setResults(generated);
        setIsGenerating(false);
        if (generated.length > 0) setExpandedId(generated[0].studentName);
    }, [students, stats]);

    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDownloadAll = () => {
        const content = results.map(r =>
            `=== ${r.studentName} ===\n\n${r.naratif}\n\nKelebihan:\n${r.kelebihanPoin.map(p => `• ${p}`).join('\n')}\n\nRekomendasi:\n${r.rekomendasiPoin.map(p => `• ${p}`).join('\n')}\n\n`
        ).join('\n---\n\n');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rapor-naratif.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="gs-card p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-500/15 rounded-xl flex items-center justify-center border border-violet-500/25">
                        <Sparkles size={20} className="text-violet-400" />
                    </div>
                    <div>
                        <h3 className="gs-title text-lg">Rapor Naratif AI</h3>
                        <p className="gs-body text-xs mt-0.5">Generate deskripsi rapor per siswa secara otomatis</p>
                    </div>
                </div>
                {results.length > 0 && (
                    <button
                        onClick={handleDownloadAll}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold transition-all border border-white/5"
                    >
                        <Download size={13} />
                        <span>Unduh Semua</span>
                    </button>
                )}
            </div>

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={isGenerating || students.length === 0}
                className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-violet-600/20"
            >
                {isGenerating ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Membuat... {progress.done}/{progress.total} siswa</span>
                    </>
                ) : (
                    <>
                        <Sparkles size={16} />
                        <span>Generate Naratif {students.length} Siswa</span>
                    </>
                )}
            </button>

            {/* Progress bar */}
            {isGenerating && progress.total > 0 && (
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-violet-500 transition-all duration-500 rounded-full"
                        style={{ width: `${(progress.done / progress.total) * 100}%` }}
                    />
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <Check size={13} className="text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400">{results.length} naratif berhasil dibuat</span>
                    </div>

                    {results.map(result => {
                        const isExpanded = expandedId === result.studentName;
                        return (
                            <div key={result.studentName} className="border border-white/8 rounded-xl overflow-hidden bg-white/[0.02]">
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : result.studentName)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center text-violet-400 text-xs font-black">
                                            {result.studentName.charAt(0)}
                                        </div>
                                        <span className="text-sm font-bold text-white">{result.studentName}</span>
                                    </div>
                                    {isExpanded ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
                                </button>

                                {isExpanded && (
                                    <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
                                        {/* Naratif text */}
                                        <div className="relative">
                                            <div className="bg-white/[0.03] rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
                                                {result.naratif.split('\n').map((para, i) => (
                                                    <p key={i} className={i > 0 ? 'mt-3' : ''}>{para}</p>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => handleCopy(result.naratif, result.studentName)}
                                                className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all"
                                            >
                                                {copiedId === result.studentName ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                            </button>
                                        </div>

                                        {/* Kelebihan & Rekomendasi */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3">
                                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Kelebihan</p>
                                                {result.kelebihanPoin.map((p, i) => (
                                                    <p key={i} className="text-xs text-slate-400 flex gap-2 mb-1">
                                                        <span className="text-emerald-500 mt-0.5">•</span> {p}
                                                    </p>
                                                ))}
                                            </div>
                                            <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3">
                                                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">Rekomendasi</p>
                                                {result.rekomendasiPoin.map((p, i) => (
                                                    <p key={i} className="text-xs text-slate-400 flex gap-2 mb-1">
                                                        <span className="text-amber-500 mt-0.5">•</span> {p}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Regenerate single */}
                                        <button
                                            onClick={async () => {
                                                const input: StudentNaratifInput = {
                                                    name: result.studentName,
                                                    avgGrade: 75,
                                                    attendanceRate: stats?.attendance ?? 85,
                                                    submissionRate: stats?.submissions ?? 80,
                                                };
                                                const { generateNaratifSiswa } = await import('@/lib/services/naratif-ai.service');
                                                const newResult = await generateNaratifSiswa(input);
                                                if (newResult) {
                                                    setResults(prev => prev.map(r => r.studentName === result.studentName ? newResult : r));
                                                }
                                            }}
                                            className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors"
                                        >
                                            <RefreshCw size={12} />
                                            <span>Regenerate</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty state */}
            {!isGenerating && results.length === 0 && (
                <div className="text-center py-6 opacity-50">
                    <FileText size={32} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-xs text-slate-500 font-medium">
                        {students.length === 0 ? 'Pilih kelas dengan siswa untuk memulai' : 'Klik Generate untuk membuat deskripsi rapor'}
                    </p>
                </div>
            )}
        </div>
    );
}
