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
            <div className="min-h-screen bg-transparent flex items-center justify-center font-space-grotesk">
                <div className="text-center">
                    <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6" />
                    <p className="text-emerald-500 font-black tracking-widest uppercase text-xs">MENGHITUNG_HASIL...</p>
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center font-space-grotesk">
                <div className="text-center universe-card p-12">
                    <p className="text-white font-bold mb-6">HASIL_TIDAK_DITEMUKAN</p>
                    <button onClick={onExit} className="px-8 py-3 bg-white/5 text-white rounded-2xl border border-white/10 font-black text-xs uppercase tracking-widest">
                        KEMBALI
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
        <div className="min-h-screen bg-transparent py-20 font-space-grotesk overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6">
                {/* Header — Achievement Celebration */}
                <div className="relative mb-12 text-center animate-in fade-in zoom-in duration-1000">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full" />
                    
                    <div className={`
                        w-32 h-32 rounded-3xl mx-auto mb-8 flex items-center justify-center relative z-10 rotate-3 transition-transform hover:rotate-0 duration-500
                        ${passed
                            ? 'bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-[0_20px_50px_rgba(16,185,129,0.3)]'
                            : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_20px_50px_rgba(245,158,11,0.3)]'
                        }
                    `}>
                        <Trophy size={64} className="text-white drop-shadow-lg" />
                        <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center animate-bounce">
                            <span className="text-xl">✨</span>
                        </div>
                    </div>

                    <h1 className={`text-6xl font-black mb-2 tracking-tighter ${passed ? 'text-white' : 'text-amber-400'}`}>
                        {percentage.toFixed(0)}<span className="text-2xl opacity-50">%</span>
                    </h1>
                    <p className={`text-xl font-black uppercase tracking-[0.3em] ${passed ? 'text-emerald-400' : 'text-amber-500'}`}>
                        {passed ? 'LEVEL_COMPLETE' : 'MISSION_FAILED'}
                    </p>
                    {result.quiz && (
                        <p className="text-slate-500 mt-4 font-bold text-sm tracking-widest uppercase">
                            MODUL: {result.quiz.title}
                        </p>
                    )}
                </div>

                {/* Primary Reward Card */}
                <div className="universe-card p-1 animate-in slide-in-from-bottom-8 duration-700 delay-300 mb-8">
                    <div className="bg-[#0F0F1A]/80 backdrop-blur-2xl rounded-[calc(var(--universe-radius)-4px)] p-8">
                        {/* XP Section */}
                        <div className="flex flex-col items-center mb-10 pb-10 border-b border-white/5">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">ESTIMATED_REWARD</span>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                                    <span className="text-3xl">💎</span>
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black text-white leading-none">+{Math.round(percentage * 5)} <span className="text-amber-500">XP</span></h2>
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Siswa_Rank: GOLD_III</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center group hover:bg-emerald-500/5 transition-all">
                                <CheckCircle size={24} className="mx-auto mb-4 text-emerald-500" />
                                <p className="text-3xl font-black text-white">{correctCount}</p>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">TERJAWAB_BENAR</p>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center group hover:bg-rose-500/5 transition-all">
                                <XCircle size={24} className="mx-auto mb-4 text-rose-500" />
                                <p className="text-3xl font-black text-white">{totalQuestions - correctCount}</p>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">JAWABAN_SALAH</p>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center group hover:bg-indigo-500/5 transition-all">
                                <Clock size={24} className="mx-auto mb-4 text-indigo-400" />
                                <p className="text-3xl font-black text-white">{formatTime(timeSpent)}</p>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">WAKTU_TEMPUH</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={onExit}
                                className="flex-1 h-16 flex items-center justify-center gap-3 bg-white text-black font-black text-sm rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-xl hover:shadow-emerald-500/20 uppercase tracking-widest"
                            >
                                <Home size={18} />
                                KEMBALI_KE_DASHBOARD
                            </button>
                            {onRetry && result.quiz && (result.quiz.max_attempts > 1) && (
                                <button
                                    onClick={onRetry}
                                    className="px-8 h-16 flex items-center justify-center gap-3 bg-white/5 text-white font-black text-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all uppercase tracking-widest"
                                >
                                    <RefreshCcw size={18} />
                                    ULANGI
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Answer Review Section */}
                {result.quiz?.show_answers_after && result.answers && (
                    <div className="animate-in slide-in-from-bottom-8 duration-700 delay-500">
                        <button
                            onClick={() => setShowAnswers(!showAnswers)}
                            className="w-full universe-card flex items-center justify-between p-6 hover:bg-white/5 transition-all mb-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                    <BarChart3 size={20} />
                                </div>
                                <span className="font-black text-sm text-white uppercase tracking-widest">LIHAT_PEMBAHASAN_DETAIL</span>
                            </div>
                            <div className="w-10 h-10 flex items-center justify-center text-slate-500">
                                {showAnswers ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                            </div>
                        </button>

                        {showAnswers && (
                            <div className="space-y-4 mb-20">
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
