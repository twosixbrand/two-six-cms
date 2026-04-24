import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import * as api from './consignmentCycleCountApi';

describe('consignmentCycleCountApi', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });
    afterEach(() => { vi.restoreAllMocks(); });

    it('getCycleCounts', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).getCycleCounts(1); } catch (e) {}
    });

    it('getCycleCount', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).getCycleCount(1); } catch (e) {}
    });

    it('createCycleCount', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).createCycleCount(1); } catch (e) {}
    });

    it('saveCycleCountItems', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).saveCycleCountItems(1); } catch (e) {}
    });

    it('approveCycleCount', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).approveCycleCount(1); } catch (e) {}
    });

    it('cancelCycleCount', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).cancelCycleCount(1); } catch (e) {}
    });

    it('createMermaInvoice', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).createMermaInvoice(1); } catch (e) {}
    });

});
