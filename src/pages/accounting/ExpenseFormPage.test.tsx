import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ExpenseFormPage from './ExpenseFormPage';
import * as accountingApi from '../../services/accountingApi';
import Swal from 'sweetalert2';

// Mock the API
vi.mock('../../services/accountingApi', () => ({
  getExpenseCategories: vi.fn(),
  getAccounts: vi.fn(),
  getExpenses: vi.fn(),
  createExpense: vi.fn(),
  updateExpense: vi.fn(),
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
    useParams: () => ({ id: undefined }), // Default to create mode
  };
});

const mockCategories = [
  { id: 1, name: 'SERVICIOS PUBLICOS' },
  { id: 2, name: 'ARRIENDOS' },
];

const mockAccounts = [
  { code: '513505', name: 'Aseo y Cafetería', accepts_movements: true },
  { code: '111005', name: 'Bancos Nacionales', accepts_movements: true },
];

describe('ExpenseFormPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (accountingApi.getExpenseCategories as any).mockResolvedValue(mockCategories);
    (accountingApi.getAccounts as any).mockResolvedValue(mockAccounts);
  });

  const renderPage = () => render(
    <BrowserRouter>
      <ExpenseFormPage />
    </BrowserRouter>
  );

  it('renders correctly and loads data', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /Registrar Gasto/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(accountingApi.getExpenseCategories).toHaveBeenCalled();
      expect(accountingApi.getAccounts).toHaveBeenCalled();
    });
  });

  it('calculates total correctly', async () => {
    renderPage();
    
    const subtotalInput = screen.getByLabelText(/Subtotal/i);
    const taxInput = screen.getByLabelText(/IVA \(Impuesto\)/i);
    const retInput = screen.getByLabelText(/Retencion/i);

    fireEvent.change(subtotalInput, { target: { value: '1000000' } });
    fireEvent.change(taxInput, { target: { value: '190000' } });
    fireEvent.change(retInput, { target: { value: '40000' } });

    // Total = 1,000,000 + 190,000 - 40,000 = 1,150,000
    expect(screen.getByTestId('total-value')).toHaveTextContent(/\$ 1.150.000/i);
  });

  it('handles account selection', async () => {
    renderPage();
    await waitFor(() => expect(accountingApi.getAccounts).toHaveBeenCalled());

    const searchInput = screen.getByTestId('account-search-input');
    fireEvent.change(searchInput, { target: { value: '5135' } });

    const option = await screen.findByText(/Aseo y Cafetería/i);
    fireEvent.click(option);

    expect(searchInput).toHaveValue('513505 - Aseo y Cafetería');
  });

  it('submits correctly (create mode)', async () => {
    (accountingApi.createExpense as any).mockResolvedValue({ id: 100 });
    renderPage();
    await waitFor(() => expect(accountingApi.getExpenseCategories).toHaveBeenCalled());

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/Descripcion/i), { target: { value: 'Pago de luz' } });
    fireEvent.change(screen.getByLabelText(/Subtotal/i), { target: { value: '250000' } });

    const saveButton = screen.getByTestId('save-expense-button');
    expect(saveButton).not.toBeDisabled();
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(accountingApi.createExpense).toHaveBeenCalledWith(expect.objectContaining({
        description: 'Pago de luz',
        subtotal: 250000
      }));
    });

    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success' }));
    expect(mockNavigate).toHaveBeenCalledWith('/accounting/expenses');
  });

  it('handles errors on save', async () => {
    (accountingApi.createExpense as any).mockRejectedValue(new Error('Save Error'));
    renderPage();
    
    fireEvent.change(screen.getByLabelText(/Descripcion/i), { target: { value: 'Test Error' } });
    fireEvent.change(screen.getByLabelText(/Subtotal/i), { target: { value: '100' } });

    fireEvent.click(screen.getByTestId('save-expense-button'));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ 
        title: 'Error',
        text: 'Save Error'
      }));
    });
  });
});
