import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConsignmentDispatchPage from './ConsignmentDispatchPage';
import * as dispatchApi from '../../services/consignmentDispatchApi';
import * as warehouseApi from '../../services/consignmentWarehouseApi';
import * as priceApi from '../../services/consignmentPriceApi';
import * as productApi from '../../services/productApi';
import Swal from 'sweetalert2';

// Use real UI components for integration testing
vi.mock('../../services/consignmentDispatchApi');
vi.mock('../../services/consignmentWarehouseApi');
vi.mock('../../services/consignmentPriceApi');
vi.mock('../../services/productApi');
vi.mock('../../services/errorApi');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

const mockDispatches = [
  {
    id: 1,
    dispatch_number: 'DSP-000001',
    status: 'PENDIENTE',
    id_warehouse: 10,
    qr_token: 'tok-1',
    warehouse: { id: 10, name: 'Bodega Norte', customer: { id: 1, name: 'Cliente A' } },
    items: [{ id: 101, id_clothing_size: 501, quantity: 5 }],
  },
  {
    id: 2,
    dispatch_number: 'DSP-000002',
    status: 'EN_TRANSITO',
    id_warehouse: 11,
    qr_token: 'tok-2',
    warehouse: { id: 11, name: 'Bodega Sur', customer: { id: 2, name: 'Cliente B' } },
    items: [{ id: 102, id_clothing_size: 502, quantity: 10 }],
  },
];

const mockWarehouses = [
  { id: 10, name: 'Bodega Norte', id_customer: 1, is_active: true, customer: { id: 1, name: 'Cliente A' } },
];

const mockProducts = [
  {
    id: 501,
    id_clothing_size: 501,
    reference: 'REF-001',
    color_name: 'Negro',
    size_name: 'M',
    quantity_available: 100,
    clothingSize: { id: 501, quantity_available: 100, clothingColor: { design: { reference: 'REF-001' }, color: { name: 'Negro' } }, size: { name: 'M' } },
  },
];

const mockPrices = [
  { id: 1, id_customer: 1, id_product: 501, price: 85000 },
];

describe('ConsignmentDispatchPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (dispatchApi.getDispatches as any).mockResolvedValue(mockDispatches);
    (warehouseApi.getWarehouses as any).mockResolvedValue(mockWarehouses);
    (productApi.getProducts as any).mockResolvedValue(mockProducts);
    (priceApi.getConsignmentPrices as any).mockResolvedValue(mockPrices);
    (dispatchApi.getDispatch as any).mockImplementation((id: number) => 
      Promise.resolve(mockDispatches.find(d => d.id === id))
    );
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <ConsignmentDispatchPage />
      </BrowserRouter>,
    );

  it('renders page header', async () => {
    renderPage();
    expect(await screen.findByText('Despachos de Consignación')).toBeInTheDocument();
  });

  it('filters dispatches', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('DSP-000001')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText(/Buscar por número/i), { target: { value: 'DSP-000002' } });
    await waitFor(() => expect(screen.queryByText('DSP-000001')).not.toBeInTheDocument());
    expect(screen.getByText('DSP-000002')).toBeInTheDocument();
  });

  describe('Creation Flow', () => {
    it('opens create modal', async () => {
      renderPage();
      await waitFor(() => expect(screen.queryByText('Cargando despachos...')).not.toBeInTheDocument());
      fireEvent.click(screen.getByText('Nuevo Despacho'));
      expect(await screen.findByText('Nuevo Despacho de Consignación')).toBeInTheDocument();
    });

    it('creates a dispatch', async () => {
      (dispatchApi.createDispatch as any).mockResolvedValue({ id: 99 });
      renderPage();
      await waitFor(() => expect(screen.queryByText('Cargando despachos...')).not.toBeInTheDocument());
      fireEvent.click(screen.getByText('Nuevo Despacho'));
      
      fireEvent.change(screen.getByLabelText(/Bodega destino/i), { target: { value: '10' } });
      fireEvent.click(screen.getByText('Agregar ítem'));
      
      const productSelect = await screen.findByDisplayValue('Selecciona producto...');
      fireEvent.change(productSelect, { target: { value: '501' } });
      
      fireEvent.change(screen.getByPlaceholderText('Cant.'), { target: { value: '5' } });
      fireEvent.click(screen.getByText('Crear borrador'));
      
      await waitFor(() => {
        expect(dispatchApi.createDispatch).toHaveBeenCalled();
      });
    });
  });

  describe('Actions', () => {
    it('opens detail modal', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('DSP-000001')).toBeInTheDocument());
      
      const row = screen.getByText('DSP-000001').closest('tr')!;
      const viewBtn = within(row).getAllByRole('button')[0];
      fireEvent.click(viewBtn);
      
      await waitFor(() => {
        expect(dispatchApi.getDispatch).toHaveBeenCalledWith(1);
        expect(screen.getByText('Despacho DSP-000001')).toBeInTheDocument();
      });
    });

    it('calls sendDispatch', async () => {
      (dispatchApi.preSendDispatch as any).mockResolvedValue({ has_changes: false });
      renderPage();
      await waitFor(() => expect(screen.getByText('DSP-000001')).toBeInTheDocument());
      
      const row = screen.getByText('DSP-000001').closest('tr')!;
      const sendBtn = within(row).getAllByRole('button')[1];
      fireEvent.click(sendBtn);
      
      await waitFor(() => {
        expect(dispatchApi.sendDispatch).toHaveBeenCalledWith(1);
      });
    });
  });
});
