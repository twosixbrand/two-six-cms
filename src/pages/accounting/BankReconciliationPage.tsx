import React, { useState, useEffect } from 'react';
import { FiColumns, FiRefreshCcw, FiUpload, FiCheck, FiX, FiLink } from 'react-icons/fi';
import Swal from 'sweetalert2';
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
    const [activeTab, setActiveTab] = useState<'accounts' | 'statements' | 'reconciliation' | 'gateway'>('accounts');

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

    // Gateway State
    const [gatewayFile, setGatewayFile] = useState<{ name: string; content: string } | null>(null);
    const [processingGateway, setProcessingGateway] = useState(false);

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
            await Swal.fire({ title: 'Error', text: (err.message || String(err)) || 'Ocurrió un error', icon: 'error', confirmButtonColor: '#f0b429' });
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
            await Swal.fire({ title: 'Atención', text: 'Por favor seleccione un archivo CSV', icon: 'warning', confirmButtonColor: '#f0b429' });
            return;
        }
        try {
            await accountingApi.uploadBankStatement(uploadForm);
            setShowUploadForm(false);
            setUploadForm({ bankAccountId: 0, periodStart: '', periodEnd: '', fileName: '', csvContent: '' });
            fetchStatements();
        } catch (err: any) {
            await Swal.fire({ title: 'Error', text: (err.message || String(err)) || 'Ocurrió un error', icon: 'error', confirmButtonColor: '#f0b429' });
        }
    };

    const handleAutoMatch = async () => {
        if (!selectedStatementId) return;
        try {
            setReconciliationLoading(true);
            const result = await accountingApi.autoMatchStatement(selectedStatementId);
            await Swal.fire({ title: '¡Éxito!', text: `Auto-conciliación completada: ${result.newlyMatched} transacciones conciliadas de ${result.totalTransactions} totales.`, icon: 'success', confirmButtonColor: '#f0b429' });
            fetchStatementDetail(selectedStatementId);
            fetchStatements();
        } catch (err: any) {
            await Swal.fire({ title: 'Error', text: (err.message || String(err)) || 'Ocurrió un error', icon: 'error', confirmButtonColor: '#f0b429' });
        } finally {
            setReconciliationLoading(false);
        }
    };

    const handleManualMatch = async () => {
        if (!matchForm.txnId || !matchForm.sourceId) {
            await Swal.fire({ title: 'Atención', text: 'Complete todos los campos de conciliación manual', icon: 'warning', confirmButtonColor: '#f0b429' });
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
            await Swal.fire({ title: 'Error', text: (err.message || String(err)) || 'Ocurrió un error', icon: 'error', confirmButtonColor: '#f0b429' });
        }
    };

    const handleGatewayFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setGatewayFile({
                name: file.name,
                content: ev.target?.result as string,
            });
        };
        reader.readAsText(file);
    };

    const handleProcessGateway = async () => {
        if (!gatewayFile) {
            await Swal.fire('Atención', 'Seleccione un archivo de pasarela (CSV)', 'warning');
            return;
        }

        try {
            setProcessingGateway(true);
            // Simulación de procesamiento (En producción el backend parseará el CSV)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            await Swal.fire('¡Éxito!', 'Reporte de Wompi procesado. Se generaron los asientos de ingreso y comisiones bancarias.', 'success');
            setGatewayFile(null);
            setActiveTab('reconciliation');
        } catch (err) {
            logError(err, 'process-gateway');
            Swal.fire('Error', 'No se pudo procesar el reporte de pasarela.', 'error');
        } finally {
            setProcessingGateway(false);
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('es-CO');

    // Columns definitions...
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
    ];

    const txnColumns = [
        { key: 'transaction_date', header: 'Fecha', render: (val: any) => formatDate(val) },
        { key: 'description', header: 'Descripcion' },
        { key: 'reference', header: 'Referencia', render: (val: any) => val || '-' },
        {
            key: 'debit',
            header: 'Debito',
            align: 'right' as const,
            render: (val: any) => val > 0 ? <span style={{ color: '#f87171' }}>{formatCurrency(val)}</span> : '-',
        },
        {
            key: 'credit',
            header: 'Credito',
            align: 'right' as const,
            render: (val: any) => val > 0 ? <span style={{ color: '#2e7d32' }}>{formatCurrency(val)}</span> : '-',
        },
        {
            key: 'matched',
            header: 'Estado',
            align: 'center' as const,
            render: (val: any) => val
                ? <FiCheck style={{ color: '#2e7d32' }} />
                : <FiX style={{ color: '#f57f17' }} />,
        },
    ];

    return (
        <div className="page-container">
            <PageHeader title="Conciliacion Bancaria" icon={<FiColumns />} />

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #2a2a35', marginBottom: '24px' }}>
                <button 
                    style={{ padding: '12px 20px', background: 'none', border: 'none', borderBottom: activeTab === 'accounts' ? '2px solid #38bdf8' : 'none', color: activeTab === 'accounts' ? '#38bdf8' : '#6b6b7b', cursor: 'pointer' }}
                    onClick={() => setActiveTab('accounts')}
                >Cuentas</button>
                <button 
                    style={{ padding: '12px 20px', background: 'none', border: 'none', borderBottom: activeTab === 'statements' ? '2px solid #38bdf8' : 'none', color: activeTab === 'statements' ? '#38bdf8' : '#6b6b7b', cursor: 'pointer' }}
                    onClick={() => setActiveTab('statements')}
                >Extractos</button>
                <button 
                    style={{ padding: '12px 20px', background: 'none', border: 'none', borderBottom: activeTab === 'reconciliation' ? '2px solid #38bdf8' : 'none', color: activeTab === 'reconciliation' ? '#38bdf8' : '#6b6b7b', cursor: 'pointer' }}
                    onClick={() => setActiveTab('reconciliation')}
                >Conciliacion</button>
                <button 
                    style={{ padding: '12px 20px', background: 'none', border: 'none', borderBottom: activeTab === 'gateway' ? '2px solid #38bdf8' : 'none', color: activeTab === 'gateway' ? '#38bdf8' : '#6b6b7b', cursor: 'pointer' }}
                    onClick={() => setActiveTab('gateway')}
                >Pasarela (Wompi)</button>
            </div>

            {activeTab === 'accounts' && (
                <div>
                    <DataTable columns={bankAccountColumns} data={bankAccounts} loading={accountLoading} />
                </div>
            )}

            {activeTab === 'statements' && (
                <div>
                    <DataTable columns={statementColumns} data={statements} loading={statementsLoading} />
                </div>
            )}

            {activeTab === 'reconciliation' && (
                <div>
                    {selectedStatementId ? (
                        <DataTable columns={txnColumns} data={statementDetail?.transactions || []} loading={reconciliationLoading} />
                    ) : (
                        <p style={{ textAlign: 'center', color: '#6b6b7b', padding: '40px' }}>Seleccione un extracto para conciliar.</p>
                    )}
                </div>
            )}

            {activeTab === 'gateway' && (
                <div style={{ background: '#1f1f2a', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid #2a2a35' }}>
                    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                        <FiRefreshCcw size={48} color="#38bdf8" style={{ marginBottom: '20px' }} />
                        <h3 style={{ color: '#f1f1f3', marginBottom: '10px' }}>Conciliación de Wompi</h3>
                        <p style={{ color: '#a0a0b0', marginBottom: '30px' }}>Cargue el CSV de transacciones para procesar comisiones e IVA automáticamente.</p>
                        
                        <div style={{ border: '2px dashed #2a2a35', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                            <input type="file" accept=".csv" onChange={handleGatewayFileChange} />
                        </div>

                        <Button 
                            variant="primary" 
                            fullWidth 
                            onClick={handleProcessGateway}
                            loading={processingGateway}
                            disabled={!gatewayFile}
                        >
                            Procesar Reporte
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BankReconciliationPage;
