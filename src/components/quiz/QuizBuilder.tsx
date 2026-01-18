'use client';

import { useState, useEffect } from 'react';
import {
    Plus, Trash2, Edit2, Eye, EyeOff, Clock, Users,
    CheckCircle, X, GripVertical, FileText, Settings,
    ChevronDown, ChevronUp, Copy, BarChart3
} from 'lucide-react';
import { useQuiz } from '@/hooks/useQuiz';
import type { Quiz, Question, QuestionType, QuizFormData } from '@/types/quiz';
import { toast } from 'sonner';

// ========================================================
// QUIZ BUILDER COMPONENT
// Teacher interface for creating and managing quizzes
// ========================================================

interface QuizBuilderProps {
    classId: string;
    className?: string;
}

export function QuizBuilder({ classId, className }: QuizBuilderProps) {
    const {
        quizzes,
        loading,
        fetchQuizzes,
        createQuiz,
        deleteQuiz,
        togglePublish,
    } = useQuiz(classId);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'edit'>('list');

    useEffect(() => {
        fetchQuizzes();
    }, [fetchQuizzes]);

    const handleCreateQuiz = async (data: QuizFormData) => {
        const quiz = await createQuiz(data);
        if (quiz) {
            setShowCreateModal(false);
            setSelectedQuiz(quiz);
            setViewMode('edit');
        }
    };

    if (viewMode === 'edit' && selectedQuiz) {
        return (
            <QuizEditor
                quizId={selectedQuiz.id}
                classId={classId}
                onBack={() => {
                    setViewMode('list');
                    setSelectedQuiz(null);
                    fetchQuizzes();
                }}
            />
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                        <FileText size={24} className="text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Quiz Builder</h2>
                        <p className="text-sm text-slate-400">{quizzes.length} kuis tersedia</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/30"
                >
                    <Plus size={20} />
                    Buat Kuis
                </button>
            </div>

            {/* Quiz List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : quizzes.length === 0 ? (
                <div className="text-center py-16 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10">
                    <FileText size={48} className="mx-auto mb-4 text-slate-500" />
                    <h3 className="text-xl font-bold text-white mb-2">Belum Ada Kuis</h3>
                    <p className="text-slate-400 mb-6">Buat kuis pertama untuk kelas ini</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all"
                    >
                        Buat Kuis Pertama
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {quizzes.map((quiz) => (
                        <QuizCard
                            key={quiz.id}
                            quiz={quiz}
                            onEdit={() => {
                                setSelectedQuiz(quiz);
                                setViewMode('edit');
                            }}
                            onDelete={() => deleteQuiz(quiz.id)}
                            onTogglePublish={() => togglePublish(quiz.id, !quiz.published)}
                        />
                    ))}
                </div>
            )}

            {/* Create Quiz Modal */}
            {showCreateModal && (
                <CreateQuizModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateQuiz}
                />
            )}
        </div>
    );
}

