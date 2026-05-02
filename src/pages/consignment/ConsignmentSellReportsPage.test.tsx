import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConsignmentSellReportsPage from './ConsignmentSellReportsPage';
import * as reportApi from '../../services/consignmentSellReportApi';
import * as selloutApi from '../../services/consignmentSelloutApi';
import Swal from 'sweetalert2';

vi.mock('../../services/consignmentSellReportApi');
vi.mock('../../services/consignmentSelloutApi');
vi.mock('../../services/errorApi');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

const mockReports = [
  {
    id: 1,
    id_customer: 1,
    id_warehouse: 10,
    status: 'PENDING',
    customer: { id: 1, name: 'Cliente A' },
    warehouse: { id: 10, name: 'Bodega Norte' },
    items: [
      { id: 101, id_clothing_size: 501, quantity: 2, clothingSize: { clothingColor: { design: { reference: 'REF1' }, color: { name: 'Negro' } }, size: { name: 'M' }, product: { price: 50000 } } },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('ConsignmentSellReportsPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (reportApi.getSellReports as any).mockResolvedValue(mockReports);
    (reportApi.getSellReport as any).mockImplementation((id: number) => 
      Promise.resolve(mockReports.find(r => r.id === id))
    );
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <ConsignmentSellReportsPage />
      </BrowserRouter>,
    );

  it('renders page header and subheader', async () => {
    renderPage();
    expect(await screen.findByText('Reportes de Venta del Cliente')).toBeInTheDocument();
  });

  it('renders reports in the DataTable', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Cliente A')).toBeInTheDocument();
      expect(screen.getByText('Bodega Norte')).toBeInTheDocument();
    });
  });

  it('opens detail modal when clicking Eye icon', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Cliente A')).toBeInTheDocument());
    
    const row = screen.getByText('Cliente A').closest('tr')!;
    const viewBtn = within(row).getAllByRole('button')[0]; // FiEye
    fireEvent.click(viewBtn);
    
    await waitFor(() => {
      expect(reportApi.getSellReport).toHaveBeenCalledWith(1);
      expect(screen.getByText('Reporte #1')).toBeInTheDocument();
    });
  });

  it('handles approve flow', async () => {
    (selloutApi.processSellout as any).mockResolvedValue({ id: 55, order_reference: 'SO-55' });
    (selloutApi.generateDianForOrder as any).mockResolvedValue({ invoiceId: 1001, cufe: 'ABC123DEF456' });
    
    renderPage();
    await waitFor(() => expect(screen.getByText('Cliente A')).toBeInTheDocument());
    
    const row = screen.getByText('Cliente A').closest('tr')!;
    const approveBtn = within(row).getAllByRole('button')[1]; // FiCheck
    fireEvent.click(approveBtn);
    
    await waitFor(() => {
      expect(reportApi.approveSellReport).toHaveBeenCalledWith(1);
      expect(selloutApi.processSellout).toHaveBeenCalled();
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Aprobado y facturado' }));
    });
  });

  it('handles reject flow', async () => {
    (Swal.fire as any).mockResolvedValue({ value: 'Motivo de rechazo' });
    
    renderPage();
    await waitFor(() => expect(screen.getByText('Cliente A')).toBeInTheDocument());
    
    const row = screen.getByText('Cliente A').closest('tr')!;
    const rejectBtn = within(row).getAllByRole('button')[2]; // FiX
    fireEvent.click(rejectBtn);
    
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Rechazar reporte' }));
      expect(reportApi.rejectSellReport).toHaveBeenCalledWith(1, 'Motivo de rechazo');
    });
  });
});
