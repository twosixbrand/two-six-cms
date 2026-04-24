import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime } from './dateFormat';

describe('formatDate', () => {
    it('returns — for null', () => { expect(formatDate(null)).toBe('—'); });
    it('returns — for undefined', () => { expect(formatDate(undefined)).toBe('—'); });
    it('returns — for empty string', () => { expect(formatDate('')).toBe('—'); });
    it('returns — for invalid string', () => { expect(formatDate('not-a-date')).toBe('—'); });
    it('formats ISO string', () => { expect(formatDate('2026-04-23T14:30:00Z')).toMatch(/^2026-04-2[23]$/); });
    it('formats date-only string', () => { expect(formatDate('2026-01-15')).toMatch(/^2026-01-1[45]$/); });
    it('formats Date object', () => {
        const d = new Date(2026, 0, 1); // Jan 1 2026 local
        expect(formatDate(d)).toBe('2026-01-01');
    });
    it('pads single-digit month and day', () => {
        const d = new Date(2026, 2, 5); // Mar 5
        expect(formatDate(d)).toBe('2026-03-05');
    });
    it('handles Dec 31', () => {
        const d = new Date(2026, 11, 31);
        expect(formatDate(d)).toBe('2026-12-31');
    });
});

describe('formatDateTime', () => {
    it('returns — for null', () => { expect(formatDateTime(null)).toBe('—'); });
    it('returns — for undefined', () => { expect(formatDateTime(undefined)).toBe('—'); });
    it('returns — for empty string', () => { expect(formatDateTime('')).toBe('—'); });
    it('returns — for invalid string', () => { expect(formatDateTime('xyz')).toBe('—'); });
    it('formats Date object with time', () => {
        const d = new Date(2026, 0, 1, 14, 30, 45);
        expect(formatDateTime(d)).toBe('2026-01-01 14:30:45');
    });
    it('formats midnight correctly', () => {
        const d = new Date(2026, 5, 15, 0, 0, 0);
        expect(formatDateTime(d)).toBe('2026-06-15 00:00:00');
    });
    it('pads single-digit hours/minutes/seconds', () => {
        const d = new Date(2026, 0, 1, 3, 5, 7);
        expect(formatDateTime(d)).toBe('2026-01-01 03:05:07');
    });
});
