'use client';

import { useState, useEffect, useCallback } from 'react';
import { Rocket, Clock, BookOpen, FileText, AlertTriangle, ChevronRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface NextAction {
    id: string;
    type: 'overdue' | 'deadline_soon' | 'new_quiz' | 'unread_material' | 'remedial';
    title: string;
    description: string;
    urgency: 'high' | 'medium' | 'low';
    action?: () => void;
}

interface Props {
    studentId: string;
    classId: string;
    onNavigate: (tab: string) => void;
}

const TYPE_CONFIG = {
    overdue: { icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Terlambat' },
    deadline_soon: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Deadline' },
    new_quiz: { icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', label: 'Kuis Baru' },
    unread_material: { icon: BookOpen, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', label: 'Materi' },
    remedial: { icon: AlertTriangle, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', label: 'Remedial' },
};

export function NextActionEngine({ studentId, classId, onNavigate }: Props) {
    const [actions, setActions] = useState<NextAction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchActions = useCallback(async () => {
        if (!studentId || !classId) return;
        setLoading(true);

        try {
            const now = new Date().toISOString();
            const soon = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            const result: NextAction[] = [];

            const { data: assignments } = await supabase
                .from('assignments')
                .select('id, title, deadline, subject_id, subjects!inner(class_id)')
                .eq('subjects.class_id', classId)
                .is('deleted_at', null);

            const { data: mySubmissions } = await supabase
                .from('submissions')
                .select('assignment_id')
                .eq('student_id', studentId);

            const submittedIds = new Set((mySubmissions || []).map(s => s.assignment_id));

            (assignments || []).forEach((a: any) => {
                if (submittedIds.has(a.id)) return;
                if (a.deadline && a.deadline < now) {
                    result.push({
                        id: `overdue-${a.id}`,
                        type: 'overdue',
                        title: a.title,
                        description: 'Tugas sudah melewati deadline!',
                        urgency: 'high',
                    });
                } else if (a.deadline && a.deadline < soon) {
                    result.push({
                        id: `soon-${a.id}`,
                        type: 'deadline_soon',
                        title: a.title,
                        description: 'Deadline kurang dari 24 jam.',
                        urgency: 'high',
                    });
                }
            });

            const { data: quizzes } = await supabase
                .from('quizzes')
                .select('id, title')
                .eq('class_id', classId)
                .eq('published', true);

            const { data: myAttempts } = await supabase
                .from('quiz_attempts')
                .select('quiz_id')
                .eq('student_id', studentId);

            const attemptedIds = new Set((myAttempts || []).map(a => a.quiz_id));

            (quizzes || []).forEach((q: any) => {
                if (!attemptedIds.has(q.id)) {
                    result.push({
                        id: `quiz-${q.id}`,
                        type: 'new_quiz',
                        title: q.title,
                        description: 'Kuis tersedia, belum dikerjakan.',
                        urgency: 'medium',
                    });
                }
            });

            result.sort((a, b) => {
                const order = { high: 0, medium: 1, low: 2 };
                return order[a.urgency] - order[b.urgency];
            });

            setActions(result.slice(0, 5));
        } catch (err) {
            console.error('Next action fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [studentId, classId]);

    useEffect(() => { fetchActions(); }, [fetchActions]);

    if (loading) {
        return (
            <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 animate-pulse">
                <div className="h-5 bg-white/5 rounded w-48 mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    if (actions.length === 0) {
        return (
            <div className="bg-emerald-500/5 backdrop-blur-md rounded-3xl border border-emerald-500/20 p-8 text-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={28} className="text-emerald-400" />
                </div>
                <h3 className="text-lg font-black text-emerald-400 mb-1">Semua Selesai!</h3>
                <p className="text-sm text-emerald-400/60">Tidak ada tugas mendesak. Kamu bisa review materi atau coba kuis.</p>
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Rocket size={20} className="text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-white">Apa yang harus dilakukan?</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Prioritas berdasarkan urgency</p>
                </div>
            </div>

            <div className="space-y-2">
                {actions.map(action => {
                    const cfg = TYPE_CONFIG[action.type];
                    return (
                        <button
                            key={action.id}
                            onClick={() => onNavigate(action.type === 'new_quiz' ? 'kuis' : 'pembelajaran')}
                            className={`w-full ${cfg.bg} border ${cfg.border} rounded-2xl p-4 flex items-center gap-3 text-left hover:scale-[1.005] transition-all group`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg} ${cfg.color}`}>
                                <cfg.icon size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-white truncate">{action.title}</p>
                                    <span className={`${cfg.bg} ${cfg.color} border ${cfg.border} px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shrink-0`}>
                                        {cfg.label}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-500">{action.description}</p>
                            </div>
                            <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-colors shrink-0" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
