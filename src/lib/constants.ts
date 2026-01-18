/**
 * Application Constants
 * Centralized configuration values to avoid magic numbers
 */

// ========================================================
// GRADING CONSTANTS
// ========================================================
export const GRADING = {
    /** Minimum percentage to pass an assignment/quiz */
    PASSING_SCORE: 70,
    
    /** Grade categories with their ranges */
    GRADE_RANGES: {
        A: { min: 85, max: 100 },
        B: { min: 70, max: 84 },
        C: { min: 55, max: 69 },
        D: { min: 0, max: 54 },
    },
    
    /** Maximum points for manual grading */
    MAX_POINTS: 100,
} as const;

// ========================================================
// PERFORMANCE CONSTANTS
// ========================================================
export const PERFORMANCE = {
    /** Debounce delay for realtime subscriptions (ms) */
    REALTIME_DEBOUNCE_MS: 5000,
    
    /** Delay for class switch batching (ms) */
    CLASS_SWITCH_DELAY_MS: 100,
    
    /** Maximum items per page for pagination */
    PAGE_SIZE: 20,
    
    /** Maximum file upload size (bytes) - 10MB */
    MAX_FILE_SIZE: 10 * 1024 * 1024,
} as const;

// ========================================================
// RATE LIMITING
// ========================================================
export const RATE_LIMIT = {
    /** Maximum requests per window */
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    
    /** Window duration in milliseconds */
    WINDOW_MS: 60 * 1000,
} as const;

// ========================================================
// UI CONSTANTS
// ========================================================
export const UI = {
    /** Animation durations (ms) */
    ANIMATION: {
        FAST: 150,
        NORMAL: 300,
        SLOW: 500,
    },
    
    /** Toast notification duration (ms) */
    TOAST_DURATION: 4000,
    
    /** Skeleton shimmer animation cycle (ms) */
    SKELETON_CYCLE: 1500,
} as const;

// ========================================================
// QUIZ CONSTANTS
// ========================================================
export const QUIZ = {
    /** Default time limit in minutes */
    DEFAULT_TIME_LIMIT: 30,
    
    /** Warning threshold for remaining time (seconds) */
    TIME_WARNING_THRESHOLD: 300, // 5 minutes
    
    /** Default maximum attempts */
    DEFAULT_MAX_ATTEMPTS: 3,
    
    /** Default passing score percentage */
    DEFAULT_PASSING_SCORE: 60,
} as const;

// ========================================================
// ATTENDANCE CONSTANTS
// ========================================================
export const ATTENDANCE = {
    /** QR code refresh interval (seconds) */
    QR_REFRESH_INTERVAL: 30,
    
    /** QR code validity duration (seconds) */
    QR_VALIDITY_SECONDS: 60,
    
    /** Session timeout for attendance (hours) */
    SESSION_TIMEOUT_HOURS: 4,
} as const;

// ========================================================
// GAMIFICATION CONSTANTS
// ========================================================
export const GAMIFICATION = {
    /** Points per level */
    POINTS_PER_LEVEL: 100,
    
    /** Streak milestones (days) */
    STREAK_MILESTONES: [7, 14, 30, 60, 100],
    
    /** Points for activities */
    POINTS: {
        ATTENDANCE: 5,
        ASSIGNMENT_SUBMIT: 10,
        ASSIGNMENT_ON_TIME: 15,
        QUIZ_COMPLETE: 20,
        QUIZ_PERFECT: 50,
        STREAK_DAY: 2,
    },
} as const;
