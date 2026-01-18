'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Clock, ChevronLeft, ChevronRight, CheckCircle,
    AlertTriangle, Flag, X, RotateCcw
} from 'lucide-react';
import { useQuiz } from '@/hooks/useQuiz';
import type { Quiz, Question, QuizAttempt } from '@/types/quiz';

// ========================================================
// QUIZ PLAYER COMPONENT
// Student interface for taking quizzes
// ========================================================

interface QuizPlayerProps {
    quizId: string;
    classId: string;
    onComplete: (attemptId: string) => void;
    onExit: () => void;
}

export function QuizPlayer({ quizId, classId, onComplete, onExit }: QuizPlayerProps) {
    const { fetchQuizWithQuestions, startAttempt, saveAnswer, submitAttempt } = useQuiz(classId);

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, unknown>>({});
    const [flagged, setFlagged] = useState<Set<string>>(new Set());
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

    // Load quiz and start attempt
    useEffect(() => {
        loadQuiz();
    }, [quizId]);

    const loadQuiz = async () => {
        const quizData = await fetchQuizWithQuestions(quizId);
        if (quizData) {
            setQuiz(quizData);

            // Shuffle questions if enabled
            if (quizData.shuffle_questions && quizData.questions) {
                quizData.questions = shuffleArray([...quizData.questions]);
            }

            // Start or resume attempt
            const attemptData = await startAttempt(quizId);
            if (attemptData) {
                setAttempt(attemptData);
                setStartTime(new Date(attemptData.started_at).getTime());

                // Set time limit
                if (quizData.time_limit) {
                    const elapsed = (Date.now() - new Date(attemptData.started_at).getTime()) / 1000;
                    const remaining = quizData.time_limit * 60 - elapsed;
                    setTimeRemaining(Math.max(0, Math.floor(remaining)));
                }
            }
        }
        setLoading(false);
    };

    // Timer countdown
    useEffect(() => {
        if (timeRemaining === null || timeRemaining <= 0) return;

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev === null || prev <= 1) {
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeRemaining]);

    const handleAutoSubmit = async () => {
        if (attempt) {
            await handleSubmit();
        }
    };

    // Save answer
    const handleAnswer = async (questionId: string, answer: unknown) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answer }));

        if (attempt) {
            await saveAnswer(attempt.id, questionId, answer);
        }
    };

    // Toggle flag
    const toggleFlag = (questionId: string) => {
        setFlagged((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    // Submit quiz
    const handleSubmit = async () => {
        if (!attempt) return;

        setSubmitting(true);
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const result = await submitAttempt(attempt.id, timeSpent);
        setSubmitting(false);

        if (result) {
            onComplete(result.id);
        }
    };

    // Navigation
    const goTo = (index: number) => {
        if (quiz?.questions && index >= 0 && index < quiz.questions.length) {
            setCurrentIndex(index);
        }
    };

    const goNext = () => goTo(currentIndex + 1);
    const goPrev = () => goTo(currentIndex - 1);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white">Memuat kuis...</p>
                </div>
            </div>
        );
    }

    if (!quiz || !quiz.questions || !attempt) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle size={48} className="text-amber-400 mx-auto mb-4" />
                    <p className="text-white mb-4">Kuis tidak dapat dimuat</p>
                    <button onClick={onExit} className="px-6 py-2 bg-white/10 text-white rounded-xl">
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentIndex];
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = quiz.questions.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onExit}
                                className="p-2 text-slate-400 hover:bg-white/10 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                            <div>
                                <h1 className="font-bold text-white truncate">{quiz.title}</h1>
                                <p className="text-xs text-slate-400">
                                    {answeredCount}/{totalQuestions} dijawab
                                </p>
                            </div>
                        </div>

                        {timeRemaining !== null && (
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${timeRemaining < 300 ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'
                                }`}>
                                <Clock size={18} />
                                <span className="font-mono font-bold">
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid grid-cols-12 gap-6">
                    {/* Question Navigation */}
                    <div className="col-span-12 lg:col-span-3">
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 sticky top-24">
                            <p className="text-sm text-slate-400 mb-3">Navigasi Soal</p>
                            <div className="grid grid-cols-5 gap-2">
                                {quiz.questions.map((q, i) => (
                                    <button
                                        key={q.id}
                                        onClick={() => goTo(i)}
                                        className={`
                                            w-10 h-10 rounded-lg font-bold text-sm transition-all relative
                                            ${i === currentIndex
                                                ? 'bg-indigo-500 text-white'
                                                : answers[q.id] !== undefined
                                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                            }
                                        `}
                                    >
                                        {i + 1}
                                        {flagged.has(q.id) && (
                                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/10">
                                <button
                                    onClick={() => setShowConfirmSubmit(true)}
                                    disabled={submitting}
                                    className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50"
                                >
                                    {submitting ? 'Mengirim...' : 'Selesai & Kirim'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className="col-span-12 lg:col-span-9">
                        <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-8 border border-white/10">
                            {/* Question Header */}
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-slate-400">
                                    Soal {currentIndex + 1} dari {totalQuestions}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-400">{currentQuestion.points} poin</span>
                                    <button
                                        onClick={() => toggleFlag(currentQuestion.id)}
                                        className={`p-2 rounded-lg transition-all ${flagged.has(currentQuestion.id)
                                                ? 'bg-amber-500/20 text-amber-400'
                                                : 'text-slate-400 hover:bg-white/10'
                                            }`}
                                        title="Tandai untuk review"
                                    >
                                        <Flag size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Question Content */}
                            <div className="mb-8">
                                <h2 className="text-xl text-white leading-relaxed">
                                    {currentQuestion.content}
                                </h2>
                            </div>

                            {/* Answer Options */}
                            <QuestionInput
                                question={currentQuestion}
                                answer={answers[currentQuestion.id]}
                                onAnswer={(answer) => handleAnswer(currentQuestion.id, answer)}
                                shuffleOptions={quiz.shuffle_options}
                            />

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                                <button
                                    onClick={goPrev}
                                    disabled={currentIndex === 0}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={18} />
                                    Sebelumnya
                                </button>

                                {currentIndex < totalQuestions - 1 ? (
                                    <button
                                        onClick={goNext}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all"
                                    >
                                        Selanjutnya
                                        <ChevronRight size={18} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowConfirmSubmit(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all"
                                    >
                                        <CheckCircle size={18} />
                                        Selesai
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Confirm Submit Modal */}
            {showConfirmSubmit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-slate-900 rounded-[2rem] p-6 border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-4">Kirim Jawaban?</h3>

                        <div className="bg-white/5 rounded-xl p-4 mb-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-400">Dijawab</span>
                                <span className="text-white font-bold">{answeredCount}/{totalQuestions}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Ditandai</span>
                                <span className="text-amber-400 font-bold">{flagged.size}</span>
                            </div>
                        </div>

                        {answeredCount < totalQuestions && (
                            <div className="flex items-start gap-3 p-3 bg-amber-500/20 rounded-xl mb-6">
                                <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-200">
                                    Anda belum menjawab semua soal. Yakin ingin mengirim?
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmSubmit(false)}
                                className="flex-1 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
                            >
                                Kembali
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50"
                            >
                                {submitting ? 'Mengirim...' : 'Kirim'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Question Input Component
function QuestionInput({
    question,
    answer,
    onAnswer,
    shuffleOptions,
}: {
    question: Question;
    answer: unknown;
    onAnswer: (answer: unknown) => void;
    shuffleOptions?: boolean;
}) {
    const [options, setOptions] = useState(question.options || []);

    useEffect(() => {
        if (shuffleOptions && question.options) {
            setOptions(shuffleArray([...question.options]));
        } else {
            setOptions(question.options || []);
        }
    }, [question.id, shuffleOptions]);

    if (question.type === 'multiple_choice') {
        return (
            <div className="space-y-3">
                {options.map((option, i) => (
                    <button
                        key={option.id}
                        onClick={() => onAnswer(option.id)}
                        className={`
                            w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all
                            ${answer === option.id
                                ? 'bg-indigo-500/20 border-indigo-500/50 text-white'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                            }
                        `}
                    >
                        <span className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0
                            ${answer === option.id ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400'}
                        `}>
                            {String.fromCharCode(65 + i)}
                        </span>
                        <span>{option.text}</span>
                    </button>
                ))}
            </div>
        );
    }

    if (question.type === 'true_false') {
        return (
            <div className="flex gap-4">
                {['true', 'false'].map((value) => (
                    <button
                        key={value}
                        onClick={() => onAnswer(value === 'true')}
                        className={`
                            flex-1 py-4 rounded-xl border font-bold transition-all
                            ${answer === (value === 'true')
                                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                            }
                        `}
                    >
                        {value === 'true' ? 'Benar' : 'Salah'}
                    </button>
                ))}
            </div>
        );
    }

    if (question.type === 'short_answer') {
        return (
            <input
                type="text"
                value={(answer as string) || ''}
                onChange={(e) => onAnswer(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500"
                placeholder="Ketik jawaban Anda..."
            />
        );
    }

    if (question.type === 'essay') {
        return (
            <textarea
                value={(answer as string) || ''}
                onChange={(e) => onAnswer(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 min-h-[200px]"
                placeholder="Tulis jawaban Anda..."
            />
        );
    }

    return null;
}

// Utility functions
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
