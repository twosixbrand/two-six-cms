import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InventoryKardexPage from './InventoryKardexPage';
import * as inventoryApi from '../../services/inventoryApi';
import * as accountingApi from '../../services/accountingApi';
import { BrowserRouter } from 'react-router-dom';

// Mock Services
vi.mock('../../services/inventoryApi');
vi.mock('../../services/accountingApi');
vi.mock('../../services/errorApi');

const mockKardexData = [
  {
    id: 1,
    date: '2026-05-01T10:00:00Z',
    type: 'ENTRADA',
    source_type: 'PURCHASE',
    source_id: 501,
    quantity: 10,
    unit_cost: 25000,
    balance_after: 10,
    clothingSize: {
      id: 10,
      size: { name: 'M' },
      clothingColor: {
        color: { name: 'Azul' },
        design: {
          reference: 'REF-001',
          clothing: { name: 'Camiseta Polo' }
        }
      }
    }
  }
];

const renderPage = () => {
  return render(
    <BrowserRouter>
      <InventoryKardexPage />
    </BrowserRouter>
  );
};

describe('InventoryKardexPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (inventoryApi.getKardexAll as any).mockResolvedValue(mockKardexData);
  });

  it('renders KPIs and movements table correctly', async () => {
    renderPage();

    expect(screen.getByText(/Kardex de Inventario/i)).toBeInTheDocument();
    
    // Check if API was called
    await waitFor(() => {
      expect(inventoryApi.getKardexAll).toHaveBeenCalled();
    }, { timeout: 4000 });

    // Check table rows
    expect(await screen.findByText('REF-001', {}, { timeout: 4000 })).toBeInTheDocument();
  });

  it('filters movements by search term', async () => {
    renderPage();
    
    const searchInput = await screen.findByLabelText('Buscar movimientos');
    fireEvent.change(searchInput, { target: { value: 'REF-001' } });

    await waitFor(() => {
      expect(inventoryApi.getKardexAll).toHaveBeenCalledWith(expect.objectContaining({
        search: 'REF-001'
      }));
    });
  });

  it('filters movements by date range', async () => {
    renderPage();
    
    const startDateInput = await screen.findByLabelText('Fecha Desde');
    const endDateInput = screen.getByLabelText('Fecha Hasta');
    
    fireEvent.change(startDateInput, { target: { value: '20260501' } });
    fireEvent.change(endDateInput, { target: { value: '20260531' } });

    await waitFor(() => {
      // Check that at least one call has both dates
      const calls = (inventoryApi.getKardexAll as any).mock.calls;
      const hasCorrectCall = calls.some((call: any) => 
        call[0].startDate === '2026-05-01' && call[0].endDate === '2026-05-31'
      );
      expect(hasCorrectCall).toBe(true);
    }, { timeout: 4000 });
  });

  it('opens detail modal for a movement', async () => {
    (inventoryApi.getKardex as any).mockResolvedValue([mockKardexData[0]]);
    
    renderPage();
    
    // Wait for data to load
    const rows = await screen.findAllByTestId('kardex-row', {}, { timeout: 4000 });
    expect(rows.length).toBeGreaterThan(0);
    
    // Click view detail button in the first row
    const viewBtn = within(rows[0]).getByRole('button');
    fireEvent.click(viewBtn);

    expect(await screen.findByText(/Kardex — REF-001/i)).toBeInTheDocument();
    expect(inventoryApi.getKardex).toHaveBeenCalledWith(10);
  });

  it('handles excel export', async () => {
    renderPage();
    
    const exportBtn = await screen.findByText(/Exportar Excel/i);
    fireEvent.click(exportBtn);

    expect(accountingApi.exportToExcel).toHaveBeenCalledWith('kardex', expect.any(Object));
  });

  it('handles chips filtering', async () => {
    renderPage();
    
    const entradaChip = await screen.findByText('↗ Entradas');
    fireEvent.click(entradaChip);

    await waitFor(() => {
      expect(inventoryApi.getKardexAll).toHaveBeenCalledWith(expect.objectContaining({
        type: 'ENTRADA'
      }));
    });
  });
});
