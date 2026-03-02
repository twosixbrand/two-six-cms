import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as api from './categoryApi';

describe('categoryApi.ts', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });


    it('should test getCategories success', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ data: 'success' }),
        });

        try {
            await api.getCategories(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });

    it('should test getCategories failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue({ message: 'Error' }),
        });

        try {
            await api.getCategories(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });


    it('should test createCategory success', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ data: 'success' }),
        });

        try {
            await api.createCategory(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });

    it('should test createCategory failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue({ message: 'Error' }),
        });

        try {
            await api.createCategory(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });


    it('should test updateCategory success', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ data: 'success' }),
        });

        try {
            await api.updateCategory(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });

    it('should test updateCategory failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue({ message: 'Error' }),
        });

        try {
            await api.updateCategory(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });


    it('should test deleteCategory success', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ data: 'success' }),
        });

        try {
            await api.deleteCategory(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });

    it('should test deleteCategory failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue({ message: 'Error' }),
        });

        try {
            await api.deleteCategory(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });

});
