'use client';

import { useEffect, useState, useCallback } from 'react';
import { XCircle, Download, FileText, Clock, User, CheckCircle, Star, Save, Loader2, Mic, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { Assignment } from '@/types';
import { useSubmissionGrading, type Submission, type GradeForm } from '@/hooks/useSubmissionGrading';
import { supabase } from '@/lib/supabase';
import { AudioRecorder } from '@/components/audio/AudioRecorder';
import { aiService } from '@/lib/services/ai.service';
import { toast } from 'sonner';

interface SubmissionReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    assignment: Assignment | null;
}

export function SubmissionReviewModal({ isOpen, onClose, assignment }: SubmissionReviewModalProps) {
    const {
        submissions,
        loading,
        gradeForms,
        savingGrade,
        fetchSubmissions,
        saveGrade,
        updateGradeForm
    } = useSubmissionGrading();

    const [batchMode, setBatchMode] = useState(false);
    const [batchIndex, setBatchIndex] = useState(0);

    useEffect(() => {
        if (isOpen && assignment) {
            fetchSubmissions(assignment.id);
            setBatchIndex(0);
            setBatchMode(false);
        }
    }, [isOpen, assignment, fetchSubmissions]);

    useEffect(() => {
        if (!isOpen || !assignment) return;

        const channel = supabase
            .channel(`submissions_${assignment.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'submissions',
                filter: `assignment_id=eq.${assignment.id}`
            }, () => {
                fetchSubmissions(assignment.id);
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'grades'
            }, () => {
                fetchSubmissions(assignment.id);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isOpen, assignment, fetchSubmissions]);

    const handleSaveGrade = async (submissionId: string) => {
        if (assignment) {
            await saveGrade(submissionId, assignment.id);
        }
    };

    const handleSaveAndNext = useCallback(async () => {
        if (!assignment || !submissions[batchIndex]) return;
        await saveGrade(submissions[batchIndex].id, assignment.id);
        if (batchIndex < submissions.length - 1) {
            setBatchIndex(i => i + 1);
        }
    }, [assignment, batchIndex, submissions, saveGrade]);

    const handleQuickScore = (score: string) => {
        if (!submissions[batchIndex]) return;
        updateGradeForm(submissions[batchIndex].id, 'score', score);
    };

    useEffect(() => {
        if (!batchMode || !isOpen) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSaveAndNext();
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [batchMode, isOpen, handleSaveAndNext]);

    if (!isOpen) return null;

    const gradedCount = submissions.filter(s => s.grades?.score !== null && s.grades?.score !== undefined).length;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <button
                type="button"
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md cursor-default"
                onClick={onClose}
                aria-label="Tutup modal"
            />
            <div className={`${batchMode ? 'bg-[#0C0B12] w-full h-full' : 'bg-[#0C0B12] border border-[var(--guru-border-default)] w-full max-w-4xl max-h-[90vh]'} rounded-[2rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col`}>
                <div className={`p-6 md:p-8 border-b border-white/10 ${batchMode ? 'bg-[#0C0B12]' : 'bg-[#08080C]'} flex justify-between items-center shrink-0`}>
                    <div>
                        <h3 className="text-xl font-black tracking-tight uppercase text-white">
                            {batchMode ? '⚡ SpeedGrade' : 'Review Pengumpulan'}
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">{assignment?.title}</p>
                        <div className="flex items-center gap-3 mt-2">
                            <p className="text-xs font-bold text-[var(--guru-accent)]">{gradedCount} / {submissions.length} dinilai</p>
                            {batchMode && (
                                <div className="flex-1 max-w-[200px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-[var(--guru-accent)] to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${submissions.length > 0 ? (gradedCount / submissions.length * 100) : 0}%` }} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { setBatchMode(!batchMode); setBatchIndex(0); }}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${batchMode ? 'bg-[var(--guru-accent)] text-white shadow-lg shadow-[var(--guru-accent)]/30' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
                        >
                            <Zap size={14} />
                            {batchMode ? 'Mode Normal' : 'SpeedGrade'}
                        </button>
                        <button type="button" onClick={onClose}
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-white/10 text-white hover:bg-rose-500/30 hover:text-rose-400"
                            aria-label="Tutup modal"
                        >
                            <XCircle size={24} />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-[var(--guru-accent)]" />
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <FileText size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="font-bold">Belum ada pengumpulan</p>
                        </div>
                    ) : batchMode ? (
                        /* ── SpeedGrade Split-Pane Layout ── */
                        <div className="flex flex-col h-full">
                            {/* Navigation bar */}
                            <div className="flex items-center justify-between bg-white/[0.03] border-b border-white/10 px-6 py-3">
                                <button onClick={() => setBatchIndex(i => Math.max(0, i - 1))} disabled={batchIndex === 0}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30 text-white hover:bg-white/10 transition-colors text-sm font-bold">
                                    <ChevronLeft size={16} /> Sebelumnya
                                </button>
                                <div className="flex items-center gap-3">
                                    {submissions.map((_, i) => (
                                        <button key={i} onClick={() => setBatchIndex(i)}
                                            className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${i === batchIndex ? 'bg-[var(--guru-accent)] text-white scale-110' : submissions[i]?.grades?.score != null ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-500 border border-white/10 hover:bg-white/10'}`}>
                                            {i + 1}
                                        </button>
                                    )).slice(Math.max(0, batchIndex - 3), batchIndex + 4)}
                                    <span className="text-sm font-black text-white">{batchIndex + 1} / {submissions.length}</span>
                                </div>
                                <button onClick={() => setBatchIndex(i => Math.min(submissions.length - 1, i + 1))} disabled={batchIndex >= submissions.length - 1}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30 text-white hover:bg-white/10 transition-colors text-sm font-bold">
                                    Selanjutnya <ChevronRight size={16} />
                                </button>
                            </div>

                            {/* Quick Score Buttons */}
                            <div className="flex items-center gap-2 px-6 py-3 bg-white/[0.02] border-b border-white/5">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">Skor Cepat:</span>
                                {['100', '90', '85', '75', '60', '50'].map(score => (
                                    <button key={score} onClick={() => handleQuickScore(score)}
                                        className={`px-4 py-2 rounded-xl text-sm font-black border transition-all ${gradeForms[submissions[batchIndex]?.id]?.score === score
                                            ? 'bg-[var(--guru-accent)] text-white border-[var(--guru-accent)]'
                                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-[var(--guru-accent)]/20 hover:text-[var(--guru-accent-text)] hover:border-[var(--guru-accent)]/30'}`}>
                                        {score}
                                    </button>
                                ))}
                            </div>

                            {/* Content Area */}
                            {submissions[batchIndex] && (
                                <SubmissionCard
                                    key={submissions[batchIndex].id}
                                    submission={submissions[batchIndex]}
                                    gradeForm={gradeForms[submissions[batchIndex].id]}
                                    savingGrade={savingGrade}
                                    onUpdateGradeForm={updateGradeForm}
                                    onSaveGrade={handleSaveGrade}
                                    assignment={assignment}
                                    darkMode={true}
                                />
                            )}

                            {/* Bottom Action Bar */}
                            <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-t border-white/10 mt-auto">
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <kbd className="bg-white/10 border border-white/20 px-2 py-1 rounded-lg font-mono text-white">Enter</kbd>
                                    <span>Simpan & Lanjut</span>
                                    <span className="text-white/20">|</span>
                                    <kbd className="bg-white/10 border border-white/20 px-2 py-1 rounded-lg font-mono text-white">←→</kbd>
                                    <span>Navigasi</span>
                                </div>
                                <button onClick={handleSaveAndNext}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--guru-accent)] to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[var(--guru-accent)]/30 transition-all">
                                    <Save size={16} />
                                    Simpan & Lanjut
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {submissions.map((submission) => (
                                <SubmissionCard
                                    key={submission.id}
                                    submission={submission}
                                    gradeForm={gradeForms[submission.id]}
                                    savingGrade={savingGrade}
                                    onUpdateGradeForm={updateGradeForm}
                                    onSaveGrade={handleSaveGrade}
                                    assignment={assignment}
                                    darkMode={true}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Sub-component for individual submission card
interface SubmissionCardProps {
    submission: Submission;
    gradeForm: GradeForm;
    savingGrade: string | null;
    onUpdateGradeForm: (submissionId: string, field: keyof GradeForm, value: string) => void;
    onSaveGrade: (submissionId: string) => void;
    assignment: Assignment | null;
    darkMode?: boolean;
}

function SubmissionCard({ submission, gradeForm, savingGrade, onUpdateGradeForm, onSaveGrade, assignment }: SubmissionCardProps) {
    const [isAIGrading, setIsAIGrading] = useState(false);
    const [aiResult, setAiResult] = useState<any>(null);

    const handleAIGrade = async () => {
        if (!assignment) return;
        
        setIsAIGrading(true);
        try {
            const result = await aiService.gradeEssay(
                assignment.description || assignment.title,
                (submission as any).text_content || `File: ${submission.file_url}`,
                "Gunakan rubrik standar akademik: 0-100."
            );

            if (result) {
                setAiResult(result);
                onUpdateGradeForm(submission.id, 'score', result.score.toString());
                onUpdateGradeForm(submission.id, 'feedback', result.feedback);
                toast.success('AI Berhasil memberikan saran nilai!');
            } else {
                toast.error('Gagal mendapatkan respon AI. Pastikan API Key sudah terpasang.');
            }
        } catch (error) {
            console.error('AI Grading Error:', error);
            toast.error('Terjadi kesalahan saat grading AI.');
        } finally {
            setIsAIGrading(false);
        }
    };
    const hasExistingGrade = submission.grades?.score !== null;
    const isSaving = savingGrade === submission.id;

    return (
        <div className="bg-white/5 border-white/10 rounded-2xl p-6 border">
            {/* Student Info */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#181A20] border border-white/10 rounded-full flex items-center justify-center">
                        <User size={18} className="text-[var(--guru-accent)]" />
                    </div>
                    <div>
                        <p className="font-bold text-white">{submission.users?.full_name || 'Unknown'}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Clock size={12} />
                            {new Date(submission.submitted_at).toLocaleString('id-ID')}
                        </div>
                    </div>
                </div>
                <a
                    href={submission.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--guru-accent)] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-colors"
                >
                    <Download size={16} />
                    Unduh
                </a>
            </div>

            {/* Grade Form */}
            <div className="bg-[#0C0B12] rounded-2xl p-4 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor={`score-${submission.id}`} className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                            Nilai (0-100)
                        </label>
                        <input
                            id={`score-${submission.id}`}
                            type="number"
                            min="0"
                            max="100"
                            value={gradeForm?.score || ''}
                            onChange={(e) => onUpdateGradeForm(submission.id, 'score', e.target.value)}
                            className="w-full px-4 py-3 bg-[#181A20] border border-white/10 rounded-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-[var(--guru-accent)]/50"
                            placeholder="85"
                        />
                    </div>
                    <div>
                        <label htmlFor={`type-${submission.id}`} className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                            Tipe Nilai
                        </label>
                        <select
                            id={`type-${submission.id}`}
                            value={gradeForm?.type || 'formatif'}
                            onChange={(e) => onUpdateGradeForm(submission.id, 'type', e.target.value)}
                            className="w-full px-4 py-3 bg-[#181A20] border border-white/10 rounded-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-[var(--guru-accent)]/50"
                        >
                            <option value="formatif">Formatif</option>
                            <option value="sumatif">Sumatif</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor={`feedback-${submission.id}`} className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                            Feedback
                        </label>
                        <input
                            id={`feedback-${submission.id}`}
                            type="text"
                            value={gradeForm?.feedback || ''}
                            onChange={(e) => onUpdateGradeForm(submission.id, 'feedback', e.target.value)}
                            className="w-full px-4 py-3 bg-[#181A20] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--guru-accent)]/50"
                            placeholder="Kerja bagus!"
                        />
                    </div>
                </div>

                {/* AI Helper Section */}
                <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-[var(--guru-accent)]/20 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--guru-accent)]/20 flex items-center justify-center text-[var(--guru-accent)]">
                            <Zap size={20} className={isAIGrading ? 'animate-pulse' : ''} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-[var(--guru-accent-text)] uppercase">AI Auto-Grader</p>
                            <p className="text-[10px] text-[var(--guru-accent)]/70 font-bold uppercase tracking-wider">Powered by OpenRouter</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleAIGrade}
                        disabled={isAIGrading}
                        className="w-full md:w-auto px-6 py-2.5 bg-transparent border border-[var(--guru-accent)] text-[var(--guru-accent-text)] font-black rounded-xl text-xs hover:bg-[var(--guru-accent)] hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        {isAIGrading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                        {isAIGrading ? 'MENGANALISA...' : 'NILAI OTOMATIS (AI)'}
                    </button>
                </div>

                {aiResult && (
                    <div className="mt-4 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-3 animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase">
                            <Star size={14} /> Analisa AI Selesai
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-emerald-400/70 uppercase tracking-widest">Kekuatan</p>
                                <ul className="text-xs text-white list-disc list-inside">
                                    {aiResult.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-rose-400/70 uppercase tracking-widest">Kelemahan</p>
                                <ul className="text-xs text-white list-disc list-inside">
                                    {aiResult.weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Voice Feedback Section */}
                <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                        <Mic size={16} className="text-violet-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase">Feedback Suara (Opsional)</span>
                    </div>
                    <AudioRecorder 
                        onUploadComplete={(url: string) => {
                            // Save audio feedback URL to grades table
                            onUpdateGradeForm(submission.id, 'feedback', `[Voice] ${url}`);
                        }}
                        maxDurationSeconds={60}
                    />
                </div>
                <div className="flex items-center justify-between mt-4">
                    {hasExistingGrade && (
                        <div className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle size={16} />
                            <span className="text-sm font-bold">Sudah dinilai: {submission.grades?.score}</span>
                            {submission.grades?.type && (
                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-bold uppercase">
                                    {submission.grades.type}
                                </span>
                            )}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => onSaveGrade(submission.id)}
                        disabled={isSaving}
                        className="ml-auto flex items-center gap-2 px-6 py-3 bg-[var(--guru-accent)] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[var(--guru-accent)]/20 transition-all disabled:opacity-50"
                    >
                        {isSaving ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        {hasExistingGrade ? 'Update Nilai' : 'Simpan Nilai'}
                    </button>
                </div>
            </div>
        </div>
    );
}
