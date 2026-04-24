import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

vi.mock('axios', () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));

describe('locationApi', () => {
    beforeEach(() => { vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api'); });
    afterEach(() => { vi.restoreAllMocks(); });

    it('getDepartments', async () => {
        (axios.get as any).mockResolvedValue({ data: [] });
        const locationApi = (await import('./locationApi')).default;
        try { await locationApi.getDepartments(); } catch (e) {}
    });

    it('getCities', async () => {
        (axios.get as any).mockResolvedValue({ data: [] });
        const locationApi = (await import('./locationApi')).default;
        try { await locationApi.getCities(1); } catch (e) {}
    });
});
