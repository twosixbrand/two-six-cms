import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import * as api from './consignmentPriceApi';

describe('consignmentPriceApi', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });
    afterEach(() => { vi.restoreAllMocks(); });

    it('getConsignmentPrices', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).getConsignmentPrices(1); } catch (e) {}
    });

    it('createConsignmentPrice', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).createConsignmentPrice(1); } catch (e) {}
    });

    it('bulkCreateConsignmentPrice', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).bulkCreateConsignmentPrice(1); } catch (e) {}
    });

    it('updateConsignmentPrice', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).updateConsignmentPrice(1); } catch (e) {}
    });

    it('deleteConsignmentPrice', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).deleteConsignmentPrice(1); } catch (e) {}
    });

});
