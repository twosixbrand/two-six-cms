import React, { useState, useEffect } from 'react';
import { FiFileText, FiRefreshCcw, FiPrinter } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const ReteFuentePage = () => {
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(currentMonth);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchReport = async () => {
        try {
            setLoading(true);
            setError('');
            const result = await accountingApi.getReteFuenteDeclaration({ year, month });
            setData(result);
        } catch (err) {
            logError(err, '/accounting/tax/retefuente');
            setError('Error al generar la declaracion de Retencion en la Fuente.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val || 0);

    const formatPercent = (val: number) => `${(val || 0).toFixed(1)}%`;

    const handlePrint = () => window.print();

    return (
        <div className="page-container">
            <PageHeader title="Retencion en la Fuente" icon={<FiFileText />} />

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
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Mes</label>
                    <select value={month} onChange={e => setMonth(Number(e.target.value))}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}>
                        {months.map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
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
                <p>Generando declaracion de Retencion en la Fuente...</p>
            ) : data ? (
                <div className="list-card full-width" style={{ padding: '24px' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '4px' }}>Retencion en la Fuente - Formulario 350</h2>
                    <p style={{ textAlign: 'center', color: '#666', marginBottom: '24px' }}>
                        {months[month - 1]} {year}
                    </p>

                    {/* Total Card */}
                    <div style={{
                        padding: '20px', borderRadius: '8px', background: '#e8eaf6',
                        border: '1px solid #9fa8da', marginBottom: '24px', textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '12px', color: '#283593', fontWeight: 600 }}>Total Retenciones</div>
                        <div style={{ fontSize: '28px', fontWeight: 700, color: '#283593' }}>
                            {formatCurrency(data.totalRetencion || 0)}
                        </div>
                    </div>

                    {/* Concepts Table */}
                    {data.conceptos && data.conceptos.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>Concepto</th>
                                    <th style={{ padding: '10px' }}>Codigo PUC</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Base Gravable</th>
                                    <th style={{ padding: '10px', textAlign: 'center' }}>Tarifa</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Retencion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.conceptos.map((c: any, i: number) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '10px', fontWeight: 600 }}>{c.concept}</td>
                                        <td style={{ padding: '10px', color: '#666' }}>{c.code}</td>
                                        <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(c.base)}</td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>{formatPercent(c.rate)}</td>
                                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(c.retencion)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ borderTop: '2px solid #333' }}>
                                    <td colSpan={4} style={{ padding: '10px', fontWeight: 700 }}>TOTAL</td>
                                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, fontSize: '16px' }}>
                                        {formatCurrency(data.totalRetencion)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    ) : (
                        <p style={{ color: '#999', textAlign: 'center', fontSize: '14px' }}>
                            No se encontraron retenciones para este periodo
                        </p>
                    )}

                    {/* Formulario 350 Summary */}
                    {data.formulario350 && (
                        <div style={{ marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                            <h4 style={{ marginBottom: '12px' }}>Resumen Formulario 350</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700 }}>
                                <span>Total Retenciones a Declarar:</span>
                                <span>{formatCurrency(data.formulario350.totalRetenciones)}</span>
                            </div>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default ReteFuentePage;
