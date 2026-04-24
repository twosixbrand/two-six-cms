import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as api from './consignmentPaymentApi';

describe('consignmentPaymentApi', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });
    afterEach(() => { vi.restoreAllMocks(); });

    const mockOk = (data: any = []) => ({ ok: true, status: 200, json: vi.fn().mockResolvedValue(data) });
    const mockOk204 = () => ({ ok: true, status: 204, json: vi.fn() });
    const mockErrorJson = (msg = 'Error') => ({
        ok: false, status: 400,
        headers: { get: vi.fn().mockReturnValue('application/json') },
        json: vi.fn().mockResolvedValue({ message: msg }),
    });
    const mockErrorText = (msg = 'plain err') => ({
        ok: false, status: 500,
        headers: { get: vi.fn().mockReturnValue('text/plain') },
        text: vi.fn().mockResolvedValue(msg),
    });

    // ── getPayments ──
    it('getPayments without filters', async () => {
        (global.fetch as any).mockResolvedValue(mockOk([{ id: 1 }]));
        const result = await api.getPayments();
        expect(result).toEqual([{ id: 1 }]);
    });

    it('getPayments with filters', async () => {
        (global.fetch as any).mockResolvedValue(mockOk([]));
        await api.getPayments({ status: 'PENDING', id_customer: 5 });
        const url = (fetch as any).mock.calls[0][0];
        expect(url).toContain('status=PENDING');
        expect(url).toContain('id_customer=5');
    });

    // ── getPayment ──
    it('getPayment', async () => {
        (global.fetch as any).mockResolvedValue(mockOk({ id: 1, amount: 500 }));
        const result = await api.getPayment(1);
        expect(result).toEqual({ id: 1, amount: 500 });
    });

    // ── approvePayment ──
    it('approvePayment sends POST', async () => {
        (global.fetch as any).mockResolvedValue(mockOk({ id: 1, status: 'APPROVED' }));
        const result = await api.approvePayment(1);
        expect(result).toEqual({ id: 1, status: 'APPROVED' });
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/approve'), expect.objectContaining({ method: 'POST' }));
    });

    // ── rejectPayment ──
    it('rejectPayment sends POST with reason', async () => {
        (global.fetch as any).mockResolvedValue(mockOk({ id: 1, status: 'REJECTED' }));
        const result = await api.rejectPayment(1, 'invalid receipt');
        expect(result).toEqual({ id: 1, status: 'REJECTED' });
    });

    // ── handleResponse error paths ──
    it('throws on JSON error response', async () => {
        (global.fetch as any).mockResolvedValue(mockErrorJson('invalid payment'));
        await expect(api.getPayments()).rejects.toThrow('invalid payment');
    });

    it('throws on text error response', async () => {
        (global.fetch as any).mockResolvedValue(mockErrorText('server error'));
        await expect(api.getPayments()).rejects.toThrow('server error');
    });

    it('returns undefined on 204', async () => {
        (global.fetch as any).mockResolvedValue(mockOk204());
        const result = await api.getPayment(1);
        expect(result).toBeUndefined();
    });
});
