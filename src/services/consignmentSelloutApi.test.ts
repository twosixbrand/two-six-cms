import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as api from './consignmentSelloutApi';

describe('consignmentSelloutApi', () => {
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
    const mockErrorText = (msg = 'text err') => ({
        ok: false, status: 500,
        headers: { get: vi.fn().mockReturnValue('text/plain') },
        text: vi.fn().mockResolvedValue(msg),
    });

    // ── previewSellout ──
    it('previewSellout sends POST with body', async () => {
        (global.fetch as any).mockResolvedValue(mockOk({ preview: true }));
        const dto = { id_customer: 1, id_warehouse: 10, rows: [{ quantity: 2 }] };
        const result = await api.previewSellout(dto as any);
        expect(result).toEqual({ preview: true });
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/sellout/preview'), expect.objectContaining({ method: 'POST' }));
    });

    // ── processSellout ──
    it('processSellout sends POST', async () => {
        (global.fetch as any).mockResolvedValue(mockOk({ orderId: 5 }));
        const dto = { id_customer: 1, id_warehouse: 10, rows: [{ quantity: 2 }], notes: 'test' };
        const result = await api.processSellout(dto as any);
        expect(result).toEqual({ orderId: 5 });
    });

    // ── generateDianForOrder ──
    it('generateDianForOrder', async () => {
        (global.fetch as any).mockResolvedValue(mockOk({ id: 1 }));
        const result = await api.generateDianForOrder(99);
        expect(result).toEqual({ id: 1 });
    });

    // ── handleResponse error paths ──
    it('handleResponse throws on JSON error', async () => {
        (global.fetch as any).mockResolvedValue(mockErrorJson('bad request'));
        await expect(api.previewSellout({ id_customer: 1, id_warehouse: 1, rows: [] })).rejects.toThrow('bad request');
    });

    it('handleResponse throws on text error', async () => {
        (global.fetch as any).mockResolvedValue(mockErrorText('server down'));
        await expect(api.previewSellout({ id_customer: 1, id_warehouse: 1, rows: [] })).rejects.toThrow('server down');
    });

    it('handleResponse returns undefined on 204', async () => {
        (global.fetch as any).mockResolvedValue(mockOk204());
        const result = await api.previewSellout({ id_customer: 1, id_warehouse: 1, rows: [] });
        expect(result).toBeUndefined();
    });

    // ── parseSelloutCsv ──
    it('parseSelloutCsv parses comma-delimited CSV', () => {
        const csv = 'sku,reference,color,size,quantity,price_override\nSK1,REF1,Rojo,M,5,50000';
        const rows = api.parseSelloutCsv(csv);
        expect(rows).toHaveLength(1);
        expect(rows[0].sku).toBe('SK1');
        expect(rows[0].quantity).toBe(5);
        expect(rows[0].price_override).toBe(50000);
    });

    it('parseSelloutCsv parses semicolon-delimited CSV', () => {
        const csv = 'sku;reference;color;size;quantity\nSK2;REF2;Azul;L;3';
        const rows = api.parseSelloutCsv(csv);
        expect(rows).toHaveLength(1);
        expect(rows[0].sku).toBe('SK2');
        expect(rows[0].quantity).toBe(3);
    });

    it('parseSelloutCsv returns empty for single line', () => {
        expect(api.parseSelloutCsv('sku,quantity')).toHaveLength(0);
    });

    it('parseSelloutCsv returns empty for empty string', () => {
        expect(api.parseSelloutCsv('')).toHaveLength(0);
    });

    it('parseSelloutCsv handles referencia/talla/cantidad/precio aliases', () => {
        const csv = 'referencia;talla;cantidad;precio\nREF3;XL;10;99000';
        const rows = api.parseSelloutCsv(csv);
        expect(rows).toHaveLength(1);
        expect(rows[0].reference).toBe('REF3');
        expect(rows[0].size).toBe('XL');
        expect(rows[0].quantity).toBe(10);
    });

    it('parseSelloutCsv handles missing price_override', () => {
        const csv = 'sku,quantity\nSK4,2';
        const rows = api.parseSelloutCsv(csv);
        expect(rows[0].price_override).toBeUndefined();
    });
});
