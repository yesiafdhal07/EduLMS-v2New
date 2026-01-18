'use client';

import { useState } from 'react';
import { Shuffle, Loader2, CheckCircle, Users, History } from 'lucide-react';
import { toast } from 'sonner';
import { enablePeerReview, isDeadlinePlusDayPassed, isPeerReviewEnabled, getAllPeerReviews } from '@/lib/peerReview';
import type { Assignment } from '@/types';

interface PeerReviewButtonProps {
    assignment: Assignment;
    submissionCount: number;
    onPeerReviewEnabled?: () => void;
}

export function PeerReviewButton({ assignment, submissionCount, onPeerReviewEnabled }: PeerReviewButtonProps) {
    const [loading, setLoading] = useState(false);
    const [enabled, setEnabled] = useState(assignment.peer_review_enabled ?? false);
    const [showStatus, setShowStatus] = useState(false);

    // Check if deadline + 1 day has passed
    const canEnablePeerReview = isDeadlinePlusDayPassed(assignment.deadline);

    // If can't enable yet or already enabled, show different states
    if (!canEnablePeerReview && !enabled) {
        return null; // Don't show button if deadline hasn't passed yet
    }

    const handleEnablePeerReview = async () => {
        if (enabled) {
            setShowStatus(true);
            return;
        }

        if (submissionCount < 2) {
            toast.warning('Minimal 2 siswa yang sudah mengumpulkan tugas untuk peer review');
            return;
        }

        setLoading(true);
        try {
            const result = await enablePeerReview(assignment.id);

            if (result.success) {
                setEnabled(true);
                toast.success(result.message || 'Peer review berhasil diaktifkan!');
                onPeerReviewEnabled?.();
            } else {
                toast.error(result.error || 'Gagal mengaktifkan peer review');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan saat mengaktifkan peer review');
        } finally {
            setLoading(false);
        }
    };

    if (enabled) {
        return (
            <button
                type="button"
                onClick={() => setShowStatus(!showStatus)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors"
            >
                <CheckCircle size={16} />
                Peer Review Aktif
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={handleEnablePeerReview}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-bold hover:bg-purple-600 transition-colors disabled:opacity-50"
        >
            {loading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <Shuffle size={16} />
            )}
            Mulai Peer Review
        </button>
    );
}

// ============================================================
// PEER REVIEW STATUS MODAL
// Modal untuk menampilkan dan mengelola semua peer review pairs
// Guru dapat: view, edit score/feedback, dan approve review
// ============================================================

interface PeerReviewStatusModalProps {
    assignmentId: string;
    isOpen: boolean;
    onClose: () => void;
}

// Interface untuk type safety
interface PeerReviewWithNames {
    id: string;
    reviewer_name: string;
    reviewee_name: string;
    score: number | null;
    feedback: string | null;
    reviewed_at: string | null;
    status: string;
}

import { useEffect, useCallback } from 'react';
import { updatePeerReviewScore, approvePeerReview } from '@/lib/peerReview';
import { Pencil, Save } from 'lucide-react';

export function PeerReviewStatusModal({ assignmentId, isOpen, onClose }: PeerReviewStatusModalProps) {
    // State untuk data dan UI
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<PeerReviewWithNames[]>([]);
    const [stats, setStats] = useState({ completed: 0, total: 0 });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ score: 0, feedback: '' });
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Fetch data dari server - gunakan useCallback untuk memoize
    const fetchData = useCallback(async () => {
        setLoading(true);
        const result = await getAllPeerReviews(assignmentId);
        setReviews(result.reviews);
        setStats({ completed: result.completed, total: result.total });
        setLoading(false);
    }, [assignmentId]);

    // CORRECT: Fetch data saat modal dibuka menggunakan useEffect
    // Ini mencegah infinite loop dan mengikuti aturan React Hooks
    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, fetchData]);

    // Early return SETELAH semua hooks
    if (!isOpen) return null;

    const startEditing = (review: PeerReviewWithNames) => {
        setEditingId(review.id);
        setEditForm({ score: review.score ?? 0, feedback: review.feedback ?? '' });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({ score: 0, feedback: '' });
    };

    const saveEdit = async (reviewId: string) => {
        setProcessingId(reviewId);
        const res = await updatePeerReviewScore(reviewId, editForm.score, editForm.feedback);
        if (res.success) {
            toast.success('Review berhasil diupdate');
            setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, score: editForm.score, feedback: editForm.feedback } : r));
            setEditingId(null);
        } else {
            toast.error('Gagal update: ' + res.error);
        }
        setProcessingId(null);
    };

    const handleApprove = async (reviewId: string) => {
        setProcessingId(reviewId);
        const res = await approvePeerReview(reviewId);
        if (res.success) {
            toast.success('Nilai berhasil disetujui & masuk rapor!');
            setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status: 'approved' } : r));
        } else {
            toast.error('Gagal approve: ' + res.error);
        }
        setProcessingId(null);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <button
                type="button"
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md cursor-default"
                onClick={onClose}
                aria-label="Tutup modal"
            />
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                            Status & Approval Peer Review
                        </h3>
                        <p className="text-slate-500 text-sm mt-1">
                            Review, Edit, dan Approve nilai dari siswa.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase">Progress</p>
                            <p className="font-black text-indigo-600">{stats.completed}/{stats.total} Selesai</p>
                        </div>
                        <button onClick={fetchData} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                            <History size={20} className="text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={32} className="animate-spin text-purple-500" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => {
                                const isEditing = editingId === review.id;
                                const isApproved = review.status === 'approved';
                                const hasReviewed = review.reviewed_at !== null;

                                return (
                                    <div
                                        key={review.id}
                                        className={`p-6 rounded-3xl border transition-all ${isApproved
                                            ? 'bg-emerald-50/50 border-emerald-200'
                                            : hasReviewed
                                                ? 'bg-white border-slate-200 shadow-sm'
                                                : 'bg-slate-50 border-slate-100 opacity-75'
                                            }`}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            {/* Info Reviewer/Reviewee */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="font-bold text-slate-700">{review.reviewer_name}</span>
                                                    <span className="text-slate-300 text-xs">●</span>
                                                    <span className="font-bold text-slate-700">{review.reviewee_name}</span>
                                                </div>

                                                {isEditing ? (
                                                    <div className="mt-3 space-y-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                                        <div>
                                                            <label className="text-xs font-bold text-indigo-400 uppercase">Score (0-100)</label>
                                                            <input
                                                                type="number"
                                                                value={editForm.score}
                                                                onChange={e => setEditForm({ ...editForm, score: Number(e.target.value) })}
                                                                className="w-full mt-1 px-3 py-2 rounded-lg text-lg font-bold border-indigo-200 focus:ring-indigo-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-indigo-400 uppercase">Feedback</label>
                                                            <input
                                                                type="text"
                                                                value={editForm.feedback}
                                                                onChange={e => setEditForm({ ...editForm, feedback: e.target.value })}
                                                                className="w-full mt-1 px-3 py-2 rounded-lg border-indigo-200 focus:ring-indigo-500"
                                                            />
                                                        </div>
                                                        <div className="flex gap-2 justify-end pt-2">
                                                            <button onClick={cancelEditing} className="px-3 py-1 text-sm font-bold text-slate-500">Batal</button>
                                                            <button onClick={() => saveEdit(review.id)} className="px-4 py-1 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                                                {processingId === review.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Simpan
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mt-1">
                                                        {hasReviewed ? (
                                                            <div className="flex items-start gap-4">
                                                                <div className={`text-2xl font-black ${(review.score ?? 0) >= 75 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                                    {review.score ?? '-'}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-slate-600 italic">"{review.feedback || 'Tidak ada feedback'}"</p>
                                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                                                        {review.reviewed_at ? new Date(review.reviewed_at).toLocaleString('id-ID') : '-'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs font-bold text-amber-500 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider">
                                                                Belum ada review
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            {hasReviewed && !isEditing && (
                                                <div className="flex md:flex-col items-center gap-2 shrink-0">
                                                    {isApproved ? (
                                                        <div className="flex flex-col items-center text-emerald-600 bg-emerald-100 px-4 py-2 rounded-xl">
                                                            <CheckCircle size={24} className="mb-1" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Approved</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => startEditing(review)}
                                                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                                                            >
                                                                <Pencil size={14} /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleApprove(review.id)}
                                                                disabled={processingId === review.id}
                                                                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all uppercase tracking-wider"
                                                            >
                                                                {processingId === review.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                                Approve
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 shrink-0 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
