// ========================================================
// QUIZ SYSTEM TYPES
// TypeScript interfaces for the quiz system
// ========================================================

export type QuestionType =
    | 'multiple_choice'
    | 'multiple_answer'
    | 'true_false'
    | 'short_answer'
    | 'essay'
    | 'matching';

export interface QuizOption {
    id: string;
    text: string;
    isCorrect?: boolean; // Only visible to teachers
}

export interface MatchingPair {
    id: string;
    left: string;
    right: string;
}

export interface Question {
    id: string;
    quiz_id: string;
    type: QuestionType;
    content: string;
    explanation?: string;
    options?: QuizOption[]; // For multiple choice
    correct_answer?: unknown; // Varies by type
    points: number;
    order_index: number;
    required: boolean;
    created_at: string;
}

export interface Quiz {
    id: string;
    class_id: string;
    teacher_id: string;
    title: string;
    description?: string;
    instructions?: string;
    time_limit?: number; // minutes
    shuffle_questions: boolean;
    shuffle_options: boolean;
    show_answers_after: boolean;
    show_score_after: boolean;
    max_attempts: number;
    passing_score: number;
    start_date?: string;
    end_date?: string;
    published: boolean;
    created_at: string;
    updated_at: string;
    // Joined data
    questions?: Question[];
    question_count?: number;
    attempt_count?: number;
    class?: { name: string };
    teacher?: { name: string };
}

export interface QuizAttempt {
    id: string;
    quiz_id: string;
    student_id: string;
    score?: number;
    max_score?: number;
    percentage?: number;
    passed?: boolean;
    time_spent?: number; // seconds
    started_at: string;
    submitted_at?: string;
    status: 'in_progress' | 'submitted' | 'graded' | 'expired';
    // Joined data
    quiz?: Quiz;
    student?: { name: string; email: string };
    answers?: QuizAnswer[];
}

export interface QuizAnswer {
    id: string;
    attempt_id: string;
    question_id: string;
    answer: unknown;
    is_correct?: boolean;
    points_earned: number;
    graded_by?: string;
    feedback?: string;
    answered_at: string;
    // Joined
    question?: Question;
}

// Form types for creating/editing
export interface QuizFormData {
    title: string;
    description?: string;
    instructions?: string;
    time_limit?: number;
    shuffle_questions: boolean;
    shuffle_options: boolean;
    show_answers_after: boolean;
    show_score_after: boolean;
    max_attempts: number;
    passing_score: number;
    start_date?: string;
    end_date?: string;
}

export interface QuestionFormData {
    type: QuestionType;
    content: string;
    explanation?: string;
    options?: QuizOption[];
    correct_answer?: unknown;
    points: number;
    required: boolean;
}

// Quiz player state
export interface QuizPlayerState {
    quiz: Quiz;
    questions: Question[];
    currentIndex: number;
    answers: Record<string, unknown>;
    timeRemaining?: number;
    attemptId: string;
}

// Result types
export interface QuizResult {
    attempt: QuizAttempt;
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    timeSpent: number;
    answers: (QuizAnswer & { question: Question })[];
}
