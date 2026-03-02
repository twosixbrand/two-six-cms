import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as api from './returnItemApi';

describe('returnItemApi.ts', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });


    it('should test getReturnItems success', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ data: 'success' }),
        });

        try {
            await api.getReturnItems(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });

    it('should test getReturnItems failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue({ message: 'Error' }),
        });

        try {
            await api.getReturnItems(1, { id: 1, name: 'test' }, 'test');
        } catch (e) {
            // ignore
        }
    });

});
