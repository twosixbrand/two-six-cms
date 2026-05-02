import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OrderPage from './OrderPage';
import * as orderApi from '../services/orderApi';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock('../services/orderApi');
vi.mock('../services/errorApi');

const mockOrders = [
  {
    id: 1,
    order_reference: 'ORD-001',
    customer: { name: 'Alice Smith' },
    order_date: '2023-01-01',
    status: 'Pagado',
    total_payment: 100000,
    delivery_method: 'SHIPPING',
    is_paid: true,
  },
  {
    id: 2,
    order_reference: 'ORD-002',
    customer: { name: 'Bob Jones' },
    order_date: '2023-01-02',
    status: 'Pendiente',
    total_payment: 50000,
    delivery_method: 'PICKUP',
    is_paid: false,
  },
];

describe('OrderPage Integration', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
    (orderApi.getOrders as any).mockResolvedValue(mockOrders);
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <OrderPage />
      </BrowserRouter>,
    );

  it('renders orders table', async () => {
    renderPage();
    expect(await screen.findByText('ORD-001')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('ORD-002')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('filters orders by search term', async () => {
    renderPage();
    await screen.findByText('ORD-001');
    
    const searchInput = screen.getByPlaceholderText(/Buscar por referencia/i);
    fireEvent.change(searchInput, { target: { value: 'Alice' } });
    
    await waitFor(() => {
      expect(screen.getByText('ORD-001')).toBeInTheDocument();
      expect(screen.queryByText('ORD-002')).not.toBeInTheDocument();
    });
  });

  it('filters orders by tabs', async () => {
    renderPage();
    await screen.findByText('ORD-001');
    
    const pickupTab = screen.getByLabelText(/Filtrar por Para Recoger/i);
    fireEvent.click(pickupTab);
    
    await waitFor(() => {
      expect(screen.queryByText('ORD-001')).not.toBeInTheDocument();
      expect(screen.getByText('ORD-002')).toBeInTheDocument();
    });
  });

  it('navigates to order detail', async () => {
    renderPage();
    await screen.findByText('ORD-001');
    
    const viewBtn = screen.getByLabelText(/Ver detalle pedido ORD-001/i);
    fireEvent.click(viewBtn);
    
    expect(mockNavigate).toHaveBeenCalledWith('/order/1');
  });

  it('opens transport guide modal', async () => {
    renderPage();
    await screen.findByText('ORD-001');
    
    const guideBtn = screen.getByLabelText(/Gestionar guia pedido ORD-001/i);
    (orderApi.getOrder as any).mockResolvedValue(mockOrders[0]);
    
    fireEvent.click(guideBtn);
    
    await waitFor(() => {
      expect(orderApi.getOrder).toHaveBeenCalledWith(1);
    });
  });

  it('handles API errors gracefully', async () => {
    (orderApi.getOrders as any).mockRejectedValue(new Error('API Error'));
    renderPage();
    expect(await screen.findByText(/Error al cargar los pedidos/i)).toBeInTheDocument();
  });
});
