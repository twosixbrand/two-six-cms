import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiRefreshCcw, FiUpload, FiCheck, FiX, FiLink } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import { Button, StatusBadge, LoadingSpinner, DataTable } from '../../components/ui';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const statusColors: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'neutral' }> = {
    PENDING: { label: 'Pendiente', variant: 'warning' },
    PARTIAL: { label: 'Parcial', variant: 'info' },
    RECONCILED: { label: 'Conciliado', variant: 'success' },
};

const BankReconciliationPage = () => {
    const [activeTab, setActiveTab] = useState<'accounts' | 'statements' | 'reconciliation'>('accounts');

    // Bank Accounts State
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [accountForm, setAccountForm] = useState({
        name: '', bank_name: '', account_number: '', account_type: 'AHORROS', id_puc_account: 0,
    });
    const [accountLoading, setAccountLoading] = useState(false);

    // Statements State
    const [statements, setStatements] = useState<any[]>([]);
    const [statementsLoading, setStatementsLoading] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        bankAccountId: 0, periodStart: '', periodEnd: '', fileName: '', csvContent: '',
    });

    // Reconciliation State
    const [selectedStatementId, setSelectedStatementId] = useState<number | null>(null);
    const [statementDetail, setStatementDetail] = useState<any>(null);
    const [reconciliationLoading, setReconciliationLoading] = useState(false);
    const [matchForm, setMatchForm] = useState<{ txnId: number | null; sourceType: string; sourceId: string }>({
        txnId: null, sourceType: 'PAYMENT', sourceId: '',
    });

    const [error, setError] = useState('');

    // Fetch Functions

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

    // Handlers

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

    // Bank account columns
    const bankAccountColumns = [
        { key: 'name', header: 'Nombre' },
        { key: 'bank_name', header: 'Banco' },
        { key: 'account_number', header: 'No. Cuenta' },
        { key: 'account_type', header: 'Tipo' },
        { key: '_count', header: 'Extractos', render: (_val: any, row: any) => row._count?.statements ?? 0 },
        {
            key: 'is_active',
            header: 'Estado',
            render: (val: any) => (
                <StatusBadge
                    status={val ? 'Activa' : 'Inactiva'}
                    variant={val ? 'success' : 'error'}
                    size="sm"
                />
            ),
        },
    ];

    // Statement columns
    const statementColumns = [
        { key: 'id', header: 'ID' },
        { key: 'bankAccount', header: 'Cuenta', render: (_val: any, row: any) => row.bankAccount?.name || '-' },
        { key: 'file_name', header: 'Archivo' },
        {
            key: 'period_start',
            header: 'Periodo',
            render: (_val: any, row: any) => `${formatDate(row.period_start)} - ${formatDate(row.period_end)}`,
        },
        { key: '_count', header: 'Transacciones', render: (_val: any, row: any) => row._count?.transactions ?? 0 },
        {
            key: 'status',
            header: 'Estado',
            render: (val: any) => {
                const sc = statusColors[val] || statusColors.PENDING;
                return <StatusBadge status={sc.label} variant={sc.variant} size="sm" />;
            },
        },
        { key: 'upload_date', header: 'Fecha Subida', render: (val: any) => formatDate(val) },
    ];

    // Reconciliation transaction columns
    const txnColumns = [
        { key: 'transaction_date', header: 'Fecha', render: (val: any) => formatDate(val) },
        {
            key: 'description',
            header: 'Descripcion',
            render: (val: any) => (
                <span style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
                    {val}
                </span>
            ),
        },
        { key: 'reference', header: 'Referencia', render: (val: any) => val || '-' },
        {
            key: 'debit',
            header: 'Debito',
            align: 'right' as const,
            render: (val: any) => val > 0 ? <span style={{ color: '#c62828' }}>{formatCurrency(val)}</span> : '-',
        },
        {
            key: 'credit',
            header: 'Credito',
            align: 'right' as const,
            render: (val: any) => val > 0 ? <span style={{ color: '#2e7d32' }}>{formatCurrency(val)}</span> : '-',
        },
        {
            key: 'balance',
            header: 'Saldo',
            align: 'right' as const,
            render: (val: any) => val != null ? formatCurrency(val) : '-',
        },
        {
            key: 'matched',
            header: 'Estado',
            align: 'center' as const,
            render: (val: any) => val
                ? <FiCheck style={{ color: '#2e7d32' }} />
                : <FiX style={{ color: '#f57f17' }} />,
        },
        {
            key: 'matched_source_type',
            header: 'Fuente',
            render: (_val: any, row: any) => row.matched
                ? `${row.matched_source_type} #${row.matched_source_id}`
                : (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMatchForm({ txnId: row.id, sourceType: 'PAYMENT', sourceId: '' })}
                    >
                        Conciliar
                    </Button>
                ),
        },
    ];

    return (
        <div>
            <PageHeader title="Conciliacion Bancaria" icon={<FiDollarSign />} />

            {error && (
                <div style={{ background: '#fce4ec', padding: '12px', borderRadius: 8, marginBottom: 16, color: '#c62828', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {error}
                    <Button variant="ghost" size="sm" onClick={() => setError('')}>
                        <FiX />
                    </Button>
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

            {/* Tab: Bank Accounts */}
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
                        <Button variant="primary" type="submit">
                            Crear Cuenta
                        </Button>
                    </form>

                    <h3 style={{ marginBottom: 12 }}>Cuentas Bancarias</h3>
                    <DataTable
                        columns={bankAccountColumns}
                        data={bankAccounts}
                        loading={accountLoading}
                        emptyMessage="No hay cuentas bancarias registradas"
                    />
                </div>
            )}

            {/* Tab: Statements */}
            {activeTab === 'statements' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3>Extractos Bancarios</h3>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Button variant="ghost" size="sm" icon={<FiRefreshCcw />} onClick={() => fetchStatements()}>
                                {''}
                            </Button>
                            <Button variant="primary" size="sm" icon={<FiUpload />} onClick={() => setShowUploadForm(!showUploadForm)}>
                                Subir Extracto
                            </Button>
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
                                <Button variant="primary" type="submit">Subir</Button>
                                <Button variant="ghost" onClick={() => setShowUploadForm(false)}>Cancelar</Button>
                            </div>
                        </form>
                    )}

                    <DataTable
                        columns={statementColumns}
                        data={statements}
                        loading={statementsLoading}
                        emptyMessage="No hay extractos cargados"
                        onRowClick={(st: any) => { setSelectedStatementId(st.id); setActiveTab('reconciliation'); }}
                    />
                </div>
            )}

            {/* Tab: Reconciliation */}
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
                            <Button
                                variant="primary"
                                icon={<FiLink />}
                                onClick={handleAutoMatch}
                                loading={reconciliationLoading}
                                disabled={reconciliationLoading}
                            >
                                Auto-Conciliar
                            </Button>
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
                        <LoadingSpinner text="Cargando..." />
                    ) : statementDetail ? (
                        <>
                            <DataTable
                                columns={txnColumns}
                                data={statementDetail.transactions || []}
                                emptyMessage="No hay transacciones"
                            />

                            {/* Manual Match Form */}
                            {matchForm.txnId && (
                                <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, border: '1px solid #ddd', marginTop: 16 }}>
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
                                        <Button variant="primary" onClick={handleManualMatch}>Conciliar</Button>
                                        <Button variant="ghost" onClick={() => setMatchForm({ txnId: null, sourceType: 'PAYMENT', sourceId: '' })}>Cancelar</Button>
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
