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
  listManualDianInvoices: vi.fn(),
}));
vi.mock('../../services/errorApi', () => ({ logError: vi.fn() }));
vi.mock('sweetalert2', () => ({ default: { fire: vi.fn().mockResolvedValue({ isConfirmed: false }) } }));
vi.mock('../../components/common/PageHeader', () => ({ default: ({ title, children }: any) => <h1>{title}{children}</h1> }));
vi.mock('../../components/ui/Button', () => ({ default: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button> }));

import ManualInvoiceListPage from './ManualInvoiceListPage';
import * as accountingApi from '../../services/accountingApi';

describe('ManualInvoiceListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (accountingApi.listManualDianInvoices as any).mockResolvedValue([
      { id: 1, document_number: 'FRM-001', status: 'AUTHORIZED', issue_date: '2026-04-01', customer: { name: 'Test', doc_type: 'NIT', doc_number: '900' }, subtotal: 100000, iva_total: 19000, total: 119000, items_count: 2, cash_receipt: null, journal_entry: null },
    ]);
  });

  const renderPage = () => render(<BrowserRouter><ManualInvoiceListPage /></BrowserRouter>);

  it('renders page title', () => {
    renderPage();
    expect(screen.getByText('Regularizaciones DIAN')).toBeInTheDocument();
  });

  it('calls listManualDianInvoices on mount', async () => {
    renderPage();
    await waitFor(() => { expect(accountingApi.listManualDianInvoices).toHaveBeenCalled(); });
  });

  it('displays invoice rows after loading', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('FRM-001')).toBeInTheDocument(); });
  });
});
