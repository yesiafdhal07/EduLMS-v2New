'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
    
    // Prevent double-submit with ref guard
    const isSubmittingRef = useRef(false);

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

    // Submit quiz - Protected with ref guard against double-submit
    const handleSubmit = async () => {
        if (!attempt) return;
        
        // DOUBLE-SUBMIT PREVENTION: Check ref before state
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        setSubmitting(true);
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const result = await submitAttempt(attempt.id, timeSpent);
        setSubmitting(false);
        isSubmittingRef.current = false;

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
        <div className="min-h-screen bg-transparent font-space-grotesk">
            {/* Top Navigation Bar — Duolingo Style */}
            <header className="fixed top-0 inset-x-0 z-50 bg-slate-900/40 backdrop-blur-md border-b border-white/5">
                <div className="max-w-3xl mx-auto px-6 h-20 flex items-center gap-6">
                    <button
                        onClick={onExit}
                        className="p-2 text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                    
                    {/* Progress Bar Container */}
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Progress Kuis</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {currentIndex + 1} dari {totalQuestions}
                            </span>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                            <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(16,185,129,0.3)] relative"
                                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                            </div>
                        </div>
                    </div>

                    {timeRemaining !== null && (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${timeRemaining < 300 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-white/5 border-white/10 text-white'
                            }`}>
                            <Clock size={16} />
                            <span className="font-mono font-black text-sm">
                                {formatTime(timeRemaining)}
                            </span>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content — Centered & Immersive */}
            <main className="pt-32 pb-40 max-w-2xl mx-auto px-6">
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {/* Question Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 text-emerald-400 font-black">
                                {currentIndex + 1}
                            </div>
                            <div>
                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Pertanyaan</span>
                                <p className="text-white font-bold text-sm leading-none mt-1">Soal Pilihan</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-slate-400 border border-white/10">
                                {currentQuestion.points} POIN
                            </span>
                            <button
                                onClick={() => toggleFlag(currentQuestion.id)}
                                className={`p-2.5 rounded-xl transition-all border ${flagged.has(currentQuestion.id)
                                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                        : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                <Flag size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Question Statement */}
                    <div className="mb-12">
                        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
                            {currentQuestion.content}
                        </h2>
                    </div>

                    {/* Answer Options — Managed by QuestionInput but styled for Duolingo */}
                    <div className="space-y-4">
                        <QuestionInput
                            question={currentQuestion}
                            answer={answers[currentQuestion.id]}
                            onAnswer={(answer) => handleAnswer(currentQuestion.id, answer)}
                            shuffleOptions={quiz.shuffle_options}
                        />
                    </div>
                </div>
            </main>

            {/* Bottom Navigation Dock — Floating style */}
            <footer className="fixed bottom-0 inset-x-0 z-50 p-6 pointer-events-none">
                <div className="max-w-2xl mx-auto flex gap-4 pointer-events-auto">
                    <button
                        onClick={goPrev}
                        disabled={currentIndex === 0}
                        className="h-16 px-8 bg-white/5 backdrop-blur-md text-white font-black rounded-2xl border border-white/10 hover:bg-white/10 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center shrink-0"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    {currentIndex < totalQuestions - 1 ? (
                        <button
                            onClick={goNext}
                            disabled={answers[currentQuestion.id] === undefined}
                            className={`flex-1 h-16 flex items-center justify-center gap-3 rounded-2xl font-black text-lg transition-all shadow-xl
                                ${answers[currentQuestion.id] !== undefined 
                                    ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]' 
                                    : 'bg-slate-800 text-slate-500 border border-white/5 opacity-50'
                                }
                            `}
                        >
                            PERIKSA JAWABAN
                            <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowConfirmSubmit(true)}
                            className="flex-1 h-16 flex items-center justify-center gap-3 bg-cyan-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <CheckCircle size={20} />
                            SELESAIKAN KUIS
                        </button>
                    )}
                </div>
            </footer>

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
            <div className="space-y-4">
                {options.map((option, i) => (
                    <button
                        key={option.id}
                        onClick={() => onAnswer(option.id)}
                        className={`
                            w-full flex items-center gap-5 p-5 rounded-2xl border-2 text-left transition-all duration-200 group relative overflow-hidden
                            ${answer === option.id
                                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10 hover:bg-white/10'
                            }
                        `}
                    >
                        <span className={`
                            w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 border-2 transition-all
                            ${answer === option.id 
                                ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30' 
                                : 'bg-white/5 border-white/10 text-slate-500 group-hover:text-slate-300'
                            }
                        `}>
                            {String.fromCharCode(65 + i)}
                        </span>
                        <span className={`font-bold text-lg ${answer === option.id ? 'text-white' : 'text-slate-300'}`}>
                            {option.text}
                        </span>
                        
                        {answer === option.id && (
                            <div className="ml-auto w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                                <CheckCircle size={14} />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        );
    }

    if (question.type === 'true_false') {
        return (
            <div className="flex gap-6">
                {['true', 'false'].map((value) => (
                    <button
                        key={value}
                        onClick={() => onAnswer(value === 'true')}
                        className={`
                            flex-1 py-10 rounded-[2rem] border-2 font-black text-xl transition-all duration-200 flex flex-col items-center gap-3
                            ${answer === (value === 'true')
                                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                                : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'
                            }
                        `}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${answer === (value === 'true') ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-white/10 border-white/10'}`}>
                            {value === 'true' ? <CheckCircle size={24} /> : <X size={24} />}
                        </div>
                        {value === 'true' ? 'BENAR' : 'SALAH'}
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
                className="w-full bg-white/5 border-2 border-white/5 focus:border-emerald-500/50 rounded-2xl px-6 py-5 text-xl font-bold text-white placeholder:text-slate-600 transition-all outline-none"
                placeholder="Ketik jawaban Anda..."
            />
        );
    }

    if (question.type === 'essay') {
        return (
            <textarea
                value={(answer as string) || ''}
                onChange={(e) => onAnswer(e.target.value)}
                className="w-full bg-white/5 border-2 border-white/5 focus:border-emerald-500/50 rounded-2xl px-6 py-5 text-lg font-bold text-white placeholder:text-slate-600 min-h-[250px] transition-all outline-none resize-none"
                placeholder="Tulis penjelasan lengkap Anda..."
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
