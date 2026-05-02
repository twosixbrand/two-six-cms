import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConsignmentSelloutPage from './ConsignmentSelloutPage';
import * as selloutApi from '../../services/consignmentSelloutApi';
import * as warehouseApi from '../../services/consignmentWarehouseApi';
import * as customerApi from '../../services/customerApi';
import Swal from 'sweetalert2';

vi.mock('../../services/consignmentSelloutApi');
vi.mock('../../services/consignmentWarehouseApi');
vi.mock('../../services/customerApi');
vi.mock('../../services/errorApi');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

const mockCustomers = [
  { id: 1, name: 'Cliente A', is_consignment_ally: true },
];

const mockWarehouses = [
  { id: 10, name: 'Bodega Norte', id_customer: 1, is_active: true, customer: { id: 1, name: 'Cliente A' } },
];

describe('ConsignmentSelloutPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (customerApi.getCustomers as any).mockResolvedValue(mockCustomers);
    (warehouseApi.getWarehouses as any).mockResolvedValue(mockWarehouses);
    (selloutApi.parseSelloutCsv as any).mockImplementation((text: string) => {
        if (!text) return [];
        return [{ sku: 'SKU1', quantity: 2 }];
    });
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <ConsignmentSelloutPage />
      </BrowserRouter>,
    );

  it('renders page header and subheader', async () => {
    renderPage();
    expect(await screen.findByText('Procesar Sell-out')).toBeInTheDocument();
  });

  it('allows selecting customer and warehouse', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('1. Cliente y bodega')).toBeInTheDocument());
    
    const customerSelect = screen.getByLabelText(/Cliente aliado/i);
    fireEvent.change(customerSelect, { target: { value: '1' } });
    
    await waitFor(() => {
        const warehouseSelect = screen.getByLabelText(/Bodega/i);
        expect(warehouseSelect).not.toBeDisabled();
        fireEvent.change(warehouseSelect, { target: { value: '10' } });
    });
  });

  it('allows pasting CSV text and showing row count', async () => {
    renderPage();
    await waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument());
    
    const textarea = screen.getByPlaceholderText(/Pega aquí el CSV/i);
    fireEvent.change(textarea, { target: { value: 'sku,quantity\nSKU1,2' } });
    
    expect(screen.getByText('1 filas detectadas.')).toBeInTheDocument();
  });

  it('handles preview flow', async () => {
    (selloutApi.previewSellout as any).mockResolvedValue({
        customer: { name: 'Cliente A' },
        warehouse: { name: 'Bodega Norte' },
        summary: { ok_count: 1, error_count: 0, subtotal: 100000, iva: 19000, total: 119000 },
        resolved: [{ status: 'ok', row: { sku: 'SKU1', quantity: 2 }, product: { reference: 'REF1', color: 'N', size: 'M' }, effective_price: 50000, line_total: 100000 }],
    });
    
    renderPage();
    await waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument());
    
    fireEvent.change(screen.getByLabelText(/Cliente aliado/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Bodega/i), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText(/Pega aquí el CSV/i), { target: { value: 'sku,quantity\nSKU1,2' } });
    
    fireEvent.click(screen.getByText('Previsualizar'));
    
    await waitFor(() => {
        expect(selloutApi.previewSellout).toHaveBeenCalled();
        expect(screen.getByText('3. Previsualización')).toBeInTheDocument();
    });
  });

  it('handles process flow', async () => {
    (selloutApi.previewSellout as any).mockResolvedValue({
        customer: { name: 'Cliente A' },
        warehouse: { name: 'Bodega Norte' },
        summary: { ok_count: 1, error_count: 0, subtotal: 100000, iiva: 19000, total: 119000 },
        resolved: [{ status: 'ok', row: { sku: 'SKU1', quantity: 2 }, product: { reference: 'REF1', color: 'N', size: 'M' }, effective_price: 50000, line_total: 100000 }],
    });
    (selloutApi.processSellout as any).mockResolvedValue({ id: 55, order_reference: 'SO-55', total_payment: 119000 });
    (selloutApi.generateDianForOrder as any).mockResolvedValue({ invoiceId: 1001, cufe: 'ABC123DEF456' });
    
    renderPage();
    await waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument());
    
    fireEvent.change(screen.getByLabelText(/Cliente aliado/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Bodega/i), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText(/Pega aquí el CSV/i), { target: { value: 'sku,quantity\nSKU1,2' } });
    fireEvent.click(screen.getByText('Previsualizar'));
    
    const processBtn = await screen.findByRole('button', { name: /Procesar y facturar DIAN/i });
    fireEvent.click(processBtn);
    
    await waitFor(() => {
        expect(selloutApi.processSellout).toHaveBeenCalled();
        expect(screen.getByText('¡Procesado!')).toBeInTheDocument();
    });
  });
});
