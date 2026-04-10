import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BalanceSheetPage from './BalanceSheetPage';
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
    getBalanceSheet: vi.fn(),
    exportToExcel: vi.fn(),
}));

describe('BalanceSheetPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders and fetches data on load', async () => {
        (accountingApi.getBalanceSheet as any).mockResolvedValue({
            assets: [{ code: '1105', name: 'Caja', balance: 1000000 }],
            total_assets: 1000000,
            liabilities: [],
            total_liabilities: 0,
            equity: [],
            total_equity: 0
        });

        render(
            <BrowserRouter>
                <BalanceSheetPage />
            </BrowserRouter>
        );

        expect(screen.getByText('Balance General')).toBeDefined();
        await waitFor(() => {
            expect(screen.getByText('1105 - Caja')).toBeDefined();
            expect(screen.getByText('Total ACTIVOS')).toBeDefined();
        });
    });

    it('updates when clicking Generar button', async () => {
        (accountingApi.getBalanceSheet as any).mockResolvedValue({ assets: [], total_assets: 0 });

        render(
            <BrowserRouter>
                <BalanceSheetPage />
            </BrowserRouter>
        );

        const generateBtn = screen.getByRole('button', { name: /Generar/i });
        fireEvent.click(generateBtn);

        expect(accountingApi.getBalanceSheet).toHaveBeenCalled();
    });

    it('calls exportToExcel on button click', async () => {
        (accountingApi.getBalanceSheet as any).mockResolvedValue({ assets: [], total_assets: 0 });

        render(
            <BrowserRouter>
                <BalanceSheetPage />
            </BrowserRouter>
        );

        const exportBtn = screen.getByRole('button', { name: /Exportar Excel/i });
        fireEvent.click(exportBtn);

        expect(accountingApi.exportToExcel).toHaveBeenCalledWith('balance-sheet', expect.any(Object));
    });
});
