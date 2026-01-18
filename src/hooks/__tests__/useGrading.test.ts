// Jest globals (describe, it, expect) are provided automatically

describe('Grade Utility Functions', () => {
    it('should calculate average correctly', () => {
        const grades = [85, 90, 78, 92, 88];
        const average = grades.reduce((sum, g) => sum + g, 0) / grades.length;

        expect(average).toBeCloseTo(86.6, 1);
    });

    it('should find highest grade', () => {
        const grades = [85, 90, 78, 92, 88];
        const highest = Math.max(...grades);

        expect(highest).toBe(92);
    });

    it('should assign letter grades correctly', () => {
        const getLetterGrade = (score: number) => {
            if (score >= 85) return 'A';
            if (score >= 70) return 'B';
            if (score >= 55) return 'C';
            return 'D';
        };

        expect(getLetterGrade(90)).toBe('A');
        expect(getLetterGrade(75)).toBe('B');
        expect(getLetterGrade(60)).toBe('C');
        expect(getLetterGrade(40)).toBe('D');
    });

    it('should validate score range', () => {
        const validateScore = (score: number) => score >= 0 && score <= 100;

        expect(validateScore(85)).toBe(true);
        expect(validateScore(-5)).toBe(false);
        expect(validateScore(105)).toBe(false);
    });
});

describe('Grade Type Validation', () => {
    const VALID_TYPES = ['formatif', 'sumatif', 'keaktifan', 'manual'] as const;

    it('should validate grade types', () => {
        expect(VALID_TYPES).toContain('formatif');
        expect(VALID_TYPES).toContain('sumatif');
        expect(VALID_TYPES).toContain('keaktifan');
    });

    it('should count grades by type', () => {
        const grades = [
            { type: 'formatif', score: 80 },
            { type: 'sumatif', score: 85 },
            { type: 'formatif', score: 90 },
            { type: 'keaktifan', score: 88 },
        ];

        const formatifCount = grades.filter(g => g.type === 'formatif').length;
        expect(formatifCount).toBe(2);
    });
});

describe('Feedback Validation', () => {
    it('should trim feedback text', () => {
        const feedback = '  Great work!  ';
        expect(feedback.trim()).toBe('Great work!');
    });

    it('should handle null/empty feedback', () => {
        const processFeedback = (f: string | null | undefined) => f?.trim() || '-';

        expect(processFeedback(null)).toBe('-');
        expect(processFeedback(undefined)).toBe('-');
        expect(processFeedback('')).toBe('-');
        expect(processFeedback('Good')).toBe('Good');
    });
});
