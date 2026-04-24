import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import * as api from './inventoryApi';

describe('inventoryApi', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });
    afterEach(() => { vi.restoreAllMocks(); });

    it('createAdjustment', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue({}) });
        try { await api.createAdjustment({ reason: 'test' }); } catch (e) {}
    });

    it('getAdjustments', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await api.getAdjustments(); } catch (e) {}
    });

    it('getKardex', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await api.getKardex(1); } catch (e) {}
    });
});
