import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WithholdingCertificatePage from './WithholdingCertificatePage';
import * as accountingApi from '../../services/accountingApi';
import * as providerApi from '../../services/providerApi';
import Swal from 'sweetalert2';

vi.mock('../../services/accountingApi');
vi.mock('../../services/providerApi');
vi.mock('../../services/errorApi');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

const mockCertificates = [
  {
    id: 1,
    certificate_number: 'CERT-2023-001',
    id_provider: 101,
    provider: { company_name: 'Provider A' },
    concept: 'RETEFUENTE',
    base_amount: 1000000,
    rate: 2.5,
    withheld_amount: 25000,
    issue_date: '2023-03-15',
  },
];

const mockProviders = [
  { id: 101, company_name: 'Provider A', nit: '900123456' },
];

describe('WithholdingCertificatePage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (accountingApi.getWithholdingCertificates as any).mockResolvedValue(mockCertificates);
    (providerApi.getProviders as any).mockResolvedValue(mockProviders);
    
    // Mock URL.createObjectURL for PDF download
    window.URL.createObjectURL = vi.fn().mockReturnValue('mock-url');
    window.URL.revokeObjectURL = vi.fn();
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <WithholdingCertificatePage />
      </BrowserRouter>,
    );

  it('renders page header and displays certificates', async () => {
    renderPage();
    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/Certificados/i);
    
    expect(await screen.findByText('CERT-2023-001')).toBeInTheDocument();
    // Use getAllByText because it appears in both Table and Select
    expect(screen.getAllByText('Provider A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Retefuente').length).toBeGreaterThan(0);
  });

  it('filters certificates by year and concept', async () => {
    renderPage();
    await screen.findByText('CERT-2023-001');
    
    const yearSelect = screen.getByLabelText(/Año/i);
    fireEvent.change(yearSelect, { target: { value: '2022' } });
    
    const conceptSelect = screen.getByLabelText(/Concepto/i);
    fireEvent.change(conceptSelect, { target: { value: 'RETEICA' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));
    
    await waitFor(() => {
      expect(accountingApi.getWithholdingCertificates).toHaveBeenCalledWith(expect.objectContaining({
        year: '2022',
        concept: 'RETEICA',
      }));
    });
  });

  it('generates certificates for the selected year', async () => {
    (accountingApi.generateWithholdingCertificates as any).mockResolvedValue({ created: 10 });
    renderPage();
    
    fireEvent.click(screen.getByRole('button', { name: /Generar Certificados/i }));
    
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalled();
      expect(accountingApi.generateWithholdingCertificates).toHaveBeenCalled();
    });
    
    expect(await screen.findByText(/Se generaron 10 certificados/i)).toBeInTheDocument();
  });

  it('downloads certificate PDF', async () => {
    (accountingApi.downloadWithholdingPdf as any).mockResolvedValue(new Blob());
    renderPage();
    await screen.findByText('CERT-2023-001');
    
    const downloadBtn = screen.getByRole('button', { name: /Descargar CERT-2023-001/i });
    fireEvent.click(downloadBtn);
    
    await waitFor(() => {
      expect(accountingApi.downloadWithholdingPdf).toHaveBeenCalledWith(1);
    });
  });

  it('deletes a certificate', async () => {
    (accountingApi.deleteWithholdingCertificate as any).mockResolvedValue({ success: true });
    renderPage();
    await screen.findByText('CERT-2023-001');
    
    const deleteBtn = screen.getByRole('button', { name: /Eliminar CERT-2023-001/i });
    fireEvent.click(deleteBtn);
    
    await waitFor(() => {
      expect(accountingApi.deleteWithholdingCertificate).toHaveBeenCalledWith(1);
    });
  });
});
