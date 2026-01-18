'use client';

import { useState, useEffect } from 'react';
import {
    Trophy, CheckCircle, XCircle, Clock, BarChart3,
    RefreshCcw, Home, ChevronDown, ChevronUp
} from 'lucide-react';
import { useQuiz } from '@/hooks/useQuiz';
import type { QuizAttempt, Question } from '@/types/quiz';

// ========================================================
// QUIZ RESULTS COMPONENT
// Display score, feedback, and answer review
// ========================================================

interface QuizResultsProps {
    attemptId: string;
    classId: string;
    onRetry?: () => void;
    onExit: () => void;
}

export function QuizResults({ attemptId, classId, onRetry, onExit }: QuizResultsProps) {
    const { getResults } = useQuiz(classId);
    const [result, setResult] = useState<QuizAttempt | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAnswers, setShowAnswers] = useState(false);

    useEffect(() => {
        loadResults();
    }, [attemptId]);

    const loadResults = async () => {
        const data = await getResults(attemptId);
        setResult(data);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white">Memuat hasil...</p>
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white mb-4">Hasil tidak ditemukan</p>
                    <button onClick={onExit} className="px-6 py-2 bg-white/10 text-white rounded-xl">
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    const percentage = result.percentage || 0;
    const passed = result.passed || false;
    const timeSpent = result.time_spent || 0;
    const correctCount = result.answers?.filter(a => a.is_correct).length || 0;
    const totalQuestions = result.answers?.length || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-12">
            <div className="max-w-2xl mx-auto px-4">
                {/* Result Card */}
                <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-8 border border-white/10 mb-6">
                    {/* Trophy/Grade Icon */}
                    <div className="text-center mb-8">
                        <div className={`
                            w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center
                            ${passed
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                                : 'bg-gradient-to-br from-amber-500 to-orange-500'
                            }
                            shadow-2xl
                        `}>
                            <Trophy size={48} className="text-white" />
                        </div>

                        <h1 className={`text-4xl font-black mb-2 ${passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {percentage.toFixed(0)}%
                        </h1>
                        <p className={`text-lg font-bold ${passed ? 'text-emerald-300' : 'text-amber-300'}`}>
                            {passed ? 'Selamat, Anda Lulus!' : 'Belum Lulus'}
                        </p>
                        {result.quiz && (
                            <p className="text-slate-400 mt-2">{result.quiz.title}</p>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                            <CheckCircle size={24} className="mx-auto mb-2 text-emerald-400" />
                            <p className="text-2xl font-black text-white">{correctCount}</p>
                            <p className="text-xs text-slate-400">Benar</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                            <XCircle size={24} className="mx-auto mb-2 text-red-400" />
                            <p className="text-2xl font-black text-white">{totalQuestions - correctCount}</p>
                            <p className="text-xs text-slate-400">Salah</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                            <Clock size={24} className="mx-auto mb-2 text-indigo-400" />
                            <p className="text-2xl font-black text-white">{formatTime(timeSpent)}</p>
                            <p className="text-xs text-slate-400">Waktu</p>
                        </div>
                    </div>

                    {/* Score Details */}
                    <div className="bg-white/5 rounded-xl p-4 mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-400">Nilai</span>
                            <span className="text-white font-bold">
                                {result.score?.toFixed(0) || 0} / {result.max_score || 0}
                            </span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${passed ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                                    }`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-right">
                            Nilai minimum: {result.quiz?.passing_score || 60}%
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {onRetry && result.quiz && (result.quiz.max_attempts > 1) && (
                            <button
                                onClick={onRetry}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
                            >
                                <RefreshCcw size={18} />
                                Coba Lagi
                            </button>
                        )}
                        <button
                            onClick={onExit}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all"
                        >
                            <Home size={18} />
                            Kembali
                        </button>
                    </div>
                </div>

                {/* Answer Review */}
                {result.quiz?.show_answers_after && result.answers && (
                    <div className="bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 overflow-hidden">
                        <button
                            onClick={() => setShowAnswers(!showAnswers)}
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <BarChart3 size={20} className="text-indigo-400" />
                                <span className="font-bold text-white">Lihat Pembahasan</span>
                            </div>
                            {showAnswers ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                        </button>

                        {showAnswers && (
                            <div className="p-6 pt-0 space-y-4">
                                {result.answers.map((answer, index) => (
                                    <AnswerReview
                                        key={answer.id}
                                        answer={answer}
                                        index={index}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Answer Review Component
function AnswerReview({
    answer,
    index
}: {
    answer: {
        id: string;
        answer: unknown;
        is_correct?: boolean;
        points_earned: number;
        feedback?: string;
        question?: Question;
    };
    index: number;
}) {
    const question = answer.question;
    if (!question) return null;

    return (
        <div className={`p-4 rounded-xl border ${answer.is_correct
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-red-500/10 border-red-500/30'
            }`}>
            <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${answer.is_correct ? 'bg-emerald-500' : 'bg-red-500'
                    }`}>
                    {answer.is_correct ? <CheckCircle size={16} className="text-white" /> : <XCircle size={16} className="text-white" />}
                </div>

                <div className="flex-1">
                    <p className="text-sm text-slate-400 mb-1">Soal {index + 1}</p>
                    <p className="text-white mb-3">{question.content}</p>

                    {question.type === 'multiple_choice' && question.options && (
                        <div className="space-y-2 mb-3">
                            {question.options.map((opt, i) => {
                                const isSelected = answer.answer === opt.id;
                                const isCorrect = opt.isCorrect;

                                return (
                                    <div
                                        key={opt.id}
                                        className={`flex items-center gap-2 p-2 rounded-lg text-sm ${isCorrect
                                            ? 'bg-emerald-500/20 text-emerald-300'
                                            : isSelected
                                                ? 'bg-red-500/20 text-red-300'
                                                : 'text-slate-400'
                                            }`}
                                    >
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isCorrect
                                            ? 'bg-emerald-500 text-white'
                                            : isSelected
                                                ? 'bg-red-500 text-white'
                                                : 'bg-white/10'
                                            }`}>
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                        <span>{opt.text}</span>
                                        {isSelected && !isCorrect && (
                                            <span className="ml-auto text-xs text-red-400">(Jawaban Anda)</span>
                                        )}
                                        {isCorrect && (
                                            <span className="ml-auto text-xs text-emerald-400">✓ Benar</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {question.type !== 'multiple_choice' && (
                        <div className="text-sm space-y-1 mb-3">
                            <p className="text-slate-400">Jawaban Anda: <span className="text-white">{String(answer.answer)}</span></p>
                            {question.correct_answer !== undefined && (
                                <p className="text-emerald-400">Kunci: {JSON.stringify(question.correct_answer)}</p>
                            )}
                        </div>
                    )}

                    {question.explanation && (
                        <div className="bg-white/5 rounded-lg p-3 text-sm text-slate-300">
                            <p className="text-xs text-slate-500 mb-1">Pembahasan:</p>
                            {question.explanation}
                        </div>
                    )}

                    {answer.feedback && (
                        <div className="bg-indigo-500/10 rounded-lg p-3 text-sm text-indigo-300 mt-2">
                            <p className="text-xs text-indigo-400 mb-1">Feedback Guru:</p>
                            {answer.feedback}
                        </div>
                    )}
                </div>

                <div className="text-right shrink-0">
                    <span className={`font-bold ${answer.is_correct ? 'text-emerald-400' : 'text-red-400'}`}>
                        +{answer.points_earned}
                    </span>
                    <span className="text-slate-500 text-sm">/{question.points}</span>
                </div>
            </div>
        </div>
    );
}

function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${String(secs).padStart(2, '0')}`;
}
