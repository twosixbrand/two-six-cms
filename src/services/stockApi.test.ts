import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as api from './stockApi';

describe('stockApi.ts', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('getStocks: should fetch all stocks', async () => {
        const mockData = [{ id: 1, current_quantity: 50 }];
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockData),
        });

        const result = await api.getStocks();
        expect(result).toEqual(mockData);
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3050/api/stock');
    });

    it('createStock: should convert input to numbers and POST', async () => {
        const input = {
            id_design_clothing: '10',
            current_quantity: '100',
            available_quantity: '90',
            sold_quantity: '10',
            consignment_quantity: '0'
        };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 201,
            json: vi.fn().mockResolvedValue({ id: 1, ...input }),
        });

        await api.createStock(input);

        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3050/api/stock', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
                id_design_clothing: 10,
                current_quantity: 100,
                available_quantity: 90,
                sold_quantity: 10,
                consignment_quantity: 0
            })
        }));
    });

    it('updateStock: should send PATCH with correct data', async () => {
        const input = {
            current_quantity: '120',
            available_quantity: '110',
            sold_quantity: '10',
            consignment_quantity: '0'
        };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ success: true }),
        });

        await api.updateStock(5, input);

        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3050/api/stock/5', expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify({
                current_quantity: 120,
                available_quantity: 110,
                sold_quantity: 10,
                consignment_quantity: 0
            })
        }));
    });

    it('deleteStock: should send DELETE request', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({}),
        });

        await api.deleteStock(10);
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3050/api/stock/10', expect.objectContaining({
            method: 'DELETE'
        }));
    });
});
