import React, { useState, useEffect } from 'react';
import * as accountingApi from '../../services/accountingApi';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const cardStyle = (bg: string): React.CSSProperties => ({
    background: bg,
    borderRadius: '12px',
    padding: '1rem 1.25rem',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
});

const labelStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    fontWeight: 600,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
};

const valueStyle: React.CSSProperties = {
    fontSize: '1.35rem',
    fontWeight: 800,
    lineHeight: 1.2,
};

const actionColors: Record<string, string> = {
    CREATE: '#4caf50',
    UPDATE: '#2196f3',
    DELETE: '#f44336',
    VOID: '#ff9800',
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

    if (loading) return <p style={{ padding: '1rem', color: '#999' }}>Cargando indicadores financieros...</p>;
    if (error) return <p style={{ padding: '1rem', color: '#c62828' }}>{error}</p>;
    if (!data) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Row 1: KPIs principales */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div style={cardStyle('#e8f5e9')}>
                    <span style={labelStyle}>Ventas del Mes</span>
                    <span style={{ ...valueStyle, color: '#2e7d32' }}>{formatCurrency(data.ventasMes)}</span>
                </div>
                <div style={cardStyle('#ffebee')}>
                    <span style={labelStyle}>Gastos del Mes</span>
                    <span style={{ ...valueStyle, color: '#c62828' }}>{formatCurrency(data.gastosMes)}</span>
                </div>
                <div style={cardStyle('#e3f2fd')}>
                    <span style={labelStyle}>Utilidad Neta</span>
                    <span style={{ ...valueStyle, color: data.utilidadMes >= 0 ? '#1565c0' : '#c62828' }}>{formatCurrency(data.utilidadMes)}</span>
                </div>
                <div style={cardStyle('#fff8e1')}>
                    <span style={labelStyle}>Margen %</span>
                    <span style={{ ...valueStyle, color: '#f57f17' }}>{data.margenUtilidad}%</span>
                </div>
            </div>

            {/* Row 2: IVA */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div style={cardStyle('#f3e5f5')}>
                    <span style={labelStyle}>IVA Generado</span>
                    <span style={{ ...valueStyle, color: '#6a1b9a' }}>{formatCurrency(data.ivaGenerado)}</span>
                </div>
                <div style={cardStyle('#e8eaf6')}>
                    <span style={labelStyle}>IVA Descontable</span>
                    <span style={{ ...valueStyle, color: '#283593' }}>{formatCurrency(data.ivaDescontable)}</span>
                </div>
                <div style={cardStyle('#fce4ec')}>
                    <span style={labelStyle}>IVA por Pagar</span>
                    <span style={{ ...valueStyle, color: '#ad1457' }}>{formatCurrency(data.ivaPorPagar)}</span>
                </div>
            </div>

            {/* Row 3: Counts + CxP/CxC */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div style={cardStyle('#e0f2f1')}>
                    <span style={labelStyle}>Órdenes Pagadas</span>
                    <span style={{ ...valueStyle, color: '#00695c' }}>{data.totalOrdenesMes}</span>
                </div>
                <div style={cardStyle('#fbe9e7')}>
                    <span style={labelStyle}>Total Gastos</span>
                    <span style={{ ...valueStyle, color: '#bf360c' }}>{data.totalGastosMes}</span>
                </div>
                <div style={cardStyle('#fff3e0')}>
                    <span style={labelStyle}>Cuentas por Pagar</span>
                    <span style={{ ...valueStyle, color: '#e65100' }}>{formatCurrency(data.cuentasPorPagar)}</span>
                </div>
                <div style={cardStyle('#e0f7fa')}>
                    <span style={labelStyle}>Cuentas por Cobrar</span>
                    <span style={{ ...valueStyle, color: '#006064' }}>{formatCurrency(data.cuentasPorCobrar)}</span>
                </div>
            </div>

            {/* Bottom row: Top Gastos + Audit */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Top 5 Gastos */}
                <div style={{ background: '#fafafa', borderRadius: '12px', padding: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 700 }}>Top 5 Gastos del Mes</h4>
                    {data.topGastos && data.topGastos.length > 0 ? (
                        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                                    <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 600 }}>Categoría</th>
                                    <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 600 }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topGastos.map((g: any, i: number) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '6px 8px' }}>{g.category}</td>
                                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(g.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ color: '#999', fontSize: '0.85rem' }}>Sin gastos este mes.</p>
                    )}
                </div>

                {/* Recent Audit */}
                <div style={{ background: '#fafafa', borderRadius: '12px', padding: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 700 }}>Últimas 5 Acciones</h4>
                    {data.auditRecent && data.auditRecent.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.82rem' }}>
                            {data.auditRecent.map((a: any) => (
                                <li key={a.id} style={{
                                    padding: '6px 0',
                                    borderBottom: '1px solid #f0f0f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '1px 8px',
                                        borderRadius: '10px',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        color: '#fff',
                                        background: actionColors[a.action] || '#757575',
                                        flexShrink: 0,
                                    }}>{a.action}</span>
                                    <span>{a.entity_type} #{a.entity_id}</span>
                                    <span style={{ marginLeft: 'auto', color: '#999', fontSize: '0.75rem' }}>
                                        {new Date(a.createdAt).toLocaleDateString('es-CO')}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: '#999', fontSize: '0.85rem' }}>Sin registros de auditoría.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountingDashboardWidget;
