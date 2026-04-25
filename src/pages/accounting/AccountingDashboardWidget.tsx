import React, { useState, useEffect } from 'react';
import * as accountingApi from '../../services/accountingApi';
import { formatDate } from '../../utils/dateFormat';


const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const kpiCardStyle: React.CSSProperties = {
    background: '#1a1a24',
    borderRadius: 8,
    padding: '1rem 1.25rem',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    border: '1px solid #2a2a35',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
};

const labelStyle: React.CSSProperties = {
    fontSize: '0.7rem',
    fontWeight: 500,
    color: '#6b6b7b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
};

const valueStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 700,
    lineHeight: 1.2,
    color: '#f1f1f3',
};

const actionColors: Record<string, string> = {
    CREATE: '#34d399',
    UPDATE: '#60a5fa',
    DELETE: '#f87171',
    VOID: '#fbbf24',
};

const AccountingDashboardWidget = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        accountingApi.getAccountingDashboard()
            .then(setData)
            .catch((err: any) => setError(err.message || 'Error cargando dashboard'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p style={{ padding: '1rem', color: '#6b6b7b', fontSize: '0.8125rem' }}>Cargando indicadores financieros...</p>;
    if (error) return <p style={{ padding: '1rem', color: '#f87171', fontSize: '0.8125rem' }}>{error}</p>;
    if (!data) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Row 1: Main KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div style={{ ...kpiCardStyle, borderTopColor: '#34d399', borderTopWidth: 2 }}>
                    <span style={labelStyle}>Ventas del Mes</span>
                    <span style={{ ...valueStyle, color: '#34d399' }}>{formatCurrency(data.ventasMes)}</span>
                </div>
                <div style={{ ...kpiCardStyle, borderTopColor: '#f87171', borderTopWidth: 2 }}>
                    <span style={labelStyle}>Gastos del Mes</span>
                    <span style={{ ...valueStyle, color: '#f87171' }}>{formatCurrency(data.gastosMes)}</span>
                </div>
                <div style={{ ...kpiCardStyle, borderTopColor: '#60a5fa', borderTopWidth: 2 }}>
                    <span style={labelStyle}>Utilidad Neta</span>
                    <span style={{ ...valueStyle, color: data.utilidadMes >= 0 ? '#60a5fa' : '#f87171' }}>{formatCurrency(data.utilidadMes)}</span>
                </div>
                <div style={{ ...kpiCardStyle, borderTopColor: '#f0b429', borderTopWidth: 2 }}>
                    <span style={labelStyle}>Margen %</span>
                    <span style={{ ...valueStyle, color: '#f0b429' }}>{data.margenUtilidad}%</span>
                </div>
            </div>

            {/* Row 2: IVA */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div style={{ ...kpiCardStyle, borderTopColor: '#8b5cf6', borderTopWidth: 2 }}>
                    <span style={labelStyle}>IVA Generado</span>
                    <span style={{ ...valueStyle, color: '#8b5cf6' }}>{formatCurrency(data.ivaGenerado)}</span>
                </div>
                <div style={{ ...kpiCardStyle, borderTopColor: '#6d28d9', borderTopWidth: 2 }}>
                    <span style={labelStyle}>IVA Descontable</span>
                    <span style={{ ...valueStyle, color: '#a78bfa' }}>{formatCurrency(data.ivaDescontable)}</span>
                </div>
                <div style={{ ...kpiCardStyle, borderTopColor: '#ec4899', borderTopWidth: 2 }}>
                    <span style={labelStyle}>IVA por Pagar</span>
                    <span style={{ ...valueStyle, color: '#f472b6' }}>{formatCurrency(data.ivaPorPagar)}</span>
                </div>
            </div>

            {/* Row 3: Counts + CxP/CxC */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div style={kpiCardStyle}>
                    <span style={labelStyle}>Ordenes Pagadas</span>
                    <span style={valueStyle}>{data.totalOrdenesMes}</span>
                </div>
                <div style={kpiCardStyle}>
                    <span style={labelStyle}>Total Gastos</span>
                    <span style={valueStyle}>{data.totalGastosMes}</span>
                </div>
                <div style={{ ...kpiCardStyle, borderTopColor: '#fb923c', borderTopWidth: 2 }}>
                    <span style={labelStyle}>Cuentas por Pagar</span>
                    <span style={{ ...valueStyle, color: '#fb923c' }}>{formatCurrency(data.cuentasPorPagar)}</span>
                </div>
                <div style={{ ...kpiCardStyle, borderTopColor: '#22d3ee', borderTopWidth: 2 }}>
                    <span style={labelStyle}>Cuentas por Cobrar</span>
                    <span style={{ ...valueStyle, color: '#22d3ee' }}>{formatCurrency(data.cuentasPorCobrar)}</span>
                </div>
            </div>

            {/* Bottom: Top Gastos + Audit */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {/* Top 5 Gastos */}
                <div style={{ ...kpiCardStyle, padding: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: '#f1f1f3' }}>Top 5 Gastos del Mes</h4>
                    {data.topGastos && data.topGastos.length > 0 ? (
                        <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #2a2a35' }}>
                                    <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 500, color: '#6b6b7b', fontSize: '0.7rem', textTransform: 'uppercase' }}>Categoria</th>
                                    <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 500, color: '#6b6b7b', fontSize: '0.7rem', textTransform: 'uppercase' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topGastos.map((g: any, i: number) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #1f1f2a' }}>
                                        <td style={{ padding: '5px 8px', color: '#f1f1f3' }}>{g.category}</td>
                                        <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 600, color: '#f1f1f3' }}>{formatCurrency(g.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ color: '#6b6b7b', fontSize: '0.8rem' }}>Sin gastos este mes.</p>
                    )}
                </div>

                {/* Recent Audit */}
                <div style={{ ...kpiCardStyle, padding: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: '#f1f1f3' }}>Ultimas 5 Acciones</h4>
                    {data.auditRecent && data.auditRecent.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.78rem' }}>
                            {data.auditRecent.map((a: any) => (
                                <li key={a.id} style={{
                                    padding: '5px 0',
                                    borderBottom: '1px solid #1f1f2a',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '1px 6px',
                                        borderRadius: 4,
                                        fontSize: '0.65rem',
                                        fontWeight: 600,
                                        color: '#0a0a0f',
                                        background: actionColors[a.action] || '#6b6b7b',
                                        flexShrink: 0,
                                    }}>{a.action}</span>
                                    <span style={{ color: '#f1f1f3' }}>{a.entity_type} #{a.entity_id}</span>
                                    <span style={{ marginLeft: 'auto', color: '#6b6b7b', fontSize: '0.7rem' }}>
                                        {formatDate(a.created_at)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: '#6b6b7b', fontSize: '0.8rem' }}>Sin registros de auditoria.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountingDashboardWidget;
