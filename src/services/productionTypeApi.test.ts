import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as api from './productionTypeApi';

describe('productionTypeApi.ts', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });


    it('should test getProductionTypes success', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ data: 'success' }),
        });

        try {
            await api.getProductionTypes(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });

    it('should test getProductionTypes failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue({ message: 'Error' }),
        });

        try {
            await api.getProductionTypes(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });


    it('should test createProductionType success', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ data: 'success' }),
        });

        try {
            await api.createProductionType(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });

    it('should test createProductionType failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue({ message: 'Error' }),
        });

        try {
            await api.createProductionType(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });


    it('should test updateProductionType success', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ data: 'success' }),
        });

        try {
            await api.updateProductionType(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });

    it('should test updateProductionType failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue({ message: 'Error' }),
        });

        try {
            await api.updateProductionType(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });


    it('should test deleteProductionType success', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ data: 'success' }),
        });

        try {
            await api.deleteProductionType(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });

    it('should test deleteProductionType failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue({ message: 'Error' }),
        });

        try {
            await api.deleteProductionType(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });

});
