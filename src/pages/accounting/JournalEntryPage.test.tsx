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
  getJournalEntries: vi.fn(),
  exportToExcel: vi.fn(),
}));
vi.mock('../../services/errorApi', () => ({ logError: vi.fn() }));
vi.mock('sweetalert2', () => ({ default: { fire: vi.fn().mockResolvedValue({ isConfirmed: false }) } }));
vi.mock('../../components/common/PageHeader', () => ({ default: ({ title }: any) => <h1>{title}</h1> }));
vi.mock('../../components/ui', () => ({
  DataTable: ({ data, emptyMessage }: any) => (
    <div data-testid="data-table">
      {data.length === 0 ? emptyMessage : data.map((r: any) => <div key={r.id}>{r.entry_number || 'je-' + r.id}</div>)}
    </div>
  ),
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  StatusBadge: ({ label }: any) => <span>{label}</span>,
  LoadingSpinner: ({ text }: any) => <div>{text}</div>,
  FormField: ({ label }: any) => <label>{label}</label>,
}));

import JournalEntryPage from './JournalEntryPage';
import * as accountingApi from '../../services/accountingApi';

describe('JournalEntryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (accountingApi.getJournalEntries as any).mockResolvedValue([
      { id: 1, entry_number: 'AC-000001', entry_date: '2026-04-01', source_type: 'MANUAL', status: 'POSTED', lines: [] },
    ]);
  });

  const renderPage = () => render(<BrowserRouter><JournalEntryPage /></BrowserRouter>);

  it('renders page title', () => {
    renderPage();
    expect(screen.getByText('Asientos Contables')).toBeInTheDocument();
  });

  it('calls getJournalEntries on mount', async () => {
    renderPage();
    await waitFor(() => { expect(accountingApi.getJournalEntries).toHaveBeenCalled(); });
  });

  it('shows loading state', () => {
    (accountingApi.getJournalEntries as any).mockImplementation(() => new Promise(() => {}));
    renderPage();
    expect(screen.getByText('Cargando asientos contables...')).toBeInTheDocument();
  });

  it('shows error on fetch failure', async () => {
    (accountingApi.getJournalEntries as any).mockRejectedValue(new Error('boom'));
    renderPage();
    await waitFor(() => { expect(screen.getByText('Error al cargar asientos contables.')).toBeInTheDocument(); });
  });
});
