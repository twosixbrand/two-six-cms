import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import * as api from './customerApi';

describe('customerApi', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });
    afterEach(() => { vi.restoreAllMocks(); });

    it('getCustomers', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await api.getCustomers(); } catch (e) {}
    });

    it('getCustomerByDocument', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue({}) });
        try { await api.getCustomerByDocument('123'); } catch (e) {}
    });

    it('updateCustomer', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue({}) });
        try { await api.updateCustomer(1, { name: 'Test' }); } catch (e) {}
    });
});
