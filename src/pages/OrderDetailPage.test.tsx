import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useParams, useNavigate } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OrderDetailPage from './OrderDetailPage';
import * as orderApi from '../services/orderApi';
import * as dianApi from '../services/dianApi';
import Swal from 'sweetalert2';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
  };
});

vi.mock('../services/orderApi');
vi.mock('../services/dianApi');
vi.mock('../services/errorApi');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

// Mock window.confirm and alert
window.confirm = vi.fn().mockReturnValue(true);
window.alert = vi.fn();

const mockOrder = {
  id: 123,
  order_reference: 'ORD-123',
  order_date: '2023-01-01T10:00:00Z',
  total_payment: 150000,
  is_paid: true,
  status: 'Pagado',
  delivery_method: 'PICKUP',
  pickup_status: 'PENDING',
  pickup_pin: '9876',
  customer: {
    name: 'Juan Perez',
    email: 'juan@example.com',
    current_phone_number: '3001234567',
    city: 'Bogotá',
    state: 'Cundinamarca',
  },
  orderItems: [
    {
      id: 1,
      product_name: 'Camiseta Cool',
      size: 'M',
      color: 'Azul',
      quantity: 2,
      unit_price: 50000,
      product: { image_url: 'http://example.com/img.jpg' },
    },
  ],
  payments: [
    {
      id: 10,
      paymentMethod: { name: 'Wompi' },
      transaction_reference: 'TX-001',
      status: 'APPROVED',
      transaction_date: '2023-01-01T10:05:00Z',
    },
  ],
  dianEInvoicing: null,
};

