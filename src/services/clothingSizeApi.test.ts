import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as api from './clothingSizeApi';

describe('clothingSizeApi.ts', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('getClothingSizes: should fetch all clothing sizes', async () => {
        const mockData = [{ id: 1, id_size: 2, quantity_available: 10 }];
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockData),
        });

        const result = await api.getClothingSizes();
        expect(result).toEqual(mockData);
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3050/api/clothing-size');
    });

    it('createClothingSize: should convert strings to numbers and POST', async () => {
        const input = {
            id_clothing_color: '5',
            id_size: '2',
            quantity_produced: '100',
            quantity_available: '80',
            quantity_sold: '20',
            quantity_on_consignment: '0',
            quantity_under_warranty: '0',
            quantity_minimum_alert: '10'
        };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 201,
            json: vi.fn().mockResolvedValue({ id: 1, ...input }),
        });

        await api.createClothingSize(input);
        
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3050/api/clothing-size', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
                id_clothing_color: 5,
                id_size: 2,
                quantity_produced: 100,
                quantity_available: 80,
                quantity_sold: 20,
                quantity_on_consignment: 0,
                quantity_under_warranty: 0,
                quantity_minimum_alert: 10
            })
        }));
    });

    it('updateClothingSize: should send PATCH with numeric values', async () => {
        const input = {
            id_clothing_color: '5',
            id_size: '2',
            quantity_produced: '150',
            quantity_available: '130',
            quantity_sold: '20',
            quantity_on_consignment: '0',
            quantity_under_warranty: '0'
        };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ success: true }),
        });

        await api.updateClothingSize(1, input);

        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3050/api/clothing-size/1', expect.objectContaining({
            method: 'PATCH',
            body: expect.stringContaining('"quantity_produced":150')
        }));
    });

    it('deleteClothingSize: should send DELETE request', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ success: true }),
        });

        await api.deleteClothingSize(10);
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3050/api/clothing-size/10', expect.objectContaining({
            method: 'DELETE'
        }));
    });
});
