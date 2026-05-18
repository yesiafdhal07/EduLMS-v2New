'use client';

import { useState } from 'react';
import { BookOpen, FileText, Layers, FileQuestion } from 'lucide-react';
import { MaterialPanel } from '@/components/guru/MaterialPanel';
import { AssignmentPanel } from '@/components/guru/AssignmentPanel';
import { QuizBuilder } from '@/components/quiz';
import type { Material, Assignment } from '@/types';

// ========================================================
// PEMBELAJARAN TAB - CONSOLIDATED
// Combines Materials + Assignments + Quizzes
// ========================================================

interface PembelajaranTabProps {
    materials: Material[];
    assignments: Assignment[];
    onAddMaterial: () => void;
    onAddAssignment: () => void;
    onViewSubmissions: (assignment: Assignment) => void;
    onManualGrade: (assignment: Assignment) => void;
    classSelected: boolean;
    classId?: string; // NEW: Required for QuizBuilder
}

type SubTab = 'materi' | 'tugas' | 'kuis';

export function PembelajaranTab({
    materials,
    assignments,
    onAddMaterial,
    onAddAssignment,
    onViewSubmissions,
    onManualGrade,
    classSelected,
    classId,
}: PembelajaranTabProps) {
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('materi');

    if (!classSelected) {
        return (
            <div className="universe-card flex flex-col items-center justify-center min-h-[400px] p-12">
                <div className="w-20 h-20 bg-indigo-500/15 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                    <Layers size={40} className="text-indigo-400" />
                </div>
                <h3 className="font-fraunces text-2xl font-black text-white mb-3">Pilih Kelas Terlebih Dahulu</h3>
                <p className="text-slate-500 text-center max-w-md font-medium">
                    Silakan pilih kelas dari dropdown di header untuk mengelola materi, tugas, dan kuis.
                </p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sub-Tab Navigation — Universe Style */}
            <div className="flex overflow-x-auto gap-4 mb-8 p-1.5 bg-white/[0.03] border border-white/5 rounded-2xl w-fit no-scrollbar">
                <button
                    data-tour="nav-pembelajaran"
                    onClick={() => setActiveSubTab('materi')}
                    className={`flex-shrink-0 flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-fraunces font-black text-sm transition-all whitespace-nowrap ${activeSubTab === 'materi'
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                >
                    <BookOpen size={16} />
                    Bahan Ajar
                    <span className={`ml-1 px-2 py-0.5 rounded-lg text-[10px] ${activeSubTab === 'materi' ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}>
                        {materials.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveSubTab('tugas')}
                    className={`flex-shrink-0 flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-fraunces font-black text-sm transition-all whitespace-nowrap ${activeSubTab === 'tugas'
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                >
                    <FileText size={16} />
                    Penugasan
                    <span className={`ml-1 px-2 py-0.5 rounded-lg text-[10px] ${activeSubTab === 'tugas' ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}>
                        {assignments.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveSubTab('kuis')}
                    className={`flex-shrink-0 flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-fraunces font-black text-sm transition-all whitespace-nowrap ${activeSubTab === 'kuis'
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                >
                    <FileQuestion size={16} />
                    Kuis & Ujian
                </button>
            </div>

            {/* Sub-Tab Content */}
            {activeSubTab === 'materi' && (
                <MaterialPanel materials={materials} onAddMaterial={onAddMaterial} />
            )}
            {activeSubTab === 'tugas' && (
                <AssignmentPanel
                    assignments={assignments}
                    onAddAssignment={onAddAssignment}
                    onViewSubmissions={onViewSubmissions}
                    onManualGrade={onManualGrade}
                />
            )}
            {activeSubTab === 'kuis' && classId && (
                <QuizBuilder classId={classId} />
            )}
        </div>
    );
}
