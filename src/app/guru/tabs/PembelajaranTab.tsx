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
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-12">
                <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
                    <Layers size={40} className="text-indigo-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Pilih Kelas Terlebih Dahulu</h3>
                <p className="text-slate-400 text-center max-w-md">
                    Silakan pilih kelas dari dropdown di header untuk mengelola materi, tugas, dan kuis.
                </p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sub-Tab Navigation */}
            <div className="flex overflow-x-auto gap-2 mb-8 bg-white/5 backdrop-blur-md p-2 rounded-2xl w-full md:w-fit border border-white/10 no-scrollbar">
                <button
                    data-tour="nav-pembelajaran"
                    onClick={() => setActiveSubTab('materi')}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap ${activeSubTab === 'materi'
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'text-slate-300 hover:bg-white/10'
                        }`}
                >
                    <BookOpen size={18} />
                    Bahan Ajar
                    <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-[10px] md:text-xs">
                        {materials.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveSubTab('tugas')}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap ${activeSubTab === 'tugas'
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'text-slate-300 hover:bg-white/10'
                        }`}
                >
                    <FileText size={18} />
                    Penugasan
                    <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-[10px] md:text-xs">
                        {assignments.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveSubTab('kuis')}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap ${activeSubTab === 'kuis'
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'text-slate-300 hover:bg-white/10'
                        }`}
                >
                    <FileQuestion size={18} />
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
