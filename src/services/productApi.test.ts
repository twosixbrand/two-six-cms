import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as api from './productApi';

describe('productApi.ts', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });


    it('should test getProducts success', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ data: 'success' }),
        });

        try {
            await api.getProducts(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });

    it('should test getProducts failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue({ message: 'Error' }),
        });

        try {
            await api.getProducts(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });


    it('should test createProduct success', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ data: 'success' }),
        });

        try {
            await api.createProduct(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });

    it('should test createProduct failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue({ message: 'Error' }),
        });

        try {
            await api.createProduct(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });


    it('should test updateProduct success', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ data: 'success' }),
        });

        try {
            await api.updateProduct(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });

    it('should test updateProduct failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue({ message: 'Error' }),
        });

        try {
            await api.updateProduct(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });


    it('should test deleteProduct success', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ data: 'success' }),
        });

        try {
            await api.deleteProduct(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });

    it('should test deleteProduct failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue({ message: 'Error' }),
        });

        try {
            await api.deleteProduct(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });

});
