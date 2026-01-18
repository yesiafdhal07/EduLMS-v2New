'use client';

import { useState, useEffect } from 'react';
import {
    FileText, Clock, Play, CheckCircle, Trophy, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Quiz } from '@/types/quiz';

// ========================================================
// QUIZ LIST FOR STUDENTS
// Display available quizzes and attempt status
// ========================================================

interface QuizListProps {
    classId: string;
    userId: string;
    onStartQuiz: (quizId: string) => void;
    onViewResults: (attemptId: string) => void;
}

interface QuizWithAttempts extends Quiz {
    my_attempts: {
        id: string;
        status: string;
        percentage: number | null;
        passed: boolean | null;
        submitted_at: string | null;
    }[];
}

export function QuizList({ classId, userId, onStartQuiz, onViewResults }: QuizListProps) {
    const [quizzes, setQuizzes] = useState<QuizWithAttempts[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuizzes();
    }, [classId, userId]);

    const fetchQuizzes = async () => {
        const { data, error } = await supabase
            .from('quizzes')
            .select(`
                *,
                questions:questions(count),
                my_attempts:quiz_attempts(id, status, percentage, passed, submitted_at)
            `)
            .eq('class_id', classId)
            .eq('published', true)
            .eq('my_attempts.student_id', userId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setQuizzes(data.map(q => ({
                ...q,
                question_count: q.questions?.[0]?.count || 0,
            })));
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (quizzes.length === 0) {
        return (
            <div className="text-center py-16 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10">
                <FileText size={48} className="mx-auto mb-4 text-slate-500" />
                <h3 className="text-xl font-bold text-white mb-2">Belum Ada Kuis</h3>
                <p className="text-slate-400">Kuis akan muncul di sini saat guru membuatnya.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {quizzes.map((quiz) => (
                <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    onStart={() => onStartQuiz(quiz.id)}
                    onViewResults={(attemptId) => onViewResults(attemptId)}
                />
            ))}
        </div>
    );
}

function QuizCard({
    quiz,
    onStart,
    onViewResults,
}: {
    quiz: QuizWithAttempts;
    onStart: () => void;
    onViewResults: (attemptId: string) => void;
}) {
    const attempts = quiz.my_attempts || [];
    const completedAttempts = attempts.filter(a => a.status === 'graded');
    const inProgressAttempt = attempts.find(a => a.status === 'in_progress');
    const bestAttempt = completedAttempts.reduce((best, curr) =>
        (curr.percentage || 0) > (best?.percentage || 0) ? curr : best
        , completedAttempts[0]);

    const canAttempt = attempts.length < quiz.max_attempts || inProgressAttempt;
    const isExpired = quiz.end_date && new Date(quiz.end_date) < new Date();
    const notStarted = quiz.start_date && new Date(quiz.start_date) > new Date();

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bestAttempt?.passed ? 'bg-emerald-500/20' : 'bg-indigo-500/20'
                    }`}>
                    {bestAttempt?.passed ? (
                        <Trophy size={24} className="text-emerald-400" />
                    ) : (
                        <FileText size={24} className="text-indigo-400" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{quiz.title}</h3>
                    {quiz.description && (
                        <p className="text-sm text-slate-400 line-clamp-1 mt-1">{quiz.description}</p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                            <FileText size={14} />
                            {quiz.question_count} soal
                        </span>
                        {quiz.time_limit && (
                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {quiz.time_limit} menit
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <CheckCircle size={14} />
                            {completedAttempts.length}/{quiz.max_attempts} percobaan
                        </span>
                    </div>

                    {bestAttempt && (
                        <div className="mt-3 flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${bestAttempt.passed
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}>
                                {bestAttempt.passed ? 'Lulus' : 'Belum Lulus'}
                            </span>
                            <span className="text-sm text-slate-400">
                                Nilai terbaik: <span className="text-white font-bold">{bestAttempt.percentage?.toFixed(0)}%</span>
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    {isExpired ? (
                        <span className="px-3 py-2 bg-slate-500/20 text-slate-400 text-sm font-bold rounded-xl">
                            Berakhir
                        </span>
                    ) : notStarted ? (
                        <span className="px-3 py-2 bg-amber-500/20 text-amber-400 text-sm font-bold rounded-xl">
                            Belum Mulai
                        </span>
                    ) : canAttempt ? (
                        <button
                            onClick={onStart}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 transition-all"
                        >
                            <Play size={16} />
                            {inProgressAttempt ? 'Lanjutkan' : 'Mulai'}
                        </button>
                    ) : (
                        <span className="px-3 py-2 bg-slate-500/20 text-slate-400 text-sm font-bold rounded-xl">
                            Selesai
                        </span>
                    )}

                    {bestAttempt && (
                        <button
                            onClick={() => onViewResults(bestAttempt.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-slate-400 text-sm hover:text-white transition-all"
                        >
                            Lihat Hasil
                            <ChevronRight size={14} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
