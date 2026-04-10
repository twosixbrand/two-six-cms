import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import IncomeStatementPage from './IncomeStatementPage';
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
    getIncomeStatement: vi.fn(),
    exportToExcel: vi.fn(),
}));

describe('IncomeStatementPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders and fetches income statement data', async () => {
        (accountingApi.getIncomeStatement as any).mockResolvedValue({
            income: [{ code: '4135', name: 'Ventas', amount: 5000000 }],
            total_income: 5000000,
            expenses: [{ code: '5105', name: 'Sueldos', amount: 2000000 }],
            total_expenses: 2000000,
            costs: [],
            total_costs: 0
        });

        render(
            <BrowserRouter>
                <IncomeStatementPage />
            </BrowserRouter>
        );

        expect(screen.getByText('Estado de Resultados')).toBeDefined();
        await waitFor(() => {
            expect(screen.getByText('4135 - Ventas')).toBeDefined();
            expect(screen.getByText('Utilidad del Periodo')).toBeDefined();
        });
    });

    it('shows loss when expenses exceed income', async () => {
        (accountingApi.getIncomeStatement as any).mockResolvedValue({
            income: [{ code: '4135', name: 'Ventas', amount: 1000000 }],
            total_income: 1000000,
            expenses: [{ code: '5105', name: 'Sueldos', amount: 2000000 }],
            total_expenses: 2000000,
            costs: [],
            total_costs: 0
        });

        render(
            <BrowserRouter>
                <IncomeStatementPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Perdida del Periodo')).toBeDefined();
        });
    });

    it('calls exportToExcel when export button clicked', async () => {
        (accountingApi.getIncomeStatement as any).mockResolvedValue({ income: [], expenses: [], costs: [] });

        render(
            <BrowserRouter>
                <IncomeStatementPage />
            </BrowserRouter>
        );

        const exportBtn = screen.getByRole('button', { name: /Exportar Excel/i });
        fireEvent.click(exportBtn);

        expect(accountingApi.exportToExcel).toHaveBeenCalledWith('income-statement', expect.any(Object));
    });
});
