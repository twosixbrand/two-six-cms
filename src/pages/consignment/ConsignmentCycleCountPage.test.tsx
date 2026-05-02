import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConsignmentCycleCountPage from './ConsignmentCycleCountPage';
import * as ccApi from '../../services/consignmentCycleCountApi';
import * as warehouseApi from '../../services/consignmentWarehouseApi';
import * as selloutApi from '../../services/consignmentSelloutApi';
import Swal from 'sweetalert2';

vi.mock('../../services/consignmentCycleCountApi');
vi.mock('../../services/consignmentWarehouseApi');
vi.mock('../../services/consignmentSelloutApi');
vi.mock('../../services/errorApi');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

const mockCycleCounts = [
  {
    id: 1,
    id_warehouse: 10,
    status: 'DRAFT',
    warehouse: { id: 10, name: 'Bodega Norte', customer: { id: 1, name: 'Cliente A' } },
    items: [
      { id: 101, id_clothing_size: 501, theoretical_qty: 10, real_qty: null, clothingSize: { clothingColor: { design: { reference: 'REF-001' }, color: { name: 'Negro' } }, size: { name: 'M' } } },
    ],
  },
];

const mockWarehouses = [
  { id: 10, name: 'Bodega Norte', id_customer: 1, is_active: true, customer: { id: 1, name: 'Cliente A' } },
];

describe('ConsignmentCycleCountPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (ccApi.getCycleCounts as any).mockResolvedValue(mockCycleCounts);
    (warehouseApi.getWarehouses as any).mockResolvedValue(mockWarehouses);
    (ccApi.getCycleCount as any).mockImplementation((id: number) => 
      Promise.resolve(mockCycleCounts.find(c => c.id === id))
    );
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <ConsignmentCycleCountPage />
      </BrowserRouter>,
    );

  it('renders page header and data', async () => {
    renderPage();
    expect(await screen.findByText('Conciliación de Inventario')).toBeInTheDocument();
    expect(await screen.findByText('Cliente A — Bodega Norte')).toBeInTheDocument();
  });

  it('filters by status', async () => {
    renderPage();
    await screen.findByText('Cliente A — Bodega Norte');
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'APPROVED' } });
    
    expect(screen.queryByText('Cliente A — Bodega Norte')).not.toBeInTheDocument();
  });

  describe('Creation Flow', () => {
    it('creates a new count', async () => {
      (ccApi.createCycleCount as any).mockResolvedValue({ id: 2 });
      renderPage();
      await screen.findByText('Cliente A — Bodega Norte');
      
      fireEvent.click(screen.getByText('Nuevo Conteo'));
      expect(await screen.findByText('Nuevo Conteo Cíclico')).toBeInTheDocument();
      
      fireEvent.change(screen.getByLabelText(/Bodega/i), { target: { value: '10' } });
      fireEvent.click(screen.getByText('Crear conteo'));
      
      await waitFor(() => {
        expect(ccApi.createCycleCount).toHaveBeenCalled();
      });
    });
  });

  describe('Editor Flow', () => {
    it('opens editor, saves progress and approves', async () => {
      (ccApi.saveCycleCountItems as any).mockResolvedValue({ success: true });
      (ccApi.approveCycleCount as any).mockResolvedValue({ ...mockCycleCounts[0], status: 'APPROVED' });
      
      renderPage();
      await screen.findByText('Cliente A — Bodega Norte');
      
      const row = screen.getByText('Cliente A — Bodega Norte').closest('tr')!;
      const viewBtn = within(row).getByRole('button', { name: 'Ver detalle' });
      fireEvent.click(viewBtn);
      
      expect(await screen.findByText(/Conteo #1/)).toBeInTheDocument();
      
      const realInput = screen.getByRole('spinbutton');
      fireEvent.change(realInput, { target: { value: '10' } });
      
      fireEvent.click(screen.getByText('Guardar progreso'));
      await waitFor(() => expect(ccApi.saveCycleCountItems).toHaveBeenCalled());
      
      fireEvent.click(screen.getByText('Aprobar'));
      await waitFor(() => expect(ccApi.approveCycleCount).toHaveBeenCalled());
    });

    it('cancels a draft count', async () => {
      (ccApi.cancelCycleCount as any).mockResolvedValue({ success: true });
      renderPage();
      await screen.findByText('Cliente A — Bodega Norte');
      
      const row = screen.getByText('Cliente A — Bodega Norte').closest('tr')!;
      const cancelBtn = within(row).getByRole('button', { name: 'Cancelar conteo' });
      fireEvent.click(cancelBtn);
      
      await waitFor(() => {
        expect(ccApi.cancelCycleCount).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Merma Flow', () => {
    it('opens merma modal and invoices merma', async () => {
      const approvedCount = { ...mockCycleCounts[0], status: 'APPROVED' };
      (ccApi.getCycleCounts as any).mockResolvedValue([approvedCount]);
      (ccApi.createMermaInvoice as any).mockResolvedValue({ id: 99, order_reference: 'MERMA-01', total_payment: 100000 });
      (selloutApi.generateDianForOrder as any).mockResolvedValue({ cufe: '1234567890abcdef' });
      
      renderPage();
      await screen.findByText('Cliente A — Bodega Norte');
      
      const row = screen.getByText('Cliente A — Bodega Norte').closest('tr')!;
      const mermaBtn = within(row).getByRole('button', { name: 'Facturar merma' });
      fireEvent.click(mermaBtn);
      
      expect(await screen.findByText('Facturar Merma — Conteo #1')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Facturar y generar DIAN'));
      
      await waitFor(() => {
        expect(ccApi.createMermaInvoice).toHaveBeenCalled();
        expect(selloutApi.generateDianForOrder).toHaveBeenCalledWith(99);
      });
    });
  });
});
