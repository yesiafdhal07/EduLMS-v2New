'use client';

import { supabase } from '@/lib/supabase';

// =========================================
// PEER REVIEW UTILITY FUNCTIONS
// =========================================

export interface PeerReview {
    id: string;
    assignment_id: string;
    reviewer_id: string;
    reviewee_id: string;
    submission_id: string;
    reviewer_name_confirm: string | null;
    feedback: string | null;
    score: number | null; // Changed from rating to score
    status: string; // 'assigned', 'submitted', 'approved'
    created_at: string;
    reviewed_at: string | null;
}

/**
 * Check if 1 day has passed since deadline (grace period ended)
 */
export function isDeadlinePlusDayPassed(deadline: string): boolean {
    const deadlineDate = new Date(deadline);
    const oneDayAfter = new Date(deadlineDate.getTime() + 24 * 60 * 60 * 1000);
    return new Date() > oneDayAfter;
}

/**
 * Check if peer review is already enabled for an assignment
 */
export async function isPeerReviewEnabled(assignmentId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('assignments')
        .select('peer_review_enabled')
        .eq('id', assignmentId)
        .single();

    if (error) return false;
    return data?.peer_review_enabled ?? false;
}

/**
 * Enable peer review for an assignment using Database RPC
 */
export async function enablePeerReview(assignmentId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        // 1. Call RPC to distribute reviews
        const { data, error } = await supabase
            .rpc('distribute_peer_reviews', { p_assignment_id: assignmentId });

        if (error) throw error;

        // 2. Update assignment to mark peer review as enabled
        const { error: updateError } = await supabase
            .from('assignments')
            .update({ peer_review_enabled: true })
            .eq('id', assignmentId);

        if (updateError) throw updateError;

        return { success: true, message: data };
    } catch (error: any) {
        console.error('Error enabling peer review:', error);
        return { success: false, error: error.message || 'Gagal mengaktifkan peer review' };
    }
}

/**
 * Approve a peer review and finalize the grade (RPC)
 */
export async function approvePeerReview(reviewId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .rpc('approve_peer_review', { p_review_id: reviewId });

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Gagal menyetujui review' };
    }
}

/**
 * Update a peer review score/feedback (for Teacher before approval)
 */
export async function updatePeerReviewScore(
    reviewId: string,
    score: number,
    feedback: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('peer_reviews')
            .update({ score, feedback })
            .eq('id', reviewId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Get all peer reviews for an assignment (for teacher view)
 */
export async function getAllPeerReviews(assignmentId: string): Promise<{
    reviews: (PeerReview & { reviewer_name: string; reviewee_name: string })[];
    completed: number;
    total: number;
}> {
    const { data, error } = await supabase
        .from('peer_reviews')
        .select(`
            *,
            reviewer:users!peer_reviews_reviewer_id_fkey (full_name),
            reviewee:users!peer_reviews_reviewee_id_fkey (full_name)
        `)
        .eq('assignment_id', assignmentId);

    if (error) {
        console.error('Error fetching peer reviews:', error);
        return { reviews: [], completed: 0, total: 0 };
    }

    const reviews = (data || []).map((r: any) => ({
        ...r,
        reviewer_name: r.reviewer?.full_name || 'Unknown',
        reviewee_name: r.reviewee?.full_name || 'Unknown',
    }));

    const completed = reviews.filter(r => r.reviewed_at !== null).length;

    return { reviews, completed, total: reviews.length };
}

/**
 * Get the peer review assigned to a student (as reviewer) for an assignment
 */
export async function getAssignedPeerReview(assignmentId: string, studentId: string): Promise<PeerReview | null> {
    const { data, error } = await supabase
        .from('peer_reviews')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('reviewer_id', studentId)
        .single();

    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('Error fetching assigned peer review:', error);
        }
        return null;
    }

    return data as PeerReview;
}

// ============================================================
// SUBMIT PEER REVIEW
// Kirim review dari siswa dengan validasi dan sanitasi input
// ============================================================

/**
 * Fungsi untuk membersihkan input dari karakter berbahaya
 * Mencegah XSS (Cross-Site Scripting) attacks
 */
function sanitizeInput(input: string): string {
    return input
        .replace(/</g, '&lt;')      // Escape < untuk mencegah HTML injection
        .replace(/>/g, '&gt;')      // Escape >
        .replace(/"/g, '&quot;')    // Escape quotes
        .replace(/'/g, '&#x27;')    // Escape single quotes
        .replace(/\//g, '&#x2F;')   // Escape forward slash
        .trim();                     // Hapus whitespace berlebih
}

/**
 * Submit peer review dengan validasi dan sanitasi lengkap
 * @param reviewId - ID review yang akan disubmit
 * @param reviewerNameConfirm - Nama reviewer untuk konfirmasi
 * @param feedback - Feedback untuk reviewee (akan disanitasi)
 * @param score - Nilai 0-100
 * @returns Object dengan status success/error
 */
export async function submitPeerReview(
    reviewId: string,
    reviewerNameConfirm: string,
    feedback: string,
    score: number
): Promise<{ success: boolean; error?: string }> {
    try {
        // Validasi score di server-side (defense in depth)
        if (typeof score !== 'number' || score < 0 || score > 100) {
            return { success: false, error: 'Score harus angka antara 0-100' };
        }

        // Sanitasi semua input teks untuk mencegah XSS
        const sanitizedFeedback = sanitizeInput(feedback);
        const sanitizedName = sanitizeInput(reviewerNameConfirm);

        // Validasi panjang input
        if (sanitizedFeedback.length > 2000) {
            return { success: false, error: 'Feedback terlalu panjang (max 2000 karakter)' };
        }

        const { error } = await supabase
            .from('peer_reviews')
            .update({
                reviewer_name_confirm: sanitizedName,
                feedback: sanitizedFeedback,
                score: score,
                reviewed_at: new Date().toISOString()
            })
            .eq('id', reviewId);

        if (error) throw error;
        return { success: true };
    } catch (error: unknown) {
        // Type-safe error handling
        const errorMessage = error instanceof Error
            ? error.message
            : 'Gagal mengirim review';
        console.error('Error submitting peer review:', error);
        return { success: false, error: errorMessage };
    }
}

