import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConsignmentPaymentsPage from './ConsignmentPaymentsPage';
import * as paymentApi from '../../services/consignmentPaymentApi';
import Swal from 'sweetalert2';

vi.mock('../../services/consignmentPaymentApi');
vi.mock('../../services/errorApi');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

const mockPayments = [
  {
    id: 1,
    id_customer: 1,
    id_order: 101,
    amount: 500000,
    payment_method: 'TRANSFERENCIA',
    status: 'PENDING',
    createdAt: '2026-04-01T10:00:00Z',
    customer: { id: 1, name: 'Cliente A' },
    order: { id: 101, order_reference: 'ORD-001', status: 'PENDIENTE_PAGO', total_payment: 500000 },
  },
];

describe('ConsignmentPaymentsPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (paymentApi.getPayments as any).mockResolvedValue(mockPayments);
    (paymentApi.getPayment as any).mockImplementation((id: number) => 
      Promise.resolve(mockPayments.find(p => p.id === id))
    );
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <ConsignmentPaymentsPage />
      </BrowserRouter>,
    );

  it('renders page header and displays payments', async () => {
    renderPage();
    expect(await screen.findByText('Pagos de Consignación')).toBeInTheDocument();
    expect(await screen.findByText('Cliente A')).toBeInTheDocument();
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
  });

  it('filters payments by status', async () => {
    renderPage();
    await screen.findByText('Cliente A');
    
    const statusSelect = screen.getByRole('combobox');
    fireEvent.change(statusSelect, { target: { value: 'APPROVED' } });
    
    await waitFor(() => {
      expect(paymentApi.getPayments).toHaveBeenCalledWith({ status: 'APPROVED' });
    });
  });

  describe('Actions', () => {
    it('opens detail modal', async () => {
      renderPage();
      await screen.findByText('Cliente A');
      
      const row = screen.getByText('Cliente A').closest('tr')!;
      const viewBtn = within(row).getByRole('button', { name: 'Ver detalle' });
      fireEvent.click(viewBtn);
      
      expect(await screen.findByText('Pago #1')).toBeInTheDocument();
      expect(screen.getByText('Monto pago:')).toBeInTheDocument();
    });

    it('approves a payment', async () => {
      (paymentApi.approvePayment as any).mockResolvedValue({ success: true });
      renderPage();
      await screen.findByText('Cliente A');
      
      const row = screen.getByText('Cliente A').closest('tr')!;
      const approveBtn = within(row).getByRole('button', { name: 'Aprobar' });
      fireEvent.click(approveBtn);
      
      await waitFor(() => {
        expect(paymentApi.approvePayment).toHaveBeenCalledWith(1);
      });
    });

    it('rejects a payment', async () => {
      (paymentApi.rejectPayment as any).mockResolvedValue({ success: true });
      (Swal.fire as any).mockResolvedValue({ value: 'Motivo de rechazo' });
      
      renderPage();
      await screen.findByText('Cliente A');
      
      const row = screen.getByText('Cliente A').closest('tr')!;
      const rejectBtn = within(row).getByRole('button', { name: 'Rechazar' });
      fireEvent.click(rejectBtn);
      
      await waitFor(() => {
        expect(paymentApi.rejectPayment).toHaveBeenCalledWith(1, 'Motivo de rechazo');
      });
    });
  });
});
