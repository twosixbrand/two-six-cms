import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConsignmentReturnPage from './ConsignmentReturnPage';
import * as returnApi from '../../services/consignmentReturnApi';
import * as warehouseApi from '../../services/consignmentWarehouseApi';
import * as customerApi from '../../services/customerApi';
import * as productApi from '../../services/productApi';
import * as orderApi from '../../services/orderApi';
import Swal from 'sweetalert2';

vi.mock('../../services/consignmentReturnApi');
vi.mock('../../services/consignmentWarehouseApi');
vi.mock('../../services/customerApi');
vi.mock('../../services/productApi');
vi.mock('../../services/orderApi');
vi.mock('../../services/errorApi');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

const mockReturns = [
  {
    id: 1,
    return_type: 'PORTFOLIO',
    status: 'DRAFT',
    id_warehouse: 10,
    warehouse: { id: 10, name: 'Bodega Norte', customer: { id: 1, name: 'Cliente A' } },
    items: [{ id: 101, id_clothing_size: 501, quantity: 2, reason: 'Obsolescencia' }],
  },
];

const mockCustomers = [
  { id: 1, name: 'Cliente A', is_consignment_ally: true },
];

const mockWarehouses = [
  { id: 10, name: 'Bodega Norte', id_customer: 1, is_active: true, customer: { id: 1, name: 'Cliente A' } },
];

const mockProducts = [
  {
    id: 501,
    id_clothing_size: 501,
    sku: 'SKU501',
    clothingSize: { id: 501, clothingColor: { design: { reference: 'REF1' }, color: { name: 'Negro' } }, size: { name: 'M' } },
  },
];

describe('ConsignmentReturnPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (returnApi.getReturns as any).mockResolvedValue(mockReturns);
    (customerApi.getCustomers as any).mockResolvedValue(mockCustomers);
    (warehouseApi.getWarehouses as any).mockResolvedValue(mockWarehouses);
    (productApi.getProducts as any).mockResolvedValue(mockProducts);
    (orderApi.getOrders as any).mockResolvedValue([]);
    (returnApi.getReturn as any).mockImplementation((id: number) => 
      Promise.resolve(mockReturns.find(r => r.id === id))
    );
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <ConsignmentReturnPage />
      </BrowserRouter>,
    );

  it('renders page header', async () => {
    renderPage();
    expect(await screen.findByText('Devoluciones y Garantías')).toBeInTheDocument();
  });

  it('allows creating a return', async () => {
    (returnApi.createReturn as any).mockResolvedValue({ id: 123 });
    renderPage();
    await waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument());
    fireEvent.click(screen.getByText('Nueva Devolución'));
    
    fireEvent.change(screen.getByLabelText(/Cliente/i), { target: { value: '1' } });
    await waitFor(() => expect(screen.getByLabelText(/Bodega/i)).not.toBeDisabled());
    fireEvent.change(screen.getByLabelText(/Bodega/i), { target: { value: '10' } });
    
    fireEvent.click(screen.getByText('Agregar'));
    fireEvent.change(screen.getByDisplayValue('Producto...'), { target: { value: '501' } });
    fireEvent.change(screen.getByPlaceholderText('Cant.'), { target: { value: '3' } });
    
    fireEvent.click(screen.getByText('Crear borrador'));
    
    await waitFor(() => {
      expect(returnApi.createReturn).toHaveBeenCalled();
    });
  });

  describe('Actions', () => {
    it('opens detail modal', async () => {
      renderPage();
      await screen.findByText('1');
      const row = screen.getByText('1').closest('tr')!;
      const viewBtn = within(row).getAllByRole('button')[0];
      fireEvent.click(viewBtn);
      
      expect(await screen.findByText('Devolución #1')).toBeInTheDocument();
    });

    it('calls processReturn', async () => {
      (returnApi.processReturn as any).mockResolvedValue({ id: 1 });
      renderPage();
      await screen.findByText('1');
      const row = screen.getByText('1').closest('tr')!;
      const processBtn = within(row).getAllByRole('button')[1];
      fireEvent.click(processBtn);
      
      await waitFor(() => {
        expect(returnApi.processReturn).toHaveBeenCalledWith(1);
      });
    });

    it('calls cancelReturn', async () => {
      renderPage();
      await screen.findByText('1');
      const row = screen.getByText('1').closest('tr')!;
      const cancelBtn = within(row).getAllByRole('button')[2];
      fireEvent.click(cancelBtn);
      
      await waitFor(() => {
        expect(returnApi.cancelReturn).toHaveBeenCalledWith(1);
      });
    });

    it('calls deleteReturn', async () => {
      renderPage();
      await screen.findByText('1');
      const row = screen.getByText('1').closest('tr')!;
      const deleteBtn = within(row).getAllByRole('button')[3];
      fireEvent.click(deleteBtn);
      
      await waitFor(() => {
        expect(returnApi.deleteReturn).toHaveBeenCalledWith(1);
      });
    });
  });
});
