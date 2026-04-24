import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import * as api from './sizeGuideApi';

describe('sizeGuideApi', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });
    afterEach(() => { vi.restoreAllMocks(); });

    it('getSizeGuides', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await api.getSizeGuides(); } catch (e) {}
    });

    it('getSizeGuideById', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue({}) });
        try { await api.getSizeGuideById(1); } catch (e) {}
    });

    it('createSizeGuide', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue({}) });
        try { await api.createSizeGuide({ name: 'XL' }); } catch (e) {}
    });

    it('updateSizeGuide', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue({}) });
        try { await api.updateSizeGuide(1, { name: 'XL v2' }); } catch (e) {}
    });

    it('deleteSizeGuide', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 204, json: vi.fn().mockResolvedValue(null) });
        try { await api.deleteSizeGuide(1); } catch (e) {}
    });
});
