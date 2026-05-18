'use client';

import { useState, useMemo } from 'react';
import { BookOpen, FileText, Layers, FileQuestion, LayoutList, LayoutGrid, Calendar, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { MaterialPanel } from '@/components/guru/MaterialPanel';
import { AssignmentPanel } from '@/components/guru/AssignmentPanel';
import { SoalGeneratorModal } from '@/components/guru/SoalGeneratorModal';
import { QuizBuilder } from '@/components/quiz';
import type { Material, Assignment } from '@/types';

// Dynamic import for Pipeline (Board view)
import dynamic from 'next/dynamic';
const PipelineView = dynamic(
    () => import('@/components/guru/PipelineView').then(mod => mod.PipelineView),
    { loading: () => <div className="h-64 gs-card animate-pulse" /> }
);

// ========================================================
// KONTEN TAB — Unified Content Hub
// Merges Materials + Assignments + Quiz + Pipeline
// with view mode toggles (List / Board / Calendar) and filter chips
// Inspired by: Google Classroom Classwork + Asana Views
// ========================================================

interface KontenTabProps {
    materials: Material[];
    assignments: Assignment[];
    onAddMaterial: () => void;
    onAddAssignment: () => void;
    onViewSubmissions: (assignment: Assignment) => void;
    onManualGrade: (assignment: Assignment) => void;
    classSelected: boolean;
    classId?: string;
}

type ContentFilter = 'semua' | 'materi' | 'tugas' | 'kuis';
type ViewMode = 'list' | 'board' | 'calendar';

const FILTER_OPTIONS: { key: ContentFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'semua', label: 'Semua', icon: <Layers size={13} /> },
    { key: 'materi', label: 'Bahan Ajar', icon: <BookOpen size={13} /> },
    { key: 'tugas', label: 'Penugasan', icon: <FileText size={13} /> },
    { key: 'kuis', label: 'Kuis & Ujian', icon: <FileQuestion size={13} /> },
];

