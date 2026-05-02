import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import JournalEntryFormPage from './JournalEntryFormPage';
import * as accountingApi from '../../services/accountingApi';
import Swal from 'sweetalert2';

// Mock the API
vi.mock('../../services/accountingApi', () => ({
  getAccounts: vi.fn(),
  createJournalEntry: vi.fn(),
}));

// Mock Swal
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockAccounts = [
  { code: '110505', name: 'Caja General', accepts_movements: true, is_active: true },
  { code: '111005', name: 'Bancos Nacionales', accepts_movements: true, is_active: true },
  { code: '413501', name: 'Ventas de Ropa', accepts_movements: true, is_active: true },
];

describe('JournalEntryFormPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (accountingApi.getAccounts as any).mockResolvedValue(mockAccounts);
  });

  const renderPage = () => render(
    <BrowserRouter>
      <JournalEntryFormPage />
    </BrowserRouter>
  );

  it('renders correctly and loads accounts', async () => {
    renderPage();
    expect(screen.getByText('Nuevo Asiento Contable')).toBeInTheDocument();
    await waitFor(() => expect(accountingApi.getAccounts).toHaveBeenCalled());
  });

  it('allows adding and removing lines', async () => {
    renderPage();
    
    // Initially 2 lines
    expect(screen.getAllByPlaceholderText('Buscar cuenta...')).toHaveLength(2);

    const addButton = screen.getByTestId('add-line-button');
    fireEvent.click(addButton);

    // Now 3 lines
    expect(screen.getAllByPlaceholderText('Buscar cuenta...')).toHaveLength(3);

    const trashButtons = screen.getAllByTitle('Eliminar linea');
    fireEvent.click(trashButtons[2]);

    // Back to 2 lines
    expect(screen.getAllByPlaceholderText('Buscar cuenta...')).toHaveLength(2);
  });

  it('handles account selection and search', async () => {
    renderPage();
    await waitFor(() => expect(accountingApi.getAccounts).toHaveBeenCalled());

    const searchInput = screen.getByTestId('account-search-0');
    fireEvent.change(searchInput, { target: { value: '1105' } });

    // Should show Caja General in dropdown
    const option = await screen.findByText(/Caja General/i);
    fireEvent.click(option);

    // Search input should now show the code, and name cell should show the name
    expect(searchInput).toHaveValue('110505');
    expect(screen.getByTestId('account-name-0')).toHaveTextContent('Caja General');
  });

  it('calculates totals and shows balance error', async () => {
    renderPage();
    
    const debitInput0 = screen.getByTestId('debit-input-0');
    const creditInput1 = screen.getByTestId('credit-input-1');

    fireEvent.change(debitInput0, { target: { value: '100000' } });
    fireEvent.change(creditInput1, { target: { value: '80000' } });

    // Should show difference message
    expect(screen.getByText(/Diferencia: \$ 20.000/i)).toBeInTheDocument();
    expect(screen.getByTestId('save-entry-button')).toBeDisabled();

    // Balance it
    fireEvent.change(creditInput1, { target: { value: '100000' } });
    expect(screen.queryByText(/Diferencia/i)).not.toBeInTheDocument();
    
    // Still disabled because missing description/date (though date has default)
    expect(screen.getByTestId('save-entry-button')).toBeDisabled();
  });

  it('completes the full flow successfully', async () => {
    (accountingApi.createJournalEntry as any).mockResolvedValue({ id: 1 });
    renderPage();
    await waitFor(() => expect(accountingApi.getAccounts).toHaveBeenCalled());

    // 1. Fill Header
    const descInput = screen.getByPlaceholderText(/Descripcion del asiento/i);
    fireEvent.change(descInput, { target: { value: 'Ajuste de inventario' } });

    // 2. Fill Line 1
    const search0 = screen.getByTestId('account-search-0');
    fireEvent.change(search0, { target: { value: '1105' } });
    fireEvent.click(await screen.findByText(/Caja General/i));
    fireEvent.change(screen.getByTestId('debit-input-0'), { target: { value: '50000' } });

    // 3. Fill Line 2
    const search1 = screen.getByTestId('account-search-1');
    fireEvent.change(search1, { target: { value: '1110' } });
    fireEvent.click(await screen.findByText(/Bancos Nacionales/i));
    fireEvent.change(screen.getByTestId('credit-input-1'), { target: { value: '50000' } });

    // 4. Save
    const saveButton = screen.getByTestId('save-entry-button');
    expect(saveButton).not.toBeDisabled();
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(accountingApi.createJournalEntry).toHaveBeenCalledWith(expect.objectContaining({
        description: 'Ajuste de inventario',
        lines: expect.arrayContaining([
          expect.objectContaining({ account_code: '110505', debit: 50000 }),
          expect.objectContaining({ account_code: '111005', credit: 50000 }),
        ])
      }));
    });

    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success' }));
    expect(mockNavigate).toHaveBeenCalledWith('/accounting/journal');
  });

  it('handles API error during save', async () => {
    (accountingApi.createJournalEntry as any).mockRejectedValue(new Error('Server Error'));
    renderPage();
    
    // Mock enough data to enable save
    fireEvent.change(screen.getByPlaceholderText(/Descripcion/i), { target: { value: 'Error Test' } });
    fireEvent.change(screen.getByTestId('debit-input-0'), { target: { value: '100' } });
    fireEvent.change(screen.getByTestId('credit-input-1'), { target: { value: '100' } });

    const saveButton = screen.getByTestId('save-entry-button');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ 
        title: 'Error',
        text: 'Server Error'
      }));
    });
  });
});