// Quiz Card Component
function QuizCard({
    quiz,
    onEdit,
    onDelete,
    onTogglePublish,
}: {
    quiz: Quiz;
    onEdit: () => void;
    onDelete: () => void;
    onTogglePublish: () => void;
}) {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${quiz.published ? 'bg-emerald-500/20' : 'bg-slate-500/20'
                    }`}>
                    <FileText size={24} className={quiz.published ? 'text-emerald-400' : 'text-slate-400'} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-white truncate">{quiz.title}</h3>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${quiz.published
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-slate-500/20 text-slate-400'
                            }`}>
                            {quiz.published ? 'Publik' : 'Draft'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                            <FileText size={14} />
                            {quiz.question_count || 0} soal
                        </span>
                        {quiz.time_limit && (
                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {quiz.time_limit} menit
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Users size={14} />
                            {quiz.attempt_count || 0} percobaan
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onEdit}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        title="Edit"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={onTogglePublish}
                        className={`p-2 rounded-lg transition-all ${quiz.published
                                ? 'text-emerald-400 hover:bg-emerald-500/20'
                                : 'text-slate-400 hover:bg-white/10'
                            }`}
                        title={quiz.published ? 'Sembunyikan' : 'Publikasikan'}
                    >
                        {quiz.published ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                        title="Hapus"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Create Quiz Modal
function CreateQuizModal({
    onClose,
    onSubmit,
}: {
    onClose: () => void;
    onSubmit: (data: QuizFormData) => void;
}) {
    const [formData, setFormData] = useState<QuizFormData>({
        title: '',
        description: '',
        instructions: '',
        time_limit: undefined,
        shuffle_questions: false,
        shuffle_options: false,
        show_answers_after: false,
        show_score_after: true,
        max_attempts: 1,
        passing_score: 60,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return;
        setLoading(true);
        await onSubmit(formData);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-xl bg-slate-900 rounded-[2rem] p-6 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Buat Kuis Baru</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-white/10 rounded-xl">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Judul Kuis *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                            placeholder="Contoh: UTS Matematika Bab 1-3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Deskripsi</label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white min-h-[80px]"
                            placeholder="Deskripsi singkat tentang kuis ini..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Durasi (menit)</label>
                            <input
                                type="number"
                                value={formData.time_limit || ''}
                                onChange={(e) => setFormData({ ...formData, time_limit: e.target.value ? parseInt(e.target.value) : undefined })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                placeholder="Tanpa batas"
                                min={1}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Nilai Lulus (%)</label>
                            <input
                                type="number"
                                value={formData.passing_score}
                                onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) || 60 })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                min={0}
                                max={100}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Maks. Percobaan</label>
                        <input
                            type="number"
                            value={formData.max_attempts}
                            onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) || 1 })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                            min={1}
                        />
                    </div>

                    <div className="space-y-3 pt-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.shuffle_questions}
                                onChange={(e) => setFormData({ ...formData, shuffle_questions: e.target.checked })}
                                className="w-5 h-5 rounded"
                            />
                            <span className="text-sm text-slate-300">Acak urutan soal</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.shuffle_options}
                                onChange={(e) => setFormData({ ...formData, shuffle_options: e.target.checked })}
                                className="w-5 h-5 rounded"
                            />
                            <span className="text-sm text-slate-300">Acak opsi jawaban</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.show_score_after}
                                onChange={(e) => setFormData({ ...formData, show_score_after: e.target.checked })}
                                className="w-5 h-5 rounded"
                            />
                            <span className="text-sm text-slate-300">Tampilkan nilai setelah selesai</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.show_answers_after}
                                onChange={(e) => setFormData({ ...formData, show_answers_after: e.target.checked })}
                                className="w-5 h-5 rounded"
                            />
                            <span className="text-sm text-slate-300">Tampilkan kunci jawaban setelah selesai</span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.title.trim()}
                            className="flex-1 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Membuat...' : 'Buat Kuis'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Quiz Editor (placeholder - will be expanded)