describe('OrderDetailPage Integration', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useParams as any).mockReturnValue({ id: '123' });
    (useNavigate as any).mockReturnValue(mockNavigate);
    (orderApi.getOrder as any).mockResolvedValue(mockOrder);
  }, 15000); // Increased timeout for setup

  const renderPage = () =>
    render(
      <BrowserRouter>
        <OrderDetailPage />
      </BrowserRouter>,
    );

  it('renders order details correctly', async () => {
    renderPage();
    expect(await screen.findByText(/Detalle del Pedido ORD-123/i, {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText('Juan Perez')).toBeInTheDocument();
  }, 15000);

  it('allows updating order status', async () => {
    renderPage();
    await screen.findByText(/Detalle del Pedido ORD-123/i);
    const select = screen.getByLabelText(/Estado del Pedido:/i);
    fireEvent.change(select, { target: { value: 'Entregado' } });
    const saveBtn = screen.getByRole('button', { name: /Actualizar Estado/i });
    await waitFor(() => expect(saveBtn).not.toBeDisabled());
    (orderApi.updateOrder as any).mockResolvedValue({ success: true });
    (orderApi.getOrder as any).mockResolvedValue({ ...mockOrder, status: 'Entregado' });
    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(orderApi.updateOrder).toHaveBeenCalledWith('123', { status: 'Entregado' });
    });
  }, 15000);

  it('manages pickup status actions (Preparing, Ready, Unclaimed)', async () => {
    renderPage();
    await screen.findByText(/Detalle del Pedido ORD-123/i);
    
    fireEvent.click(screen.getByLabelText(/Preparar pedido/i));
    await waitFor(() => expect(orderApi.markAsPreparingForPickup).toHaveBeenCalledWith('123'));
    
    fireEvent.click(screen.getByLabelText(/Notificar listo para recoger/i));
    await waitFor(() => expect(orderApi.markAsReadyForPickup).toHaveBeenCalledWith('123'));
    
    fireEvent.click(screen.getByLabelText(/Marcar como no reclamado/i));
    await waitFor(() => expect(orderApi.markAsUnclaimedForPickup).toHaveBeenCalledWith('123'));
  }, 15000);

  it('handles WOMPI_COD specific UI and confirmation', async () => {
    const codOrder = {
      ...mockOrder,
      payment_method: 'WOMPI_COD',
      status: 'Enviado',
      cod_amount: 155000,
      delivery_method: 'SHIPPING',
    };
    (orderApi.getOrder as any).mockResolvedValue(codOrder);
    
    renderPage();
    expect(await screen.findByText(/PEDIDO PAGO CONTRA ENTREGA/i)).toBeInTheDocument();
    
    fireEvent.click(screen.getByLabelText(/Confirmar recaudo/i));
    
    await waitFor(() => {
      expect(orderApi.updateOrder).toHaveBeenCalledWith('123', { status: 'Pagado' });
    });
  }, 15000);

  it('allows generating DIAN invoice and handles success', async () => {
    renderPage();
    await screen.findByRole('button', { name: /Generar Factura Electrónica/i });
    (dianApi.createDianInvoice as any).mockResolvedValue({ id: 501 });
    fireEvent.click(screen.getByRole('button', { name: /Generar Factura Electrónica/i }));
    await waitFor(() => expect(dianApi.createDianInvoice).toHaveBeenCalled());
  }, 15000);

  it('manages existing DIAN invoice (PDF, XML, Retry, Sync)', async () => {
    const orderWithInvoice = {
      ...mockOrder,
      dianEInvoicing: {
        id: 501,
        document_number: 'SETT-1',
        status: 'REJECTED',
        cufe_code: 'CUFE-123',
        dian_response: '<b:ZipKey>ZIP-999</b:ZipKey>',
      },
      dianEInvoicings: [
        { id: 501, status: 'REJECTED', document_number: 'SETT-1', createdAt: '2023-01-01', dian_response: '<b:ZipKey>ZIP-999</b:ZipKey>' }
      ]
    };
    (orderApi.getOrder as any).mockResolvedValue(orderWithInvoice);
    
    renderPage();
    await screen.findByText('SETT-1');
    
    fireEvent.click(screen.getByText(/Descargar PDF/i));
    expect(dianApi.downloadInvoicePdf).toHaveBeenCalled();
    
    fireEvent.click(screen.getByText(/Descargar UBL/i));
    expect(dianApi.downloadInvoiceXml).toHaveBeenCalled();
    
    (dianApi.retryInvoice as any).mockResolvedValue({ success: true });
    fireEvent.click(screen.getByText(/Reintentar DIAN/i));
    await waitFor(() => expect(dianApi.retryInvoice).toHaveBeenCalled());
    
    (dianApi.checkInvoiceStatus as any).mockResolvedValue({ isValid: 'true', statusCode: '00' });
    fireEvent.click(screen.getByText(/Verificar Estado/i));
    await waitFor(() => expect(dianApi.checkInvoiceStatus).toHaveBeenCalledWith('ZIP-999'));
  }, 15000);

  it('allows creating credit/debit notes with reasons', async () => {
    const orderWithInvoice = {
      ...mockOrder,
      dianEInvoicing: { id: 501, document_number: 'SETT-1', status: 'AUTHORIZED' },
    };
    (orderApi.getOrder as any).mockResolvedValue(orderWithInvoice);
    
    renderPage();
    await screen.findByText('SETT-1');
    
    fireEvent.click(screen.getByText(/Devolución \(Nota Crédito\)/i));
    fireEvent.change(screen.getByLabelText(/Motivo DIAN:/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Descripción Justificativa:/i), { target: { value: 'Error admin' } });
    fireEvent.click(screen.getByRole('button', { name: /Emitir Nota al DIAN/i }));
    await waitFor(() => expect(dianApi.createCreditNote).toHaveBeenCalledWith(501, expect.objectContaining({ reasonCode: '2' })));
    
    fireEvent.click(screen.getByText(/Ajuste \(Nota Débito\)/i));
    fireEvent.change(screen.getByLabelText(/Motivo DIAN:/i), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: /Emitir Nota al DIAN/i }));
    await waitFor(() => expect(dianApi.createDebitNote).toHaveBeenCalledWith(501, expect.objectContaining({ reasonCode: '3' })));
  }, 15000);

  it('allows verifying status of individual notes', async () => {
    const orderWithNotes = {
      ...mockOrder,
      dianEInvoicing: {
        id: 501,
        document_number: 'SETT-1',
        status: 'AUTHORIZED',
        dianNotes: [
          { id: 701, note_number: 'NC-1', type: 'CREDIT', status: 'SENT' }
        ]
      },
    };
    (orderApi.getOrder as any).mockResolvedValue(orderWithNotes);
    
    renderPage();
    await screen.findByText('NC-1');
    
    (dianApi.syncNoteStatus as any).mockResolvedValue({ isValid: true, statusCode: '00' });
    fireEvent.click(screen.getAllByRole('button', { name: /Verificar/i })[1]); 
    
    await waitFor(() => expect(dianApi.syncNoteStatus).toHaveBeenCalledWith(701));
  }, 15000);

  it('handles API errors gracefully', async () => {
    (orderApi.getOrder as any).mockRejectedValue(new Error('API Error'));
    renderPage();
    expect(await screen.findByText(/Error al cargar el pedido/i)).toBeInTheDocument();
  }, 15000);
});
