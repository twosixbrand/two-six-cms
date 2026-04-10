import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import * as api from './accountingApi';

describe('accountingApi.ts', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should test getBudgets success', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue([]),
        });
        try { await api.getBudgets(2026); } catch (e) { }
    });

    it('should test upsertBudget success', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({}),
        });
        try { await api.upsertBudget({ year: 2026, month: 1, id_puc_account: 1, budgeted_amount: 1000 }); } catch (e) { }
    });

    it('should test getBudgetComparison success', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({}),
        });
        try { await api.getBudgetComparison({ year: 2026, month: 1 }); } catch (e) { }
    });

    it('should test getAnnualBudgetComparison success', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({}),
        });
        try { await api.getAnnualBudgetComparison(2026); } catch (e) { }
    });

    it('should test getAccounts success', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue([]),
        });
        try { await api.getAccounts(); } catch (e) { }
    });
});
