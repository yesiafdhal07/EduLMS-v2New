'use client';

import { useState, useEffect, useCallback } from 'react';
import { Map, Star, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ProgressRing } from '@/components/ui/ProgressRing';

interface SkillNode {
    id: string;
    name: string;
    mastery: number;
    level: 'mastered' | 'learning' | 'weak' | 'not_started';
    quizCount: number;
    avgScore: number;
}

interface Props {
    studentId: string;
    classId: string;
}

const LEVEL_CONFIG = {
    mastered: { color: '#10B981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', label: 'Dikuasai' },
    learning: { color: '#F59E0B', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', label: 'Belajar' },
    weak: { color: '#F43F5E', bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', label: 'Lemah' },
    not_started: { color: '#64748B', bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-500', label: 'Belum Mulai' },
};

function getLevel(mastery: number): SkillNode['level'] {
    if (mastery >= 80) return 'mastered';
    if (mastery >= 50) return 'learning';
    if (mastery > 0) return 'weak';
    return 'not_started';
}

export function SkillMap({ studentId, classId }: Props) {
    const [nodes, setNodes] = useState<SkillNode[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSkills = useCallback(async () => {
        if (!studentId || !classId) return;
        setLoading(true);

        try {
            const { data: subjects } = await supabase
                .from('subjects')
                .select('id, title')
                .eq('class_id', classId);

            if (!subjects || subjects.length === 0) {
                setNodes([]);
                setLoading(false);
                return;
            }

            const skillNodes: SkillNode[] = [];

            for (const subject of subjects) {
                const { data: grades } = await supabase
                    .from('grades')
                    .select('score, assignments!inner(subject_id)')
                    .eq('student_id', studentId)
                    .eq('assignments.subject_id', subject.id);

                const scores = (grades || []).map((g: any) => g.score).filter(Boolean);
                const avgScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;

                skillNodes.push({
                    id: subject.id,
                    name: subject.title,
                    mastery: avgScore,
                    level: getLevel(avgScore),
                    quizCount: scores.length,
                    avgScore,
                });
            }

            skillNodes.sort((a, b) => b.mastery - a.mastery);
            setNodes(skillNodes);
        } catch (err) {
            console.error('Skill map error:', err);
        } finally {
            setLoading(false);
        }
    }, [studentId, classId]);

    useEffect(() => { fetchSkills(); }, [fetchSkills]);

    if (loading) {
        return (
            <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 animate-pulse">
                <div className="h-5 bg-white/5 rounded w-32 mb-4" />
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white/5 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    if (nodes.length === 0) {
        return (
            <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 text-center">
                <Map size={40} className="text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400">Belum ada data skill map.</p>
                <p className="text-xs text-slate-500 mt-1">Kerjakan tugas dan kuis untuk membangun skill map.</p>
            </div>
        );
    }

    const masteredCount = nodes.filter(n => n.level === 'mastered').length;
    const learningCount = nodes.filter(n => n.level === 'learning').length;
    const weakCount = nodes.filter(n => n.level === 'weak').length;

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                        <Map size={20} className="text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white">Skill Map</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Peta penguasaan topik</p>
                    </div>
                </div>
                <div className="flex gap-3 text-[10px] font-bold">
                    <span className="text-emerald-400">{masteredCount} dikuasai</span>
                    <span className="text-amber-400">{learningCount} belajar</span>
                    <span className="text-rose-400">{weakCount} lemah</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nodes.map(node => {
                    const cfg = LEVEL_CONFIG[node.level];
                    return (
                        <div key={node.id} className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4 flex items-center gap-4 transition-all hover:scale-[1.01]`}>
                            <ProgressRing value={node.mastery} color={cfg.color} size={52} strokeWidth={4} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{node.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`${cfg.text} text-[9px] font-black uppercase tracking-widest`}>{cfg.label}</span>
                                    <span className="text-[10px] text-slate-500">{node.quizCount} tugas</span>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className={`text-lg font-black ${cfg.text}`}>{node.avgScore || '-'}</p>
                                <p className="text-[8px] text-slate-500 font-bold uppercase">Rata-rata</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
