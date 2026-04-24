import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false, media: query, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
  })),
});

vi.mock('../../services/consignmentPaymentApi', () => ({
  getPayments: vi.fn(),
  getPayment: vi.fn(),
  approvePayment: vi.fn(),
  rejectPayment: vi.fn(),
}));
vi.mock('../../services/errorApi', () => ({ logError: vi.fn() }));
vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn().mockResolvedValue({ isConfirmed: false }) },
}));
vi.mock('../../components/common/PageHeader', () => ({
  default: ({ title }: any) => <h1>{title}</h1>,
}));
vi.mock('../../components/ui', () => ({
  DataTable: ({ data, emptyMessage }: any) => (
    <div data-testid="data-table">
      {data.length === 0 ? emptyMessage : data.map((r: any) => <div key={r.id}>{r.customer?.name || 'pay-' + r.id}</div>)}
    </div>
  ),
  Modal: ({ isOpen, children }: any) => (isOpen ? <div role="dialog">{children}</div> : null),
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  SearchInput: () => <input />,
  LoadingSpinner: ({ text }: any) => <div>{text}</div>,
}));

import ConsignmentPaymentsPage from './ConsignmentPaymentsPage';
import * as paymentApi from '../../services/consignmentPaymentApi';

describe('ConsignmentPaymentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (paymentApi.getPayments as any).mockResolvedValue([
      { id: 1, amount: 500000, status: 'PENDING', customer: { id: 1, name: 'Ally Norte' }, createdAt: '2026-04-01' },
    ]);
  });

  const renderPage = () => render(<BrowserRouter><ConsignmentPaymentsPage /></BrowserRouter>);

  it('renders page title', () => {
    renderPage();
    expect(screen.getByText('Pagos de Consignación')).toBeInTheDocument();
  });

  it('calls getPayments on mount', async () => {
    renderPage();
    await waitFor(() => { expect(paymentApi.getPayments).toHaveBeenCalled(); });
  });

  it('displays payment rows after loading', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Ally Norte')).toBeInTheDocument(); });
  });

  it('shows loading state initially', () => {
    (paymentApi.getPayments as any).mockImplementation(() => new Promise(() => {}));
    renderPage();
    expect(screen.getByText('Cargando pagos...')).toBeInTheDocument();
  });

  it('shows error on fetch failure', async () => {
    (paymentApi.getPayments as any).mockRejectedValue(new Error('boom'));
    renderPage();
    await waitFor(() => { expect(screen.getByText('Error al cargar los pagos.')).toBeInTheDocument(); });
  });
});
