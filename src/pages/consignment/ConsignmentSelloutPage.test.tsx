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

vi.mock('../../services/consignmentSelloutApi', () => ({
  previewSellout: vi.fn(),
  processSellout: vi.fn(),
  generateDianForOrder: vi.fn(),
  parseSelloutCsv: vi.fn(() => [
    { sku: '', reference: 'CAM-001', color: 'Azul', size: 'M', quantity: 3 },
    { sku: '', reference: 'CAM-001', color: 'Negro', size: 'L', quantity: 2 },
  ]),
}));
vi.mock('../../services/consignmentWarehouseApi', () => ({
  getWarehouses: vi.fn(),
}));
vi.mock('../../services/customerApi', () => ({
  getCustomers: vi.fn(),
}));
vi.mock('../../services/errorApi', () => ({ logError: vi.fn() }));
vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn().mockResolvedValue({ isConfirmed: false }) },
}));
vi.mock('../../components/common/PageHeader', () => ({
  default: ({ title }: any) => <h1>{title}</h1>,
}));
vi.mock('../../components/ui', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  LoadingSpinner: ({ text }: any) => <div>{text}</div>,
}));

import ConsignmentSelloutPage from './ConsignmentSelloutPage';
import * as customerApi from '../../services/customerApi';
import * as whApi from '../../services/consignmentWarehouseApi';

describe('ConsignmentSelloutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (customerApi.getCustomers as any).mockResolvedValue([
      { id: 1, name: 'Ally Uno', is_consignment_ally: true },
    ]);
    (whApi.getWarehouses as any).mockResolvedValue([
      { id: 10, name: 'Bodega Norte', id_customer: 1, is_active: true },
    ]);
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <ConsignmentSelloutPage />
      </BrowserRouter>,
    );

  it('shows loading initially', () => {
    (customerApi.getCustomers as any).mockImplementation(() => new Promise(() => {}));
    renderPage();
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('renders title after load', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Procesar Sell-out')).toBeInTheDocument();
    });
  });

  it('loads customers and warehouses on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(customerApi.getCustomers).toHaveBeenCalled();
      expect(whApi.getWarehouses).toHaveBeenCalled();
    });
  });

  it('renders step sections (cliente/bodega, reporte)', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Cliente y bodega/i)).toBeInTheDocument();
      expect(screen.getByText(/Reporte de ventas/i)).toBeInTheDocument();
    });
  });

  it('renders ally customer in the dropdown but not retail ones', async () => {
    (customerApi.getCustomers as any).mockResolvedValue([
      { id: 1, name: 'Ally Uno', is_consignment_ally: true },
      { id: 2, name: 'Retail X', is_consignment_ally: false },
    ]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Ally Uno')).toBeInTheDocument();
    });
    expect(screen.queryByText('Retail X')).not.toBeInTheDocument();
  });
});
