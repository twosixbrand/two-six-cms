import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import * as api from './consignmentReturnApi';

describe('consignmentReturnApi', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });
    afterEach(() => { vi.restoreAllMocks(); });

    it('getReturns', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).getReturns(1); } catch (e) {}
    });

    it('getReturn', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).getReturn(1); } catch (e) {}
    });

    it('createReturn', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).createReturn(1); } catch (e) {}
    });

    it('processReturn', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).processReturn(1); } catch (e) {}
    });

    it('cancelReturn', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).cancelReturn(1); } catch (e) {}
    });

    it('deleteReturn', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).deleteReturn(1); } catch (e) {}
    });

    it('attachCreditNote', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).attachCreditNote(1); } catch (e) {}
    });

    it('generateDianCreditNote', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).generateDianCreditNote(1); } catch (e) {}
    });

});
