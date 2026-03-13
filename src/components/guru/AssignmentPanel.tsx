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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6 mb-10">
                <div>
                    <h3 className="text-2xl font-black text-white tracking-tight leading-none">Daftar Penugasan</h3>
                    <p className="text-slate-400 text-sm font-medium mt-2">Kelola tugas kelas atau tugas individu untuk siswa.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                    {/* Filter Bar */}
                    <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                        {(['all', 'pdf', 'doc', 'video', 'link'] as AssignmentFilter[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => handleFilterChange(f)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                    filter === f 
                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {f === 'all' ? 'Semua' : f}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={onAddAssignment}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black flex items-center gap-2 shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-1 transition-all uppercase text-[10px] tracking-widest border border-white/10"
                    >
                        <Plus size={16} />
                        Tambah Tugas
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredAssignments.length === 0 ? (
                    <div className="col-span-full p-20 bg-white/5 rounded-[3rem] border-4 border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 text-slate-500">
                            <FileText size={48} />
                        </div>
                        <h4 className="font-black text-white text-lg mb-2">Tugas Tidak Ditemukan</h4>
                        <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                            {filter === 'all' ? 'Klik tombol "Tambah Tugas" untuk mulai memberikan penugasan.' : `Tidak ada tugas dengan format ${filter.toUpperCase()}.`}
                        </p>
                    </div>
                ) : filteredAssignments.map(a => (
                    <div 
                        key={a.id} 
                        data-flip-id={a.id}
                        className="assignment-card bg-white/5 backdrop-blur-md p-10 rounded-[3.5rem] border border-white/10 shadow-xl shadow-black/20 hover:shadow-2xl hover:-translate-y-2 transition-all group overflow-hidden relative flex flex-col hover:bg-white/10"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-bl-[4rem] group-hover:scale-150 transition-transform opacity-30"></div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center text-indigo-400 shadow-inner group-hover:rotate-12 transition-transform border border-white/5">
                                        <FileText size={28} />
                                    </div>
                                    <span className="px-4 py-1.5 bg-slate-900 text-white border border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                                        {a.required_format}
                                    </span>
                                </div>
                                <h4 className="font-black text-white text-xl mb-2 tracking-tight line-clamp-2 uppercase group-hover:text-indigo-300 transition-colors">{a.title}</h4>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-6">
                                    <Calendar size={14} className="text-indigo-400" /> Deadline: {a.deadline ? new Date(a.deadline).toLocaleDateString('id-ID') : '-'}
                                </p>
                                <p className="text-slate-400 text-sm font-medium line-clamp-3 leading-relaxed mb-6">{a.description || 'Tidak ada deskripsi.'}</p>
                            </div>
                            <div className="pt-6 border-t border-white/10 mt-auto flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                        <History size={14} />
                                        <span>Dibuat {new Date(a.created_at || new Date().toISOString()).toLocaleDateString('id-ID')}</span>
                                    </div>
                                    {submissionCounts[a.id] !== undefined && (
                                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                                            <Users size={14} />
                                            <span>{submissionCounts[a.id]} submit</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-3 flex-wrap">
                                    <button
                                        onClick={() => onViewSubmissions(a)}
                                        className="flex-1 py-3 bg-slate-50 hover:bg-white text-slate-600 hover:text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors border border-slate-200 hover:border-indigo-200"
                                    >
                                        Submisi
                                    </button>
                                    <button
                                        onClick={() => onManualGrade && onManualGrade(a)}
                                        className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors border border-emerald-200"
                                    >
                                        Nilai
                                    </button>
                                    <PeerReviewButton
                                        assignment={a}
                                        submissionCount={submissionCounts[a.id] || 0}
                                        onPeerReviewEnabled={() => setShowStatusModal(a.id)}
                                    />
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
