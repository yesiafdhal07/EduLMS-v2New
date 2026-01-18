'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, Send, Loader2, CheckCircle, User, FileText, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getAssignedPeerReview, submitPeerReview, type PeerReview } from '@/lib/peerReview';
import { supabase } from '@/lib/supabase';

interface PeerReviewPanelProps {
    assignmentId: string;
    studentId: string;
    studentName: string;  // Current logged-in student's name
}

export function PeerReviewPanel({ assignmentId, studentId, studentName }: PeerReviewPanelProps) {
    const [loading, setLoading] = useState(true);
    const [review, setReview] = useState<PeerReview | null>(null);
    const [revieweeName, setRevieweeName] = useState('');
    const [submissionUrl, setSubmissionUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [nameConfirm, setNameConfirm] = useState('');
    const [feedback, setFeedback] = useState('');
    const [score, setScore] = useState<string>(''); // Using string for input handling, convert to number on submit

    // Wrap fetchAssignedReview with useCallback for realtime
    const fetchAssignedReview = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAssignedPeerReview(assignmentId, studentId);
            setReview(data);

            if (data) {
                // Fetch reviewee name
                const { data: userData } = await supabase
                    .from('users')
                    .select('full_name')
                    .eq('id', data.reviewee_id)
                    .single();
                setRevieweeName(userData?.full_name || 'Unknown');

                // Fetch submission URL
                const { data: submissionData } = await supabase
                    .from('submissions')
                    .select('file_url')
                    .eq('id', data.submission_id)
                    .single();
                setSubmissionUrl(submissionData?.file_url || '');

                // Pre-fill form if already reviewed
                if (data.reviewed_at) {
                    setFeedback(data.feedback || '');
                    setScore(data.score?.toString() || '');
                    setNameConfirm(data.reviewer_name_confirm || '');
                }
            }
        } catch (error) {
            console.error('Error fetching peer review:', error);
        } finally {
            setLoading(false);
        }
    }, [assignmentId, studentId]);

    // Initial fetch
    useEffect(() => {
        fetchAssignedReview();
    }, [fetchAssignedReview]);

    // Realtime subscription for peer reviews
    useEffect(() => {
        const channel = supabase
            .channel(`peer_review_${assignmentId}_${studentId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'peer_reviews'
            }, (payload) => {
                // Refetch when peer review is updated (e.g., teacher approved)
                fetchAssignedReview();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [assignmentId, studentId, fetchAssignedReview]);

    const handleSubmit = async () => {
        // Validate name confirmation
        if (nameConfirm.toLowerCase().trim() !== studentName.toLowerCase().trim()) {
            toast.error('Nama yang Anda masukkan tidak sesuai dengan profil Anda');
            return;
        }

        if (!feedback.trim()) {
            toast.warning('Mohon berikan feedback untuk teman Anda');
            return;
        }

        const numScore = parseInt(score);
        if (isNaN(numScore) || numScore < 0 || numScore > 100) {
            toast.warning('Mohon berikan nilai antara 0 - 100');
            return;
        }

        if (!review) return;

        setSubmitting(true);
        try {
            // Updated to pass numScore instead of rating
            const result = await submitPeerReview(review.id, nameConfirm.trim(), feedback.trim(), numScore);

            if (result.success) {
                toast.success('Review berhasil dikirim! Menunggu persetujuan guru.');
                await fetchAssignedReview();
            } else {
                toast.error(result.error || 'Gagal mengirim review');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-purple-400" />
            </div>
        );
    }

    if (!review) {
        return (
            <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 text-center">
                <FileText size={48} className="mx-auto text-slate-500 mb-4" />
                <p className="text-slate-400 font-bold">Tidak ada peer review untuk tugas ini</p>
            </div>
        );
    }

    const isReviewed = !!review.reviewed_at;
    const isApproved = review.status === 'approved';

    return (
        <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                        <User size={24} className="text-purple-400" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Review Tugas Dari</p>
                        <p className="text-white font-bold text-lg">{revieweeName}</p>
                    </div>
                </div>
                {isReviewed && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isApproved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                        <CheckCircle size={16} />
                        <span className="font-bold text-sm">
                            {isApproved ? 'Sudah Disetujui Guru' : 'Menunggu Persetujuan'}
                        </span>
                    </div>
                )}
            </div>

            {/* Download Submission */}
            {submissionUrl && (
                <a
                    href={submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-4 mb-6 bg-indigo-500 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-colors"
                >
                    <Download size={20} />
                    Unduh Tugas untuk Direview
                </a>
            )}

            {/* Review Form */}
            <div className="space-y-6">
                {/* Score Input */}
                <div>
                    <label htmlFor="score" className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-3">
                        Nilai (0-100)
                    </label>
                    <input
                        id="score"
                        type="number"
                        min="0"
                        max="100"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        disabled={isReviewed}
                        placeholder="85"
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-2xl placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    />
                </div>

                {/* Feedback */}
                <div>
                    <label htmlFor="feedback" className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-3">
                        Feedback untuk Teman
                    </label>
                    <textarea
                        id="feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        disabled={isReviewed}
                        placeholder="Berikan komentar konstruktif tentang tugas teman Anda..."
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-32 disabled:opacity-50"
                    />
                </div>

                {/* Name Confirmation */}
                <div>
                    <label htmlFor="name-confirm" className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-3">
                        Ketik Nama Anda untuk Konfirmasi
                    </label>
                    <input
                        id="name-confirm"
                        type="text"
                        value={nameConfirm}
                        onChange={(e) => setNameConfirm(e.target.value)}
                        disabled={isReviewed}
                        placeholder={`Ketik: ${studentName}`}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                        Nama harus sama dengan profil Anda: <span className="text-purple-400 font-bold">{studentName}</span>
                    </p>
                </div>

                {/* Submit Button */}
                {!isReviewed && (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
                    >
                        {submitting ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Send size={20} />
                        )}
                        Kirim Review
                    </button>
                )}
            </div>
        </div>
    );
}
