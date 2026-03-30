import React, { useState, useEffect } from 'react';
import { FiFileText, FiRefreshCcw, FiPrinter } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const thStyle: React.CSSProperties = {
    padding: '0.65rem 1rem', fontSize: '0.7rem', fontWeight: 500,
    textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b6b7b',
    borderBottom: '1px solid #2a2a35', backgroundColor: '#1f1f2a',
    whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif',
};

const tdStyle: React.CSSProperties = {
    padding: '0.65rem 1rem', fontSize: '0.8125rem', color: '#f1f1f3',
    borderBottom: '1px solid #1f1f2a', fontFamily: 'Inter, sans-serif',
};

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
                        label="Mes"
                        name="month"
                        type="select"
                        value={month}
                        onChange={e => setMonth(Number(e.target.value))}
                        options={months.map((m, i) => ({ value: i + 1, label: m }))}
                    />
                </div>
                <Button variant="primary" icon={<FiRefreshCcw />} onClick={fetchReport}>Generar</Button>
                <Button variant="secondary" icon={<FiPrinter />} onClick={handlePrint}>Imprimir</Button>
            </div>

            {error && <p style={{ color: '#f87171', fontSize: '13px', fontWeight: 600 }}>{error}</p>}

            {loading ? (
                <LoadingSpinner size="md" text="Generando declaracion de Retencion en la Fuente..." />
            ) : data ? (
                <div style={{
                    backgroundColor: '#1a1a24', border: '1px solid #2a2a35',
                    borderRadius: 12, padding: '24px',
                }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '4px', color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>Retencion en la Fuente - Formulario 350</h2>
                    <p style={{ textAlign: 'center', color: '#a0a0b0', marginBottom: '24px', fontFamily: 'Inter, sans-serif' }}>
                        {months[month - 1]} {year}
                    </p>

                    {/* Total Card */}
                    <div style={{
                        padding: '20px', borderRadius: '12px', background: '#1f1f2a',
                        border: '1px solid rgba(167, 139, 250, 0.2)', borderTop: '3px solid #a78bfa',
                        marginBottom: '24px', textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 600 }}>Total Retenciones</div>
                        <div style={{ fontSize: '28px', fontWeight: 700, color: '#a78bfa' }}>
                            {formatCurrency(data.totalRetencion || 0)}
                        </div>
                    </div>

                    {/* Concepts Table */}
                    {data.conceptos && data.conceptos.length > 0 ? (
                        <div style={{ overflowX: 'auto', backgroundColor: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 8 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                                <thead>
                                    <tr>
                                        <th style={thStyle}>Concepto</th>
                                        <th style={thStyle}>Codigo PUC</th>
                                        <th style={{ ...thStyle, textAlign: 'right' }}>Base Gravable</th>
                                        <th style={{ ...thStyle, textAlign: 'center' }}>Tarifa</th>
                                        <th style={{ ...thStyle, textAlign: 'right' }}>Retencion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.conceptos.map((c: any, i: number) => (
                                        <tr key={i}>
                                            <td style={{ ...tdStyle, fontWeight: 600 }}>{c.concept}</td>
                                            <td style={{ ...tdStyle, color: '#a0a0b0' }}>{c.code}</td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(c.base)}</td>
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>{formatPercent(c.rate)}</td>
                                            <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(c.retencion)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={{ borderTop: '2px solid #f0b429', background: '#1f1f2a' }}>
                                        <td colSpan={4} style={{ ...tdStyle, fontWeight: 700 }}>TOTAL</td>
                                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, fontSize: '16px' }}>
                                            {formatCurrency(data.totalRetencion)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <p style={{ color: '#6b6b7b', textAlign: 'center', fontSize: '14px' }}>
                            No se encontraron retenciones para este periodo
                        </p>
                    )}

                    {/* Formulario 350 Summary */}
                    {data.formulario350 && (
                        <div style={{ marginTop: '24px', padding: '16px', background: '#1f1f2a', borderRadius: '8px', border: '1px solid #2a2a35' }}>
                            <h4 style={{ marginBottom: '12px', color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>Resumen Formulario 350</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700, color: '#f1f1f3' }}>
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