function QuizEditor({
    quizId,
    classId,
    onBack,
}: {
    quizId: string;
    classId: string;
    onBack: () => void;
}) {
    const { fetchQuizWithQuestions, addQuestion, updateQuestion, deleteQuestion } = useQuiz(classId);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddQuestion, setShowAddQuestion] = useState(false);

    useEffect(() => {
        loadQuiz();
    }, [quizId]);

    const loadQuiz = async () => {
        const data = await fetchQuizWithQuestions(quizId);
        setQuiz(data);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
                <div className="h-40 bg-white/5 rounded-xl animate-pulse" />
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="text-center py-16">
                <p className="text-slate-400">Kuis tidak ditemukan</p>
                <button onClick={onBack} className="mt-4 text-indigo-400">Kembali</button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 text-slate-400 hover:bg-white/10 rounded-lg"
                    >
                        <ChevronDown size={20} className="rotate-90" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-white">{quiz.title}</h2>
                        <p className="text-sm text-slate-400">
                            {quiz.questions?.length || 0} soal
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddQuestion(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all"
                >
                    <Plus size={18} />
                    Tambah Soal
                </button>
            </div>

            {/* Questions List */}
            {quiz.questions?.length === 0 ? (
                <div className="text-center py-16 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10">
                    <FileText size={48} className="mx-auto mb-4 text-slate-500" />
                    <h3 className="text-xl font-bold text-white mb-2">Belum Ada Soal</h3>
                    <p className="text-slate-400 mb-6">Tambahkan soal pertama untuk kuis ini</p>
                    <button
                        onClick={() => setShowAddQuestion(true)}
                        className="px-6 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all"
                    >
                        Tambah Soal
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {quiz.questions?.map((question, index) => (
                        <QuestionCard
                            key={question.id}
                            question={question}
                            index={index}
                            onDelete={async () => {
                                await deleteQuestion(question.id);
                                loadQuiz();
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Add Question Modal */}
            {showAddQuestion && (
                <AddQuestionModal
                    quizId={quizId}
                    onClose={() => setShowAddQuestion(false)}
                    onSuccess={() => {
                        setShowAddQuestion(false);
                        loadQuiz();
                    }}
                    addQuestion={addQuestion}
                />
            )}
        </div>
    );
}

// Question Card
function QuestionCard({
    question,
    index,
    onDelete,
}: {
    question: Question;
    index: number;
    onDelete: () => void;
}) {
    const typeLabels: Record<QuestionType, string> = {
        multiple_choice: 'Pilihan Ganda',
        multiple_answer: 'Pilihan Banyak',
        true_false: 'Benar/Salah',
        short_answer: 'Jawaban Singkat',
        essay: 'Essay',
        matching: 'Menjodohkan',
    };

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">
                    {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-slate-500/20 text-slate-400 text-xs font-medium rounded">
                            {typeLabels[question.type]}
                        </span>
                        <span className="text-xs text-slate-500">{question.points} poin</span>
                    </div>
                    <p className="text-white">{question.content}</p>

                    {question.options && (
                        <div className="mt-2 space-y-1">
                            {question.options.map((opt, i) => (
                                <div key={opt.id} className="flex items-center gap-2 text-sm">
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${opt.isCorrect ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'
                                        }`}>
                                        {String.fromCharCode(65 + i)}
                                    </span>
                                    <span className={opt.isCorrect ? 'text-emerald-400' : 'text-slate-300'}>
                                        {opt.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    onClick={onDelete}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

// Add Question Modal
function AddQuestionModal({
    quizId,
    onClose,
    onSuccess,
    addQuestion,
}: {
    quizId: string;
    onClose: () => void;
    onSuccess: () => void;
    addQuestion: (quizId: string, data: any) => Promise<Question | null>;
}) {
    const [type, setType] = useState<QuestionType>('multiple_choice');
    const [content, setContent] = useState('');
    const [points, setPoints] = useState(1);
    const [options, setOptions] = useState([
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false },
        { id: '3', text: '', isCorrect: false },
        { id: '4', text: '', isCorrect: false },
    ]);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);

        let formData: any = {
            type,
            content: content.trim(),
            points,
            required: true,
        };

        if (type === 'multiple_choice') {
            formData.options = options.filter(o => o.text.trim());
            formData.correct_answer = options.find(o => o.isCorrect)?.id;
        } else if (type === 'true_false') {
            formData.correct_answer = correctAnswer === 'true';
        } else if (type === 'short_answer') {
            formData.correct_answer = correctAnswer.split(',').map(s => s.trim());
        } else {
            formData.correct_answer = correctAnswer;
        }

        const result = await addQuestion(quizId, formData);
        setLoading(false);

        if (result) {
            onSuccess();
        }
    };

    const updateOption = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
        const newOptions = [...options];
        if (field === 'isCorrect') {
            // Only one correct answer for multiple choice
            newOptions.forEach((o, i) => o.isCorrect = i === index);
        } else {
            newOptions[index].text = value as string;
        }
        setOptions(newOptions);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-xl bg-slate-900 rounded-[2rem] p-6 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Tambah Soal</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-white/10 rounded-xl">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Tipe Soal</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as QuestionType)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                        >
                            <option value="multiple_choice">Pilihan Ganda</option>
                            <option value="true_false">Benar/Salah</option>
                            <option value="short_answer">Jawaban Singkat</option>
                            <option value="essay">Essay</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Pertanyaan *</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white min-h-[100px]"
                            placeholder="Tulis pertanyaan di sini..."
                            required
                        />
                    </div>

                    {type === 'multiple_choice' && (
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-slate-300">Opsi Jawaban</label>
                            {options.map((option, i) => (
                                <div key={option.id} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="correct"
                                        checked={option.isCorrect}
                                        onChange={() => updateOption(i, 'isCorrect', true)}
                                        className="w-5 h-5"
                                    />
                                    <input
                                        type="text"
                                        value={option.text}
                                        onChange={(e) => updateOption(i, 'text', e.target.value)}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                                        placeholder={`Opsi ${String.fromCharCode(65 + i)}`}
                                    />
                                </div>
                            ))}
                            <p className="text-xs text-slate-500">Pilih radio untuk menandai jawaban benar</p>
                        </div>
                    )}

                    {type === 'true_false' && (
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Jawaban Benar</label>
                            <select
                                value={correctAnswer}
                                onChange={(e) => setCorrectAnswer(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                            >
                                <option value="">Pilih jawaban</option>
                                <option value="true">Benar</option>
                                <option value="false">Salah</option>
                            </select>
                        </div>
                    )}

                    {type === 'short_answer' && (
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Jawaban Benar</label>
                            <input
                                type="text"
                                value={correctAnswer}
                                onChange={(e) => setCorrectAnswer(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                placeholder="Pisahkan dengan koma untuk alternatif jawaban"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Poin</label>
                        <input
                            type="number"
                            value={points}
                            onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                            min={1}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !content.trim()}
                            className="flex-1 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan...' : 'Tambah Soal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
