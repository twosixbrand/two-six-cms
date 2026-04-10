import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BudgetPage from './BudgetPage';
import * as accountingApi from '../../services/accountingApi';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock accountingApi
vi.mock('../../services/accountingApi', () => ({
    getBudgets: vi.fn(),
    getAccounts: vi.fn(),
    upsertBudget: vi.fn(),
    getBudgetComparison: vi.fn(),
    getAnnualBudgetComparison: vi.fn(),
    exportToExcel: vi.fn(),
}));

describe('BudgetPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (accountingApi.getBudgets as any).mockResolvedValue([]);
        (accountingApi.getAccounts as any).mockResolvedValue({ data: [] });
    });

    it('renders and allows year selection', async () => {
        render(
            <BrowserRouter>
                <BudgetPage />
            </BrowserRouter>
        );

        expect(screen.getByText('Presupuesto')).toBeDefined();
        const yearSelect = screen.getByLabelText(/Ano:/i);
        fireEvent.change(yearSelect, { target: { value: '2026' } });
        expect(accountingApi.getBudgets).toHaveBeenCalledWith(2026);
    });

    it('navigates to monthly comparison', async () => {
        (accountingApi.getBudgetComparison as any).mockResolvedValue({ items: [], totals: {} });

        render(
            <BrowserRouter>
                <BudgetPage />
            </BrowserRouter>
        );

        const compareBtn = screen.getByRole('button', { name: /Ver Comparativo/i });
        fireEvent.click(compareBtn);

        await waitFor(() => {
            expect(screen.getByText(/Comparativo Presupuesto vs Ejecución MENSUAL/i)).toBeDefined();
        });
    });

    it('navigates to annual comparison', async () => {
        (accountingApi.getAnnualBudgetComparison as any).mockResolvedValue({ items: [], grandTotals: {} });

        render(
            <BrowserRouter>
                <BudgetPage />
            </BrowserRouter>
        );

        const annualBtn = screen.getByRole('button', { name: /Comparativo Anual/i });
        fireEvent.click(annualBtn);

        await waitFor(() => {
            expect(screen.getByText(/Comparativo Presupuesto vs Ejecución ANUAL/i)).toBeDefined();
        });
    });
});
