import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock('../../services/consignmentWarehouseApi', () => ({
  getWarehouses: vi.fn(),
  getWarehouse: vi.fn(),
  getWarehouseStock: vi.fn(),
  createWarehouse: vi.fn(),
  updateWarehouse: vi.fn(),
  deleteWarehouse: vi.fn(),
}));

vi.mock('../../services/customerApi', () => ({
  getCustomers: vi.fn(),
  updateCustomer: vi.fn(),
}));

vi.mock('../../services/errorApi', () => ({
  logError: vi.fn(),
}));

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn().mockResolvedValue({ isConfirmed: false }) },
}));

vi.mock('../../components/common/PageHeader', () => ({
  default: ({ title }: any) => <h1>{title}</h1>,
}));

vi.mock('../../components/ui', () => ({
  DataTable: ({ data, emptyMessage }: any) => (
    <div data-testid="data-table">
      {data.length === 0 ? emptyMessage : data.map((r: any) => <div key={r.id}>{r.name}</div>)}
    </div>
  ),
  Modal: ({ isOpen, children }: any) => (isOpen ? <div role="dialog">{children}</div> : null),
  FormField: ({ label, value, onChange, name }: any) => (
    <label>
      {label}
      <input value={value} onChange={onChange} name={name} />
    </label>
  ),
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  SearchInput: ({ value, onChange }: any) => (
    <input data-testid="search" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
  LoadingSpinner: ({ text }: any) => <div>{text}</div>,
}));

import ConsignmentWarehousePage from './ConsignmentWarehousePage';
import * as warehouseApi from '../../services/consignmentWarehouseApi';
import * as customerApi from '../../services/customerApi';

const mockCustomers = [
  { id: 1, name: 'Ally Uno', is_consignment_ally: true, document_number: '900000' },
  { id: 2, name: 'Cliente Retail', is_consignment_ally: false },
];

const mockWarehouses = [
  {
    id: 10,
    id_customer: 1,
    name: 'Bodega Norte',
    address: 'Calle 1',
    city: 'Bogotá',
    state: 'Cundinamarca',
    is_active: true,
    customer: mockCustomers[0],
  },
];

describe('ConsignmentWarehousePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (warehouseApi.getWarehouses as any).mockResolvedValue(mockWarehouses);
    (customerApi.getCustomers as any).mockResolvedValue(mockCustomers);
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <ConsignmentWarehousePage />
      </BrowserRouter>,
    );

  it('renders page title', async () => {
    renderPage();
    expect(screen.getByText('Bodegas de Consignación')).toBeInTheDocument();
  });

  it('calls getWarehouses and getCustomers on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(warehouseApi.getWarehouses).toHaveBeenCalled();
      expect(customerApi.getCustomers).toHaveBeenCalled();
    });
  });

  it('displays warehouses after loading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Bodega Norte')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    (warehouseApi.getWarehouses as any).mockImplementation(() => new Promise(() => {}));
    renderPage();
    expect(screen.getByText('Cargando bodegas...')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    (warehouseApi.getWarehouses as any).mockRejectedValue(new Error('boom'));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Error al cargar las bodegas de consignación.')).toBeInTheDocument();
    });
  });
});
