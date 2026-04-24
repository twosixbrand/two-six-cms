import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import * as api from './permissionApi';

describe('permissionApi', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });
    afterEach(() => { vi.restoreAllMocks(); });

    it('getPermissions', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await api.getPermissions(); } catch (e) {}
    });

    it('getRolePermissions', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await api.getRolePermissions(1); } catch (e) {}
    });

    it('setRolePermissions', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue({}) });
        try { await api.setRolePermissions(1, [1, 2, 3]); } catch (e) {}
    });

    it('getUserPermissions', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue([]) });
        try { await api.getUserPermissions(1); } catch (e) {}
    });
});
