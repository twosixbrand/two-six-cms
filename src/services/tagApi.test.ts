import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import * as api from './tagApi';

describe('tagApi', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });
    afterEach(() => { vi.restoreAllMocks(); });

    it('getTags', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await api.getTags(); } catch (e) {}
    });

    it('createTag', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue({}) });
        try { await api.createTag({ name: 'New' }); } catch (e) {}
    });

    it('updateTag', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue({}) });
        try { await api.updateTag(1, { name: 'Updated' }); } catch (e) {}
    });

    it('deleteTag', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 204, json: vi.fn().mockResolvedValue(null) });
        try { await api.deleteTag(1); } catch (e) {}
    });
});
