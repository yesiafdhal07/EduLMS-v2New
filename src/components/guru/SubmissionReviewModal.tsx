'use client';

import { useEffect } from 'react';
import { XCircle, Download, FileText, Clock, User, CheckCircle, Star, Save, Loader2 } from 'lucide-react';
import { Assignment } from '@/types';
import { useSubmissionGrading, type Submission, type GradeForm } from '@/hooks/useSubmissionGrading';
import { supabase } from '@/lib/supabase';

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

    // Initial fetch
    useEffect(() => {
        if (isOpen && assignment) {
            fetchSubmissions(assignment.id);
        }
    }, [isOpen, assignment, fetchSubmissions]);

    // Realtime subscription for new submissions
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
                // Refetch when student submits new assignment
                fetchSubmissions(assignment.id);
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'grades'
            }, () => {
                // Refetch when grades are updated
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <button
                type="button"
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md cursor-default"
                onClick={onClose}
                aria-label="Tutup modal"
            />
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
                {/* Header */}
                <div className="p-10 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                            Review Pengumpulan
                        </h3>
                        <p className="text-slate-500 mt-1">{assignment?.title}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                        aria-label="Tutup modal"
                    >
                        <XCircle size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-indigo-500" />
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <FileText size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="font-bold">Belum ada pengumpulan</p>
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
}

function SubmissionCard({ submission, gradeForm, savingGrade, onUpdateGradeForm, onSaveGrade }: SubmissionCardProps) {
    const hasExistingGrade = submission.grades?.score !== null;
    const isSaving = savingGrade === submission.id;

    return (
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
            {/* Student Info */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User size={18} className="text-indigo-600" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">{submission.users?.full_name || 'Unknown'}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock size={12} />
                            {new Date(submission.submitted_at).toLocaleString('id-ID')}
                        </div>
                    </div>
                </div>
                <a
                    href={submission.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors"
                >
                    <Download size={16} />
                    Unduh
                </a>
            </div>

            {/* Grade Form */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200">
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
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Kerja bagus!"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                    {hasExistingGrade && (
                        <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle size={16} />
                            <span className="text-sm font-bold">Sudah dinilai: {submission.grades?.score}</span>
                            {submission.grades?.type && (
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase">
                                    {submission.grades.type}
                                </span>
                            )}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => onSaveGrade(submission.id)}
                        disabled={isSaving}
                        className="ml-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
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
