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

vi.mock('../../services/consignmentCycleCountApi', () => ({
  getCycleCounts: vi.fn(),
  getCycleCount: vi.fn(),
  createCycleCount: vi.fn(),
  saveCycleCountItems: vi.fn(),
  approveCycleCount: vi.fn(),
  cancelCycleCount: vi.fn(),
  createMermaInvoice: vi.fn(),
}));
vi.mock('../../services/consignmentWarehouseApi', () => ({
  getWarehouses: vi.fn(),
}));
vi.mock('../../services/consignmentSelloutApi', () => ({
  generateDianForOrder: vi.fn(),
  parseSelloutCsv: vi.fn(),
  previewSellout: vi.fn(),
  processSellout: vi.fn(),
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
      {data.length === 0 ? emptyMessage : data.map((r: any) => <div key={r.id}>count-{r.id}</div>)}
    </div>
  ),
  Modal: ({ isOpen, children }: any) => (isOpen ? <div role="dialog">{children}</div> : null),
  FormField: ({ label }: any) => <label>{label}</label>,
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  SearchInput: () => <input />,
  LoadingSpinner: ({ text }: any) => <div>{text}</div>,
}));

import ConsignmentCycleCountPage from './ConsignmentCycleCountPage';
import * as ccApi from '../../services/consignmentCycleCountApi';
import * as whApi from '../../services/consignmentWarehouseApi';

describe('ConsignmentCycleCountPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (ccApi.getCycleCounts as any).mockResolvedValue([
      {
        id: 1,
        status: 'DRAFT',
        id_warehouse: 10,
        warehouse: { id: 10, name: 'B1', customer: { id: 1, name: 'Ally' } },
        items: [{ id: 1, theoretical_qty: 5 }],
      },
    ]);
    (whApi.getWarehouses as any).mockResolvedValue([
      { id: 10, name: 'B1', id_customer: 1, is_active: true, customer: { id: 1, name: 'Ally' } },
    ]);
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <ConsignmentCycleCountPage />
      </BrowserRouter>,
    );

  it('renders title', () => {
    renderPage();
    expect(screen.getByText('Conciliación de Inventario')).toBeInTheDocument();
  });

  it('calls getCycleCounts and getWarehouses on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(ccApi.getCycleCounts).toHaveBeenCalled();
      expect(whApi.getWarehouses).toHaveBeenCalled();
    });
  });

  it('displays cycle count rows', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('count-1')).toBeInTheDocument();
    });
  });

  it('shows loading initially', () => {
    (ccApi.getCycleCounts as any).mockImplementation(() => new Promise(() => {}));
    renderPage();
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('shows error on fetch failure', async () => {
    (ccApi.getCycleCounts as any).mockRejectedValue(new Error('boom'));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Error al cargar los conteos.')).toBeInTheDocument();
    });
  });
});
