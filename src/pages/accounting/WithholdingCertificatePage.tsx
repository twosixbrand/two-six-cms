import React, { useState, useEffect } from 'react';
import { FiFileText, FiRefreshCcw, FiDownload, FiTrash2, FiZap } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import { DataTable, Button, StatusBadge, LoadingSpinner, ConfirmDialog } from '../../components/ui';
import * as accountingApi from '../../services/accountingApi';
import { getProviders } from '../../services/providerApi';
import { logError } from '../../services/errorApi';

const WithholdingCertificatePage = () => {
    const [certificates, setCertificates] = useState<any[]>([]);
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(String(currentYear));
    const [provider, setProvider] = useState('');
    const [concept, setConcept] = useState('');

    const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - i);

    // Confirm dialogs
    const [confirmGenerate, setConfirmGenerate] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await accountingApi.getWithholdingCertificates({
                year: year || undefined,
                provider: provider || undefined,
                concept: concept || undefined,
            });
            setCertificates(Array.isArray(data) ? data : data.data || []);
        } catch (err) {
            logError(err, '/accounting/withholding-certificates');
            setError('Error al cargar certificados.');
        } finally {
            setLoading(false);
        }
    };

    const fetchProviders = async () => {
        try {
            const data = await getProviders();
            setProviders(Array.isArray(data) ? data : data.data || []);
        } catch (err) {
            console.error('Error cargando proveedores:', err);
        }
    };

    useEffect(() => {
        fetchProviders();
        fetchData();
    }, []);

    const handleGenerate = async () => {
        if (!year) {
            alert('Seleccione un a\u00f1o para generar los certificados.');
            return;
        }
        try {
            setGenerating(true);
            setError('');
            setSuccessMsg('');
            const result = await accountingApi.generateWithholdingCertificates(parseInt(year, 10));
            setSuccessMsg(result.message || `Se generaron ${result.created} certificados.`);
            fetchData();
        } catch (err: any) {
            setError('Error al generar certificados: ' + (err.message || err));
        } finally {
            setGenerating(false);
            setConfirmGenerate(false);
        }
    };

    const handleDownloadPdf = async (id: number, certNumber: string) => {
        try {
            const blob = await accountingApi.downloadWithholdingPdf(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${certNumber}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err: any) {
            alert('Error descargando PDF: ' + (err.message || err));
        }
    };

    const handleDelete = async () => {
        if (confirmDelete === null) return;
        try {
            await accountingApi.deleteWithholdingCertificate(confirmDelete);
            fetchData();
        } catch (err: any) {
            alert('Error al eliminar: ' + (err.message || err));
        } finally {
            setConfirmDelete(null);
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val || 0);

    const conceptLabels: Record<string, string> = {
        RETEFUENTE: 'Retefuente',
        RETEICA: 'ReteICA',
        RETEIVA: 'ReteIVA',
    };

    const getConceptVariant = (concept: string) => {
        switch (concept) {
            case 'RETEFUENTE': return 'info';
            case 'RETEICA': return 'warning';
            case 'RETEIVA': return 'gold';
            default: return 'neutral';
        }
    };

    const columns = [
        {
            key: 'certificate_number',
            header: '# Certificado',
            render: (val: any) => <strong>{val}</strong>,
        },
        {
            key: 'provider',
            header: 'Proveedor',
            render: (_val: any, row: any) => row.provider?.company_name || row.id_provider,
        },
        {
            key: 'concept',
            header: 'Concepto',
            render: (val: any) => (
                <StatusBadge
                    status={conceptLabels[val] || val}
                    variant={getConceptVariant(val)}
                    size="sm"
                />
            ),
        },
        {
            key: 'base_amount',
            header: 'Base Gravable',
            align: 'right' as const,
            render: (val: any) => formatCurrency(val),
        },
        {
            key: 'rate',
            header: 'Tarifa',
            align: 'right' as const,
            render: (val: any) => `${val}%`,
        },
        {
            key: 'withheld_amount',
            header: 'Valor Retenido',
            align: 'right' as const,
            render: (val: any) => <strong>{formatCurrency(val)}</strong>,
        },
        {
            key: 'issue_date',
            header: 'Fecha Expedici\u00f3n',
            render: (val: any) => new Date(val).toLocaleDateString('es-CO'),
        },
    ];

    return (
        <div className="page-container">
            <PageHeader title="Certificados de Retenci\u00f3n" icon={<FiFileText />} />

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>A\u00f1o</label>
                    <select value={year} onChange={e => setYear(e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', minWidth: '100px' }}>
                        {yearOptions.map(y => (
                            <option key={y} value={String(y)}>{y}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Proveedor</label>
                    <select value={provider} onChange={e => setProvider(e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', minWidth: '180px' }}>
                        <option value="">Todos</option>
                        {providers.map((p: any) => (
                            <option key={p.id || p.nit} value={p.id || p.nit}>{p.company_name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Concepto</label>
                    <select value={concept} onChange={e => setConcept(e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', minWidth: '140px' }}>
                        <option value="">Todos</option>
                        <option value="RETEFUENTE">Retefuente</option>
                        <option value="RETEICA">ReteICA</option>
                        <option value="RETEIVA">ReteIVA</option>
                    </select>
                </div>
                <Button variant="primary" icon={<FiRefreshCcw />} onClick={fetchData}>
                    Buscar
                </Button>
                <Button
                    variant="secondary"
                    icon={<FiZap />}
                    onClick={() => setConfirmGenerate(true)}
                    loading={generating}
                    disabled={generating}
                >
                    {generating ? 'Generando...' : 'Generar Certificados'}
                </Button>
            </div>

            {error && <p className="error-message">{error}</p>}
            {successMsg && (
                <p style={{ color: '#2e7d32', background: '#e8f5e9', padding: '10px 14px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px', fontWeight: 600 }}>
                    {successMsg}
                </p>
            )}

            <DataTable
                columns={columns}
                data={certificates}
                loading={loading}
                emptyMessage="No hay certificados para los filtros seleccionados"
                actions={(cert: any) => (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={<FiDownload />}
                            onClick={() => handleDownloadPdf(cert.id, cert.certificate_number)}
                        >
                            {''}
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            icon={<FiTrash2 />}
                            onClick={() => setConfirmDelete(cert.id)}
                        >
                            {''}
                        </Button>
                    </>
                )}
            />

            <ConfirmDialog
                isOpen={confirmGenerate}
                onConfirm={handleGenerate}
                onCancel={() => setConfirmGenerate(false)}
                title="Generar certificados"
                message={`¿Generar certificados de retención para el año ${year}? Esto reemplazará los certificados existentes de ese año.`}
                confirmText="Generar"
                cancelText="Cancelar"
                variant="warning"
            />

            <ConfirmDialog
                isOpen={confirmDelete !== null}
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete(null)}
                title="Eliminar certificado"
                message="¿Eliminar este certificado?"
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="danger"
            />
        </div>
    );
};

export default WithholdingCertificatePage;
