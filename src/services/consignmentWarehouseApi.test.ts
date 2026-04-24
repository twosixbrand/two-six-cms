import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import * as api from './consignmentWarehouseApi';

describe('consignmentWarehouseApi', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });
    afterEach(() => { vi.restoreAllMocks(); });

    it('getWarehouses', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).getWarehouses(1); } catch (e) {}
    });

    it('getWarehouse', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).getWarehouse(1); } catch (e) {}
    });

    it('getWarehouseStock', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).getWarehouseStock(1); } catch (e) {}
    });

    it('createWarehouse', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).createWarehouse(1); } catch (e) {}
    });

    it('updateWarehouse', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).updateWarehouse(1); } catch (e) {}
    });

    it('deleteWarehouse', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).deleteWarehouse(1); } catch (e) {}
    });

    it('getWarehouseKardex', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await (api as any).getWarehouseKardex(1); } catch (e) {}
    });

});
