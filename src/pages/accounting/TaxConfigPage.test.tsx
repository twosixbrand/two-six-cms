import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaxConfigPage from './TaxConfigPage';
import * as accountingApi from '../../services/accountingApi';
import locationApi from '../../services/locationApi';
import Swal from 'sweetalert2';

vi.mock('../../services/accountingApi');
vi.mock('../../services/locationApi');
vi.mock('../../services/errorApi');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

const mockTaxConfigs = [
  {
    id: 1,
    name: 'ICA Bogotá',
    type: 'ICA',
    city_id: 101,
    rate: 0.01104,
    is_active: true,
    city: { name: 'Bogotá' },
    pucAccountDebit: { code: '511501', name: 'ICA Gasto' },
    pucAccountCredit: { code: '236801', name: 'ICA Pasivo' },
  },
];

const mockDepartments = [
  {
    id: 1,
    name: 'Cundinamarca',
    cities: [{ id: 101, name: 'Bogotá' }],
  },
];

const mockAccounts = [
  { id: 1001, code: '511501', name: 'ICA Gasto' },
  { id: 2001, code: '236801', name: 'ICA Pasivo' },
];

describe('TaxConfigPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (accountingApi.getTaxConfigs as any).mockResolvedValue(mockTaxConfigs);
    (locationApi.getDepartments as any).mockResolvedValue(mockDepartments);
    (accountingApi.getAccounts as any).mockResolvedValue(mockAccounts);
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <TaxConfigPage />
      </BrowserRouter>,
    );

  it('renders page header and displays tax configurations', async () => {
    renderPage();
    expect(await screen.findByText('Configuración de Impuestos')).toBeInTheDocument();
    expect(await screen.findByText('ICA Bogotá')).toBeInTheDocument();
    expect(screen.getByText('1.104%')).toBeInTheDocument();
  });

  it('opens modal and creates a new tax config', async () => {
    (accountingApi.createTaxConfig as any).mockResolvedValue({ success: true });
    renderPage();
    await screen.findByText('ICA Bogotá');
    
    fireEvent.click(screen.getByRole('button', { name: 'Nueva Configuración' }));
    
    expect(await screen.findByText('Nueva Configuración de Impuesto')).toBeInTheDocument();
    
    fireEvent.change(screen.getByPlaceholderText(/Ej: ICA Bogotá/i), { target: { value: 'ICA Medellín' } });
    fireEvent.change(screen.getByLabelText(/Tipo de Impuesto/i), { target: { value: 'ICA' } });
    fireEvent.change(screen.getByLabelText(/Ciudad/i), { target: { value: '101' } });
    fireEvent.change(screen.getByPlaceholderText('0.01104'), { target: { value: '0.005' } });
    
    const selects = screen.getAllByRole('combobox');
    // Débito
    fireEvent.change(selects[2], { target: { value: '1001' } });
    // Crédito
    fireEvent.change(selects[3], { target: { value: '2001' } });
    
    fireEvent.click(screen.getByText('Guardar Configuración'));
    
    await waitFor(() => {
      expect(accountingApi.createTaxConfig).toHaveBeenCalledWith(expect.objectContaining({
        name: 'ICA Medellín',
        rate: 0.005,
      }));
    });
  });

  it('deletes a tax configuration', async () => {
    (accountingApi.deleteTaxConfig as any).mockResolvedValue({ success: true });
    renderPage();
    await screen.findByText('ICA Bogotá');
    
    const deleteBtn = screen.getByRole('button', { name: /Eliminar ICA Bogotá/i });
    fireEvent.click(deleteBtn);
    
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
        title: '¿Eliminar configuración?',
      }));
      expect(accountingApi.deleteTaxConfig).toHaveBeenCalledWith(1);
    });
  });
});
