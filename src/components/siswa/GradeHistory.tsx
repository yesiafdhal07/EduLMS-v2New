'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Trophy, Star, TrendingUp, RefreshCw, FileText, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface GradeRecord {
    id: string;
    score: number;
    type: 'formatif' | 'sumatif' | 'keaktifan';
    feedback?: string;
    created_at: string;
    assignment_title?: string;
    subject_name?: string;
}

interface GradeHistoryProps {
    studentId: string;
}

export function GradeHistory({ studentId }: GradeHistoryProps) {
    const [loading, setLoading] = useState(true);
    const [grades, setGrades] = useState<GradeRecord[]>([]);
    const [filter, setFilter] = useState<'all' | 'formatif' | 'sumatif' | 'keaktifan'>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Supabase join query result type
    interface GradeWithSubmission {
        id: string;
        score: number;
        type: 'formatif' | 'sumatif' | 'keaktifan';
        feedback: string | null;
        created_at: string;
        submission: {
            assignment: {
                title: string;
                subject: { title: string } | null;
            } | null;
        } | null;
    }

    const fetchGrades = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('grades')
                .select(`
                    id,
                    score,
                    type,
                    feedback,
                    created_at,
                    submission:submission_id (
                        assignment:assignment_id (
                            title,
                            subject:subject_id (title)
                        )
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Supabase error details:', JSON.stringify(error, null, 2));
                throw error;
            }

            const formatted = ((data || []) as unknown as GradeWithSubmission[]).map((grade) => ({
                id: grade.id,
                score: grade.score,
                type: grade.type,
                feedback: grade.feedback || undefined,
                created_at: grade.created_at,
                assignment_title: grade.submission?.assignment?.title || 'Keaktifan',
                subject_name: grade.submission?.assignment?.subject?.title || ''
            }));

            setGrades(formatted);
        } catch (error) {
            console.error('Error fetching grades:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (studentId) fetchGrades();
    }, [studentId]);

    // Real-time subscription
    useEffect(() => {
        if (!studentId) return;

        const channel = supabase
            .channel('student_grades_history')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'grades', filter: `student_id=eq.${studentId}` },
                fetchGrades
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [studentId]);

    // Memoize filtered grades and stats
    const filteredGrades = useMemo(() =>
        filter === 'all' ? grades : grades.filter(g => g.type === filter),
        [grades, filter]);

    const stats = useMemo(() => ({
        average: grades.length > 0
            ? Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length * 10) / 10
            : 0,
        highest: grades.length > 0 ? Math.max(...grades.map(g => g.score)) : 0,
        count: grades.length,
        formatif: grades.filter(g => g.type === 'formatif').length,
        sumatif: grades.filter(g => g.type === 'sumatif').length,
        keaktifan: grades.filter(g => g.type === 'keaktifan').length
    }), [grades]);

    const getGradeColor = (score: number) => {
        if (score >= 85) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', grade: 'A' };
        if (score >= 70) return { text: 'text-blue-400', bg: 'bg-blue-500/10', grade: 'B' };
        if (score >= 55) return { text: 'text-amber-400', bg: 'bg-amber-500/10', grade: 'C' };
        return { text: 'text-rose-400', bg: 'bg-rose-500/10', grade: 'D' };
    };

    const typeConfig = {
        formatif: { label: 'Formatif', color: 'text-blue-400', bg: 'bg-blue-500/10' },
        sumatif: { label: 'Sumatif', color: 'text-purple-400', bg: 'bg-purple-500/10' },
        keaktifan: { label: 'Keaktifan', color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-md p-5 rounded-2xl border border-indigo-500/30">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                            <TrendingUp size={24} className="text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white">{stats.average}</p>
                            <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Rata-rata</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                            <Trophy size={24} className="text-amber-400" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white">{stats.highest}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tertinggi</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                            <Star size={24} className="text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white">{stats.count}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Nilai</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                    <div className="flex gap-2 text-xs">
                        <span className="text-blue-400 font-bold">{stats.formatif}F</span>
                        <span className="text-purple-400 font-bold">{stats.sumatif}S</span>
                        <span className="text-emerald-400 font-bold">{stats.keaktifan}K</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Breakdown</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {(['all', 'formatif', 'sumatif', 'keaktifan'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === type
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                    >
                        {type === 'all' ? 'Semua' : typeConfig[type].label}
                    </button>
                ))}
            </div>

            {/* Grades List */}
            <div className="bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Star size={20} className="text-amber-400" />
                        <h3 className="font-black text-white">Histori Nilai</h3>
                    </div>
                    <button
                        onClick={fetchGrades}
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
                    ) : filteredGrades.length === 0 ? (
                        <div className="p-12 text-center">
                            <Star className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm font-medium">Belum ada nilai</p>
                        </div>
                    ) : (
                        filteredGrades.map((grade) => {
                            const gradeColor = getGradeColor(grade.score);
                            const config = typeConfig[grade.type];
                            const isExpanded = expandedId === grade.id;

                            return (
                                <div key={grade.id} className="hover:bg-white/5 transition-colors">
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : grade.id)}
                                        className="w-full p-4 flex items-center gap-4 text-left"
                                    >
                                        <div className={`w-14 h-14 rounded-xl ${gradeColor.bg} flex items-center justify-center`}>
                                            <span className={`text-2xl font-black ${gradeColor.text}`}>{grade.score}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FileText size={14} className="text-slate-400" />
                                                <p className="font-bold text-white truncate">{grade.assignment_title}</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <span className={`px-2 py-0.5 rounded-full ${config.bg} ${config.color} font-bold`}>
                                                    {config.label}
                                                </span>
                                                <span>•</span>
                                                <span>{new Date(grade.created_at).toLocaleDateString('id-ID')}</span>
                                            </div>
                                        </div>
                                        <div className={`w-10 h-10 rounded-xl ${gradeColor.bg} flex items-center justify-center`}>
                                            <span className={`text-lg font-black ${gradeColor.text}`}>{gradeColor.grade}</span>
                                        </div>
                                        {grade.feedback && (
                                            isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />
                                        )}
                                    </button>

                                    {/* Feedback Section */}
                                    {isExpanded && grade.feedback && (
                                        <div className="px-4 pb-4">
                                            <div className="bg-white/5 rounded-xl p-4 ml-[70px]">
                                                <div className="flex items-start gap-2">
                                                    <MessageCircle size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Feedback Guru</p>
                                                        <p className="text-sm text-slate-300">{grade.feedback}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
