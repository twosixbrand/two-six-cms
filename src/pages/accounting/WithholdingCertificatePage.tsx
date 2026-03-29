import React, { useState, useEffect } from 'react';
import { FiFileText, FiRefreshCcw, FiDownload, FiTrash2, FiZap } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
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
        if (!window.confirm(`\u00bfGenerar certificados de retenci\u00f3n para el a\u00f1o ${year}? Esto reemplazar\u00e1 los certificados existentes de ese a\u00f1o.`)) return;

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

    const handleDelete = async (id: number) => {
        if (!window.confirm('\u00bfEliminar este certificado?')) return;
        try {
            await accountingApi.deleteWithholdingCertificate(id);
            fetchData();
        } catch (err: any) {
            alert('Error al eliminar: ' + (err.message || err));
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val || 0);

    const conceptLabels: Record<string, string> = {
        RETEFUENTE: 'Retefuente',
        RETEICA: 'ReteICA',
        RETEIVA: 'ReteIVA',
    };

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
                <button onClick={fetchData} className="btn btn-primary">
                    <FiRefreshCcw /> Buscar
                </button>
                <button
                    onClick={handleGenerate}
                    className="btn btn-secondary"
                    disabled={generating}
                    style={{ background: '#d4af37', color: '#0f172a', fontWeight: 700 }}
                >
                    <FiZap /> {generating ? 'Generando...' : 'Generar Certificados'}
                </button>
            </div>

            {error && <p className="error-message">{error}</p>}
            {successMsg && (
                <p style={{ color: '#2e7d32', background: '#e8f5e9', padding: '10px 14px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px', fontWeight: 600 }}>
                    {successMsg}
                </p>
            )}

            {loading ? (
                <p>Cargando certificados...</p>
            ) : (
                <div className="list-card full-width">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th># Certificado</th>
                                <th>Proveedor</th>
                                <th>Concepto</th>
                                <th>Base Gravable</th>
                                <th>Tarifa</th>
                                <th>Valor Retenido</th>
                                <th>Fecha Expedici\u00f3n</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {certificates.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center' }}>No hay certificados para los filtros seleccionados</td></tr>
                            ) : certificates.map((cert: any) => (
                                <tr key={cert.id}>
                                    <td><strong>{cert.certificate_number}</strong></td>
                                    <td>{cert.provider?.company_name || cert.id_provider}</td>
                                    <td>
                                        <span style={{
                                            padding: '3px 8px',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            background: cert.concept === 'RETEFUENTE' ? '#e3f2fd' : cert.concept === 'RETEICA' ? '#fff3e0' : '#f3e5f5',
                                            color: cert.concept === 'RETEFUENTE' ? '#1565c0' : cert.concept === 'RETEICA' ? '#e65100' : '#7b1fa2',
                                        }}>
                                            {conceptLabels[cert.concept] || cert.concept}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(cert.base_amount)}</td>
                                    <td style={{ textAlign: 'right' }}>{cert.rate}%</td>
                                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(cert.withheld_amount)}</td>
                                    <td>{new Date(cert.issue_date).toLocaleDateString('es-CO')}</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>
                                        <button
                                            className="btn btn-sm"
                                            onClick={() => handleDownloadPdf(cert.id, cert.certificate_number)}
                                            style={{ marginRight: '4px', padding: '4px 8px', fontSize: '12px', color: '#1565c0' }}
                                            title="Descargar PDF"
                                        >
                                            <FiDownload />
                                        </button>
                                        <button
                                            className="btn btn-sm"
                                            onClick={() => handleDelete(cert.id)}
                                            style={{ padding: '4px 8px', fontSize: '12px', color: '#e53935' }}
                                            title="Eliminar"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default WithholdingCertificatePage;
