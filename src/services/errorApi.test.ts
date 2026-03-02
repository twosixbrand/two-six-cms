import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logError } from './errorApi';

describe('errorApi', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3000');
        global.fetch = vi.fn();
        // Use defineProperty to mock window.location
        Object.defineProperty(window, 'location', {
            value: { pathname: '/test-path' },
            writable: true,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should call fetch with correct parameters when logError is called without pageInfo', async () => {
        const error = new Error('Test error');
        error.stack = 'Error stack';

        // Mock fetch resolution
        (global.fetch as any).mockResolvedValue({
            ok: true,
        });

        await logError(error, undefined);

        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3050/api/error-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                app: 'cms',
                page: '/test-path',
                message: 'Test error',
                stack: 'Error stack',
            }),
        });
    });

    it('should call fetch with correct parameters when logError is called with pageInfo', async () => {
        const error = new Error('Test error');
        error.stack = 'Error stack';

        // Mock fetch resolution
        (global.fetch as any).mockResolvedValue({
            ok: true,
        });

        await logError(error, '/custom-path');

        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3050/api/error-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                app: 'cms',
                page: '/custom-path',
                message: 'Test error',
                stack: 'Error stack',
            }),
        });
    });

    it('should catch fetch errors and log to console', async () => {
        const error = new Error('Test error');
        const fetchError = new Error('Fetch failed');

        // Make fetch reject
        (global.fetch as any).mockRejectedValue(fetchError);

        // Spy on console.error
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        await logError(error, undefined);

        expect(consoleSpy).toHaveBeenCalledWith('Fallo al registrar el error en el backend:', fetchError);
    });
});
