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

vi.mock('../../services/accountingApi', () => ({
  getEmployees: vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  getPayrollPeriods: vi.fn(),
  createPayrollPeriod: vi.fn(),
  calculatePayroll: vi.fn(),
  approvePayroll: vi.fn(),
  getPayrollDetail: vi.fn(),
  getPayrollNovedades: vi.fn(),
  createPayrollNovedad: vi.fn(),
  deletePayrollNovedad: vi.fn(),
  downloadPilaFile: vi.fn(),
}));
vi.mock('../../services/errorApi', () => ({ logError: vi.fn() }));
vi.mock('sweetalert2', () => ({ default: { fire: vi.fn().mockResolvedValue({ isConfirmed: false }) } }));
vi.mock('../../components/common/PageHeader', () => ({ default: ({ title }: any) => <h1>{title}</h1> }));
vi.mock('../../components/ui', () => ({
  DataTable: ({ data, emptyMessage }: any) => (
    <div data-testid="data-table">
      {data.length === 0 ? emptyMessage : data.map((r: any, i: number) => <div key={r.id || i}>{r.name || r.label || 'row-' + i}</div>)}
    </div>
  ),
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  StatusBadge: ({ label }: any) => <span>{label}</span>,
  LoadingSpinner: ({ text }: any) => <div>{text}</div>,
  Modal: ({ isOpen, children }: any) => (isOpen ? <div role="dialog">{children}</div> : null),
}));

import PayrollPage from './PayrollPage';
import * as accountingApi from '../../services/accountingApi';

describe('PayrollPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (accountingApi.getEmployees as any).mockResolvedValue([
      { id: 1, name: 'Juan Pérez', document_number: '1234', salary: 2000000, is_active: true },
    ]);
    (accountingApi.getPayrollPeriods as any).mockResolvedValue([
      { id: 1, label: 'Ene 2026 Q1', start_date: '2026-01-01', end_date: '2026-01-15', status: 'DRAFT' },
    ]);
  });

  const renderPage = () => render(<BrowserRouter><PayrollPage /></BrowserRouter>);

  it('renders page title', () => {
    renderPage();
    expect(screen.getByText('Gestión de Nómina Colombiana')).toBeInTheDocument();
  });

  it('calls getEmployees and getPayrollPeriods on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(accountingApi.getEmployees).toHaveBeenCalled();
      expect(accountingApi.getPayrollPeriods).toHaveBeenCalled();
    });
  });

  it('shows error on employee fetch failure', async () => {
    (accountingApi.getEmployees as any).mockRejectedValue(new Error('fail'));
    renderPage();
    await waitFor(() => { expect(screen.getByText('Error al cargar empleados.')).toBeInTheDocument(); });
  });
});
