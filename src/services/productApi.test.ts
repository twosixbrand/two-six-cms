import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as api from './productApi';

describe('productApi.ts', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('getProducts: should fetch from correct admin endpoint', async () => {
        const mockData = [{ id: 1, name: 'Product 1' }];
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockData),
        });

        const result = await api.getProducts();
        expect(result).toEqual(mockData);
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3050/api/products-admin');
    });

    it('getProducts: should handle error correctly', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 404,
            json: vi.fn().mockResolvedValue({ message: 'Not Found' }),
        });

        await expect(api.getProducts()).rejects.toThrow('Not Found');
    });

    it('createProduct: should send POST request with correct item', async () => {
        const mockItem = { name: 'New Product', price: 50000 };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 201,
            json: vi.fn().mockResolvedValue({ ...mockItem, id: 101 }),
        });

        const result = await api.createProduct(mockItem);
        expect(result).toHaveProperty('id', 101);
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3050/api/products', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(mockItem),
        }));
    });

    it('updateProduct: should send PATCH request with partial data', async () => {
        const updateData = { name: 'Updated Name', price: 60000, id_design_clothing: 5 };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ success: true }),
        });

        await api.updateProduct(123, updateData);
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3050/api/products/123', expect.objectContaining({
            method: 'PATCH',
            body: expect.stringContaining('"name":"Updated Name"'),
        }));
    });

    it('deleteProduct: should return null on 204 No Content', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 204,
        });

        const result = await api.deleteProduct(123);
        expect(result).toBeNull();
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3050/api/products/123', expect.objectContaining({
            method: 'DELETE',
        }));
    });

    it('deleteProduct: should handle error on deletion failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 403,
            json: vi.fn().mockResolvedValue({ message: 'Forbidden' }),
        });

        await expect(api.deleteProduct(123)).rejects.toThrow('Forbidden');
    });
});
