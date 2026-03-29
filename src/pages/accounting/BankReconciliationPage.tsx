import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiRefreshCcw, FiUpload, FiCheck, FiX, FiLink } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const statusColors: Record<string, { label: string; bg: string; color: string }> = {
    PENDING: { label: 'Pendiente', bg: '#fff8e1', color: '#f57f17' },
    PARTIAL: { label: 'Parcial', bg: '#e3f2fd', color: '#1565c0' },
    RECONCILED: { label: 'Conciliado', bg: '#e8f5e9', color: '#2e7d32' },
};

const BankReconciliationPage = () => {
    const [activeTab, setActiveTab] = useState<'accounts' | 'statements' | 'reconciliation'>('accounts');

    // ── Bank Accounts State ─────────────────────────────────────
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [accountForm, setAccountForm] = useState({
        name: '', bank_name: '', account_number: '', account_type: 'AHORROS', id_puc_account: 0,
    });
    const [accountLoading, setAccountLoading] = useState(false);

    // ── Statements State ────────────────────────────────────────
    const [statements, setStatements] = useState<any[]>([]);
    const [statementsLoading, setStatementsLoading] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        bankAccountId: 0, periodStart: '', periodEnd: '', fileName: '', csvContent: '',
    });

    // ── Reconciliation State ────────────────────────────────────
    const [selectedStatementId, setSelectedStatementId] = useState<number | null>(null);
    const [statementDetail, setStatementDetail] = useState<any>(null);
    const [reconciliationLoading, setReconciliationLoading] = useState(false);
    const [matchForm, setMatchForm] = useState<{ txnId: number | null; sourceType: string; sourceId: string }>({
        txnId: null, sourceType: 'PAYMENT', sourceId: '',
    });

    const [error, setError] = useState('');

    // ── Fetch Functions ─────────────────────────────────────────

    const fetchBankAccounts = async () => {
        try {
            setAccountLoading(true);
            const data = await accountingApi.getBankAccounts();
            setBankAccounts(Array.isArray(data) ? data : []);
        } catch (err) {
            logError(err, '/accounting/bank-reconciliation');
            setError('Error al cargar cuentas bancarias.');
        } finally {
            setAccountLoading(false);
        }
    };

    const fetchStatements = async () => {
        try {
            setStatementsLoading(true);
            const data = await accountingApi.getStatements();
            setStatements(Array.isArray(data) ? data : []);
        } catch (err) {
            logError(err, '/accounting/bank-reconciliation');
            setError('Error al cargar extractos.');
        } finally {
            setStatementsLoading(false);
        }
    };

    const fetchStatementDetail = async (id: number) => {
        try {
            setReconciliationLoading(true);
            const data = await accountingApi.getStatementDetail(id);
            setStatementDetail(data);
        } catch (err) {
            logError(err, '/accounting/bank-reconciliation');
            setError('Error al cargar detalle del extracto.');
        } finally {
            setReconciliationLoading(false);
        }
    };

    useEffect(() => {
        fetchBankAccounts();
        fetchStatements();
    }, []);

    useEffect(() => {
        if (selectedStatementId) {
            fetchStatementDetail(selectedStatementId);
        }
    }, [selectedStatementId]);

    // ── Handlers ────────────────────────────────────────────────

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await accountingApi.createBankAccount(accountForm);
            setAccountForm({ name: '', bank_name: '', account_number: '', account_type: 'AHORROS', id_puc_account: 0 });
            fetchBankAccounts();
        } catch (err: any) {
            alert('Error: ' + (err.message || err));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setUploadForm((prev) => ({
                ...prev,
                fileName: file.name,
                csvContent: ev.target?.result as string,
            }));
        };
        reader.readAsText(file);
    };

    const handleUploadStatement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadForm.csvContent) {
            alert('Por favor seleccione un archivo CSV');
            return;
        }
        try {
            await accountingApi.uploadBankStatement(uploadForm);
            setShowUploadForm(false);
            setUploadForm({ bankAccountId: 0, periodStart: '', periodEnd: '', fileName: '', csvContent: '' });
            fetchStatements();
        } catch (err: any) {
            alert('Error: ' + (err.message || err));
        }
    };

    const handleAutoMatch = async () => {
        if (!selectedStatementId) return;
        try {
            setReconciliationLoading(true);
            const result = await accountingApi.autoMatchStatement(selectedStatementId);
            alert(`Auto-conciliacion completada: ${result.newlyMatched} transacciones conciliadas de ${result.totalTransactions} totales.`);
            fetchStatementDetail(selectedStatementId);
            fetchStatements();
        } catch (err: any) {
            alert('Error: ' + (err.message || err));
        } finally {
            setReconciliationLoading(false);
        }
    };

    const handleManualMatch = async () => {
        if (!matchForm.txnId || !matchForm.sourceId) {
            alert('Complete todos los campos de conciliacion manual');
            return;
        }
        try {
            await accountingApi.manualMatchTransaction({
                bankTransactionId: matchForm.txnId,
                sourceType: matchForm.sourceType,
                sourceId: parseInt(matchForm.sourceId, 10),
            });
            setMatchForm({ txnId: null, sourceType: 'PAYMENT', sourceId: '' });
            if (selectedStatementId) {
                fetchStatementDetail(selectedStatementId);
                fetchStatements();
            }
        } catch (err: any) {
            alert('Error: ' + (err.message || err));
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('es-CO');

    // ── Render ──────────────────────────────────────────────────

    return (
        <div>
            <PageHeader title="Conciliacion Bancaria" icon={<FiDollarSign />} />

            {error && (
                <div style={{ background: '#fce4ec', padding: '12px', borderRadius: 8, marginBottom: 16, color: '#c62828' }}>
                    {error}
                    <button onClick={() => setError('')} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
                        <FiX />
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid #e0e0e0' }}>
                {[
                    { key: 'accounts' as const, label: 'Cuentas Bancarias' },
                    { key: 'statements' as const, label: 'Extractos' },
                    { key: 'reconciliation' as const, label: 'Conciliacion' },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: '12px 24px',
                            border: 'none',
                            borderBottom: activeTab === tab.key ? '3px solid #1976d2' : '3px solid transparent',
                            background: activeTab === tab.key ? '#e3f2fd' : 'transparent',
                            color: activeTab === tab.key ? '#1976d2' : '#666',
                            fontWeight: activeTab === tab.key ? 600 : 400,
                            cursor: 'pointer',
                            fontSize: 14,
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Tab: Bank Accounts ─────────────────────────────── */}
            {activeTab === 'accounts' && (
                <div>
                    <h3 style={{ marginBottom: 16 }}>Crear Cuenta Bancaria</h3>
                    <form onSubmit={handleCreateAccount} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24, background: '#fafafa', padding: 16, borderRadius: 8 }}>
                        <input
                            placeholder="Nombre de cuenta"
                            value={accountForm.name}
                            onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                            required
                            style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
                        />
                        <input
                            placeholder="Nombre del banco"
                            value={accountForm.bank_name}
                            onChange={(e) => setAccountForm({ ...accountForm, bank_name: e.target.value })}
                            required
                            style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
                        />
                        <input
                            placeholder="Numero de cuenta"
                            value={accountForm.account_number}
                            onChange={(e) => setAccountForm({ ...accountForm, account_number: e.target.value })}
                            required
                            style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
                        />
                        <select
                            value={accountForm.account_type}
                            onChange={(e) => setAccountForm({ ...accountForm, account_type: e.target.value })}
                            style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
                        >
                            <option value="AHORROS">Ahorros</option>
                            <option value="CORRIENTE">Corriente</option>
                        </select>
                        <input
                            type="number"
                            placeholder="ID Cuenta PUC"
                            value={accountForm.id_puc_account || ''}
                            onChange={(e) => setAccountForm({ ...accountForm, id_puc_account: parseInt(e.target.value, 10) || 0 })}
                            required
                            style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
                        />
                        <button type="submit" style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                            Crear Cuenta
                        </button>
                    </form>

                    <h3 style={{ marginBottom: 12 }}>Cuentas Bancarias</h3>
                    {accountLoading ? (
                        <p>Cargando...</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                                    <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>Nombre</th>
                                    <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>Banco</th>
                                    <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>No. Cuenta</th>
                                    <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>Tipo</th>
                                    <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>Extractos</th>
                                    <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bankAccounts.map((acc) => (
                                    <tr key={acc.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: 10 }}>{acc.name}</td>
                                        <td style={{ padding: 10 }}>{acc.bank_name}</td>
                                        <td style={{ padding: 10 }}>{acc.account_number}</td>
                                        <td style={{ padding: 10 }}>{acc.account_type}</td>
                                        <td style={{ padding: 10 }}>{acc._count?.statements ?? 0}</td>
                                        <td style={{ padding: 10 }}>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: 12,
                                                fontSize: 12,
                                                background: acc.is_active ? '#e8f5e9' : '#fce4ec',
                                                color: acc.is_active ? '#2e7d32' : '#c62828',
                                            }}>
                                                {acc.is_active ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {bankAccounts.length === 0 && (
                                    <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: '#999' }}>No hay cuentas bancarias registradas</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ── Tab: Statements ────────────────────────────────── */}
            {activeTab === 'statements' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3>Extractos Bancarios</h3>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => fetchStatements()} style={{ padding: '8px 12px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' }}>
                                <FiRefreshCcw size={14} />
                            </button>
                            <button onClick={() => setShowUploadForm(!showUploadForm)} style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <FiUpload size={14} /> Subir Extracto
                            </button>
                        </div>
                    </div>

                    {showUploadForm && (
                        <form onSubmit={handleUploadStatement} style={{ background: '#fafafa', padding: 16, borderRadius: 8, marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Cuenta Bancaria</label>
                                <select
                                    value={uploadForm.bankAccountId}
                                    onChange={(e) => setUploadForm({ ...uploadForm, bankAccountId: parseInt(e.target.value, 10) })}
                                    required
                                    style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
                                >
                                    <option value={0}>Seleccione una cuenta...</option>
                                    {bankAccounts.map((acc) => (
                                        <option key={acc.id} value={acc.id}>{acc.name} - {acc.bank_name} ({acc.account_number})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Periodo Inicio</label>
                                <input
                                    type="date"
                                    value={uploadForm.periodStart}
                                    onChange={(e) => setUploadForm({ ...uploadForm, periodStart: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Periodo Fin</label>
                                <input
                                    type="date"
                                    value={uploadForm.periodEnd}
                                    onChange={(e) => setUploadForm({ ...uploadForm, periodEnd: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
                                />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Archivo CSV</label>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    required
                                    style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
                                />
                                <small style={{ color: '#888' }}>Columnas esperadas: date, description, reference, debit, credit, balance</small>
                            </div>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
                                <button type="submit" style={{ padding: '8px 20px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                                    Subir
                                </button>
                                <button type="button" onClick={() => setShowUploadForm(false)} style={{ padding: '8px 20px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' }}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}

                    {statementsLoading ? (
                        <p>Cargando...</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                                    <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>ID</th>
                                    <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>Cuenta</th>
                                    <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>Archivo</th>
                                    <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>Periodo</th>
                                    <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>Transacciones</th>
                                    <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>Estado</th>
                                    <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>Fecha Subida</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statements.map((st) => {
                                    const sc = statusColors[st.status] || statusColors.PENDING;
                                    return (
                                        <tr key={st.id} style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }}
                                            onClick={() => { setSelectedStatementId(st.id); setActiveTab('reconciliation'); }}
                                        >
                                            <td style={{ padding: 10 }}>{st.id}</td>
                                            <td style={{ padding: 10 }}>{st.bankAccount?.name || '-'}</td>
                                            <td style={{ padding: 10 }}>{st.file_name}</td>
                                            <td style={{ padding: 10 }}>{formatDate(st.period_start)} - {formatDate(st.period_end)}</td>
                                            <td style={{ padding: 10 }}>{st._count?.transactions ?? 0}</td>
                                            <td style={{ padding: 10 }}>
                                                <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 12, background: sc.bg, color: sc.color }}>
                                                    {sc.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: 10 }}>{formatDate(st.upload_date)}</td>
                                        </tr>
                                    );
                                })}
                                {statements.length === 0 && (
                                    <tr><td colSpan={7} style={{ padding: 20, textAlign: 'center', color: '#999' }}>No hay extractos cargados</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ── Tab: Reconciliation ────────────────────────────── */}
            {activeTab === 'reconciliation' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <h3 style={{ margin: 0 }}>Conciliacion</h3>
                            <select
                                value={selectedStatementId ?? ''}
                                onChange={(e) => setSelectedStatementId(e.target.value ? parseInt(e.target.value, 10) : null)}
                                style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
                            >
                                <option value="">Seleccione extracto...</option>
                                {statements.map((st) => (
                                    <option key={st.id} value={st.id}>
                                        #{st.id} - {st.bankAccount?.name} ({formatDate(st.period_start)} - {formatDate(st.period_end)})
                                    </option>
                                ))}
                            </select>
                        </div>
                        {selectedStatementId && (
                            <button
                                onClick={handleAutoMatch}
                                disabled={reconciliationLoading}
                                style={{ padding: '8px 16px', background: '#388e3c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                                <FiLink size={14} /> Auto-Conciliar
                            </button>
                        )}
                    </div>

                    {statementDetail && (
                        <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 16, display: 'flex', gap: 24 }}>
                            <span><strong>Cuenta:</strong> {statementDetail.bankAccount?.name}</span>
                            <span><strong>Estado:</strong> {statusColors[statementDetail.status]?.label}</span>
                            <span><strong>Total:</strong> {statementDetail.transactions?.length ?? 0} transacciones</span>
                            <span><strong>Conciliadas:</strong> {statementDetail.transactions?.filter((t: any) => t.matched).length ?? 0}</span>
                        </div>
                    )}

                    {reconciliationLoading ? (
                        <p>Cargando...</p>
                    ) : statementDetail ? (
                        <>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
                                <thead>
                                    <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                                        <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>Fecha</th>
                                        <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>Descripcion</th>
                                        <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>Referencia</th>
                                        <th style={{ padding: 10, borderBottom: '2px solid #ddd', textAlign: 'right' }}>Debito</th>
                                        <th style={{ padding: 10, borderBottom: '2px solid #ddd', textAlign: 'right' }}>Credito</th>
                                        <th style={{ padding: 10, borderBottom: '2px solid #ddd', textAlign: 'right' }}>Saldo</th>
                                        <th style={{ padding: 10, borderBottom: '2px solid #ddd', textAlign: 'center' }}>Estado</th>
                                        <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>Fuente</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {statementDetail.transactions?.map((txn: any) => (
                                        <tr key={txn.id} style={{
                                            borderBottom: '1px solid #eee',
                                            background: txn.matched ? '#f1f8e9' : '#fff',
                                        }}>
                                            <td style={{ padding: 10 }}>{formatDate(txn.transaction_date)}</td>
                                            <td style={{ padding: 10, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{txn.description}</td>
                                            <td style={{ padding: 10 }}>{txn.reference || '-'}</td>
                                            <td style={{ padding: 10, textAlign: 'right', color: txn.debit > 0 ? '#c62828' : '#999' }}>
                                                {txn.debit > 0 ? formatCurrency(txn.debit) : '-'}
                                            </td>
                                            <td style={{ padding: 10, textAlign: 'right', color: txn.credit > 0 ? '#2e7d32' : '#999' }}>
                                                {txn.credit > 0 ? formatCurrency(txn.credit) : '-'}
                                            </td>
                                            <td style={{ padding: 10, textAlign: 'right' }}>
                                                {txn.balance != null ? formatCurrency(txn.balance) : '-'}
                                            </td>
                                            <td style={{ padding: 10, textAlign: 'center' }}>
                                                {txn.matched ? (
                                                    <FiCheck style={{ color: '#2e7d32' }} />
                                                ) : (
                                                    <FiX style={{ color: '#f57f17' }} />
                                                )}
                                            </td>
                                            <td style={{ padding: 10, fontSize: 12 }}>
                                                {txn.matched
                                                    ? `${txn.matched_source_type} #${txn.matched_source_id}`
                                                    : (
                                                        <button
                                                            onClick={() => setMatchForm({ txnId: txn.id, sourceType: 'PAYMENT', sourceId: '' })}
                                                            style={{ padding: '2px 8px', background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}
                                                        >
                                                            Conciliar
                                                        </button>
                                                    )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Manual Match Form */}
                            {matchForm.txnId && (
                                <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, border: '1px solid #ddd' }}>
                                    <h4 style={{ marginTop: 0, marginBottom: 12 }}>Conciliacion Manual - Transaccion #{matchForm.txnId}</h4>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500 }}>Tipo</label>
                                            <select
                                                value={matchForm.sourceType}
                                                onChange={(e) => setMatchForm({ ...matchForm, sourceType: e.target.value })}
                                                style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
                                            >
                                                <option value="PAYMENT">Pago</option>
                                                <option value="EXPENSE">Gasto</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500 }}>ID del {matchForm.sourceType === 'PAYMENT' ? 'Pago' : 'Gasto'}</label>
                                            <input
                                                type="number"
                                                value={matchForm.sourceId}
                                                onChange={(e) => setMatchForm({ ...matchForm, sourceId: e.target.value })}
                                                placeholder="ID"
                                                style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4, width: 120 }}
                                            />
                                        </div>
                                        <button
                                            onClick={handleManualMatch}
                                            style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                        >
                                            Conciliar
                                        </button>
                                        <button
                                            onClick={() => setMatchForm({ txnId: null, sourceType: 'PAYMENT', sourceId: '' })}
                                            style={{ padding: '8px 16px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' }}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <p style={{ color: '#999', textAlign: 'center', padding: 40 }}>
                            Seleccione un extracto bancario para ver las transacciones y conciliar.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BankReconciliationPage;
