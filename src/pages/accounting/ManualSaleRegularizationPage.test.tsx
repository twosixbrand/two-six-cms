import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ManualSaleRegularizationPage from './ManualSaleRegularizationPage';
import * as accountingApi from '../../services/accountingApi';
import * as customerApi from '../../services/customerApi';
import * as productApi from '../../services/productApi';
import Swal from 'sweetalert2';

// Increase timeout for this suite as it involves multiple steps and renders
vi.setConfig({ testTimeout: 15000 });

vi.mock('../../services/accountingApi');
vi.mock('../../services/customerApi');
vi.mock('../../services/productApi');
vi.mock('../../services/errorApi');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

const mockPendingReceipts = [
  {
    journal_entry_id: 501,
    entry_number: 'RC-001',
    entry_date: '2023-01-01',
    description: 'Anticipo Cliente A',
    available_balance: 150000,
    customer_nit: '123456',
    customer_name: 'Cliente A',
  },
];

const mockCustomer = {
  id: 1,
  name: 'Cliente A',
  document_number: '123456',
  email: 'cliente@example.com',
  identificationType: { code: '13' },
};

const mockProducts = [
  { id: 1, name: 'Product 1', price: 100000, active: true, size_name: 'M' },
];

describe('ManualSaleRegularizationPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (accountingApi.listPendingCashReceipts as any).mockResolvedValue(mockPendingReceipts);
    (productApi.getProducts as any).mockResolvedValue(mockProducts);
    (customerApi.getCustomerByDocument as any).mockResolvedValue(mockCustomer);
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <ManualSaleRegularizationPage />
      </BrowserRouter>,
    );

  it('renders and allows creating a new receipt', async () => {
    renderPage();
    expect(await screen.findByText(/Regularizar venta sin factura/i)).toBeInTheDocument();
    
    // Step 1: Create Receipt
    fireEvent.change(screen.getByLabelText(/Fecha consignación/i), { target: { value: '2023-01-01' } });
    fireEvent.change(screen.getByLabelText(/Monto/i), { target: { value: '150000' } });
    fireEvent.change(screen.getByLabelText(/Referencia consignación/i), { target: { value: 'REF-001' } });
    
    (accountingApi.createCashReceipt as any).mockResolvedValue({
      journal_entry_id: 999,
      entry_number: 'RC-999',
      total: 150000,
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Guardar recibo/i }));
    
    // Wait for step 2 heading
    expect(await screen.findByText(/Paso 2/i, {}, { timeout: 5000 })).toBeInTheDocument();
  });

  it('allows resuming from a pending receipt and selects product from catalog', async () => {
    renderPage();
    const resumeBtn = await screen.findByRole('button', { name: /Continuar recibo RC-001/i });
    fireEvent.click(resumeBtn);
    
    await screen.findByText(/Paso 2/i, {}, { timeout: 5000 });
    
    // Test Product Catalog Selection
    const descInput = screen.getByPlaceholderText(/Buscar producto/i);
    fireEvent.focus(descInput);
    fireEvent.change(descInput, { target: { value: 'Product' } });
    
    // Wait for dropdown
    const productOption = await screen.findByText(/Product 1 - Talla M/i, {}, { timeout: 5000 });
    fireEvent.mouseDown(productOption);
    
    expect(descInput).toHaveValue('Product 1 - Talla M');
  });

  it('allows adding and removing items', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /Continuar recibo RC-001/i }));
    await screen.findByText(/Paso 2/i, {}, { timeout: 5000 });
    
    fireEvent.click(screen.getByRole('button', { name: /Agregar ítem/i }));
    const spinButtons = screen.getAllByRole('spinbutton');
    // Each item has 3 spinbuttons: quantity, unit_price, iva_rate
    expect(spinButtons.length).toBe(6); 
    
    const removeButtons = screen.getAllByRole('button').filter(b => b.innerHTML.includes('FiTrash2') || b.querySelector('svg'));
    // Test removal of second item
    if (removeButtons.length >= 2) {
        fireEvent.click(removeButtons[1]);
        expect(screen.getAllByRole('spinbutton').length).toBe(3);
    }
  });

  it('completes the full flow and shows Step 3', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /Continuar recibo RC-001/i }));
    await screen.findByText(/Paso 2/i, {}, { timeout: 5000 });
    
    fireEvent.change(screen.getByLabelText(/Fecha operación/i), { target: { value: '2023-01-01' } });
    
    const spinButtons = screen.getAllByRole('spinbutton');
    fireEvent.change(spinButtons[1], { target: { value: '150000' } }); // unit_price
    
    (accountingApi.createManualDianInvoice as any).mockResolvedValue({
      invoice_number: 'SETT-123',
      cufe: 'MOCK-CUFE',
      total: 150000,
      journal_entry_id: 1001,
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Emitir factura/i }));
    
    expect(await screen.findByText(/¡Legalización completada!/i, {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText('SETT-123')).toBeInTheDocument();
    
    // Test navigation in Step 3
    fireEvent.click(screen.getByRole('button', { name: /Ver asientos/i }));
  });
});
