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
  getExpenses: vi.fn(),
  getExpenseCategories: vi.fn(),
  markExpensePaid: vi.fn(),
  deleteExpense: vi.fn(),
}));
vi.mock('../../services/errorApi', () => ({ logError: vi.fn() }));
vi.mock('sweetalert2', () => ({ default: { fire: vi.fn().mockResolvedValue({ isConfirmed: false }) } }));
vi.mock('../../components/common/PageHeader', () => ({ default: ({ title }: any) => <h1>{title}</h1> }));
vi.mock('../../components/ui', () => ({
  DataTable: ({ data, emptyMessage }: any) => (
    <div data-testid="data-table">
      {data.length === 0 ? emptyMessage : data.map((r: any) => <div key={r.id}>{r.description || 'exp-' + r.id}</div>)}
    </div>
  ),
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  StatusBadge: ({ label }: any) => <span>{label}</span>,
  LoadingSpinner: ({ text }: any) => <div>{text}</div>,
}));

import ExpensePage from './ExpensePage';
import * as accountingApi from '../../services/accountingApi';

describe('ExpensePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (accountingApi.getExpenses as any).mockResolvedValue({
      data: [{ id: 1, description: 'Insumos', expense_date: '2026-04-01', amount: 50000, status: 'PENDING' }],
      total: 1,
    });
    (accountingApi.getExpenseCategories as any).mockResolvedValue(['INSUMOS', 'SERVICIOS']);
  });

  const renderPage = () => render(<BrowserRouter><ExpensePage /></BrowserRouter>);

  it('renders page title', () => {
    renderPage();
    expect(screen.getByText('Gastos / Compras')).toBeInTheDocument();
  });

  it('calls getExpenses and getExpenseCategories on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(accountingApi.getExpenses).toHaveBeenCalled();
      expect(accountingApi.getExpenseCategories).toHaveBeenCalled();
    });
  });

  it('shows error on fetch failure', async () => {
    (accountingApi.getExpenses as any).mockRejectedValue(new Error('boom'));
    renderPage();
    await waitFor(() => { expect(screen.getByText('Error al cargar gastos.')).toBeInTheDocument(); });
  });
});
