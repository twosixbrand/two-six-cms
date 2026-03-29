import React, { useState, useEffect } from 'react';
import { FiFileText, FiRefreshCcw, FiPrinter } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const currentYear = new Date().getFullYear();

// Bimestral periods for IVA in Colombia
const bimesters = [
    { label: 'Ene - Feb', startMonth: 0, endMonth: 1 },
    { label: 'Mar - Abr', startMonth: 2, endMonth: 3 },
    { label: 'May - Jun', startMonth: 4, endMonth: 5 },
    { label: 'Jul - Ago', startMonth: 6, endMonth: 7 },
    { label: 'Sep - Oct', startMonth: 8, endMonth: 9 },
    { label: 'Nov - Dic', startMonth: 10, endMonth: 11 },
];

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

    const renderEntryTable = (entries: any[], title: string) => (
        <div style={{ marginTop: '16px' }}>
            <h4 style={{ marginBottom: '8px' }}>{title}</h4>
            {entries && entries.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                            <th style={{ padding: '8px' }}>Fecha</th>
                            <th style={{ padding: '8px' }}>Comprobante</th>
                            <th style={{ padding: '8px' }}>Descripcion</th>
                            <th style={{ padding: '8px', textAlign: 'right' }}>Debito</th>
                            <th style={{ padding: '8px', textAlign: 'right' }}>Credito</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((e: any, i: number) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '6px 8px' }}>{new Date(e.date).toLocaleDateString('es-CO')}</td>
                                <td style={{ padding: '6px 8px' }}>{e.entry_number}</td>
                                <td style={{ padding: '6px 8px' }}>{e.description}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'right' }}>{formatCurrency(e.debit)}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'right' }}>{formatCurrency(e.credit)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p style={{ color: '#999', fontSize: '13px' }}>Sin movimientos en este periodo</p>
            )}
        </div>
    );

    return (
        <div className="page-container">
            <PageHeader title="Declaracion de IVA" icon={<FiFileText />} />

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Ano</label>
                    <select value={year} onChange={e => setYear(Number(e.target.value))}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}>
                        {Array.from({ length: 5 }, (_, i) => currentYear - i).map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Bimestre</label>
                    <select value={bimester} onChange={e => setBimester(Number(e.target.value))}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}>
                        {bimesters.map((b, i) => (
                            <option key={i} value={i}>{b.label}</option>
                        ))}
                    </select>
                </div>
                <button onClick={fetchReport} className="btn btn-primary">
                    <FiRefreshCcw /> Generar
                </button>
                <button onClick={handlePrint} className="btn btn-secondary">
                    <FiPrinter /> Imprimir
                </button>
            </div>

            {error && <p className="error-message">{error}</p>}

            {loading ? (
                <p>Generando declaracion de IVA...</p>
            ) : data ? (
                <div className="list-card full-width" style={{ padding: '24px' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '4px' }}>Declaracion de IVA - Formulario 300</h2>
                    <p style={{ textAlign: 'center', color: '#666', marginBottom: '24px' }}>
                        {bimesters[bimester].label} {year}
                    </p>

                    {/* Summary Cards */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                        <div style={{
                            flex: 1, minWidth: '200px', padding: '20px', borderRadius: '8px',
                            background: '#e3f2fd', border: '1px solid #90caf9',
                        }}>
                            <div style={{ fontSize: '12px', color: '#1565c0', fontWeight: 600 }}>IVA Generado (Renglon 32)</div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#1565c0' }}>
                                {formatCurrency(data.ivaGenerado?.total || 0)}
                            </div>
                        </div>
                        <div style={{
                            flex: 1, minWidth: '200px', padding: '20px', borderRadius: '8px',
                            background: '#fff3e0', border: '1px solid #ffcc80',
                        }}>
                            <div style={{ fontSize: '12px', color: '#e65100', fontWeight: 600 }}>IVA Descontable (Renglon 50)</div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#e65100' }}>
                                {formatCurrency(data.ivaDescontable?.total || 0)}
                            </div>
                        </div>
                        <div style={{
                            flex: 1, minWidth: '200px', padding: '20px', borderRadius: '8px',
                            background: data.ivaPorPagar >= 0 ? '#fce4ec' : '#e8f5e9',
                            border: `1px solid ${data.ivaPorPagar >= 0 ? '#ef9a9a' : '#a5d6a7'}`,
                        }}>
                            <div style={{ fontSize: '12px', color: data.ivaPorPagar >= 0 ? '#c62828' : '#2e7d32', fontWeight: 600 }}>
                                {data.ivaPorPagar >= 0 ? 'IVA Por Pagar (Renglon 60)' : 'Saldo a Favor'}
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: data.ivaPorPagar >= 0 ? '#c62828' : '#2e7d32' }}>
                                {formatCurrency(Math.abs(data.ivaPorPagar || 0))}
                            </div>
                        </div>
                    </div>

                    {/* Detail Tables */}
                    {renderEntryTable(data.ivaGenerado?.entries || [], 'Detalle IVA Generado (Cuenta 240801)')}
                    {renderEntryTable(data.ivaDescontable?.entries || [], 'Detalle IVA Descontable (Cuenta 240802)')}

                    {/* Formulario 300 Summary */}
                    {data.formulario300 && (
                        <div style={{ marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                            <h4 style={{ marginBottom: '12px' }}>Resumen Formulario 300</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Renglon 32 - Total IVA Generado:</span>
                                    <span style={{ fontWeight: 700 }}>{formatCurrency(data.formulario300.renglon32)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Renglon 50 - Total IVA Descontable:</span>
                                    <span style={{ fontWeight: 700 }}>{formatCurrency(data.formulario300.renglon50)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #333', paddingTop: '8px', fontWeight: 700 }}>
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
