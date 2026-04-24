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

vi.mock('../../services/consignmentSellReportApi', () => ({
  getSellReports: vi.fn(),
  getSellReport: vi.fn(),
  approveSellReport: vi.fn(),
  rejectSellReport: vi.fn(),
}));
vi.mock('../../services/consignmentSelloutApi', () => ({
  generateDianForOrder: vi.fn(),
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
      {data.length === 0 ? emptyMessage : data.map((r: any) => <div key={r.id}>{r.customer?.name || 'rpt-' + r.id}</div>)}
    </div>
  ),
  Modal: ({ isOpen, children }: any) => (isOpen ? <div role="dialog">{children}</div> : null),
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  SearchInput: () => <input />,
  LoadingSpinner: ({ text }: any) => <div>{text}</div>,
}));

import ConsignmentSellReportsPage from './ConsignmentSellReportsPage';
import * as reportApi from '../../services/consignmentSellReportApi';

describe('ConsignmentSellReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (reportApi.getSellReports as any).mockResolvedValue([
      { id: 1, status: 'PENDING', customer: { id: 1, name: 'Aliado Sur' }, warehouse: { name: 'B1' }, createdAt: '2026-04-01', items: [] },
    ]);
  });

  const renderPage = () => render(<BrowserRouter><ConsignmentSellReportsPage /></BrowserRouter>);

  it('renders page title', () => {
    renderPage();
    expect(screen.getByText('Reportes de Venta del Cliente')).toBeInTheDocument();
  });

  it('calls getSellReports on mount', async () => {
    renderPage();
    await waitFor(() => { expect(reportApi.getSellReports).toHaveBeenCalled(); });
  });

  it('displays report rows after loading', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Aliado Sur')).toBeInTheDocument(); });
  });

  it('shows loading state initially', () => {
    (reportApi.getSellReports as any).mockImplementation(() => new Promise(() => {}));
    renderPage();
    expect(screen.getByText('Cargando reportes...')).toBeInTheDocument();
  });

  it('shows error on fetch failure', async () => {
    (reportApi.getSellReports as any).mockRejectedValue(new Error('boom'));
    renderPage();
    await waitFor(() => { expect(screen.getByText('Error al cargar los reportes.')).toBeInTheDocument(); });
  });
});
