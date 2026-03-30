import React, { useState, useEffect } from 'react';
import * as accountingApi from '../../services/accountingApi';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const kpiCardStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: 8,
    padding: '1rem 1.25rem',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    border: '1px solid #e5e7eb',
};

const labelStyle: React.CSSProperties = {
    fontSize: '0.7rem',
    fontWeight: 500,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
};

const valueStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 700,
    lineHeight: 1.2,
    color: '#111827',
};

const actionColors: Record<string, string> = {
    CREATE: '#10b981',
    UPDATE: '#3b82f6',
    DELETE: '#ef4444',
    VOID: '#f59e0b',
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

    if (loading) return <p style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.8125rem' }}>Cargando indicadores financieros...</p>;
    if (error) return <p style={{ padding: '1rem', color: '#ef4444', fontSize: '0.8125rem' }}>{error}</p>;
    if (!data) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Row 1: Main KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div style={kpiCardStyle}>
                    <span style={labelStyle}>Ventas del Mes</span>
                    <span style={{ ...valueStyle, color: '#059669' }}>{formatCurrency(data.ventasMes)}</span>
                </div>
                <div style={kpiCardStyle}>
                    <span style={labelStyle}>Gastos del Mes</span>
                    <span style={{ ...valueStyle, color: '#ef4444' }}>{formatCurrency(data.gastosMes)}</span>
                </div>
                <div style={kpiCardStyle}>
                    <span style={labelStyle}>Utilidad Neta</span>
                    <span style={{ ...valueStyle, color: data.utilidadMes >= 0 ? '#3b82f6' : '#ef4444' }}>{formatCurrency(data.utilidadMes)}</span>
                </div>
                <div style={kpiCardStyle}>
                    <span style={labelStyle}>Margen %</span>
                    <span style={{ ...valueStyle, color: '#f59e0b' }}>{data.margenUtilidad}%</span>
                </div>
            </div>

            {/* Row 2: IVA */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div style={kpiCardStyle}>
                    <span style={labelStyle}>IVA Generado</span>
                    <span style={{ ...valueStyle, color: '#7c3aed' }}>{formatCurrency(data.ivaGenerado)}</span>
                </div>
                <div style={kpiCardStyle}>
                    <span style={labelStyle}>IVA Descontable</span>
                    <span style={{ ...valueStyle, color: '#4f46e5' }}>{formatCurrency(data.ivaDescontable)}</span>
                </div>
                <div style={kpiCardStyle}>
                    <span style={labelStyle}>IVA por Pagar</span>
                    <span style={{ ...valueStyle, color: '#db2777' }}>{formatCurrency(data.ivaPorPagar)}</span>
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
                <div style={kpiCardStyle}>
                    <span style={labelStyle}>Cuentas por Pagar</span>
                    <span style={{ ...valueStyle, color: '#ea580c' }}>{formatCurrency(data.cuentasPorPagar)}</span>
                </div>
                <div style={kpiCardStyle}>
                    <span style={labelStyle}>Cuentas por Cobrar</span>
                    <span style={{ ...valueStyle, color: '#0891b2' }}>{formatCurrency(data.cuentasPorCobrar)}</span>
                </div>
            </div>

            {/* Bottom: Top Gastos + Audit */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {/* Top 5 Gastos */}
                <div style={{ ...kpiCardStyle, padding: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: '#111827' }}>Top 5 Gastos del Mes</h4>
                    {data.topGastos && data.topGastos.length > 0 ? (
                        <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 500, color: '#6b7280', fontSize: '0.7rem', textTransform: 'uppercase' }}>Categoria</th>
                                    <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 500, color: '#6b7280', fontSize: '0.7rem', textTransform: 'uppercase' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topGastos.map((g: any, i: number) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '5px 8px', color: '#111827' }}>{g.category}</td>
                                        <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 600, color: '#111827' }}>{formatCurrency(g.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Sin gastos este mes.</p>
                    )}
                </div>

                {/* Recent Audit */}
                <div style={{ ...kpiCardStyle, padding: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: '#111827' }}>Ultimas 5 Acciones</h4>
                    {data.auditRecent && data.auditRecent.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.78rem' }}>
                            {data.auditRecent.map((a: any) => (
                                <li key={a.id} style={{
                                    padding: '5px 0',
                                    borderBottom: '1px solid #f3f4f6',
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
                                        color: '#fff',
                                        background: actionColors[a.action] || '#6b7280',
                                        flexShrink: 0,
                                    }}>{a.action}</span>
                                    <span style={{ color: '#111827' }}>{a.entity_type} #{a.entity_id}</span>
                                    <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '0.7rem' }}>
                                        {new Date(a.createdAt).toLocaleDateString('es-CO')}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Sin registros de auditoria.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountingDashboardWidget;
