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

vi.mock('../../services/consignmentReturnApi', () => ({
  getReturns: vi.fn(),
  getReturn: vi.fn(),
  createReturn: vi.fn(),
  processReturn: vi.fn(),
  cancelReturn: vi.fn(),
  deleteReturn: vi.fn(),
  attachCreditNote: vi.fn(),
  generateDianCreditNote: vi.fn(),
}));
vi.mock('../../services/consignmentWarehouseApi', () => ({
  getWarehouses: vi.fn(),
}));
vi.mock('../../services/customerApi', () => ({
  getCustomers: vi.fn(),
}));
vi.mock('../../services/productApi', () => ({
  getProducts: vi.fn(),
}));
vi.mock('../../services/orderApi', () => ({
  getOrders: vi.fn(),
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
      {data.length === 0 ? emptyMessage : data.map((r: any) => <div key={r.id}>return-{r.id}</div>)}
    </div>
  ),
  Modal: ({ isOpen, children }: any) => (isOpen ? <div role="dialog">{children}</div> : null),
  FormField: ({ label }: any) => <label>{label}</label>,
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  SearchInput: () => <input />,
  LoadingSpinner: ({ text }: any) => <div>{text}</div>,
}));

import ConsignmentReturnPage from './ConsignmentReturnPage';
import * as returnApi from '../../services/consignmentReturnApi';
import * as whApi from '../../services/consignmentWarehouseApi';
import * as customerApi from '../../services/customerApi';
import * as productApi from '../../services/productApi';
import * as orderApi from '../../services/orderApi';

describe('ConsignmentReturnPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (returnApi.getReturns as any).mockResolvedValue([
      {
        id: 1,
        return_type: 'PORTFOLIO',
        status: 'DRAFT',
        id_warehouse: 10,
        warehouse: { id: 10, name: 'B1', customer: { id: 1, name: 'Ally' } },
        items: [{ id: 1, quantity: 2 }],
      },
    ]);
    (whApi.getWarehouses as any).mockResolvedValue([]);
    (customerApi.getCustomers as any).mockResolvedValue([]);
    (productApi.getProducts as any).mockResolvedValue([]);
    (orderApi.getOrders as any).mockResolvedValue([]);
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <ConsignmentReturnPage />
      </BrowserRouter>,
    );

  it('renders title', () => {
    renderPage();
    expect(screen.getByText('Devoluciones y Garantías')).toBeInTheDocument();
  });

  it('calls all dependent APIs on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(returnApi.getReturns).toHaveBeenCalled();
      expect(whApi.getWarehouses).toHaveBeenCalled();
      expect(customerApi.getCustomers).toHaveBeenCalled();
      expect(productApi.getProducts).toHaveBeenCalled();
      expect(orderApi.getOrders).toHaveBeenCalled();
    });
  });

  it('displays return rows after loading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('return-1')).toBeInTheDocument();
    });
  });

  it('shows loading initially', () => {
    (returnApi.getReturns as any).mockImplementation(() => new Promise(() => {}));
    renderPage();
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('shows error on fetch failure', async () => {
    (returnApi.getReturns as any).mockRejectedValue(new Error('boom'));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Error al cargar devoluciones.')).toBeInTheDocument();
    });
  });
});
