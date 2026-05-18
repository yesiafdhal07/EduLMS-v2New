'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClipboardCheck, Clock, Users, AlertTriangle, ChevronRight, Inbox } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface WorkItem {
    id: string;
    title: string;
    className: string;
    count: number;
    type: 'grade' | 'deadline' | 'review' | 'attendance';
    urgency: 'high' | 'medium' | 'low';
}

interface Props {
    teacherId: string;
    classId: string | null;
    onNavigate: (tab: string) => void;
}

const TYPE_CONFIG = {
    grade: { label: 'Perlu Dinilai', icon: ClipboardCheck, color: 'text-[var(--guru-status-remedial)]', bg: 'bg-[var(--guru-status-remedial-bg)]', border: 'border-rose-500/20' },
    deadline: { label: 'Deadline Dekat', icon: Clock, color: 'text-[var(--guru-status-pending)]', bg: 'bg-[var(--guru-status-pending-bg)]', border: 'border-amber-500/20' },
    review: { label: 'Peer Review', icon: Users, color: 'text-[var(--guru-status-info)]', bg: 'bg-[var(--guru-status-info-bg)]', border: 'border-blue-500/20' },
    attendance: { label: 'Presensi Pending', icon: AlertTriangle, color: 'text-[var(--guru-secondary-text)]', bg: 'bg-[var(--guru-secondary-soft)]', border: 'border-purple-500/20' },
};

const URGENCY_BADGE = {
    high: 'gs-badge-remedial',
    medium: 'gs-badge-pending',
    low: 'gs-badge-tuntas',
};

const URGENCY_LABEL = {
    high: 'Mendesak',
    medium: 'Sedang',
    low: 'Rendah',
};

export function WorkQueue({ teacherId, classId, onNavigate }: Props) {
    const [items, setItems] = useState<WorkItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQueue = useCallback(async () => {
        if (!teacherId) return;
        setLoading(true);

        try {
            // Smart Heuristics Logic (Non-API Intelligence)
            const { data: queueData } = await supabase
                .from('teacher_work_queue')
                .select('*')
                .eq('teacher_id', teacherId);

            const newItems: WorkItem[] = [];
            (queueData || []).forEach((row: any) => {
                // Heuristic: Critical grading backlog
                if (row.pending_grade_count > 0) {
                    newItems.push({
                        id: `grade-${row.class_id}`,
                        title: `${row.pending_grade_count} submissions awaiting review`,
                        className: row.class_name,
                        count: row.pending_grade_count,
                        type: 'grade',
                        urgency: row.pending_grade_count > 15 ? 'high' : row.pending_grade_count > 5 ? 'medium' : 'low',
                    });
                }
                
                // Heuristic: Approaching deadlines (Priority 1)
                if (row.deadline_soon_count > 0) {
                    newItems.push({
                        id: `deadline-${row.class_id}`,
                        title: `${row.deadline_soon_count} assignments near deadline`,
                        className: row.class_name,
                        count: row.deadline_soon_count,
                        type: 'deadline',
                        urgency: 'high',
                    });
                }

                // Heuristic: Peer-to-peer review monitoring
                if (row.pending_review_count > 0) {
                    newItems.push({
                        id: `review-${row.class_id}`,
                        title: `${row.pending_review_count} pending peer-review checks`,
                        className: row.class_name,
                        count: row.pending_review_count,
                        type: 'review',
                        urgency: 'medium',
                    });
                }
            });

            // Smart Sort: Urgency first
            newItems.sort((a, b) => {
                const order = { high: 0, medium: 1, low: 2 };
                return order[a.urgency] - order[b.urgency];
            });

            setItems(newItems);
        } catch (err) {
            console.error('Work queue fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [teacherId]);

    useEffect(() => { fetchQueue(); }, [fetchQueue]);

    const totalWork = items.reduce((sum, item) => sum + item.count, 0);

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2].map(i => (
                    <div key={i} className="h-24 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="gs-card gs-glow p-10 text-center">
                <div className="w-16 h-16 bg-[var(--guru-accent-soft)] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--guru-border-accent)] relative z-10">
                    <Inbox size={28} className="text-[var(--guru-accent-text)]" />
                </div>
                <h3 className="gs-title text-xl mb-2 relative z-10">Inbox Kosong</h3>
                <p className="text-xs text-[var(--guru-text-muted)] max-w-[240px] mx-auto leading-relaxed relative z-10">Semua tugas dan submission sudah terselesaikan. Kerja bagus!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="gs-title text-xl">Antrian Tugas</h3>
                    <p className="gs-label mt-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-[var(--guru-accent)] rounded-full animate-pulse" />
                        Prioritas Hari Ini
                    </p>
                </div>
                <div className="bg-[var(--guru-accent-soft)] border border-[var(--guru-border-accent)] px-3 py-1.5 rounded-xl text-center">
                    <p className="gs-kpi text-xl text-[var(--guru-accent-text)]">{totalWork}</p>
                    <p className="gs-label mt-1" style={{ fontSize: '0.5rem' }}>Tertunda</p>
                </div>
            </div>

            {/* Queue List */}
            <div className="grid gap-3">
                {items.map((item, idx) => {
                    const cfg = TYPE_CONFIG[item.type];
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.type === 'grade' ? 'konten' : item.type === 'attendance' ? 'presensi' : 'konten')}
                            className="w-full text-left group animate-in slide-in-from-bottom-4 duration-500"
                            style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}
                        >
                            <div className="gs-priority-item" data-urgency={item.urgency}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500 group-hover:scale-110 ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                                        <cfg.icon size={20} strokeWidth={2.5} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`gs-badge ${URGENCY_BADGE[item.urgency]}`}>
                                                {URGENCY_LABEL[item.urgency]}
                                            </span>
                                            <p className="gs-label truncate max-w-[120px]">{item.className}</p>
                                        </div>
                                        <p className="text-sm font-bold text-white group-hover:text-[var(--guru-accent-text)] transition-colors truncate">
                                            {item.title}
                                        </p>
                                    </div>

                                    <div className="w-8 h-8 rounded-xl bg-[var(--guru-surface-hover)] flex items-center justify-center text-[var(--guru-text-ghost)] group-hover:bg-[var(--guru-accent)] group-hover:text-white transition-all duration-300">
                                        <ChevronRight size={14} />
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
