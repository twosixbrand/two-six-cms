import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as api from './accountingApi';

const mockOk = (data: any = []) => ({
    ok: true, status: 200, json: vi.fn().mockResolvedValue(data),
});
const mockOk204 = () => ({ ok: true, status: 204 });
const mockBlob = () => {
    const b = new Blob(['data']);
    return { ok: true, blob: vi.fn().mockResolvedValue(b) };
};
const mockBlobFail = (msg = 'fail') => ({
    ok: false, status: 500, statusText: 'Error',
    text: vi.fn().mockResolvedValue(msg),
    blob: vi.fn(),
});

describe('accountingApi.ts', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3050/api');
        vi.stubEnv('VITE_DIAN_API_KEY', 'TestKey');
        global.fetch = vi.fn().mockResolvedValue(mockOk());
    });
    afterEach(() => { vi.restoreAllMocks(); });

    // ── PUC Accounts ──
    it('getAccounts', async () => { await api.getAccounts(); expect(fetch).toHaveBeenCalled(); });
    it('getAccounts with params', async () => { await api.getAccounts({ search: 'x', level: 2 }); expect(fetch).toHaveBeenCalled(); });
    it('getAccountTree', async () => { await api.getAccountTree(); expect(fetch).toHaveBeenCalled(); });
    it('createAccount', async () => { await api.createAccount({ code: '1' }); expect(fetch).toHaveBeenCalled(); });
    it('updateAccount', async () => { await api.updateAccount(1, { code: '1' }); expect(fetch).toHaveBeenCalled(); });
    it('deleteAccount', async () => { await api.deleteAccount(1); expect(fetch).toHaveBeenCalled(); });

    // ── Journal Entries ──
    it('getJournalEntries', async () => { await api.getJournalEntries(); expect(fetch).toHaveBeenCalled(); });
    it('getJournalEntries with params', async () => {
        await api.getJournalEntries({ startDate: '2026-01-01', endDate: '2026-12-31', sourceType: 'MANUAL', page: 1, limit: 10 });
        expect(fetch).toHaveBeenCalled();
    });
    it('getJournalEntries ignores ALL sourceType', async () => {
        await api.getJournalEntries({ sourceType: 'ALL' });
        const url = (fetch as any).mock.calls[0][0];
        expect(url).not.toContain('sourceType');
    });
    it('getJournalEntry', async () => { await api.getJournalEntry(1); expect(fetch).toHaveBeenCalled(); });
    it('createJournalEntry', async () => { await api.createJournalEntry({}); expect(fetch).toHaveBeenCalled(); });

    // ── Expenses ──
    it('getExpenses', async () => { await api.getExpenses(); expect(fetch).toHaveBeenCalled(); });
    it('getExpenses with filters', async () => {
        await api.getExpenses({ category: 'A', status: 'PAID', startDate: '2026-01-01', endDate: '2026-12-31', page: 1, limit: 20 });
        expect(fetch).toHaveBeenCalled();
    });
    it('getExpenses ignores ALL status', async () => {
        await api.getExpenses({ status: 'ALL' });
        const url = (fetch as any).mock.calls[0][0];
        expect(url).not.toContain('status');
    });
    it('getExpenseCategories', async () => { await api.getExpenseCategories(); expect(fetch).toHaveBeenCalled(); });
    it('createExpense', async () => { await api.createExpense({}); expect(fetch).toHaveBeenCalled(); });
    it('updateExpense', async () => { await api.updateExpense(1, {}); expect(fetch).toHaveBeenCalled(); });
    it('markExpensePaid', async () => { await api.markExpensePaid(1); expect(fetch).toHaveBeenCalled(); });
    it('deleteExpense', async () => { await api.deleteExpense(1); expect(fetch).toHaveBeenCalled(); });

    // ── Reports ──
    it('getBalanceSheet', async () => { await api.getBalanceSheet({ year: 2026, month: 1 }); expect(fetch).toHaveBeenCalled(); });
    it('getIncomeStatement', async () => { await api.getIncomeStatement({ startDate: '2026-01-01', endDate: '2026-12-31' }); expect(fetch).toHaveBeenCalled(); });
    it('getGeneralLedger', async () => { await api.getGeneralLedger({ account: '1105', startDate: '2026-01-01', endDate: '2026-12-31' }); expect(fetch).toHaveBeenCalled(); });
    it('getSubsidiaryLedger', async () => { await api.getSubsidiaryLedger({ account: '1105', startDate: '2026-01-01', endDate: '2026-12-31' }); expect(fetch).toHaveBeenCalled(); });

    // ── Bank Reconciliation ──
    it('getBankAccounts', async () => { await api.getBankAccounts(); expect(fetch).toHaveBeenCalled(); });
    it('createBankAccount', async () => { await api.createBankAccount({ name: 'Test' }); expect(fetch).toHaveBeenCalled(); });
    it('uploadBankStatement', async () => { await api.uploadBankStatement({ bankAccountId: 1, periodStart: '2026-01-01', periodEnd: '2026-01-31', fileName: 'f.csv', csvContent: 'a,b' }); expect(fetch).toHaveBeenCalled(); });
    it('getStatements', async () => { await api.getStatements(); expect(fetch).toHaveBeenCalled(); });
    it('getStatementDetail', async () => { await api.getStatementDetail(1); expect(fetch).toHaveBeenCalled(); });
    it('autoMatchStatement', async () => { await api.autoMatchStatement(1); expect(fetch).toHaveBeenCalled(); });
    it('manualMatchTransaction', async () => { await api.manualMatchTransaction({ bankTransactionId: 1, sourceType: 'ORDER', sourceId: 1 }); expect(fetch).toHaveBeenCalled(); });

    // ── Withholding ──
    it('getWithholdingCertificates', async () => { await api.getWithholdingCertificates({ year: '2026', provider: 'x', concept: 'y' }); expect(fetch).toHaveBeenCalled(); });
    it('generateWithholdingCertificates', async () => { await api.generateWithholdingCertificates(2026); expect(fetch).toHaveBeenCalled(); });
    it('downloadWithholdingPdf success', async () => {
        (global.fetch as any).mockResolvedValue(mockBlob());
        const blob = await api.downloadWithholdingPdf(1);
        expect(blob).toBeInstanceOf(Blob);
    });
    it('downloadWithholdingPdf failure', async () => {
        (global.fetch as any).mockResolvedValue({ ok: false, statusText: 'Not Found' });
        await expect(api.downloadWithholdingPdf(1)).rejects.toThrow();
    });
    it('deleteWithholdingCertificate', async () => { await api.deleteWithholdingCertificate(1); expect(fetch).toHaveBeenCalled(); });

    // ── Payroll ──
    it('getEmployees', async () => { await api.getEmployees({ is_active: 'true' }); expect(fetch).toHaveBeenCalled(); });
    it('createEmployee', async () => { await api.createEmployee({}); expect(fetch).toHaveBeenCalled(); });
    it('updateEmployee', async () => { await api.updateEmployee(1, {}); expect(fetch).toHaveBeenCalled(); });
    it('getPayrollPeriods', async () => { await api.getPayrollPeriods(); expect(fetch).toHaveBeenCalled(); });
    it('createPayrollPeriod', async () => { await api.createPayrollPeriod({}); expect(fetch).toHaveBeenCalled(); });
    it('calculatePayroll', async () => { await api.calculatePayroll(1); expect(fetch).toHaveBeenCalled(); });
    it('approvePayroll', async () => { await api.approvePayroll(1); expect(fetch).toHaveBeenCalled(); });
    it('getPayrollDetail', async () => { await api.getPayrollDetail(1); expect(fetch).toHaveBeenCalled(); });
    it('getPayrollNovedades', async () => { await api.getPayrollNovedades(1); expect(fetch).toHaveBeenCalled(); });
    it('createPayrollNovedad', async () => { await api.createPayrollNovedad({}); expect(fetch).toHaveBeenCalled(); });
    it('deletePayrollNovedad', async () => { await api.deletePayrollNovedad(1); expect(fetch).toHaveBeenCalled(); });
    it('downloadPilaFile success', async () => {
        (global.fetch as any).mockResolvedValue(mockBlob());
        const blob = await api.downloadPilaFile(2026, 1, '900123');
        expect(blob).toBeInstanceOf(Blob);
    });
    it('downloadPilaFile failure', async () => {
        (global.fetch as any).mockResolvedValue(mockBlobFail('err'));
        await expect(api.downloadPilaFile(2026, 1)).rejects.toThrow('err');
    });

    // ── Dashboard / Audit / Closing ──
    it('getAccountingDashboard', async () => { await api.getAccountingDashboard(); expect(fetch).toHaveBeenCalled(); });
    it('getAuditLog', async () => { await api.getAuditLog({ entityType: 'EXPENSE', startDate: '2026-01-01', endDate: '2026-12-31', limit: 50 }); expect(fetch).toHaveBeenCalled(); });
    it('getClosings', async () => { await api.getClosings(); expect(fetch).toHaveBeenCalled(); });
    it('closePeriod', async () => { await api.closePeriod({ year: 2026, month: 1 }); expect(fetch).toHaveBeenCalled(); });
    it('annualClose', async () => { await api.annualClose({ year: 2026 }); expect(fetch).toHaveBeenCalled(); });

    // ── Tax ──
    it('getIvaDeclaration', async () => { await api.getIvaDeclaration({ startDate: '2026-01-01', endDate: '2026-03-31' }); expect(fetch).toHaveBeenCalled(); });
    it('getReteFuenteDeclaration', async () => { await api.getReteFuenteDeclaration({ year: 2026, month: 1 }); expect(fetch).toHaveBeenCalled(); });
    it('getTaxConfigs', async () => { await api.getTaxConfigs(); expect(fetch).toHaveBeenCalled(); });
    it('createTaxConfig', async () => { await api.createTaxConfig({}); expect(fetch).toHaveBeenCalled(); });
    it('deleteTaxConfig', async () => { await api.deleteTaxConfig(1); expect(fetch).toHaveBeenCalled(); });
    it('downloadIvaExport success', async () => {
        (global.fetch as any).mockResolvedValue(mockBlob());
        const blob = await api.downloadIvaExport('2026-01-01', '2026-03-31');
        expect(blob).toBeInstanceOf(Blob);
    });
    it('downloadIvaExport failure', async () => {
        (global.fetch as any).mockResolvedValue(mockBlobFail('iva err'));
        await expect(api.downloadIvaExport('2026-01-01', '2026-03-31')).rejects.toThrow('iva err');
    });

    // ── Cash Flow / Aging / Budget ──
    it('getCashFlow', async () => { await api.getCashFlow({ startDate: '2026-01-01', endDate: '2026-12-31' }); expect(fetch).toHaveBeenCalled(); });
    it('getAgingReport', async () => { await api.getAgingReport(); expect(fetch).toHaveBeenCalled(); });
    it('getPayablesAging', async () => { await api.getPayablesAging(); expect(fetch).toHaveBeenCalled(); });
    it('getInventoryValuation', async () => { await api.getInventoryValuation(); expect(fetch).toHaveBeenCalled(); });
    it('getBudgets', async () => { await api.getBudgets(2026); expect(fetch).toHaveBeenCalled(); });
    it('upsertBudget', async () => { await api.upsertBudget({ year: 2026, month: 1, id_puc_account: 1, budgeted_amount: 1000 }); expect(fetch).toHaveBeenCalled(); });
    it('getBudgetComparison', async () => { await api.getBudgetComparison({ year: 2026, month: 1 }); expect(fetch).toHaveBeenCalled(); });
    it('getAnnualBudgetComparison', async () => { await api.getAnnualBudgetComparison(2026); expect(fetch).toHaveBeenCalled(); });

    // ── Fixed Assets / Depreciation ──
    it('getFixedAssets', async () => { await api.getFixedAssets(); expect(fetch).toHaveBeenCalled(); });
    it('createFixedAsset', async () => { await api.createFixedAsset({}); expect(fetch).toHaveBeenCalled(); });
    it('getFixedAssetDetail', async () => { await api.getFixedAssetDetail(1); expect(fetch).toHaveBeenCalled(); });
    it('runDepreciation', async () => { await api.runDepreciation({ year: 2026, month: 1 }); expect(fetch).toHaveBeenCalled(); });
    it('getFinancialIndicators', async () => { await api.getFinancialIndicators({ year: 2026, month: 1 }); expect(fetch).toHaveBeenCalled(); });

    // ── Export / Exogena ──
    it('exportToExcel', async () => {
        (global.fetch as any).mockResolvedValue(mockBlob());
        global.URL.createObjectURL = vi.fn().mockReturnValue('blob:x');
        global.URL.revokeObjectURL = vi.fn();
        const mockA = { href: '', download: '', click: vi.fn() };
        vi.spyOn(document, 'createElement').mockReturnValue(mockA as any);
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockA as any);
        vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockA as any);
        await api.exportToExcel('balance', { year: '2026' });
        expect(mockA.click).toHaveBeenCalled();
    });
    it('exportToExcel failure', async () => {
        (global.fetch as any).mockResolvedValue({ ok: false });
        await expect(api.exportToExcel('balance', {})).rejects.toThrow();
    });
    it('previewExogena', async () => { await api.previewExogena(2026); expect(fetch).toHaveBeenCalled(); });
    it('generateExogena', async () => {
        (global.fetch as any).mockResolvedValue(mockBlob());
        global.URL.createObjectURL = vi.fn().mockReturnValue('blob:x');
        global.URL.revokeObjectURL = vi.fn();
        const mockA = { href: '', download: '', click: vi.fn() };
        vi.spyOn(document, 'createElement').mockReturnValue(mockA as any);
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockA as any);
        vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockA as any);
        await api.generateExogena(2026);
        expect(mockA.click).toHaveBeenCalled();
    });
    it('generateExogena failure', async () => {
        (global.fetch as any).mockResolvedValue({ ok: false });
        await expect(api.generateExogena(2026)).rejects.toThrow();
    });
    it('getExogenaThirdPartyMovements', async () => { await api.getExogenaThirdPartyMovements(2026, '900123'); expect(fetch).toHaveBeenCalled(); });

    // ── Alerts / Reconciliation / Reverse ──
    it('getAccountingAlerts', async () => { await api.getAccountingAlerts({ draftDays: 7, idleMonths: 3 }); expect(fetch).toHaveBeenCalled(); });
    it('getAccountingAlerts defaults', async () => { await api.getAccountingAlerts(); expect(fetch).toHaveBeenCalled(); });
    it('getMayorAuxiliarReconciliation', async () => { await api.getMayorAuxiliarReconciliation('2026-12-31'); expect(fetch).toHaveBeenCalled(); });
    it('getMayorAuxiliarReconciliation no date', async () => { await api.getMayorAuxiliarReconciliation(); expect(fetch).toHaveBeenCalled(); });
    it('reverseJournalEntry', async () => { await api.reverseJournalEntry(1, 'error'); expect(fetch).toHaveBeenCalled(); });

    // ── Compared Reports ──
    it('getBalanceSheetCompared', async () => { await api.getBalanceSheetCompared(2026, 1, 'PREVIOUS_YEAR'); expect(fetch).toHaveBeenCalled(); });
    it('getIncomeStatementCompared', async () => { await api.getIncomeStatementCompared('2026-01-01', '2026-12-31', 'PREVIOUS_YEAR'); expect(fetch).toHaveBeenCalled(); });
    it('getStatementOfChangesInEquity', async () => { await api.getStatementOfChangesInEquity(2026); expect(fetch).toHaveBeenCalled(); });

    // ── Profitability ──
    it('getProfitabilityByDesign', async () => { await api.getProfitabilityByDesign('2026-01-01', '2026-12-31'); expect(fetch).toHaveBeenCalled(); });
    it('getProfitabilityByCollection', async () => { await api.getProfitabilityByCollection('2026-01-01', '2026-12-31'); expect(fetch).toHaveBeenCalled(); });

    // ── Settings ──
    it('getAccountingSettings', async () => { await api.getAccountingSettings(); expect(fetch).toHaveBeenCalled(); });
    it('updateAccountingSetting', async () => { await api.updateAccountingSetting('k', 'v', 'desc'); expect(fetch).toHaveBeenCalled(); });
    it('bulkUpdateAccountingSettings', async () => { await api.bulkUpdateAccountingSettings([{ key: 'k', value: 'v' }]); expect(fetch).toHaveBeenCalled(); });

    // ── Cash Receipts ──
    it('getCashReceipts', async () => { await api.getCashReceipts(); expect(fetch).toHaveBeenCalled(); });
    it('createCashReceipt', async () => {
        await api.createCashReceipt({ consignment_date: '2026-01-01', bank_puc_code: '1105', advance_puc_code: '2805', amount: 1000, reference: 'ref' });
        expect(fetch).toHaveBeenCalled();
    });
    it('getCashReceiptBalance', async () => { await api.getCashReceiptBalance(1, '280505'); expect(fetch).toHaveBeenCalled(); });
    it('listPendingCashReceipts', async () => { await api.listPendingCashReceipts(); expect(fetch).toHaveBeenCalled(); });

    // ── Manual Invoice ──
    it('createManualDianInvoice', async () => {
        await api.createManualDianInvoice({
            cash_receipt_journal_id: 1, advance_puc_code: '2805', revenue_puc_code: '4135',
            iva_puc_code: '2408', operation_date: '2026-01-01',
            customer: { doc_type: 'NIT', doc_number: '900', name: 'Test' },
            items: [{ description: 'x', quantity: 1, unit_price: 100 }],
        });
        expect(fetch).toHaveBeenCalled();
    });
    it('listManualDianInvoices', async () => { await api.listManualDianInvoices({ startDate: '2026-01-01', endDate: '2026-12-31', status: 'AUTHORIZED', search: 'x' }); expect(fetch).toHaveBeenCalled(); });
    it('listManualDianInvoices no params', async () => { await api.listManualDianInvoices(); expect(fetch).toHaveBeenCalled(); });
});
