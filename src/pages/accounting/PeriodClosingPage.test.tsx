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
  getClosings: vi.fn(),
  closePeriod: vi.fn(),
  annualClose: vi.fn(),
}));
vi.mock('../../services/errorApi', () => ({ logError: vi.fn() }));
vi.mock('sweetalert2', () => ({ default: { fire: vi.fn().mockResolvedValue({ isConfirmed: false }) } }));
vi.mock('../../components/common/PageHeader', () => ({ default: ({ title }: any) => <h1>{title}</h1> }));
vi.mock('../../components/ui/Button', () => ({ default: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button> }));
vi.mock('../../components/ui/FormField', () => ({ default: ({ label }: any) => <label>{label}</label> }));
vi.mock('../../components/ui/LoadingSpinner', () => ({ default: ({ text }: any) => <div>{text}</div> }));

import PeriodClosingPage from './PeriodClosingPage';
import * as accountingApi from '../../services/accountingApi';

describe('PeriodClosingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (accountingApi.getClosings as any).mockResolvedValue([
      { id: 1, year: 2026, month: 1, status: 'CLOSED', closedAt: '2026-02-01T00:00:00Z', closedBy: 'admin' },
    ]);
  });

  const renderPage = () => render(<BrowserRouter><PeriodClosingPage /></BrowserRouter>);

  it('renders page title', () => {
    renderPage();
    expect(screen.getByText('Cierre Contable')).toBeInTheDocument();
  });

  it('calls getClosings on mount', async () => {
    renderPage();
    await waitFor(() => { expect(accountingApi.getClosings).toHaveBeenCalled(); });
  });

  it('shows loading initially', () => {
    (accountingApi.getClosings as any).mockImplementation(() => new Promise(() => {}));
    renderPage();
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });
});
