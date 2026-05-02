import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PayrollPage from './PayrollPage';
import * as accountingApi from '../../services/accountingApi';
import Swal from 'sweetalert2';
import { BrowserRouter } from 'react-router-dom';

// Mock Services
vi.mock('../../services/accountingApi');
vi.mock('../../services/errorApi');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

const mockEmployees = [
  {
    id: 1,
    document_number: '12345',
    name: 'Juan Perez',
    position: 'Desarrollador',
    contract_type: 'INDEFINIDO',
    base_salary: 5000000,
    is_exonerated: true,
    is_active: true,
  },
];

const mockPeriods = [
  {
    id: 101,
    year: 2026,
    month: 5,
    period_type: 'MENSUAL',
    start_date: '2026-05-01',
    end_date: '2026-05-31',
    status: 'DRAFT',
    _count: { entries: 0 },
  },
  {
    id: 102,
    year: 2026,
    month: 4,
    period_type: 'MENSUAL',
    start_date: '2026-04-01',
    end_date: '2026-04-30',
    status: 'APPROVED',
    _count: { entries: 1 },
  },
];

const mockPayrollDetail = {
  id: 102,
  year: 2026,
  month: 4,
  period_type: 'MENSUAL',
  status: 'APPROVED',
  entries: [
    {
      id: 1,
      id_employee: 1,
      employee: { name: 'Juan Perez' },
      base_salary: 5000000,
      transport_allowance: 140000,
      gross_salary: 5140000,
      health_employee: 200000,
      pension_employee: 200000,
      net_salary: 4740000,
      health_employer: 0,
      pension_employer: 600000,
      arl_employer: 26000,
      sena_employer: 0,
      icbf_employer: 0,
      caja_employer: 200000,
      prima_provision: 428000,
      cesantias_provision: 428000,
      int_cesantias_provision: 51000,
      vacaciones_provision: 208000,
      total_employer_cost: 6500000,
    },
  ],
};

const renderPage = () => {
  return render(
    <BrowserRouter>
      <PayrollPage />
    </BrowserRouter>
  );
};

