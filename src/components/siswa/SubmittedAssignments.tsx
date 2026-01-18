'use client';

import { useState, useEffect } from 'react';
import { Send, FileText, Download, ExternalLink, RefreshCw, CheckCircle, Clock, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SubmissionRecord {
    id: string;
    file_url: string;
    submitted_at: string;
    assignment_title: string;
    assignment_deadline: string;
    subject_name: string;
    grade?: {
        score: number;
        type: string;
        feedback?: string;
    };
}

interface SubmittedAssignmentsProps {
    studentId: string;
}

export function SubmittedAssignments({ studentId }: SubmittedAssignmentsProps) {
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
    const [filter, setFilter] = useState<'all' | 'graded' | 'pending'>('all');

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('submissions')
                .select(`
                    id,
                    file_url,
                    submitted_at,
                    assignment:assignment_id (
                        title,
                        deadline,
                        subject:subject_id (title)
                    ),
                    grades (
                        score,
                        type,
                        feedback
                    )
                `)
                .order('submitted_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Supabase error details:', JSON.stringify(error, null, 2));
                throw error;
            }

            const formatted = (data || []).map((sub: any) => ({
                id: sub.id,
                file_url: sub.file_url,
                submitted_at: sub.submitted_at,
                assignment_title: sub.assignment?.title || '',
                assignment_deadline: sub.assignment?.deadline || '',
                subject_name: sub.assignment?.subject?.title || '',
                grade: sub.grades?.[0] || null
            }));

            setSubmissions(formatted);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            // setSubmissions([]); // Optional: keep previous data or clear
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (studentId) fetchSubmissions();
    }, [studentId]);

    // Real-time subscription
    useEffect(() => {
        if (!studentId) return;

        const channel = supabase
            .channel('student_submissions')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'submissions', filter: `student_id=eq.${studentId}` },
                fetchSubmissions
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'grades' },
                fetchSubmissions
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [studentId]);

    const filteredSubmissions = filter === 'all'
        ? submissions
        : filter === 'graded'
            ? submissions.filter(s => s.grade)
            : submissions.filter(s => !s.grade);

    const stats = {
        total: submissions.length,
        graded: submissions.filter(s => s.grade).length,
        pending: submissions.filter(s => !s.grade).length
    };

    const getFileType = (url: string) => {
        const ext = url.split('.').pop()?.toLowerCase() || '';
        if (['pdf'].includes(ext)) return { type: 'PDF', color: 'text-rose-400', bg: 'bg-rose-500/10' };
        if (['doc', 'docx'].includes(ext)) return { type: 'DOC', color: 'text-blue-400', bg: 'bg-blue-500/10' };
        if (['jpg', 'jpeg', 'png'].includes(ext)) return { type: 'IMG', color: 'text-purple-400', bg: 'bg-purple-500/10' };
        return { type: 'FILE', color: 'text-slate-400', bg: 'bg-slate-500/10' };
    };

    const isLateSubmission = (submitted: string, deadline: string) => {
        return new Date(submitted) > new Date(deadline);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`p-5 rounded-2xl border text-center transition-all ${filter === 'all' ? 'bg-indigo-600/20 border-indigo-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                >
                    <p className="text-3xl font-black text-white">{stats.total}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total Dikirim</p>
                </button>
                <button
                    onClick={() => setFilter('graded')}
                    className={`p-5 rounded-2xl border text-center transition-all ${filter === 'graded' ? 'bg-emerald-600/20 border-emerald-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                >
                    <p className="text-3xl font-black text-emerald-400">{stats.graded}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sudah Dinilai</p>
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`p-5 rounded-2xl border text-center transition-all ${filter === 'pending' ? 'bg-amber-600/20 border-amber-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                >
                    <p className="text-3xl font-black text-amber-400">{stats.pending}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Menunggu Nilai</p>
                </button>
            </div>

            {/* Submissions List */}
            <div className="bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Send size={20} className="text-indigo-400" />
                        <h3 className="font-black text-white">Tugas Terkirim</h3>
                    </div>
                    <button
                        onClick={fetchSubmissions}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        aria-label="Refresh"
                    >
                        <RefreshCw size={16} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto scrollbar-custom">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                            <p className="text-sm">Memuat data...</p>
                        </div>
                    ) : filteredSubmissions.length === 0 ? (
                        <div className="p-12 text-center">
                            <Send className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm font-medium">Belum ada tugas terkirim</p>
                        </div>
                    ) : (
                        filteredSubmissions.map((sub) => {
                            const fileType = getFileType(sub.file_url);
                            const isLate = isLateSubmission(sub.submitted_at, sub.assignment_deadline);

                            return (
                                <div key={sub.id} className="p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl ${fileType.bg} flex items-center justify-center shrink-0`}>
                                            <span className={`text-xs font-black ${fileType.color}`}>{fileType.type}</span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FileText size={14} className="text-slate-400 shrink-0" />
                                                <p className="font-bold text-white truncate">{sub.assignment_title}</p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-3">
                                                <span>{sub.subject_name}</span>
                                                <span>•</span>
                                                <span>Dikirim: {new Date(sub.submitted_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}</span>
                                                {isLate && (
                                                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold">
                                                        Terlambat
                                                    </span>
                                                )}
                                            </div>

                                            {/* Grade or Pending Status */}
                                            {sub.grade ? (
                                                <div className="flex items-center gap-3 bg-emerald-500/10 p-3 rounded-xl">
                                                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                                        <span className="text-lg font-black text-emerald-400">{sub.grade.score}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle size={14} className="text-emerald-400" />
                                                            <span className="text-xs font-bold text-emerald-400">Sudah Dinilai</span>
                                                        </div>
                                                        {sub.grade.feedback && (
                                                            <p className="text-xs text-slate-300 mt-1 line-clamp-1">{sub.grade.feedback}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                                                    <Clock size={14} />
                                                    <span>Menunggu penilaian guru</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 shrink-0">
                                            <a
                                                href={sub.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                                                aria-label="Lihat file"
                                                title="Lihat file"
                                            >
                                                <Eye size={16} className="text-slate-400" />
                                            </a>
                                            <a
                                                href={sub.file_url}
                                                download
                                                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                                                aria-label="Download file"
                                                title="Download"
                                            >
                                                <Download size={16} className="text-slate-400" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
