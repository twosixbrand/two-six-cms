import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import InventoryKardexPage from './InventoryKardexPage';

vi.mock('../../services/inventoryApi', () => ({
    getKardexAll: vi.fn().mockResolvedValue([]),
    getKardex: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../services/accountingApi', () => ({
    exportToExcel: vi.fn(),
}));

vi.mock('../../services/errorApi', () => ({
    logError: vi.fn(),
}));

describe('InventoryKardexPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the page header', async () => {
        render(
            <BrowserRouter>
                <InventoryKardexPage />
            </BrowserRouter>
        );
        expect(screen.getByText('Kardex de Inventario')).toBeTruthy();
    });

    it('renders the export button', async () => {
        render(
            <BrowserRouter>
                <InventoryKardexPage />
            </BrowserRouter>
        );
        expect(screen.getByText('Exportar Excel')).toBeTruthy();
    });
});