describe('PayrollPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (accountingApi.getEmployees as any).mockResolvedValue(mockEmployees);
    (accountingApi.getPayrollPeriods as any).mockResolvedValue(mockPeriods);
  });

  it('renders employees and periods tabs correctly', async () => {
    renderPage();

    expect(screen.getByText(/Gestión de Nómina Colombiana/i)).toBeInTheDocument();
    
    // Check initial tab (Employees)
    expect(await screen.findByText('Juan Perez')).toBeInTheDocument();
    expect(screen.getByText('Desarrollador')).toBeInTheDocument();

    // Switch to Periods tab
    const periodsTab = screen.getByLabelText('Tab Liquidaciones');
    fireEvent.click(periodsTab);

    // Wait for the table to render the data
    expect(await screen.findByText('101')).toBeInTheDocument();
    expect(screen.getByText('102')).toBeInTheDocument();
    expect(screen.getAllByText('2026').length).toBeGreaterThan(0);
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
  });

  it('allows editing an existing employee', async () => {
    renderPage();
    
    const editBtn = await screen.findByLabelText('Editar Empleado Juan Perez');
    fireEvent.click(editBtn);

    const nameInput = await screen.findByLabelText('Nombre Completo');
    expect(nameInput).toHaveValue('Juan Perez');

    fireEvent.change(nameInput, { target: { value: 'Juan Perez Updated' } });

    (accountingApi.updateEmployee as any).mockResolvedValue({ success: true });

    const updateBtn = screen.getByText('Actualizar Ficha');
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(accountingApi.updateEmployee).toHaveBeenCalledWith(1, expect.objectContaining({
        name: 'Juan Perez Updated',
      }));
    });
  });

  it('handles opening a new payroll period', async () => {
    renderPage();
    
    fireEvent.click(screen.getByLabelText('Tab Liquidaciones'));
    
    const openPeriodBtn = screen.getByLabelText('Abrir Nuevo Periodo');
    fireEvent.click(openPeriodBtn);

    const monthInput = await screen.findByLabelText('Mes');
    fireEvent.change(monthInput, { target: { value: '6' } });

    (accountingApi.createPayrollPeriod as any).mockResolvedValue({ id: 103 });

    const saveBtn = screen.getByText('Abrir Período');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(accountingApi.createPayrollPeriod).toHaveBeenCalledWith(expect.objectContaining({
        month: 6,
      }));
    });
  });

  it('handles payroll approval flow', async () => {
    (Swal.fire as any).mockResolvedValue({ isConfirmed: true });
    (accountingApi.approvePayroll as any).mockResolvedValue({ success: true });
    
    // Override the default mock for this specific test
    (accountingApi.getPayrollPeriods as any).mockResolvedValue([
      { ...mockPeriods[0], id: 101, status: 'CALCULATED' }
    ]);
    
    renderPage();

    fireEvent.click(screen.getByLabelText('Tab Liquidaciones'));
    
    const approveBtn = await screen.findByLabelText(/Aprobar Periodo 101/i);
    fireEvent.click(approveBtn);

    expect(Swal.fire).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(accountingApi.approvePayroll).toHaveBeenCalledWith(101);
    });
  });

  it('handles excel export', async () => {
    (accountingApi.getPayrollDetail as any).mockResolvedValue(mockPayrollDetail);
    
    renderPage();
    fireEvent.click(screen.getByLabelText('Tab Liquidaciones'));
    fireEvent.click(await screen.findByLabelText('Ver Detalle Periodo 102'));

    const exportBtn = await screen.findByText(/Descargar Soporte Excel/i);
    fireEvent.click(exportBtn);

    expect(accountingApi.exportToExcel).toHaveBeenCalledWith('payroll', { periodId: '102' });
  });

  it('handles errors when calculating payroll', async () => {
    (Swal.fire as any).mockResolvedValue({ isConfirmed: true });
    (accountingApi.calculatePayroll as any).mockRejectedValue(new Error('Calculation Error'));
    
    renderPage();
    fireEvent.click(screen.getByLabelText('Tab Liquidaciones'));
    
    const liquidarBtn = await screen.findByLabelText('Liquidar Periodo 101');
    fireEvent.click(liquidarBtn);

    expect(await screen.findByText(/Calculation Error/i)).toBeInTheDocument();
  });

  it('handles errors when saving employee', async () => {
    renderPage();
    fireEvent.click(screen.getByLabelText('Registrar Trabajador'));
    
    fireEvent.change(screen.getByLabelText('Número de Documento'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Nombre Completo'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Salario Base'), { target: { value: '1000' } });

    (accountingApi.createEmployee as any).mockRejectedValue(new Error('Save Error'));

    fireEvent.click(screen.getByText('Registrar Contratación'));

    expect(await screen.findByText(/Save Error/i)).toBeInTheDocument();
  });

  it('allows registering a new employee', async () => {
    renderPage();
    
    const registerBtn = screen.getByLabelText('Registrar Trabajador');
    fireEvent.click(registerBtn);

    // Fill the modal
    const docInput = await screen.findByLabelText('Número de Documento');
    const nameInput = screen.getByLabelText('Nombre Completo');
    const salaryInput = screen.getByLabelText('Salario Base');
    
    fireEvent.change(docInput, { target: { value: '98765' } });
    fireEvent.change(nameInput, { target: { value: 'Maria Lopez' } });
    fireEvent.change(salaryInput, { target: { value: '3000000' } });

    (accountingApi.createEmployee as any).mockResolvedValue({ id: 2 });

    const saveBtn = screen.getByText('Registrar Contratación');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(accountingApi.createEmployee).toHaveBeenCalledWith(expect.objectContaining({
        document_number: '98765',
        name: 'Maria Lopez',
        base_salary: 3000000,
      }));
    });

    expect(await screen.findByText(/Empleado registrado exitosamente/i)).toBeInTheDocument();
  });

  it('handles payroll calculation flow', async () => {
    (Swal.fire as any).mockResolvedValue({ isConfirmed: true });
    (accountingApi.calculatePayroll as any).mockResolvedValue({ success: true });
    
    renderPage();

    // Go to periods
    fireEvent.click(screen.getByLabelText('Tab Liquidaciones'));
    
    // Find liquidar button for draft period
    const liquidarBtn = await screen.findByLabelText('Liquidar Periodo 101');
    fireEvent.click(liquidarBtn);

    expect(Swal.fire).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(accountingApi.calculatePayroll).toHaveBeenCalledWith(101);
    });

    expect(await screen.findByText(/Nómina liquidada exitosamente/i)).toBeInTheDocument();
  });

  it('shows detailed summary for an approved period', async () => {
    (accountingApi.getPayrollDetail as any).mockResolvedValue(mockPayrollDetail);
    
    renderPage();

    // Go to periods
    fireEvent.click(screen.getByLabelText('Tab Liquidaciones'));
    
    // View detail
    const detailBtn = await screen.findByLabelText('Ver Detalle Periodo 102');
    fireEvent.click(detailBtn);

    expect(accountingApi.getPayrollDetail).toHaveBeenCalledWith(102);

    // Verify detail tab content
    expect(await screen.findByText(/Liquidación: 2026-04/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Neto a Pagar/i)).toBeInTheDocument();
    
    // Check totals calculation
    const totalNeto = screen.getByText(/Total Neto a Pagar/i).parentElement;
    expect(totalNeto).toHaveTextContent(/4\.740\.000/);
  });

  it('handles errors when loading employees', async () => {
    (accountingApi.getEmployees as any).mockRejectedValue(new Error('Network Error'));
    
    renderPage();

    expect(await screen.findByText(/Error al cargar empleados/i)).toBeInTheDocument();
  });
});
