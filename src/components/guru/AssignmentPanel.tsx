'use client';

import { useState, useRef } from 'react';
import { Plus, FileText, Calendar, History, Users } from 'lucide-react';
import { Assignment } from '@/types';
import { PeerReviewButton, PeerReviewStatusModal } from './PeerReviewButton';
import { useGSAP } from '@gsap/react';
import { gsap, Flip } from '@/lib/gsap';

interface AssignmentPanelProps {
    assignments: Assignment[];
    submissionCounts?: Record<string, number>;  // assignment_id -> submission count
    onAddAssignment: () => void;
    onViewSubmissions: (assignment: Assignment) => void;
    onManualGrade?: (assignment: Assignment) => void;
}

type AssignmentFilter = 'all' | 'pdf' | 'doc' | 'video' | 'link';

export function AssignmentPanel({ assignments, submissionCounts = {}, onAddAssignment, onViewSubmissions, onManualGrade }: AssignmentPanelProps) {
    const [filter, setFilter] = useState<AssignmentFilter>('all');
    const [showStatusModal, setShowStatusModal] = useState<string | null>(null);
    const flipStateRef = useRef<any>(null);

    // Capture state before filter change
    const handleFilterChange = (newFilter: AssignmentFilter) => {
        if (newFilter === filter) return;
        flipStateRef.current = Flip.getState(".assignment-card");
        setFilter(newFilter);
    };

    useGSAP(() => {
        if (!flipStateRef.current) return;

        Flip.from(flipStateRef.current, {
            duration: 0.6,
            ease: "power2.inOut",
            stagger: 0.05,
            absolute: true,
            onComplete: () => {
                flipStateRef.current = null;
            }
        });
    }, [filter]);

    const filteredAssignments = assignments.filter(a => {
        if (filter === 'all') return true;
        const format = a.required_format.toLowerCase();
        if (filter === 'pdf') return format === 'pdf';
        if (filter === 'doc') return format === 'doc' || format === 'docx';
        if (filter === 'video') return format === 'mp4' || format === 'video';
        if (filter === 'link') return format === 'link' || format === 'url';
        return true;
    });

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-8">
            <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6 mb-8 px-1">
                <div>
                    <h3 className="gs-title text-2xl">Daftar Tugas</h3>
                    <p className="gs-body text-xs mt-1">Kelola dan pantau seluruh penugasan kelas</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                    {/* Filter Bar */}
                    <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
                        {(['all', 'pdf', 'doc', 'video', 'link'] as AssignmentFilter[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => handleFilterChange(f)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                    filter === f 
                                    ? 'bg-[var(--guru-accent)] text-white shadow-lg' 
                                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {f === 'all' ? 'Semua' : f}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={onAddAssignment}
                        className="px-6 py-3 bg-[var(--guru-accent)] text-white rounded-xl font-black flex items-center gap-2 shadow-lg shadow-[var(--guru-accent)]/20 hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all uppercase text-[10px] tracking-widest"
                    >
                        <Plus size={16} />
                        Tugas Baru
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssignments.length === 0 ? (
                    <div className="col-span-full py-24 gs-card border-dashed flex flex-col items-center justify-center text-center px-6">
                        <div className="w-20 h-20 bg-white/[0.03] rounded-full flex items-center justify-center mb-6 text-[var(--guru-text-ghost)] border border-white/5">
                            <FileText size={36} />
                        </div>
                        <h4 className="gs-title text-xl mb-3">Belum Ada Tugas</h4>
                        <p className="gs-body text-sm max-w-sm mx-auto leading-relaxed">
                            {filter === 'all' ? 'Belum ada tugas di kelas ini. Buat tugas baru untuk memulai.' : `Tidak ada tugas dengan format ${filter.toUpperCase()}.`}
                        </p>
                    </div>
                ) : filteredAssignments.map(a => (
                    <div 
                        key={a.id} 
                        data-flip-id={a.id}
                        className="assignment-card gs-card p-8 group overflow-hidden relative flex flex-col hover:border-[var(--guru-accent)]/30 transition-all duration-500"
                    >
                        {/* Decorative Gradient */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--guru-accent)]/5 blur-[60px] rounded-full group-hover:bg-[var(--guru-accent)]/10 transition-all duration-700"></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="mb-6 flex justify-between items-start">
                                <div className="w-12 h-12 bg-white/[0.03] rounded-xl flex items-center justify-center text-[var(--guru-accent-text)] border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                    <FileText size={22} />
                                </div>
                                <div className="gs-badge gs-badge-accent">
                                    {a.required_format}
                                </div>
                            </div>

                            <div className="flex-1 mb-6">
                                <h4 className="gs-title text-lg mb-2 group-hover:text-[var(--guru-accent-text)] transition-colors">{a.title}</h4>
                                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">
                                    <Calendar size={12} className="text-rose-500/50" />
                                    <span>Deadline: <span className="text-rose-400">{a.deadline ? new Date(a.deadline).toLocaleDateString('id-ID') : 'Tanpa Batas'}</span></span>
                                </div>
                                <p className="gs-body text-xs leading-relaxed line-clamp-3 group-hover:text-slate-300 transition-colors">{a.description || 'Belum ada deskripsi untuk tugas ini.'}</p>
                            </div>

                            <div className="pt-6 border-t border-white/5 mt-auto space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2 text-[var(--guru-text-ghost)] text-[9px] font-bold uppercase tracking-widest">
                                        <History size={11} />
                                        <span>Dibuat {new Date(a.created_at || new Date().toISOString()).toLocaleDateString('id-ID')}</span>
                                    </div>
                                    {submissionCounts[a.id] !== undefined && (
                                        <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-widest bg-emerald-400/5 px-2 py-1 rounded-lg border border-emerald-400/10">
                                            <Users size={11} />
                                            <span>{submissionCounts[a.id]} Masuk</span>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => onViewSubmissions(a)}
                                        className="py-3 bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        Jawaban
                                    </button>
                                    <button
                                        onClick={() => onManualGrade && onManualGrade(a)}
                                        className="py-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        Nilai
                                    </button>
                                    <div className="col-span-2">
                                        <PeerReviewButton
                                            assignment={a}
                                            submissionCount={submissionCounts[a.id] || 0}
                                            onPeerReviewEnabled={() => setShowStatusModal(a.id)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Peer Review Status Modal */}
            {showStatusModal && (
                <PeerReviewStatusModal
                    assignmentId={showStatusModal}
                    isOpen={!!showStatusModal}
                    onClose={() => setShowStatusModal(null)}
                />
            )}
        </div>
    );
}
