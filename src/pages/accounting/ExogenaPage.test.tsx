import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExogenaPage from './ExogenaPage';
import * as accountingApi from '../../services/accountingApi';

// Mock the API
vi.mock('../../services/accountingApi', () => ({
  previewExogena: vi.fn(),
  generateExogena: vi.fn(),
  getExogenaThirdPartyMovements: vi.fn(),
}));

const mockExogenaData = {
  summary: {
    totalProviders: 10,
    totalCustomers: 20,
    totalPayments: 5000000,
    totalRevenue: 10000000,
    totalIvaDescontable: 500000,
    totalIvaGenerado: 1900000,
  },
  format1001: [
    { nit: '900123456', name: 'PROVEEDOR A', concept: 'COMPRAS', base_amount: 1000000, retention_amount: 25000, tax_amount: 190000 }
  ],
  format1005: [
    { nit: '900123456', name: 'PROVEEDOR A', iva_descontable: 190000 }
  ],
  format1006: [
    { month: 1, iva_generado: 100000 }
  ],
  format1007: [
    { nit: '800123456', name: 'CLIENTE B', total_revenue: 2000000 }
  ]
};

const mockThirdPartyMovements = {
  movements: [
    { date: '2024-01-15', entry_number: 'CE-1', source_type: 'PAYMENT', description: 'Pago factura', puc_code: '111005', puc_name: 'Bancos', debit: 0, credit: 500000 }
  ],
  totals: { debit: 0, credit: 500000 }
};

describe('ExogenaPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and allows year selection', () => {
    render(<ExogenaPage />);
    expect(screen.getByText(/Informacion Exogena/i)).toBeInTheDocument();
    
    const yearSelect = screen.getByLabelText(/Ano Gravable/i);
    fireEvent.change(yearSelect, { target: { value: '2023' } });
    expect(yearSelect).toHaveValue('2023');
  });

  it('handles preview flow successfully', async () => {
    (accountingApi.previewExogena as any).mockResolvedValue(mockExogenaData);
    render(<ExogenaPage />);

    const previewBtn = screen.getByTestId('preview-button');
    fireEvent.click(previewBtn);

    expect(screen.getByText(/Procesando informacion exogena/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(accountingApi.previewExogena).toHaveBeenCalled();
    });

    // Check summary cards
    expect(screen.getByTestId('summary-value-0')).toHaveTextContent('10');
    expect(screen.getByTestId('summary-value-3')).toHaveTextContent(/\$ 10.000.000/i);

    // Default tab 1001
    expect(screen.getByText(/Formato 1001 - Pagos a Terceros/i)).toBeInTheDocument();
    expect(screen.getByText('PROVEEDOR A')).toBeInTheDocument();
  });

  it('switches between tabs', async () => {
    (accountingApi.previewExogena as any).mockResolvedValue(mockExogenaData);
    render(<ExogenaPage />);
    fireEvent.click(screen.getByTestId('preview-button'));

    await screen.findByText('PROVEEDOR A');

    // Switch to 1005
    fireEvent.click(screen.getByTestId('tab-1005'));
    expect(screen.getByText(/Formato 1005 - IVA Descontable/i)).toBeInTheDocument();

    // Switch to 1006
    fireEvent.click(screen.getByTestId('tab-1006'));
    expect(screen.getByText(/Enero/i)).toBeInTheDocument();

    // Switch to 1007
    fireEvent.click(screen.getByTestId('tab-1007'));
    expect(screen.getByText('CLIENTE B')).toBeInTheDocument();
  });

  it('handles third party search in DETALLE tab', async () => {
    (accountingApi.previewExogena as any).mockResolvedValue(mockExogenaData);
    (accountingApi.getExogenaThirdPartyMovements as any).mockResolvedValue(mockThirdPartyMovements);
    render(<ExogenaPage />);
    fireEvent.click(screen.getByTestId('preview-button'));
    await screen.findByText('PROVEEDOR A');

    fireEvent.click(screen.getByTestId('tab-detalle'));
    expect(screen.getByText(/Libro Auxiliar por Tercero/i)).toBeInTheDocument();

    const nitInput = screen.getByLabelText(/NIT \/ Cédula del Tercero/i);
    fireEvent.change(nitInput, { target: { value: '900123' } });

    const searchBtn = screen.getByTestId('search-third-party-button');
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(accountingApi.getExogenaThirdPartyMovements).toHaveBeenCalledWith(expect.any(Number), '900123');
    });

    expect(screen.getByText('CE-1')).toBeInTheDocument();
    expect(screen.getByText('Bancos')).toBeInTheDocument();
  });

  it('handles Excel generation', async () => {
    (accountingApi.generateExogena as any).mockResolvedValue(null);
    render(<ExogenaPage />);

    const generateBtn = screen.getByTestId('generate-button');
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(accountingApi.generateExogena).toHaveBeenCalled();
    });
  });

  it('handles errors gracefully', async () => {
    (accountingApi.previewExogena as any).mockRejectedValue(new Error('Network Error'));
    render(<ExogenaPage />);

    fireEvent.click(screen.getByTestId('preview-button'));

    await waitFor(() => {
      expect(screen.getByText(/Error al previsualizar la informacion exogena/i)).toBeInTheDocument();
    });
  });
});
