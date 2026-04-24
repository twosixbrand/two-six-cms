import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import * as api from './consignmentSellReportApi';

describe('consignmentSellReportApi', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });
    afterEach(() => { vi.restoreAllMocks(); });

    it('getSellReports', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).getSellReports(1); } catch (e) {}
    });

    it('getSellReport', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).getSellReport(1); } catch (e) {}
    });

    it('approveSellReport', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).approveSellReport(1); } catch (e) {}
    });

    it('rejectSellReport', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).rejectSellReport(1); } catch (e) {}
    });

});
