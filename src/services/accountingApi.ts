import { handleResponse } from './apiUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3050/api';

const authHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_DIAN_API_KEY || 'TwoSixAdminKey123!'
    };
};

// ── PUC Accounts ──────────────────────────────────────────────

export const getAccounts = async (params?: { search?: string; level?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.level) query.append('level', String(params.level));
    const qs = query.toString() ? `?${query.toString()}` : '';
    const response = await fetch(`${API_URL}/accounting/puc${qs}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getAccounts');
};

export const getAccountTree = async () => {
    const response = await fetch(`${API_URL}/accounting/puc/tree`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getAccountTree');
};

export const createAccount = async (data: any) => {
    const response = await fetch(`${API_URL}/accounting/puc`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return await handleResponse(response, 'createAccount');
};

export const updateAccount = async (id: number, data: any) => {
    const response = await fetch(`${API_URL}/accounting/puc/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return await handleResponse(response, 'updateAccount');
};

export const deleteAccount = async (id: number) => {
    const response = await fetch(`${API_URL}/accounting/puc/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'deleteAccount');
};

// ── Journal Entries ───────────────────────────────────────────

export const getJournalEntries = async (params?: {
    startDate?: string;
    endDate?: string;
    sourceType?: string;
    page?: number;
    limit?: number;
}) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.sourceType && params.sourceType !== 'ALL') query.append('sourceType', params.sourceType);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';
    const response = await fetch(`${API_URL}/accounting/journal${qs}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getJournalEntries');
};

export const getJournalEntry = async (id: number) => {
    const response = await fetch(`${API_URL}/accounting/journal/${id}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getJournalEntry');
};

export const createJournalEntry = async (data: any) => {
    const response = await fetch(`${API_URL}/accounting/journal`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return await handleResponse(response, 'createJournalEntry');
};

// ── Expenses ──────────────────────────────────────────────────

export const getExpenses = async (params?: {
    category?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';
    const response = await fetch(`${API_URL}/accounting/expenses${qs}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getExpenses');
};

export const getExpenseCategories = async () => {
    const response = await fetch(`${API_URL}/accounting/expenses/categories`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getExpenseCategories');
};

export const createExpense = async (data: any) => {
    const response = await fetch(`${API_URL}/accounting/expenses`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return await handleResponse(response, 'createExpense');
};

export const updateExpense = async (id: number, data: any) => {
    const response = await fetch(`${API_URL}/accounting/expenses/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return await handleResponse(response, 'updateExpense');
};

export const markExpensePaid = async (id: number) => {
    const response = await fetch(`${API_URL}/accounting/expenses/${id}/pay`, {
        method: 'POST',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'markExpensePaid');
};

export const deleteExpense = async (id: number) => {
    const response = await fetch(`${API_URL}/accounting/expenses/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'deleteExpense');
};

// ── Reports ───────────────────────────────────────────────────

export const getBalanceSheet = async (params: { year: number; month: number }) => {
    const query = new URLSearchParams({
        year: String(params.year),
        month: String(params.month),
    });
    const response = await fetch(`${API_URL}/accounting/reports/balance-sheet?${query}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getBalanceSheet');
};

export const getIncomeStatement = async (params: { startDate: string; endDate: string }) => {
    const query = new URLSearchParams({
        startDate: params.startDate,
        endDate: params.endDate,
    });
    const response = await fetch(`${API_URL}/accounting/reports/income-statement?${query}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getIncomeStatement');
};

export const getGeneralLedger = async (params: {
    account: string;
    startDate: string;
    endDate: string;
}) => {
    const query = new URLSearchParams({
        account: params.account,
        startDate: params.startDate,
        endDate: params.endDate,
    });
    const response = await fetch(`${API_URL}/accounting/reports/general-ledger?${query}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getGeneralLedger');
};

export const getSubsidiaryLedger = async (params: {
    account: string;
    startDate: string;
    endDate: string;
}) => {
    const query = new URLSearchParams({
        account: params.account,
        startDate: params.startDate,
        endDate: params.endDate,
    });
    const response = await fetch(`${API_URL}/accounting/reports/subsidiary-ledger?${query}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getSubsidiaryLedger');
};

// ── Bank Reconciliation ─────────────────────────────────────

export const getBankAccounts = async () => {
    const response = await fetch(`${API_URL}/accounting/bank-accounts`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getBankAccounts');
};

export const createBankAccount = async (data: any) => {
    const response = await fetch(`${API_URL}/accounting/bank-accounts`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return await handleResponse(response, 'createBankAccount');
};

export const uploadBankStatement = async (data: {
    bankAccountId: number;
    periodStart: string;
    periodEnd: string;
    fileName: string;
    csvContent: string;
}) => {
    const response = await fetch(`${API_URL}/accounting/bank-reconciliation/upload`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return await handleResponse(response, 'uploadBankStatement');
};

export const getStatements = async () => {
    const response = await fetch(`${API_URL}/accounting/bank-reconciliation/statements`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getStatements');
};

export const getStatementDetail = async (id: number) => {
    const response = await fetch(`${API_URL}/accounting/bank-reconciliation/statements/${id}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getStatementDetail');
};

export const autoMatchStatement = async (statementId: number) => {
    const response = await fetch(`${API_URL}/accounting/bank-reconciliation/auto-match/${statementId}`, {
        method: 'POST',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'autoMatchStatement');
};

export const manualMatchTransaction = async (data: {
    bankTransactionId: number;
    sourceType: string;
    sourceId: number;
}) => {
    const response = await fetch(`${API_URL}/accounting/bank-reconciliation/match`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return await handleResponse(response, 'manualMatchTransaction');
};

// ── Withholding Certificates ──────────────────────────────────

export const getWithholdingCertificates = async (params?: {
    year?: string;
    provider?: string;
    concept?: string;
}) => {
    const query = new URLSearchParams();
    if (params?.year) query.append('year', params.year);
    if (params?.provider) query.append('provider', params.provider);
    if (params?.concept) query.append('concept', params.concept);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const response = await fetch(`${API_URL}/accounting/withholding-certificates${qs}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getWithholdingCertificates');
};

export const generateWithholdingCertificates = async (year: number) => {
    const response = await fetch(`${API_URL}/accounting/withholding-certificates/generate`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ year }),
    });
    return await handleResponse(response, 'generateWithholdingCertificates');
};

export const downloadWithholdingPdf = async (id: number) => {
    const response = await fetch(`${API_URL}/accounting/withholding-certificates/${id}/pdf`, {
        method: 'GET',
        headers: { 'x-api-key': import.meta.env.VITE_DIAN_API_KEY || 'TwoSixAdminKey123!' },
    });
    if (!response.ok) {
        throw new Error(`Error descargando PDF: ${response.statusText}`);
    }
    const blob = await response.blob();
    return blob;
};

export const deleteWithholdingCertificate = async (id: number) => {
    const response = await fetch(`${API_URL}/accounting/withholding-certificates/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'deleteWithholdingCertificate');
};

// ── Payroll (Nómina) ─────────────────────────────────────────

export const getEmployees = async (params?: { is_active?: string }) => {
    const query = new URLSearchParams();
    if (params?.is_active) query.append('is_active', params.is_active);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const response = await fetch(`${API_URL}/accounting/payroll/employees${qs}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getEmployees');
};

export const createEmployee = async (data: any) => {
    const response = await fetch(`${API_URL}/accounting/payroll/employees`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return await handleResponse(response, 'createEmployee');
};

export const updateEmployee = async (id: number, data: any) => {
    const response = await fetch(`${API_URL}/accounting/payroll/employees/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return await handleResponse(response, 'updateEmployee');
};

export const getPayrollPeriods = async () => {
    const response = await fetch(`${API_URL}/accounting/payroll/periods`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getPayrollPeriods');
};

export const createPayrollPeriod = async (data: any) => {
    const response = await fetch(`${API_URL}/accounting/payroll/periods`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return await handleResponse(response, 'createPayrollPeriod');
};

export const calculatePayroll = async (periodId: number) => {
    const response = await fetch(`${API_URL}/accounting/payroll/periods/${periodId}/calculate`, {
        method: 'POST',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'calculatePayroll');
};

export const approvePayroll = async (periodId: number) => {
    const response = await fetch(`${API_URL}/accounting/payroll/periods/${periodId}/approve`, {
        method: 'POST',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'approvePayroll');
};

export const getPayrollDetail = async (periodId: number) => {
    const response = await fetch(`${API_URL}/accounting/payroll/periods/${periodId}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getPayrollDetail');
};

// ── Dashboard ────────────────────────────────────────────────

export const getAccountingDashboard = async () => {
    const response = await fetch(`${API_URL}/accounting/dashboard`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getAccountingDashboard');
};

// ── Audit Log ────────────────────────────────────────────────

export const getAuditLog = async (params?: {
    entityType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
}) => {
    const query = new URLSearchParams();
    if (params?.entityType) query.append('entityType', params.entityType);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.limit) query.append('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';
    const response = await fetch(`${API_URL}/accounting/audit-log${qs}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getAuditLog');
};

// ── Period Closing (Cierre Contable) ────────────────────────

export const getClosings = async () => {
    const response = await fetch(`${API_URL}/accounting/closing`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getClosings');
};

export const closePeriod = async (data: { year: number; month: number; closedBy?: string }) => {
    const response = await fetch(`${API_URL}/accounting/closing/close`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return await handleResponse(response, 'closePeriod');
};

export const annualClose = async (data: { year: number; closedBy?: string }) => {
    const response = await fetch(`${API_URL}/accounting/closing/annual`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return await handleResponse(response, 'annualClose');
};

// ── Tax Declarations ────────────────────────────────────────

export const getIvaDeclaration = async (params: { startDate: string; endDate: string }) => {
    const query = new URLSearchParams({
        startDate: params.startDate,
        endDate: params.endDate,
    });
    const response = await fetch(`${API_URL}/accounting/tax/iva?${query}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getIvaDeclaration');
};

export const getReteFuenteDeclaration = async (params: { year: number; month: number }) => {
    const query = new URLSearchParams({
        year: String(params.year),
        month: String(params.month),
    });
    const response = await fetch(`${API_URL}/accounting/tax/retefuente?${query}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getReteFuenteDeclaration');
};

// ── Cash Flow ───────────────────────────────────────────────

export const getCashFlow = async (params: { startDate: string; endDate: string }) => {
    const query = new URLSearchParams({
        startDate: params.startDate,
        endDate: params.endDate,
    });
    const response = await fetch(`${API_URL}/accounting/reports/cash-flow?${query}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getCashFlow');
};

// ── Aging Report ────────────────────────────────────────────

export const getAgingReport = async () => {
    const response = await fetch(`${API_URL}/accounting/reports/aging`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getAgingReport');
};

export const getPayablesAging = async () => {
    const response = await fetch(`${API_URL}/accounting/reports/aging/payables`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getPayablesAging');
};

export const getInventoryValuation = async () => {
    const response = await fetch(`${API_URL}/accounting/reports/aging/inventory`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getInventoryValuation');
};

// ── Budget (Presupuesto) ──────────────────────────────────

export const getBudgets = async (year: number) => {
    const query = new URLSearchParams({ year: String(year) });
    const response = await fetch(`${API_URL}/accounting/budget?${query}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getBudgets');
};

export const upsertBudget = async (data: {
    year: number;
    month: number;
    id_puc_account: number;
    budgeted_amount: number;
    notes?: string;
}) => {
    const response = await fetch(`${API_URL}/accounting/budget`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return await handleResponse(response, 'upsertBudget');
};

export const getBudgetComparison = async (params: { year: number; month: number }) => {
    const query = new URLSearchParams({
        year: String(params.year),
        month: String(params.month),
    });
    const response = await fetch(`${API_URL}/accounting/budget/comparison?${query}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getBudgetComparison');
};

export const getAnnualBudgetComparison = async (year: number) => {
    const query = new URLSearchParams({
        year: String(year),
    });
    const response = await fetch(`${API_URL}/accounting/budget/comparison/annual?${query}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getAnnualBudgetComparison');
};

// ── Fixed Assets & Depreciation ───────────────────────────

export const getFixedAssets = async () => {
    const response = await fetch(`${API_URL}/accounting/assets`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getFixedAssets');
};

export const createFixedAsset = async (data: any) => {
    const response = await fetch(`${API_URL}/accounting/assets`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return await handleResponse(response, 'createFixedAsset');
};

export const getFixedAssetDetail = async (id: number) => {
    const response = await fetch(`${API_URL}/accounting/assets/${id}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getFixedAssetDetail');
};

export const runDepreciation = async (data: { year: number; month: number }) => {
    const response = await fetch(`${API_URL}/accounting/assets/depreciate`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return await handleResponse(response, 'runDepreciation');
};

// ── Financial Indicators ──────────────────────────────────

export const getFinancialIndicators = async (params: { year: number; month: number }) => {
    const query = new URLSearchParams({
        year: String(params.year),
        month: String(params.month),
    });
    const response = await fetch(`${API_URL}/accounting/reports/indicators?${query}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getFinancialIndicators');
};

// ── Excel Export ────────────────────────────────────────────

export const exportToExcel = async (reportType: string, params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/accounting/export/${reportType}?${query}`, {
        headers: { 'x-api-key': import.meta.env.VITE_DIAN_API_KEY || 'TwoSixAdminKey123!' },
    });
    if (!response.ok) throw new Error('Error exportando');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// ── Information Exógena (Medios Magnéticos DIAN) ───────────

export const previewExogena = async (year: number) => {
    const query = new URLSearchParams({ year: String(year) });
    const response = await fetch(`${API_URL}/accounting/exogena/preview?${query}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'previewExogena');
};

export const generateExogena = async (year: number) => {
    const query = new URLSearchParams({ year: String(year) });
    const response = await fetch(`${API_URL}/accounting/exogena/generate?${query}`, {
        headers: { 'x-api-key': import.meta.env.VITE_DIAN_API_KEY || 'TwoSixAdminKey123!' },
    });
    if (!response.ok) throw new Error('Error generando información exógena');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `InformacionExogena_${year}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// ── Tax Configuration (ICA / Autoretención) ──────────────────

export const getTaxConfigs = async () => {
    const response = await fetch(`${API_URL}/accounting/tax-config`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getTaxConfigs');
};

export const createTaxConfig = async (data: any) => {
    const response = await fetch(`${API_URL}/accounting/tax-config`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return await handleResponse(response, 'createTaxConfig');
};

export const deleteTaxConfig = async (id: number) => {
    const response = await fetch(`${API_URL}/accounting/tax-config/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'deleteTaxConfig');
};

// ── Profitability Reports ──────────────────────────────────

export const getProfitabilityByDesign = async (startDate: string, endDate: string) => {
    const query = new URLSearchParams({ startDate, endDate });
    const response = await fetch(`${API_URL}/accounting/reports/profitability/design?${query}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getProfitabilityByDesign');
};

export const getProfitabilityByCollection = async (startDate: string, endDate: string) => {
    const query = new URLSearchParams({ startDate, endDate });
    const response = await fetch(`${API_URL}/accounting/reports/profitability/collection?${query}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getProfitabilityByCollection');
};

export const getExogenaThirdPartyMovements = async (year: number, nit: string) => {
    const query = new URLSearchParams({ year: String(year), nit });
    const response = await fetch(`${API_URL}/accounting/exogena/movements?${query}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getExogenaThirdPartyMovements');
};

// ── Alertas / Reconciliación / Reverso ──────────────────────

export const getAccountingAlerts = async (params: { draftDays?: number; idleMonths?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.draftDays) qs.set('draftDays', String(params.draftDays));
    if (params.idleMonths) qs.set('idleMonths', String(params.idleMonths));
    const query = qs.toString();
    const response = await fetch(`${API_URL}/accounting/alerts${query ? '?' + query : ''}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getAccountingAlerts');
};

export const getMayorAuxiliarReconciliation = async (endDate?: string) => {
    const qs = endDate ? `?endDate=${endDate}` : '';
    const response = await fetch(`${API_URL}/accounting/reconciliation/mayor-auxiliar${qs}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getMayorAuxiliarReconciliation');
};

export const reverseJournalEntry = async (id: number, reason: string) => {
    const response = await fetch(`${API_URL}/accounting/journal/${id}/reverse`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ reason }),
    });
    return await handleResponse(response, 'reverseJournalEntry');
};

export const getBalanceSheetCompared = async (
    year: number,
    month: number,
    compareWith: 'PREVIOUS_MONTH' | 'PREVIOUS_YEAR' = 'PREVIOUS_YEAR',
) => {
    const qs = new URLSearchParams({ year: String(year), month: String(month), compareWith });
    const response = await fetch(`${API_URL}/accounting/reports/balance-sheet/compared?${qs}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getBalanceSheetCompared');
};

export const getIncomeStatementCompared = async (
    startDate: string,
    endDate: string,
    compareWith: 'PREVIOUS_PERIOD' | 'PREVIOUS_YEAR' = 'PREVIOUS_YEAR',
) => {
    const qs = new URLSearchParams({ startDate, endDate, compareWith });
    const response = await fetch(`${API_URL}/accounting/reports/income-statement/compared?${qs}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getIncomeStatementCompared');
};

export const getStatementOfChangesInEquity = async (year: number) => {
    const response = await fetch(
        `${API_URL}/accounting/reports/statement-of-changes-equity?year=${year}`,
        { method: 'GET', headers: authHeaders() },
    );
    return await handleResponse(response, 'getStatementOfChangesInEquity');
};

// ── Payroll novedades + PILA ────────────────────────────────

export const getPayrollNovedades = async (periodId: number) => {
    const response = await fetch(`${API_URL}/accounting/payroll/periods/${periodId}/novedades`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getPayrollNovedades');
};

export const createPayrollNovedad = async (data: any) => {
    const response = await fetch(`${API_URL}/accounting/payroll/novedades`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return await handleResponse(response, 'createPayrollNovedad');
};

export const deletePayrollNovedad = async (id: number) => {
    const response = await fetch(`${API_URL}/accounting/payroll/novedades/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'deletePayrollNovedad');
};

export const downloadPilaFile = async (year: number, month: number, nit?: string) => {
    const qs = nit ? `?nit=${nit}` : '';
    const response = await fetch(`${API_URL}/accounting/payroll/pila/${year}/${month}${qs}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Error ${response.status}`);
    }
    return await response.blob();
};

// ── Settings contables ──────────────────────────────────────

export const getAccountingSettings = async () => {
    const response = await fetch(`${API_URL}/accounting/settings`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getAccountingSettings');
};

export const updateAccountingSetting = async (key: string, value: string, description?: string) => {
    const response = await fetch(`${API_URL}/accounting/settings`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ key, value, description }),
    });
    return await handleResponse(response, 'updateAccountingSetting');
};

export const bulkUpdateAccountingSettings = async (
    updates: Array<{ key: string; value: string }>,
) => {
    const response = await fetch(`${API_URL}/accounting/settings/bulk`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ updates }),
    });
    return await handleResponse(response, 'bulkUpdateAccountingSettings');
};

// ── Recibo de Caja (Anticipos) ──────────────────────────────

export interface CashReceiptPayload {
    consignment_date: string;
    bank_puc_code: string;
    advance_puc_code: string;
    amount: number;
    customer_nit?: string;
    customer_name?: string;
    reference: string;
    notes?: string;
    created_by?: number;
}

export const getCashReceipts = async () => {
    const response = await fetch(`${API_URL}/accounting/cash-receipt`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getCashReceipts');
};

export const createCashReceipt = async (payload: CashReceiptPayload) => {
    const response = await fetch(`${API_URL}/accounting/cash-receipt`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return await handleResponse(response, 'createCashReceipt');
};

export const getCashReceiptBalance = async (journalEntryId: number, advancePucCode: string) => {
    const qs = new URLSearchParams({ advance_puc_code: advancePucCode });
    const response = await fetch(`${API_URL}/accounting/cash-receipt/${journalEntryId}/balance?${qs}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'getCashReceiptBalance');
};

export const listPendingCashReceipts = async (advancePucCode: string = '280505') => {
    const qs = new URLSearchParams({ advance_puc_code: advancePucCode });
    const response = await fetch(`${API_URL}/accounting/cash-receipt/pending?${qs}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'listPendingCashReceipts');
};

// ── Factura DIAN Manual (cruce anticipo) ────────────────────

export interface ManualInvoiceItem {
    description: string;
    quantity: number;
    unit_price: number;
    iva_rate?: number;
}

export interface ManualInvoiceCustomer {
    doc_type: string;
    doc_number: string;
    name: string;
    email?: string;
    address?: string;
    city?: string;
}

export interface ManualInvoicePayload {
    cash_receipt_journal_id: number;
    advance_puc_code: string;
    revenue_puc_code: string;
    iva_puc_code: string;
    operation_date: string;
    customer: ManualInvoiceCustomer;
    items: ManualInvoiceItem[];
    notes?: string;
    created_by?: number;
}

export const createManualDianInvoice = async (payload: ManualInvoicePayload) => {
    const response = await fetch(`${API_URL}/accounting/manual-invoice`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return await handleResponse(response, 'createManualDianInvoice');
};

export const listManualDianInvoices = async (params?: { startDate?: string; endDate?: string; status?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.startDate) qs.append('startDate', params.startDate);
    if (params?.endDate) qs.append('endDate', params.endDate);
    if (params?.status) qs.append('status', params.status);
    if (params?.search) qs.append('search', params.search);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    const response = await fetch(`${API_URL}/accounting/manual-invoice${suffix}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return await handleResponse(response, 'listManualDianInvoices');
};

// ── Export IVA ──────────────────────────────────────────────

export const downloadIvaExport = async (startDate: string, endDate: string) => {
    const qs = new URLSearchParams({ startDate, endDate });
    const response = await fetch(`${API_URL}/accounting/tax/iva/export?${qs}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Error ${response.status}`);
    }
    return await response.blob();
};
