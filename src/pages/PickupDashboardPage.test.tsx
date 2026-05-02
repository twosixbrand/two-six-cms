import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PickupDashboardPage from './PickupDashboardPage';
import axios from 'axios';
import Swal from 'sweetalert2';

vi.mock('axios');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

const mockOrders = [
  {
    id: 1,
    order_reference: 'PICK-001',
    pickup_status: 'PENDING',
    order_date: '2023-01-01T10:00:00Z',
    customer: { name: 'John Doe', current_phone_number: '123456' },
    orderItems: [
      { id: 10, product_name: 'Camiseta', quantity: 1, color: 'Negro', size: 'M' }
    ]
  },
  {
    id: 2,
    order_reference: 'PICK-002',
    pickup_status: 'READY',
    order_date: '2023-01-01T11:00:00Z',
    customer: { name: 'Jane Smith', current_phone_number: '654321' },
    pickup_pin: '1234',
    orderItems: [
      { id: 11, product_name: 'Pantalón', quantity: 2, color: 'Azul', size: 'L' }
    ]
  }
];

describe('PickupDashboardPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (axios.get as any).mockResolvedValue({ data: mockOrders });
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <PickupDashboardPage />
      </BrowserRouter>,
    );

  it('renders pickup dashboard with orders', async () => {
    renderPage();
    expect(await screen.findByText(/Referencia: PICK-001/i)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Camiseta')).toBeInTheDocument();
    
    expect(screen.getByText(/Referencia: PICK-002/i)).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument(); // PIN
  });

  it('allows marking an order as preparing', async () => {
    renderPage();
    await screen.findByText(/PICK-001/i);
    
    fireEvent.click(screen.getByLabelText(/Alistar pedido PICK-001/i));
    expect(Swal.fire).toHaveBeenCalled();
    
    (axios.post as any).mockResolvedValue({ success: true });
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/preparing-for-pickup'), {});
    });
  });

  it('allows marking an order as ready', async () => {
    renderPage();
    await screen.findByText(/PICK-001/i);
    
    fireEvent.click(screen.getByLabelText(/Notificar listo pedido PICK-001/i));
    expect(Swal.fire).toHaveBeenCalled();
    
    (axios.post as any).mockResolvedValue({ success: true });
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/ready-for-pickup'), {});
    });
  });

  it('allows marking an order as collected', async () => {
    renderPage();
    await screen.findByText(/PICK-002/i);
    
    fireEvent.click(screen.getByLabelText(/Entregar pedido PICK-002/i));
    expect(Swal.fire).toHaveBeenCalled();
    
    (axios.post as any).mockResolvedValue({ success: true });
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/collected'), {});
    });
  });

  it('allows marking an order as unclaimed', async () => {
    renderPage();
    await screen.findByText(/PICK-002/i);
    
    fireEvent.click(screen.getByLabelText(/Marcar no reclamado pedido PICK-002/i));
    expect(Swal.fire).toHaveBeenCalled();
    
    (axios.post as any).mockResolvedValue({ success: true });
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/unclaimed-pickup'), {});
    });
  });

  it('refreshes list when clicking refresh button', async () => {
    renderPage();
    await screen.findByText(/PICK-001/i);
    
    fireEvent.click(screen.getByLabelText(/Actualizar Listado/i));
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it('handles empty state', async () => {
    (axios.get as any).mockResolvedValue({ data: [] });
    renderPage();
    expect(await screen.findByText(/No hay pedidos para retirar/i)).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    (axios.get as any).mockRejectedValue(new Error('API Error'));
    renderPage();
    // Swal should be called for error
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith('Error', expect.any(String), 'error'));
  });
});
