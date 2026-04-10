import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as api from './clothingApi';

describe('clothingApi.ts', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('getClothing: should return data on success', async () => {
        const mockData = [{ id: 1, name: 'Camiseta' }];
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockData),
        });

        const result = await api.getClothing();
        expect(result).toEqual(mockData);
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3050/api/clothing');
    });

    it('getClothing: should throw error on failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 500,
            headers: { get: () => 'application/json' },
            json: vi.fn().mockResolvedValue({ message: 'Server Error' }),
        });

        await expect(api.getClothing()).rejects.toThrow('Server Error');
    });

    it('getClothingById: should return data on success', async () => {
        const mockData = { id: 1, name: 'Camiseta' };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockData),
        });

        const result = await api.getClothingById(1);
        expect(result).toEqual(mockData);
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3050/api/clothing/1');
    });

    it('createClothing: should send correct data and return response', async () => {
        const clothingData = { name: 'Pantalón', id_gender: '1', id_type_clothing: 2, id_category: '3' };
        const mockResponse = { id: 10, ...clothingData };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 201,
            json: vi.fn().mockResolvedValue(mockResponse),
        });

        const result = await api.createClothing(clothingData);
        expect(result).toEqual(mockResponse);
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3050/api/clothing', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
                name: 'Pantalón',
                id_gender: 1,
                id_type_clothing: 2,
                id_category: 3
            })
        }));
    });

    it('updateClothing: should send PATCH request with correct data', async () => {
        const clothingData = { name: 'Pantalón Editado', id_gender: '2', id_type_clothing: 1, id_category: '5' };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ success: true }),
        });

        await api.updateClothing(1, clothingData);
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3050/api/clothing/1', expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify({
                name: 'Pantalón Editado',
                id_gender: 2,
                id_type_clothing: 1,
                id_category: 5
            })
        }));
    });

    it('deleteClothing: should send DELETE request', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({}),
        });

        await api.deleteClothing(1);
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3050/api/clothing/1', expect.objectContaining({
            method: 'DELETE'
        }));
    });

    it('deleteClothing: should throw error on failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 404,
            headers: { get: () => 'text/plain' },
            text: vi.fn().mockResolvedValue('Not Found'),
        });

        await expect(api.deleteClothing(1)).rejects.toThrow('Not Found');
    });
});
