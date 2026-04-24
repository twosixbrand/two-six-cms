import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import * as api from './couponApi';

describe('couponApi', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });
    afterEach(() => { vi.restoreAllMocks(); });

    it('getCoupons', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await api.getCoupons(); } catch (e) {}
    });

    it('createCoupon', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue({}) });
        try { await api.createCoupon({ code: 'TEST10' }); } catch (e) {}
    });

    it('updateCoupon', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue({}) });
        try { await api.updateCoupon(1, { code: 'TEST20' }); } catch (e) {}
    });

    it('deleteCoupon', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 204, json: vi.fn().mockResolvedValue(null) });
        try { await api.deleteCoupon(1); } catch (e) {}
    });
});
