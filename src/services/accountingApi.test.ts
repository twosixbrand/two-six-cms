import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as accountingApi from './accountingApi';

// Mock fetch
global.fetch = vi.fn();

// Mock handleResponse
vi.mock('./apiUtils', () => ({
  handleResponse: vi.fn((resp) => resp.json()),
}));

describe('accountingApi - Payroll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getEmployees calls correct endpoint', async () => {
    await accountingApi.getEmployees({ is_active: 'true' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounting/payroll/employees?is_active=true'),
      expect.any(Object)
    );
  });

  it('createEmployee calls correct endpoint', async () => {
    const data = { name: 'John' };
    await accountingApi.createEmployee(data);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounting/payroll/employees'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify(data) })
    );
  });

  it('updateEmployee calls correct endpoint', async () => {
    const data = { name: 'John' };
    await accountingApi.updateEmployee(1, data);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounting/payroll/employees/1'),
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify(data) })
    );
  });

  it('getPayrollPeriods calls correct endpoint', async () => {
    await accountingApi.getPayrollPeriods();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounting/payroll/periods'),
      expect.any(Object)
    );
  });

  it('calculatePayroll calls correct endpoint', async () => {
    await accountingApi.calculatePayroll(10);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounting/payroll/periods/10/calculate'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('approvePayroll calls correct endpoint', async () => {
    await accountingApi.approvePayroll(10);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounting/payroll/periods/10/approve'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('getPayrollDetail calls correct endpoint', async () => {
    await accountingApi.getPayrollDetail(10);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounting/payroll/periods/10'),
      expect.objectContaining({ method: 'GET' })
    );
  });
});

describe('accountingApi - Reports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getBalanceSheet calls correct endpoint with params', async () => {
    await accountingApi.getBalanceSheet({ year: 2024, month: 3 });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounting/reports/balance-sheet?year=2024&month=3'),
      expect.any(Object)
    );
  });

  it('getIncomeStatement calls correct endpoint', async () => {
    await accountingApi.getIncomeStatement({ startDate: '2024-01-01', endDate: '2024-03-31' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounting/reports/income-statement?startDate=2024-01-01&endDate=2024-03-31'),
      expect.any(Object)
    );
  });

  it('getGeneralLedger calls correct endpoint', async () => {
    await accountingApi.getGeneralLedger({ account: '110505', startDate: '2024-01-01', endDate: '2024-01-31' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounting/reports/general-ledger?account=110505&startDate=2024-01-01&endDate=2024-01-31'),
      expect.any(Object)
    );
  });
});

describe('accountingApi - Bank Reconciliation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getBankAccounts calls correct endpoint', async () => {
    await accountingApi.getBankAccounts();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounting/bank-accounts'),
      expect.any(Object)
    );
  });

  it('uploadBankStatement calls correct endpoint', async () => {
    const data = { bankAccountId: 1, periodStart: '2024-01-01', periodEnd: '2024-01-31', fileName: 'test.csv', csvContent: '...' };
    await accountingApi.uploadBankStatement(data);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounting/bank-reconciliation/upload'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify(data) })
    );
  });
});

