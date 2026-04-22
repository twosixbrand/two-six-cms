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

vi.mock('../../services/consignmentDispatchApi', () => ({
  getDispatches: vi.fn(),
  getDispatch: vi.fn(),
  createDispatch: vi.fn(),
  sendDispatch: vi.fn(),
  cancelDispatch: vi.fn(),
  deleteDispatch: vi.fn(),
}));
vi.mock('../../services/consignmentWarehouseApi', () => ({
  getWarehouses: vi.fn(),
}));
vi.mock('../../services/productApi', () => ({
  getProducts: vi.fn(),
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
      {data.length === 0 ? emptyMessage : data.map((r: any) => <div key={r.id}>{r.dispatch_number}</div>)}
    </div>
  ),
  Modal: ({ isOpen, children }: any) => (isOpen ? <div role="dialog">{children}</div> : null),
  FormField: ({ label }: any) => <label>{label}</label>,
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  SearchInput: () => <input />,
  LoadingSpinner: ({ text }: any) => <div>{text}</div>,
}));

import ConsignmentDispatchPage from './ConsignmentDispatchPage';
import * as dispatchApi from '../../services/consignmentDispatchApi';
import * as whApi from '../../services/consignmentWarehouseApi';
import * as productApi from '../../services/productApi';

describe('ConsignmentDispatchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (dispatchApi.getDispatches as any).mockResolvedValue([
      {
        id: 1,
        dispatch_number: 'DSP-000001',
        status: 'PENDIENTE',
        id_warehouse: 10,
        qr_token: 'tok-1',
        warehouse: { id: 10, name: 'Bodega Norte', customer: { id: 1, name: 'Ally' } },
        items: [{ id: 1, quantity: 2 }],
      },
    ]);
    (whApi.getWarehouses as any).mockResolvedValue([
      { id: 10, name: 'Bodega Norte', id_customer: 1, is_active: true, customer: { id: 1, name: 'Ally' } },
    ]);
    (productApi.getProducts as any).mockResolvedValue([]);
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <ConsignmentDispatchPage />
      </BrowserRouter>,
    );

  it('renders title', () => {
    renderPage();
    expect(screen.getByText('Despachos de Consignación')).toBeInTheDocument();
  });

  it('loads dispatches, warehouses and products on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(dispatchApi.getDispatches).toHaveBeenCalled();
      expect(whApi.getWarehouses).toHaveBeenCalled();
      expect(productApi.getProducts).toHaveBeenCalled();
    });
  });

  it('displays dispatch rows after loading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('DSP-000001')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    (dispatchApi.getDispatches as any).mockImplementation(() => new Promise(() => {}));
    renderPage();
    expect(screen.getByText('Cargando despachos...')).toBeInTheDocument();
  });

  it('shows error message on fetch failure', async () => {
    (dispatchApi.getDispatches as any).mockRejectedValue(new Error('boom'));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Error al cargar los despachos.')).toBeInTheDocument();
    });
  });
});
