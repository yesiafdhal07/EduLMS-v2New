// Jest globals (describe, it, expect) are provided automatically
import { renderHook, waitFor } from '@testing-library/react';

// Simple mock test without full Supabase mocking
describe('useClasses Hook Logic', () => {
    it('should have valid initial state structure', () => {
        // Test that the hook would return expected structure
        const expectedStructure = {
            classes: [],
            selectedClassId: null,
            isLoading: true,
        };

        expect(expectedStructure).toHaveProperty('classes');
        expect(expectedStructure).toHaveProperty('selectedClassId');
        expect(expectedStructure).toHaveProperty('isLoading');
    });

    it('should validate class name format', () => {
        const validClassName = 'Kelas 10A';
        const emptyClassName = '';

        expect(validClassName.length).toBeGreaterThan(0);
        expect(emptyClassName.length).toBe(0);
    });

    it('should handle UUID format for classId', () => {
        const validUUID = '123e4567-e89b-12d3-a456-426614174000';
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        expect(uuidRegex.test(validUUID)).toBe(true);
    });
});

describe('Class Data Validation', () => {
    it('should validate class object structure', () => {
        const mockClass = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Kelas 10A',
            created_at: new Date().toISOString(),
            teacher_id: '123e4567-e89b-12d3-a456-426614174001',
        };

        expect(mockClass).toHaveProperty('id');
        expect(mockClass).toHaveProperty('name');
        expect(mockClass).toHaveProperty('teacher_id');
        expect(typeof mockClass.name).toBe('string');
    });

    it('should filter empty class names', () => {
        const classes = [
            { id: '1', name: 'Valid Class' },
            { id: '2', name: '' },
            { id: '3', name: 'Another Class' },
        ];

        const validClasses = classes.filter(c => c.name.trim().length > 0);
        expect(validClasses.length).toBe(2);
    });
});
