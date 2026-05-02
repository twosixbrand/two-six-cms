import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SubsidiaryLedgerPage from './SubsidiaryLedgerPage';
import * as accountingApi from '../../services/accountingApi';

vi.mock('../../services/accountingApi');
vi.mock('../../services/errorApi');

const mockAccounts = [
  { id: 1, code: '110505', name: 'Caja General' },
  { id: 2, code: '111005', name: 'Bancos Nacionales' },
];

const mockReportData = {
  account_code: '110505',
  account_name: 'Caja General',
  sub_accounts: [
    {
      account_code: '11050501',
      account_name: 'Caja Principal',
      entries: [
        {
          entry_date: '2023-01-01',
          entry_number: 'CE-001',
          description: 'Apertura',
          debit: 1000000,
          credit: 0,
          running_balance: 1000000,
        },
      ],
      totals: {
        total_debit: 1000000,
        total_credit: 0,
        final_balance: 1000000,
      },
    },
  ],
};

describe('SubsidiaryLedgerPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (accountingApi.getAccounts as any).mockResolvedValue(mockAccounts);
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <SubsidiaryLedgerPage />
      </BrowserRouter>,
    );

  it('renders page header and searches for accounts', async () => {
    renderPage();
    expect(await screen.findByText('Libro Auxiliar')).toBeInTheDocument();
    
    const searchInput = screen.getByPlaceholderText(/Buscar cuenta padre/i);
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: 'Caja' } });
    
    expect(await screen.findByText(/Caja General/i)).toBeInTheDocument();
    
    fireEvent.click(screen.getByText(/Caja General/i));
    expect(searchInput).toHaveValue('110505');
  });

  it('fetches and displays report data', async () => {
    (accountingApi.getSubsidiaryLedger as any).mockResolvedValue(mockReportData);
    renderPage();
    
    const searchInput = screen.getByPlaceholderText(/Buscar cuenta padre/i);
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: '110505' } });
    fireEvent.click(await screen.findByText(/Caja General/i));
    
    fireEvent.click(screen.getByRole('button', { name: /Consultar Libro/i }));
    
    expect(await screen.findByText(/Cuenta Padre:/i)).toBeInTheDocument();
    expect(screen.getByText(/11050501 - Caja Principal/i)).toBeInTheDocument();
    expect(screen.getByText('CE-001')).toBeInTheDocument();
    expect(screen.getByText('Apertura')).toBeInTheDocument();
  });

  it('shows error if account not selected', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Consultar Libro/i }));
    expect(await screen.findByText('Seleccione una cuenta padre.')).toBeInTheDocument();
  });
});
