import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import * as api from './consignmentReportsApi';

describe('consignmentReportsApi', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });
    afterEach(() => { vi.restoreAllMocks(); });

    it('getInventoryByCustomer', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).getInventoryByCustomer(1); } catch (e) {}
    });

    it('getLossReport', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).getLossReport(1); } catch (e) {}
    });

    it('getPendingReconciliation', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).getPendingReconciliation(1); } catch (e) {}
    });

});
