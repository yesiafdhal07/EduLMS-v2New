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
            {/* Sub-Tab Navigation */}
            <div className="flex overflow-x-auto gap-2 mb-8 bg-white/5 backdrop-blur-md p-2 rounded-2xl w-full md:w-fit border border-white/10 no-scrollbar">
                <button
                    onClick={() => setActiveSubTab('tugas')}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap ${activeSubTab === 'tugas'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'text-slate-300 hover:bg-white/10'
                        }`}
                >
                    <Layers size={18} />
                    Tugas
                    {pendingCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-[10px] md:text-xs">
                            {pendingCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveSubTab('materi')}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap ${activeSubTab === 'materi'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'text-slate-300 hover:bg-white/10'
                        }`}
                >
                    <BookOpen size={18} />
                    Materi
                    <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-[10px] md:text-xs">
                        {materials.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveSubTab('kuis')}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap ${activeSubTab === 'kuis'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'text-slate-300 hover:bg-white/10'
                        }`}
                >
                    <FileQuestion size={18} />
                    Kuis
                </button>
                <button
                    onClick={() => setActiveSubTab('terkirim')}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap ${activeSubTab === 'terkirim'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'text-slate-300 hover:bg-white/10'
                        }`}
                >
                    <Send size={18} />
                    Terkirim
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
