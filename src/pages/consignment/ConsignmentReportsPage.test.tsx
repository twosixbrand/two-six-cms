import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConsignmentReportsPage from './ConsignmentReportsPage';
import * as reportsApi from '../../services/consignmentReportsApi';

vi.mock('../../services/consignmentReportsApi');
vi.mock('../../services/errorApi');

describe('ConsignmentReportsPage Integration', () => {
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
        total_merma_orders: 5,
        total_merma_units: 10,
        total_merma_amount: 500000,
        total_warranty_returns: 2,
        total_warranty_units: 3,
      },
    });
    (reportsApi.getPendingReconciliation as any).mockResolvedValue({
      threshold_days: 30,
      pending_count: 1,
      warehouses: [
        {
          warehouse_id: 10,
          warehouse_name: 'Bodega Norte',
          customer_name: 'Ally Uno',
          last_count_date: '2026-01-01',
          days_since_last_count: 90,
          current_stock_units: 100,
          never_counted: false,
        }
      ],
    });
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <ConsignmentReportsPage />
      </BrowserRouter>,
    );

  it('renders page header and data', async () => {
    renderPage();
    expect(await screen.findByText('Reportes de Consignación')).toBeInTheDocument();
    expect(await screen.findByText('Ally Uno')).toBeInTheDocument();
    expect(screen.getByText('Bodega Norte')).toBeInTheDocument();
  });

  it('switches to "Mermas y Garantías" tab', async () => {
    renderPage();
    await screen.findByText('Ally Uno');
    
    fireEvent.click(screen.getByText('Mermas y Garantías'));
    await waitFor(() => {
      expect(reportsApi.getLossReport).toHaveBeenCalled();
    });
    expect(await screen.findByText('Mermas facturadas')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // total_merma_orders
  });

  it('switches to "Conciliación Pendiente" tab', async () => {
    renderPage();
    await screen.findByText('Ally Uno');
    
    fireEvent.click(screen.getByText('Conciliación Pendiente'));
    await waitFor(() => {
      expect(reportsApi.getPendingReconciliation).toHaveBeenCalled();
    });
    expect(await screen.findByText(/1 bodega\(s\) con conciliación pendiente/)).toBeInTheDocument();
    expect(screen.getByText('90')).toBeInTheDocument();
  });
});
