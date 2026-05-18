'use client';

import { useState } from 'react';
import { BookOpen, Layers, Send, FileQuestion } from 'lucide-react';
import { StudentMaterialsPanel } from '@/components/siswa/StudentMaterialsPanel';
import { StudentAssignmentsPanel } from '@/components/siswa/StudentAssignmentsPanel';
import { SubmittedAssignments } from '@/components/siswa/SubmittedAssignments';
import { QuizList, QuizPlayer, QuizResults } from '@/components/quiz';
import type { Material, StudentAssignment } from '@/types';

// ========================================================
// PEMBELAJARAN TAB (SISWA) - CONSOLIDATED
// Combines Materials + Assignments + Submitted
// ========================================================

interface PembelajaranSiswaTabProps {
    materials: Material[];
    assignments: StudentAssignment[];
    onUpload: (assignmentId: string, event: React.ChangeEvent<HTMLInputElement>, format: string) => void;
    uploading: string | null;
    studentId: string;
    studentClassId: string | null;
    quizViewMode: 'list' | 'play' | 'result';
    setQuizViewMode: (mode: 'list' | 'play' | 'result') => void;
    selectedQuizId: string | null;
    setSelectedQuizId: (id: string | null) => void;
    selectedAttemptId: string | null;
    setSelectedAttemptId: (id: string | null) => void;
}

type SubTab = 'tugas' | 'materi' | 'kuis' | 'terkirim';

export function PembelajaranSiswaTab({
    materials,
    assignments,
    onUpload,
    uploading,
    studentId,
    studentClassId,
    quizViewMode,
    setQuizViewMode,
    selectedQuizId,
    setSelectedQuizId,
    selectedAttemptId,
    setSelectedAttemptId,
}: PembelajaranSiswaTabProps) {
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('tugas');

    // Count pending assignments
    const pendingCount = assignments.filter(a => new Date(a.deadline) > new Date()).length;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sub-Tab Navigation (Underline Style - Linear Inspired) */}
            <div className="flex items-center gap-8 border-b border-white/10 mb-8 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveSubTab('tugas')}
                    className={`pb-4 flex items-center gap-2 font-bold text-sm transition-all relative whitespace-nowrap ${activeSubTab === 'tugas' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-300'}`}
                >
                    <Layers size={16} />
                    Tugas
                    {pendingCount > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md text-[10px] font-black">
                            {pendingCount}
                        </span>
                    )}
                    {activeSubTab === 'tugas' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full shadow-[0_-2px_8px_rgba(16,185,129,0.5)]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveSubTab('materi')}
                    className={`pb-4 flex items-center gap-2 font-bold text-sm transition-all relative whitespace-nowrap ${activeSubTab === 'materi' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-300'}`}
                >
                    <BookOpen size={16} />
                    Materi
                    <span className="ml-1 px-1.5 py-0.5 bg-white/10 text-slate-300 rounded-md text-[10px] font-black">
                        {materials.length}
                    </span>
                    {activeSubTab === 'materi' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full shadow-[0_-2px_8px_rgba(16,185,129,0.5)]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveSubTab('kuis')}
                    className={`pb-4 flex items-center gap-2 font-bold text-sm transition-all relative whitespace-nowrap ${activeSubTab === 'kuis' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-300'}`}
                >
                    <FileQuestion size={16} />
                    Kuis
                    {activeSubTab === 'kuis' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full shadow-[0_-2px_8px_rgba(16,185,129,0.5)]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveSubTab('terkirim')}
                    className={`pb-4 flex items-center gap-2 font-bold text-sm transition-all relative whitespace-nowrap ${activeSubTab === 'terkirim' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-300'}`}
                >
                    <Send size={16} />
                    Terkirim
                    {activeSubTab === 'terkirim' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full shadow-[0_-2px_8px_rgba(16,185,129,0.5)]" />
                    )}
                </button>
            </div>

            {/* Sub-Tab Content */}
            {activeSubTab === 'tugas' && (
                <StudentAssignmentsPanel
                    assignments={assignments}
                    onUpload={onUpload}
                    uploading={uploading}
                />
            )}
            {activeSubTab === 'materi' && (
                <StudentMaterialsPanel materials={materials} />
            )}
            {activeSubTab === 'kuis' && (
                <div className="space-y-6">
                    {quizViewMode === 'list' && (
                        <QuizList
                            classId={studentClassId || ''}
                            userId={studentId}
                            onStartQuiz={(quizId) => {
                                setSelectedQuizId(quizId);
                                setQuizViewMode('play');
                            }}
                            onViewResults={(attemptId) => {
                                setSelectedAttemptId(attemptId);
                                setQuizViewMode('result');
                            }}
                        />
                    )}
                    {quizViewMode === 'play' && selectedQuizId && (
                        <QuizPlayer
                            quizId={selectedQuizId}
                            classId={studentClassId || ''}
                            onComplete={(attemptId) => {
                                setSelectedAttemptId(attemptId);
                                setQuizViewMode('result');
                            }}
                            onExit={() => setQuizViewMode('list')}
                        />
                    )}
                    {quizViewMode === 'result' && selectedAttemptId && (
                        <QuizResults
                            attemptId={selectedAttemptId}
                            classId={studentClassId || ''}
                            onExit={() => setQuizViewMode('list')}
                        />
                    )}
                </div>
            )}
            {activeSubTab === 'terkirim' && (
                <SubmittedAssignments studentId={studentId} />
            )}
        </div>
    );
}
