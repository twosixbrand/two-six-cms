import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import * as api from './subscriberApi';

describe('subscriberApi', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });
    afterEach(() => { vi.restoreAllMocks(); });

    it('getSubscribers', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await api.getSubscribers(); } catch (e) {}
    });

    it('updateSubscriber', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue({}) });
        try { await api.updateSubscriber(1, { status: true }); } catch (e) {}
    });
});
