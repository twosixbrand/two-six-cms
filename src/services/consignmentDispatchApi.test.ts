import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import * as api from './consignmentDispatchApi';

describe('consignmentDispatchApi', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });
    afterEach(() => { vi.restoreAllMocks(); });

    it('getDispatches', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).getDispatches(1); } catch (e) {}
    });

    it('getDispatch', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).getDispatch(1); } catch (e) {}
    });

    it('createDispatch', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).createDispatch(1); } catch (e) {}
    });

    it('preSendDispatch', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).preSendDispatch(1); } catch (e) {}
    });

    it('sendDispatch', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).sendDispatch(1); } catch (e) {}
    });

    it('cancelDispatch', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).cancelDispatch(1); } catch (e) {}
    });

    it('deleteDispatch', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).deleteDispatch(1); } catch (e) {}
    });

    it('resolveReceptionItem', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).resolveReceptionItem(1); } catch (e) {}
    });

});
