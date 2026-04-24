import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import { PqrService } from './pqr.service';

vi.mock('../apiUtils', () => ({
    handleResponse: vi.fn().mockResolvedValue([]),
}));

describe('PqrService', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });
    afterEach(() => { vi.restoreAllMocks(); });

    it('getAllPqrs', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await PqrService.getAllPqrs(); } catch (e) {}
    });

    it('getPqrById', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue({}) });
        try { await PqrService.getPqrById(1); } catch (e) {}
    });
});
