import React, { useState, useEffect } from 'react';
import { FiPercent, FiRefreshCcw, FiPrinter, FiDownload } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const currentYear = new Date().getFullYear();

const bimesters = [
    { label: 'Ene - Feb', startMonth: 0, endMonth: 1 },
    { label: 'Mar - Abr', startMonth: 2, endMonth: 3 },
    { label: 'May - Jun', startMonth: 4, endMonth: 5 },
    { label: 'Jul - Ago', startMonth: 6, endMonth: 7 },
    { label: 'Sep - Oct', startMonth: 8, endMonth: 9 },
    { label: 'Nov - Dic', startMonth: 10, endMonth: 11 },
];

const thStyle: React.CSSProperties = {
    padding: '0.65rem 1rem', fontSize: '0.7rem', fontWeight: 500,
    textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b6b7b',
    borderBottom: '1px solid #2a2a35', backgroundColor: '#1f1f2a',
    whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif',
};

const tdStyle: React.CSSProperties = {
    padding: '0.5rem 1rem', fontSize: '0.8125rem', color: '#f1f1f3',
    borderBottom: '1px solid #1f1f2a', fontFamily: 'Inter, sans-serif',
};

const IvaDeclarationPage = () => {
    const [year, setYear] = useState(currentYear);
    const [bimester, setBimester] = useState(0);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchReport = async () => {
        try {
            setLoading(true);
            setError('');
            const b = bimesters[bimester];
            const startDate = new Date(year, b.startMonth, 1).toISOString().split('T')[0];
            const endDate = new Date(year, b.endMonth + 1, 0).toISOString().split('T')[0];
            const result = await accountingApi.getIvaDeclaration({ startDate, endDate });
            setData(result);
        } catch (err) {
            logError(err, '/accounting/tax/iva');
            setError('Error al generar la declaracion de IVA.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val || 0);

    const handlePrint = () => window.print();

    const handleExportCsv = async () => {
        try {
            const b = bimesters[bimester];
            const startDate = new Date(year, b.startMonth, 1).toISOString().split('T')[0];
            const endDate = new Date(year, b.endMonth + 1, 0).toISOString().split('T')[0];
            const blob = await accountingApi.downloadIvaExport(startDate, endDate);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `iva-${startDate}-a-${endDate}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            logError(err, '/accounting/tax/iva/export');
            setError('Error al descargar el CSV de IVA.');
        }
    };

    const renderEntryTable = (entries: any[], title: string) => (
        <div style={{ marginTop: '16px' }}>
            <h4 style={{ marginBottom: '8px', color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>{title}</h4>
            {entries && entries.length > 0 ? (
                <div style={{ overflowX: 'auto', backgroundColor: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 8 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Fecha</th>
                                <th style={thStyle}>Comprobante</th>
                                <th style={thStyle}>Descripcion</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Debito</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Credito</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((e: any, i: number) => (
                                <tr key={i}>
                                    <td style={tdStyle}>{new Date(e.date).toLocaleDateString('es-CO')}</td>
                                    <td style={tdStyle}>{e.entry_number}</td>
                                    <td style={tdStyle}>{e.description}</td>
                                    <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(e.debit)}</td>
                                    <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(e.credit)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p style={{ color: '#6b6b7b', fontSize: '13px' }}>Sin movimientos en este periodo</p>
            )}
        </div>
    );

    return (
        <div className="page-container">
            <PageHeader title="Declaracion de IVA" icon={<FiPercent />} />

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ minWidth: '120px' }}>
                    <FormField
                        label="Ano"
                        name="year"
                        type="select"
                        value={year}
                        onChange={e => setYear(Number(e.target.value))}
                        options={Array.from({ length: 5 }, (_, i) => ({ value: currentYear - i, label: String(currentYear - i) }))}
                    />
                </div>
                <div style={{ minWidth: '140px' }}>
                    <FormField
                        label="Bimestre"
                        name="bimester"
                        type="select"
                        value={bimester}
                        onChange={e => setBimester(Number(e.target.value))}
                        options={bimesters.map((b, i) => ({ value: i, label: b.label }))}
                    />
                </div>
                <Button variant="primary" icon={<FiRefreshCcw />} onClick={fetchReport}>Generar</Button>
                <Button variant="secondary" icon={<FiPrinter />} onClick={handlePrint}>Imprimir</Button>
                <Button variant="secondary" icon={<FiDownload />} onClick={handleExportCsv}>Exportar CSV</Button>
            </div>

            {error && <p style={{ color: '#f87171', fontSize: '13px', fontWeight: 600 }}>{error}</p>}

            {loading ? (
                <LoadingSpinner size="md" text="Generando declaracion de IVA..." />
            ) : data ? (
                <div style={{
                    backgroundColor: '#1a1a24', border: '1px solid #2a2a35',
                    borderRadius: 12, padding: '24px',
                }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '4px', color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>Declaracion de IVA - Formulario 300</h2>
                    <p style={{ textAlign: 'center', color: '#a0a0b0', marginBottom: '24px', fontFamily: 'Inter, sans-serif' }}>
                        {bimesters[bimester].label} {year}
                    </p>

                    {/* Summary Cards */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                        <div style={{
                            flex: 1, minWidth: '200px', padding: '20px', borderRadius: '12px',
                            background: '#1f1f2a', border: '1px solid rgba(96, 165, 250, 0.2)',
                            borderTop: '3px solid #60a5fa',
                        }}>
                            <div style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 600 }}>IVA Generado (Renglon 32)</div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#60a5fa' }}>
                                {formatCurrency(data.ivaGenerado?.total || 0)}
                            </div>
                        </div>
                        <div style={{
                            flex: 1, minWidth: '200px', padding: '20px', borderRadius: '12px',
                            background: '#1f1f2a', border: '1px solid rgba(251, 191, 36, 0.2)',
                            borderTop: '3px solid #fbbf24',
                        }}>
                            <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 600 }}>IVA Descontable (Renglon 50)</div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#fbbf24' }}>
                                {formatCurrency(data.ivaDescontable?.total || 0)}
                            </div>
                        </div>
                        <div style={{
                            flex: 1, minWidth: '200px', padding: '20px', borderRadius: '12px',
                            background: '#1f1f2a',
                            border: `1px solid ${data.ivaPorPagar >= 0 ? 'rgba(248, 113, 113, 0.2)' : 'rgba(52, 211, 153, 0.2)'}`,
                            borderTop: `3px solid ${data.ivaPorPagar >= 0 ? '#f87171' : '#34d399'}`,
                        }}>
                            <div style={{ fontSize: '12px', color: data.ivaPorPagar >= 0 ? '#f87171' : '#34d399', fontWeight: 600 }}>
                                {data.ivaPorPagar >= 0 ? 'IVA Por Pagar (Renglon 60)' : 'Saldo a Favor'}
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: data.ivaPorPagar >= 0 ? '#f87171' : '#34d399' }}>
                                {formatCurrency(Math.abs(data.ivaPorPagar || 0))}
                            </div>
                        </div>
                    </div>

                    {/* Detail Tables */}
                    {renderEntryTable(data.ivaGenerado?.entries || [], 'Detalle IVA Generado (Cuenta 240801)')}
                    {renderEntryTable(data.ivaDescontable?.entries || [], 'Detalle IVA Descontable (Cuenta 240802)')}

                    {/* Formulario 300 Summary */}
                    {data.formulario300 && (
                        <div style={{ marginTop: '24px', padding: '16px', background: '#1f1f2a', borderRadius: '8px', border: '1px solid #2a2a35' }}>
                            <h4 style={{ marginBottom: '12px', color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>Resumen Formulario 300</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f1f1f3' }}>
                                    <span>Renglon 32 - Total IVA Generado:</span>
                                    <span style={{ fontWeight: 700 }}>{formatCurrency(data.formulario300.renglon32)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f1f1f3' }}>
                                    <span>Renglon 50 - Total IVA Descontable:</span>
                                    <span style={{ fontWeight: 700 }}>{formatCurrency(data.formulario300.renglon50)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #3a3a48', paddingTop: '8px', fontWeight: 700, color: '#f1f1f3' }}>
                                    <span>Renglon 60 - Saldo a Pagar:</span>
                                    <span>{formatCurrency(data.formulario300.renglon60)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default IvaDeclarationPage;
