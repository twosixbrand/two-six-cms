import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConsignmentWarehousePage from './ConsignmentWarehousePage';
import * as warehouseApi from '../../services/consignmentWarehouseApi';
import * as customerApi from '../../services/customerApi';
import Swal from 'sweetalert2';

// Increase timeout for this suite
vi.setConfig({ testTimeout: 15000 });

vi.mock('../../services/consignmentWarehouseApi');
vi.mock('../../services/customerApi');
vi.mock('../../services/errorApi');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

const mockCustomers = [
  { id: 1, name: 'Aliado Uno', is_consignment_ally: true, document_number: '900000' },
  { id: 2, name: 'Cliente Retail', is_consignment_ally: false },
];

const mockWarehouses = [
  {
    id: 10,
    id_customer: 1,
    name: 'Bodega Norte',
    address: 'Calle 1',
    city: 'Bogotá',
    state: 'Cundinamarca',
    is_active: true,
    customer: mockCustomers[0],
  },
  {
    id: 20,
    id_customer: 1,
    name: 'Bodega Sur',
    address: 'Calle 2',
    city: 'Medellín',
    state: 'Antioquia',
    is_active: false,
    customer: mockCustomers[0],
  },
];

const mockStock = [
  { id: 101, id_clothing_size: 501, quantity: 10, status: 'EN_CONSIGNACION', clothingSize: { clothingColor: { design: { reference: 'REF1' }, color: { name: 'Negro' } }, size: { name: 'M' } } },
];

const mockKardex = [
  { id: 1001, type: 'IN', source_type: 'CONSIGNMENT_DISPATCH', quantity: 10, description: 'Despacho inicial', clothingSize: { clothingColor: { design: { reference: 'REF1' }, color: { name: 'Negro' } }, size: { name: 'M' } } },
];

describe('ConsignmentWarehousePage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (warehouseApi.getWarehouses as any).mockResolvedValue(mockWarehouses);
    (customerApi.getCustomers as any).mockResolvedValue(mockCustomers);
    (warehouseApi.getWarehouseStock as any).mockResolvedValue(mockStock);
    (warehouseApi.getWarehouseKardex as any).mockResolvedValue(mockKardex);
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <ConsignmentWarehousePage />
      </BrowserRouter>,
    );

  it('renders page header and displays warehouses', async () => {
    renderPage();
    expect(await screen.findByText('Bodegas de Consignación', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(await screen.findByText('Bodega Norte', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText('Bodega Sur')).toBeInTheDocument();
  });

  it('filters warehouses by search input', async () => {
    renderPage();
    await screen.findByText('Bodega Norte', {}, { timeout: 5000 });
    
    const searchInput = screen.getByPlaceholderText(/Buscar bodega/i);
    fireEvent.change(searchInput, { target: { value: 'Norte' } });
    
    await waitFor(() => {
      expect(screen.getByText('Bodega Norte')).toBeInTheDocument();
      expect(screen.queryByText('Bodega Sur')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('filters warehouses by customer', async () => {
    renderPage();
    await screen.findByText('Bodega Norte', {}, { timeout: 5000 });
    
    const customerSelect = screen.getByRole('combobox');
    fireEvent.change(customerSelect, { target: { value: '1' } });
    
    await waitFor(() => {
      expect(screen.getByText('Bodega Norte')).toBeInTheDocument();
    });
  });

  describe('Warehouse Creation', () => {
    it('opens modal and creates a warehouse', async () => {
      (warehouseApi.createWarehouse as any).mockResolvedValue({ id: 30 });
      renderPage();
      await screen.findByText('Bodega Norte', {}, { timeout: 5000 });
      
      fireEvent.click(screen.getByText('Nueva Bodega'));
      expect(await screen.findByText('Nueva Bodega de Consignación', {}, { timeout: 5000 })).toBeInTheDocument();
      
      fireEvent.change(screen.getByLabelText(/Cliente Aliado/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/Nombre de Bodega/i), { target: { value: 'Bodega Oeste' } });
      
      fireEvent.click(screen.getByRole('button', { name: 'Crear' }));
      
      await waitFor(() => {
        expect(warehouseApi.createWarehouse).toHaveBeenCalled();
      });
    });

    it('shows error if customer not selected', async () => {
      renderPage();
      await screen.findByText('Bodega Norte', {}, { timeout: 5000 });
      
      fireEvent.click(screen.getByText('Nueva Bodega'));
      fireEvent.click(screen.getByRole('button', { name: 'Crear' }));
      
      expect(await screen.findByText('Selecciona un cliente aliado.', {}, { timeout: 5000 })).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('opens stock modal and switches to kardex', async () => {
      renderPage();
      await screen.findByText('Bodega Norte', {}, { timeout: 5000 });
      
      const row = screen.getByText('Bodega Norte').closest('tr')!;
      const stockBtn = within(row).getByRole('button', { name: 'Ver stock' });
      fireEvent.click(stockBtn);
      
      expect(await screen.findByText(/Stock — Aliado Uno/, {}, { timeout: 5000 })).toBeInTheDocument();
      expect(await screen.findByText('REF1 Negro M', {}, { timeout: 5000 })).toBeInTheDocument();
      
      // Switch to Kardex
      fireEvent.click(screen.getByText(/Movimientos/));
      expect(await screen.findByText('Despacho inicial', {}, { timeout: 5000 })).toBeInTheDocument();
      expect(screen.getByText('IN')).toBeInTheDocument();
    });

    it('opens edit modal and updates warehouse', async () => {
      (warehouseApi.updateWarehouse as any).mockResolvedValue({ success: true });
      renderPage();
      await screen.findByText('Bodega Norte', {}, { timeout: 5000 });
      
      const row = screen.getByText('Bodega Norte').closest('tr')!;
      const editBtn = within(row).getByRole('button', { name: 'Editar bodega' });
      fireEvent.click(editBtn);
      
      expect(await screen.findByText('Editar Bodega', {}, { timeout: 5000 })).toBeInTheDocument();
      fireEvent.change(screen.getByLabelText(/Nombre de Bodega/i), { target: { value: 'Bodega Norte Editada' } });
      
      fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
      
      await waitFor(() => {
        expect(warehouseApi.updateWarehouse).toHaveBeenCalled();
      });
    });

    it('deletes a warehouse after confirmation', async () => {
      (warehouseApi.deleteWarehouse as any).mockResolvedValue({ success: true });
      renderPage();
      await screen.findByText('Bodega Norte', {}, { timeout: 5000 });
      
      const row = screen.getByText('Bodega Norte').closest('tr')!;
      const deleteBtn = within(row).getByRole('button', { name: 'Eliminar bodega' });
      fireEvent.click(deleteBtn);
      
      await waitFor(() => {
        expect(warehouseApi.deleteWarehouse).toHaveBeenCalledWith(10);
      });
    });
  });
});
