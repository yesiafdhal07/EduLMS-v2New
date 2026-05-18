'use client';

import { useState, useEffect, useCallback } from 'react';
import { Send, MessageSquare, CheckCircle, User, Shield, Loader2, Flame, HelpCircle, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Discussion {
    id: string;
    content: string;
    is_anonymous: boolean;
    is_resolved: boolean;
    created_at: string;
    author_id: string;
    replies?: DiscussionReply[];
}

interface DiscussionReply {
    id: string;
    content: string;
    is_teacher: boolean;
    created_at: string;
    author?: {
        full_name: string;
    };
}

interface DiscussionForumProps {
    classId: string;
    userId: string;
    isTeacher?: boolean;
    className?: string;
}

/**
 * Safe-Zone Discussion Forum
 * Anonymous Q&A for students with teacher visibility
 */
export function DiscussionForum({ classId, userId, isTeacher = false, className = '' }: DiscussionForumProps) {
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [replyContent, setReplyContent] = useState<Record<string, string>>({});
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Fetch discussions
    const fetchDiscussions = useCallback(async () => {
        if (!classId) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('discussions')
                .select(`
                    id,
                    content,
                    is_anonymous,
                    is_resolved,
                    created_at,
                    author_id,
                    replies:discussion_replies(
                        id,
                        content,
                        is_teacher,
                        created_at,
                        author:users!discussion_replies_author_id_fkey(full_name)
                    )
                `)
                .eq('class_id', classId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // Format replies: extract first author entry from array
            const formattedDiscussions = (data as any[] || []).map(disc => ({
                ...disc,
                replies: disc.replies?.map((reply: any) => ({
                    ...reply,
                    author: Array.isArray(reply.author) ? reply.author[0] : reply.author
                }))
            }));
            
            setDiscussions(formattedDiscussions);
        } catch (err) {
            console.error('Failed to fetch discussions:', err);
        } finally {
            setLoading(false);
        }
    }, [classId]);

    useEffect(() => {
        fetchDiscussions();
    }, [fetchDiscussions]);

    // Submit new question
    const handleSubmitQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuestion.trim() || !classId || !userId) return;

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('discussions')
                .insert({
                    class_id: classId,
                    author_id: userId,
                    content: newQuestion.trim(),
                    is_anonymous: true
                });

            if (error) throw error;

            setNewQuestion('');
            fetchDiscussions();
        } catch (err) {
            console.error('Failed to submit question:', err);
        } finally {
            setSubmitting(false);
        }
    };

    // Submit reply
    const handleSubmitReply = async (discussionId: string) => {
        const content = replyContent[discussionId]?.trim();
        if (!content || !userId) return;

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('discussion_replies')
                .insert({
                    discussion_id: discussionId,
                    author_id: userId,
                    content: content,
                    is_teacher: isTeacher
                });

            if (error) throw error;

            setReplyContent(prev => ({ ...prev, [discussionId]: '' }));
            fetchDiscussions();
        } catch (err) {
            console.error('Failed to submit reply:', err);
        } finally {
            setSubmitting(false);
        }
    };

    // Mark as resolved (teacher only)
    const handleMarkResolved = async (discussionId: string) => {
        if (!isTeacher) return;

        try {
            const { error } = await supabase
                .from('discussions')
                .update({ is_resolved: true })
                .eq('id', discussionId);

            if (error) throw error;
            fetchDiscussions();
        } catch (err) {
            console.error('Failed to mark resolved:', err);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-violet-500/20 rounded-2xl flex items-center justify-center">
                    <Shield className="text-violet-400" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-white">Safe-Zone Discussion</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm text-slate-400">
                            {isTeacher 
                                ? 'Jawab pertanyaan anonim dari siswa' 
                                : 'Bertanya tanpa takut diketahui teman sekelas'}
                        </p>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active Hub</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Question Form (Student Only) */}
            {!isTeacher && (
                <form onSubmit={handleSubmitQuestion} className="bg-white/5 backdrop-blur-lg rounded-2xl p-5 border border-white/10">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
                            <User className="text-slate-400" size={20} />
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                placeholder="Tulis pertanyaanmu di sini... (Identitasmu akan disembunyikan dari teman sekelas)"
                                className="w-full bg-transparent border-none outline-none text-white placeholder-slate-500 resize-none min-h-[80px]"
                                rows={3}
                            />
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <Shield size={12} /> Pertanyaanmu bersifat anonim
                                </span>
                                <button
                                    type="submit"
                                    disabled={!newQuestion.trim() || submitting}
                                    className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all"
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    <span className="text-sm font-bold">Kirim</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            )}

            {/* Discussion List */}
            {discussions.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-bold">Belum ada diskusi</p>
                    <p className="text-sm">Jadilah yang pertama bertanya!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {discussions.map((discussion) => (
                        <div 
                            key={discussion.id} 
                            className={`bg-white/5 backdrop-blur-lg rounded-2xl p-5 border transition-all ${
                                discussion.is_resolved 
                                    ? 'border-emerald-500/30 bg-emerald-500/5' 
                                    : 'border-white/10'
                            }`}
                        >
                            {/* Question */}
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center shrink-0">
                                    <User className="text-violet-400" size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-white text-sm">
                                            {isTeacher && discussion.author_id === userId 
                                                ? 'Anda' 
                                                : 'Siswa Anonim'}
                                        </span>
                                        
                                        {/* Heuristic: Topic Badge */}
                                        {discussion.content.includes('?') ? (
                                            <span className="text-[9px] font-black text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-lg border border-violet-500/20 flex items-center gap-1">
                                                <HelpCircle size={10} /> PERTANYAAN
                                            </span>
                                        ) : (
                                            <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20 flex items-center gap-1">
                                                <MessageSquare size={10} /> DISKUSI
                                            </span>
                                        )}

                                        {/* Heuristic: Trending Detection */}
                                        {(discussion.replies?.length || 0) >= 3 && (
                                            <span className="text-[9px] font-black text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20 animate-pulse flex items-center gap-1">
                                                <Flame size={10} /> TRENDING
                                            </span>
                                        )}

                                        {discussion.is_resolved && (
                                            <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                                                <CheckCircle size={10} /> TERJAWAB
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-500 ml-auto">
                                            {formatDate(discussion.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-slate-200 text-sm leading-relaxed font-medium">
                                        {discussion.content}
                                    </p>

                                    {/* Replies */}
                                    {discussion.replies && discussion.replies.length > 0 && (
                                        <div className="mt-4 space-y-3 pl-4 border-l-2 border-white/10">
                                            {discussion.replies.map((reply) => (
                                                <div key={reply.id} className="flex items-start gap-2">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                        reply.is_teacher 
                                                            ? 'bg-indigo-500/20' 
                                                            : 'bg-slate-700'
                                                    }`}>
                                                        <User size={14} className={reply.is_teacher ? 'text-indigo-400' : 'text-slate-400'} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs font-bold ${
                                                                reply.is_teacher ? 'text-indigo-400' : 'text-slate-400'
                                                            }`}>
                                                                {reply.is_teacher ? 'Guru' : 'Siswa'}
                                                            </span>
                                                            <span className="text-[10px] text-slate-500">
                                                                {formatDate(reply.created_at)}
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-300 text-sm">{reply.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Reply Form */}
                                    {expandedId === discussion.id && (
                                        <div className="mt-4 flex gap-2">
                                            <input
                                                type="text"
                                                value={replyContent[discussion.id] || ''}
                                                onChange={(e) => setReplyContent(prev => ({ 
                                                    ...prev, 
                                                    [discussion.id]: e.target.value 
                                                }))}
                                                placeholder="Tulis balasan..."
                                                className="flex-1 px-4 py-2 bg-slate-800 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 outline-none focus:border-violet-500"
                                            />
                                            <button
                                                onClick={() => handleSubmitReply(discussion.id)}
                                                disabled={!replyContent[discussion.id]?.trim() || submitting}
                                                className="px-4 py-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white rounded-xl"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 mt-4">
                                        <button
                                            onClick={() => setExpandedId(expandedId === discussion.id ? null : discussion.id)}
                                            className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
                                        >
                                            {expandedId === discussion.id ? 'Tutup' : 'Balas'}
                                        </button>
                                        {isTeacher && !discussion.is_resolved && (
                                            <button
                                                onClick={() => handleMarkResolved(discussion.id)}
                                                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                                            >
                                                <CheckCircle size={12} /> Tandai Terjawab
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DiscussionForum;