const DAYS_ID = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export function KontenTab({
    materials,
    assignments,
    onAddMaterial,
    onAddAssignment,
    onViewSubmissions,
    onManualGrade,
    classSelected,
    classId,
}: KontenTabProps) {
    const [activeFilter, setActiveFilter] = useState<ContentFilter>('semua');
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
    const [calYear, setCalYear] = useState(() => new Date().getFullYear());
    const [showSoalGenerator, setShowSoalGenerator] = useState(false);

    // ── Calendar data ──
    const calendarDays = useMemo(() => {
        const firstDay = new Date(calYear, calMonth, 1);
        const lastDay = new Date(calYear, calMonth + 1, 0);
        const startPad = (firstDay.getDay() + 6) % 7; // Monday start
        const totalDays = lastDay.getDate();
        const days: (number | null)[] = [];
        for (let i = 0; i < startPad; i++) days.push(null);
        for (let d = 1; d <= totalDays; d++) days.push(d);
        return days;
    }, [calMonth, calYear]);

    const assignmentsByDate = useMemo(() => {
        const map: Record<string, Assignment[]> = {};
        assignments.forEach(a => {
            if (!a.deadline) return;
            const d = new Date(a.deadline);
            if (d.getMonth() === calMonth && d.getFullYear() === calYear) {
                const key = d.getDate().toString();
                if (!map[key]) map[key] = [];
                map[key].push(a);
            }
        });
        return map;
    }, [assignments, calMonth, calYear]);

    const today = new Date();
    const isCurrentMonth = today.getMonth() === calMonth && today.getFullYear() === calYear;

    if (!classSelected) {
        return (
            <div className="gs-card flex flex-col items-center justify-center min-h-[400px] p-12 gs-glow">
                <div className="w-20 h-20 bg-[var(--guru-accent-soft)] rounded-3xl flex items-center justify-center mb-6 border border-[var(--guru-border-accent)] relative z-10">
                    <Layers size={40} className="text-[var(--guru-accent-text)]" />
                </div>
                <h3 className="gs-title text-2xl mb-3 relative z-10">Pilih Kelas Terlebih Dahulu</h3>
                <p className="gs-body text-center max-w-md text-sm relative z-10">
                    Silakan pilih kelas dari dropdown di header untuk mengelola materi, tugas, dan kuis.
                </p>
            </div>
        );
    }

    return (
        <>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            {/* ─── Top Bar: View Toggle + Filter Chips ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Filter Chips */}
                <div className="flex items-center gap-2 flex-wrap">
                    {FILTER_OPTIONS.map(opt => {
                        const count = opt.key === 'materi' ? materials.length 
                            : opt.key === 'tugas' ? assignments.length 
                            : opt.key === 'semua' ? materials.length + assignments.length 
                            : undefined;
                        return (
                            <button
                                key={opt.key}
                                onClick={() => setActiveFilter(opt.key)}
                                className="gs-chip"
                                data-active={activeFilter === opt.key ? 'true' : undefined}
                            >
                                {opt.icon}
                                <span>{opt.label}</span>
                                {count !== undefined && (
                                    <span className={`text-[10px] ml-0.5 ${
                                        activeFilter === opt.key 
                                            ? 'text-[var(--guru-accent-text)]' 
                                            : 'text-[var(--guru-text-ghost)]'
                                    }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* View Mode Toggle */}
                <div className="gs-view-toggle">
                    <button className="gs-view-toggle-item" data-active={viewMode === 'list' ? 'true' : undefined} onClick={() => setViewMode('list')}>
                        <LayoutList size={14} /> <span>List</span>
                    </button>
                    <button className="gs-view-toggle-item" data-active={viewMode === 'board' ? 'true' : undefined} onClick={() => setViewMode('board')}>
                        <LayoutGrid size={14} /> <span>Board</span>
                    </button>
                    <button className="gs-view-toggle-item" data-active={viewMode === 'calendar' ? 'true' : undefined} onClick={() => setViewMode('calendar')}>
                        <Calendar size={14} /> <span>Kalender</span>
                    </button>
                </div>
            </div>

            {/* ─── Content Area ─── */}
            <div className="min-h-[400px]">
                {viewMode === 'list' ? (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {(activeFilter === 'semua' || activeFilter === 'materi') && (
                            <div>
                                {activeFilter === 'semua' && (
                                    <div className="flex items-center gap-3 mb-4 px-1">
                                        <BookOpen size={16} className="text-[var(--guru-accent-text)]" />
                                        <h3 className="gs-title text-lg">Bahan Ajar</h3>
                                        <span className="gs-badge gs-badge-accent">{materials.length}</span>
                                    </div>
                                )}
                                <MaterialPanel materials={materials} onAddMaterial={onAddMaterial} />
                            </div>
                        )}
                        {(activeFilter === 'semua' || activeFilter === 'tugas') && (
                            <div>
                                {activeFilter === 'semua' && (
                                    <div className="flex items-center gap-3 mb-4 px-1">
                                        <FileText size={16} className="text-[var(--guru-accent-text)]" />
                                        <h3 className="gs-title text-lg">Penugasan</h3>
                                        <span className="gs-badge gs-badge-accent">{assignments.length}</span>
                                    </div>
                                )}
                                <AssignmentPanel assignments={assignments} onAddAssignment={onAddAssignment} onViewSubmissions={onViewSubmissions} onManualGrade={onManualGrade} />
                            </div>
                        )}
                        {(activeFilter === 'semua' || activeFilter === 'kuis') && classId && (
                            <div>
                                {activeFilter === 'semua' && (
                                    <div className="flex items-center gap-3 mb-4 px-1">
                                        <FileQuestion size={16} className="text-[var(--guru-accent-text)]" />
                                        <h3 className="gs-title text-lg">Kuis &amp; Ujian</h3>
                                        <button
                                            onClick={() => setShowSoalGenerator(true)}
                                            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-[var(--guru-accent-soft)] hover:bg-[var(--guru-accent-medium)] border border-[var(--guru-border-accent)] rounded-lg text-[10px] font-black text-[var(--guru-accent-text)] uppercase tracking-widest transition-all"
                                        >
                                            <Sparkles size={11} />
                                            Generate Soal AI
                                        </button>
                                    </div>
                                )}
                                <QuizBuilder classId={classId} />
                            </div>
                        )}
                    </div>
                ) : viewMode === 'board' ? (
                    <div className="animate-in fade-in duration-300">
                        {classId ? (
                            <PipelineView classId={classId} />
                        ) : (
                            <div className="gs-card p-12 text-center">
                                <p className="gs-label">Pilih kelas untuk melihat Board View</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* CALENDAR VIEW — Month grid with deadlines */
                    <div className="animate-in fade-in duration-300 space-y-4">
                        <div className="gs-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <h3 className="gs-title text-lg">{MONTHS_ID[calMonth]} {calYear}</h3>
                                <button
                                    onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {DAYS_ID.map(d => (
                                    <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-600 py-2">{d}</div>
                                ))}
                            </div>

                            {/* Day Cells */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((day, idx) => {
                                    if (day === null) return <div key={`pad-${idx}`} className="h-24 rounded-xl" />;
                                    const dayAssignments = assignmentsByDate[day.toString()] || [];
                                    const isToday = isCurrentMonth && day === today.getDate();
                                    const isPast = new Date(calYear, calMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                                    return (
                                        <div
                                            key={day}
                                            className={`h-24 rounded-xl border p-1.5 transition-all overflow-hidden ${
                                                isToday ? 'border-[var(--guru-accent)] bg-[var(--guru-accent-soft)]'
                                                    : isPast ? 'border-white/5 bg-white/[0.01] opacity-50'
                                                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10'
                                            }`}
                                        >
                                            <span className={`text-[11px] font-bold block mb-1 ${isToday ? 'text-[var(--guru-accent-text)]' : 'text-slate-500'}`}>{day}</span>
                                            <div className="space-y-0.5 overflow-hidden">
                                                {dayAssignments.slice(0, 2).map(a => (
                                                    <button key={a.id} onClick={() => onViewSubmissions(a)} className="w-full text-left px-1.5 py-0.5 rounded bg-[var(--guru-accent-medium)] text-[8px] font-bold text-[var(--guru-accent-text)] truncate hover:bg-[var(--guru-accent-soft)] transition-colors cursor-pointer" title={a.title}>
                                                        {a.title}
                                                    </button>
                                                ))}
                                                {dayAssignments.length > 2 && (
                                                    <span className="text-[8px] text-slate-500 font-bold pl-1">+{dayAssignments.length - 2} lainnya</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 px-2">
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <div className="w-3 h-3 rounded bg-[var(--guru-accent-medium)]" />
                                <span>Deadline Tugas</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <div className="w-3 h-3 rounded border border-[var(--guru-accent)]" />
                                <span>Hari Ini</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Soal Generator AI Modal — USP #2 */}
        <SoalGeneratorModal
            isOpen={showSoalGenerator}
            onClose={() => setShowSoalGenerator(false)}
            kelasName={classId || ''}
        />
    </>
    );
}
