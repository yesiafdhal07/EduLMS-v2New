'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Quiz, Question, QuizAttempt, QuizAnswer, QuizFormData, QuestionFormData } from '@/types/quiz';

// ========================================================
// useQuiz Hook
// Complete quiz management for teachers and students
// ========================================================

export function useQuiz(classId?: string) {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all quizzes for a class (teacher view)
    const fetchQuizzes = useCallback(async () => {
        if (!classId) return;
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
            .from('quizzes')
            .select(`
                *,
                questions:questions(count),
                attempts:quiz_attempts(count)
            `)
            .eq('class_id', classId)
            .order('created_at', { ascending: false });

        if (fetchError) {
            setError(fetchError.message);
            toast.error('Gagal memuat kuis');
        } else {
            setQuizzes(data?.map(q => ({
                ...q,
                question_count: q.questions?.[0]?.count || 0,
                attempt_count: q.attempts?.[0]?.count || 0,
            })) || []);
        }
        setLoading(false);
    }, [classId]);

    // Create a new quiz
    const createQuiz = async (formData: QuizFormData): Promise<Quiz | null> => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user || !classId) return null;

        const { data, error: createError } = await supabase
            .from('quizzes')
            .insert({
                ...formData,
                class_id: classId,
                teacher_id: userData.user.id,
            })
            .select()
            .single();

        if (createError) {
            toast.error('Gagal membuat kuis');
            return null;
        }

        toast.success('Kuis berhasil dibuat');
        await fetchQuizzes();
        return data;
    };

    // Update a quiz
    const updateQuiz = async (quizId: string, formData: Partial<QuizFormData>): Promise<boolean> => {
        const { error: updateError } = await supabase
            .from('quizzes')
            .update({ ...formData, updated_at: new Date().toISOString() })
            .eq('id', quizId);

        if (updateError) {
            toast.error('Gagal memperbarui kuis');
            return false;
        }

        toast.success('Kuis berhasil diperbarui');
        await fetchQuizzes();
        return true;
    };

    // Delete a quiz
    const deleteQuiz = async (quizId: string): Promise<boolean> => {
        const { error: deleteError } = await supabase
            .from('quizzes')
            .delete()
            .eq('id', quizId);

        if (deleteError) {
            toast.error('Gagal menghapus kuis');
            return false;
        }

        toast.success('Kuis berhasil dihapus');
        await fetchQuizzes();
        return true;
    };

    // Publish/unpublish a quiz
    const togglePublish = async (quizId: string, published: boolean): Promise<boolean> => {
        const { error: updateError } = await supabase
            .from('quizzes')
            .update({ published, updated_at: new Date().toISOString() })
            .eq('id', quizId);

        if (updateError) {
            toast.error('Gagal mengubah status kuis');
            return false;
        }

        toast.success(published ? 'Kuis dipublikasikan' : 'Kuis disembunyikan');
        await fetchQuizzes();
        return true;
    };

    // Add a question to quiz
    const addQuestion = async (quizId: string, formData: QuestionFormData): Promise<Question | null> => {
        // Get current max order_index
        const { data: existing } = await supabase
            .from('questions')
            .select('order_index')
            .eq('quiz_id', quizId)
            .order('order_index', { ascending: false })
            .limit(1);

        const nextOrder = (existing?.[0]?.order_index || 0) + 1;

        const { data, error: createError } = await supabase
            .from('questions')
            .insert({
                ...formData,
                quiz_id: quizId,
                order_index: nextOrder,
            })
            .select()
            .single();

        if (createError) {
            toast.error('Gagal menambah soal');
            return null;
        }

        toast.success('Soal berhasil ditambahkan');
        return data;
    };

    // Update a question
    const updateQuestion = async (questionId: string, formData: Partial<QuestionFormData>): Promise<boolean> => {
        const { error: updateError } = await supabase
            .from('questions')
            .update(formData)
            .eq('id', questionId);

        if (updateError) {
            toast.error('Gagal memperbarui soal');
            return false;
        }

        toast.success('Soal berhasil diperbarui');
        return true;
    };

    // Delete a question
    const deleteQuestion = async (questionId: string): Promise<boolean> => {
        const { error: deleteError } = await supabase
            .from('questions')
            .delete()
            .eq('id', questionId);

        if (deleteError) {
            toast.error('Gagal menghapus soal');
            return false;
        }

        toast.success('Soal berhasil dihapus');
        return true;
    };

    // Fetch quiz with questions (for playing/editing)
    const fetchQuizWithQuestions = async (quizId: string): Promise<Quiz | null> => {
        const { data, error: fetchError } = await supabase
            .from('quizzes')
            .select(`
                *,
                questions:questions(*)
            `)
            .eq('id', quizId)
            .single();

        if (fetchError) {
            toast.error('Gagal memuat kuis');
            return null;
        }

        // Sort questions by order_index
        if (data?.questions) {
            data.questions.sort((a: Question, b: Question) => a.order_index - b.order_index);
        }

        return data;
    };

    // Start a quiz attempt (student)
    const startAttempt = async (quizId: string): Promise<QuizAttempt | null> => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return null;

        // Check existing attempts
        const { data: existing } = await supabase
            .from('quiz_attempts')
            .select('*')
            .eq('quiz_id', quizId)
            .eq('student_id', userData.user.id)
            .eq('status', 'in_progress')
            .single();

        // Resume existing attempt
        if (existing) {
            return existing;
        }

        // Check max attempts
        const { data: quiz } = await supabase
            .from('quizzes')
            .select('max_attempts')
            .eq('id', quizId)
            .single();

        const { count: attemptCount } = await supabase
            .from('quiz_attempts')
            .select('*', { count: 'exact', head: true })
            .eq('quiz_id', quizId)
            .eq('student_id', userData.user.id);

        if (quiz && attemptCount !== null && attemptCount >= quiz.max_attempts) {
            toast.error('Anda sudah mencapai batas maksimal percobaan');
            return null;
        }

        // Create new attempt
        const { data, error: createError } = await supabase
            .from('quiz_attempts')
            .insert({
                quiz_id: quizId,
                student_id: userData.user.id,
            })
            .select()
            .single();

        if (createError) {
            toast.error('Gagal memulai kuis');
            return null;
        }

        return data;
    };

    // Save an answer
    const saveAnswer = async (attemptId: string, questionId: string, answer: unknown): Promise<boolean> => {
        // Get question to check correctness
        const { data: question } = await supabase
            .from('questions')
            .select('type, correct_answer, points')
            .eq('id', questionId)
            .single();

        let isCorrect: boolean | null = null;

        // Auto-grade for supported types
        if (question) {
            if (question.type === 'multiple_choice' || question.type === 'true_false') {
                isCorrect = answer === question.correct_answer;
            } else if (question.type === 'short_answer') {
                const correctAnswers = Array.isArray(question.correct_answer)
                    ? question.correct_answer
                    : [question.correct_answer];
                isCorrect = correctAnswers.some((correct: string) =>
                    String(answer).toLowerCase().trim() === String(correct).toLowerCase().trim()
                );
            }
        }

        const { error: saveError } = await supabase
            .from('quiz_answers')
            .upsert({
                attempt_id: attemptId,
                question_id: questionId,
                answer,
                is_correct: isCorrect,
                points_earned: isCorrect && question ? question.points : 0,
            }, {
                onConflict: 'attempt_id,question_id'
            });

        if (saveError) {
            console.error('Error saving answer:', saveError);
            return false;
        }

        return true;
    };

    // Submit quiz attempt
    const submitAttempt = async (attemptId: string, timeSpent: number): Promise<QuizAttempt | null> => {
        // Calculate score
        const { data: answers } = await supabase
            .from('quiz_answers')
            .select(`
                *,
                question:questions(points, type)
            `)
            .eq('attempt_id', attemptId);

        let score = 0;
        let maxScore = 0;
        let correctCount = 0;

        answers?.forEach((ans) => {
            if (ans.question) {
                maxScore += ans.question.points;
                if (ans.is_correct) {
                    score += ans.question.points;
                    correctCount++;
                }
            }
        });

        const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

        // Get passing score
        const { data: attempt } = await supabase
            .from('quiz_attempts')
            .select('quiz:quizzes(passing_score)')
            .eq('id', attemptId)
            .single();

        // Supabase returns nested relations - handle correctly
        const quizData = attempt?.quiz as unknown as { passing_score: number } | null;
        const passed = percentage >= (quizData?.passing_score || 60);

        // Update attempt
        const { data, error: updateError } = await supabase
            .from('quiz_attempts')
            .update({
                score,
                max_score: maxScore,
                percentage,
                passed,
                time_spent: timeSpent,
                status: 'graded',
                submitted_at: new Date().toISOString(),
            })
            .eq('id', attemptId)
            .select()
            .single();

        if (updateError) {
            toast.error('Gagal mengirim kuis');
            return null;
        }

        toast.success('Kuis berhasil dikirim!');
        return data;
    };

    // Get quiz results
    const getResults = async (attemptId: string): Promise<QuizAttempt | null> => {
        const { data, error: fetchError } = await supabase
            .from('quiz_attempts')
            .select(`
                *,
                quiz:quizzes(*),
                answers:quiz_answers(
                    *,
                    question:questions(*)
                )
            `)
            .eq('id', attemptId)
            .single();

        if (fetchError) {
            toast.error('Gagal memuat hasil');
            return null;
        }

        return data;
    };

    // Get all attempts for a quiz (teacher view)
    const getQuizAttempts = async (quizId: string): Promise<QuizAttempt[]> => {
        const { data, error: fetchError } = await supabase
            .from('quiz_attempts')
            .select(`
                *,
                student:users!student_id(name, email)
            `)
            .eq('quiz_id', quizId)
            .order('submitted_at', { ascending: false });

        if (fetchError) {
            toast.error('Gagal memuat percobaan');
            return [];
        }

        return data || [];
    };

    return {
        quizzes,
        loading,
        error,
        fetchQuizzes,
        createQuiz,
        updateQuiz,
        deleteQuiz,
        togglePublish,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        fetchQuizWithQuestions,
        startAttempt,
        saveAnswer,
        submitAttempt,
        getResults,
        getQuizAttempts,
    };
}
