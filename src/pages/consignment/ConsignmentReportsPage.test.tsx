import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

vi.mock('../../services/consignmentReportsApi', () => ({
  getInventoryByCustomer: vi.fn(),
  getLossReport: vi.fn(),
  getPendingReconciliation: vi.fn(),
}));
vi.mock('../../services/errorApi', () => ({ logError: vi.fn() }));
vi.mock('../../components/common/PageHeader', () => ({
  default: ({ title }: any) => <h1>{title}</h1>,
}));
vi.mock('../../components/ui', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  LoadingSpinner: ({ text }: any) => <div>{text}</div>,
}));

import ConsignmentReportsPage from './ConsignmentReportsPage';
import * as reportsApi from '../../services/consignmentReportsApi';

describe('ConsignmentReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (reportsApi.getInventoryByCustomer as any).mockResolvedValue([
      {
        id: 1,
        name: 'Ally Uno',
        document_number: '900000',
        warehouses: [
          {
            id: 10,
            name: 'Bodega Norte',
            is_active: true,
            current_pending_reception: 5,
            current_in_consignment: 10,
            total_dispatched_received: 15,
            total_returned: { PORTFOLIO: 1, WARRANTY: 0, POST_SALE: 0 },
          },
        ],
        totals: { sellout_orders: 2, sellout_total_invoiced: 100000, sellout_units: 5 },
      },
    ]);
    (reportsApi.getLossReport as any).mockResolvedValue({
      merma_orders: [],
      warranty_returns: [],
      by_customer: [],
      summary: {
        total_merma_orders: 0,
        total_merma_units: 0,
        total_merma_amount: 0,
        total_warranty_returns: 0,
        total_warranty_units: 0,
      },
    });
    (reportsApi.getPendingReconciliation as any).mockResolvedValue({
      threshold_days: 30,
      pending_count: 0,
      warehouses: [],
    });
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <ConsignmentReportsPage />
      </BrowserRouter>,
    );

  it('renders title', () => {
    renderPage();
    expect(screen.getByText('Reportes de Consignación')).toBeInTheDocument();
  });

  it('loads inventory report on mount (default tab)', async () => {
    renderPage();
    await waitFor(() => {
      expect(reportsApi.getInventoryByCustomer).toHaveBeenCalled();
    });
  });

  it('displays customer in inventory tab', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Ally Uno')).toBeInTheDocument();
      expect(screen.getByText('Bodega Norte')).toBeInTheDocument();
    });
  });

  it('switches to losses tab and loads loss report', async () => {
    renderPage();
    await waitFor(() => expect(reportsApi.getInventoryByCustomer).toHaveBeenCalled());
    fireEvent.click(screen.getByText('Mermas y Garantías'));
    await waitFor(() => {
      expect(reportsApi.getLossReport).toHaveBeenCalled();
    });
  });

  it('switches to pending tab and loads pending reconciliation', async () => {
    renderPage();
    await waitFor(() => expect(reportsApi.getInventoryByCustomer).toHaveBeenCalled());
    fireEvent.click(screen.getByText('Conciliación Pendiente'));
    await waitFor(() => {
      expect(reportsApi.getPendingReconciliation).toHaveBeenCalled();
    });
  });
});
