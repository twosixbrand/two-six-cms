import React, { useState, useEffect } from 'react';
import { FiClock, FiRefreshCcw, FiPrinter } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

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

const AgingReportPage = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchReport = async () => {
        try {
            setLoading(true);
            setError('');
            const result = await accountingApi.getAgingReport();
            setData(result);
        } catch (err) {
            logError(err, '/accounting/reports/aging');
            setError('Error al generar el reporte de cartera por edades.');
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

    const summaryCards = data?.summary ? [
        { key: 'current', label: '0-30 Dias', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.3)' },
        { key: 'days31_60', label: '31-60 Dias', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.3)' },
        { key: 'days61_90', label: '61-90 Dias', color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.3)' },
        { key: 'over90', label: 'Mas de 90 Dias', color: '#a78bfa', borderColor: 'rgba(167, 139, 250, 0.3)' },
    ] : [];

    const renderOrderTable = (orders: any[], bucketLabel: string) => {
        if (!orders || orders.length === 0) return null;
        return (
            <div style={{ marginTop: '16px' }}>
                <h4 style={{ marginBottom: '8px', color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>{bucketLabel}</h4>
                <div style={{ overflowX: 'auto', backgroundColor: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 8 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Referencia</th>
                                <th style={thStyle}>Cliente</th>
                                <th style={thStyle}>Fecha Pedido</th>
                                <th style={thStyle}>Estado</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>Dias</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o: any, i: number) => (
                                <tr key={i}>
                                    <td style={{ ...tdStyle, fontWeight: 600 }}>{o.orderReference || `#${o.orderId}`}</td>
                                    <td style={tdStyle}>{o.customerName}</td>
                                    <td style={tdStyle}>{new Date(o.orderDate).toLocaleDateString('es-CO')}</td>
                                    <td style={tdStyle}>
                                        <StatusBadge status={o.status} size="sm" />
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600 }}>{o.daysOutstanding}</td>
                                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(o.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="page-container">
            <PageHeader title="Cartera por Edades" icon={<FiClock />} />

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <Button variant="primary" icon={<FiRefreshCcw />} onClick={fetchReport}>Actualizar</Button>
                <Button variant="secondary" icon={<FiPrinter />} onClick={handlePrint}>Imprimir</Button>
            </div>

            {error && <p style={{ color: '#f87171', fontSize: '13px', fontWeight: 600 }}>{error}</p>}

            {loading ? (
                <LoadingSpinner size="md" text="Generando reporte de cartera..." />
            ) : data ? (
                <div style={{
                    backgroundColor: '#1a1a24', border: '1px solid #2a2a35',
                    borderRadius: 12, padding: '24px',
                }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '4px', color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>Cartera por Edades (Cuentas por Cobrar)</h2>
                    <p style={{ textAlign: 'center', color: '#a0a0b0', marginBottom: '24px', fontFamily: 'Inter, sans-serif' }}>
                        Generado: {new Date(data.generatedAt).toLocaleString('es-CO')} | Total pedidos: {data.totalOrders}
                    </p>

                    {/* Summary Cards */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                        {summaryCards.map((card) => {
                            const bucket = data.summary[card.key];
                            return (
                                <div key={card.key} style={{
                                    flex: 1, minWidth: '180px', padding: '20px', borderRadius: '12px',
                                    background: '#1f1f2a', border: `1px solid ${card.borderColor}`,
                                    borderTop: `3px solid ${card.color}`, textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: '12px', color: card.color, fontWeight: 600 }}>{card.label}</div>
                                    <div style={{ fontSize: '22px', fontWeight: 700, color: card.color }}>
                                        {formatCurrency(bucket?.total || 0)}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#6b6b7b', marginTop: '4px' }}>
                                        {bucket?.count || 0} pedidos
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Total Outstanding */}
                    <div style={{
                        padding: '16px', borderRadius: '12px',
                        background: 'rgba(240, 180, 41, 0.08)', border: '1px solid rgba(240, 180, 41, 0.2)',
                        textAlign: 'center', marginBottom: '24px',
                    }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#a0a0b0' }}>Total Cartera Pendiente</div>
                        <div style={{ fontSize: '28px', fontWeight: 700, color: '#f0b429' }}>{formatCurrency(data.totalOutstanding)}</div>
                    </div>

                    {/* Detail Tables */}
                    {renderOrderTable(data.detail?.current, 'Corriente (0-30 dias)')}
                    {renderOrderTable(data.detail?.days31_60, '31-60 Dias')}
                    {renderOrderTable(data.detail?.days61_90, '61-90 Dias')}
                    {renderOrderTable(data.detail?.over90, 'Mas de 90 Dias')}

                    {data.totalOrders === 0 && (
                        <p style={{ color: '#6b6b7b', textAlign: 'center', fontSize: '14px', marginTop: '24px' }}>
                            No hay cuentas por cobrar pendientes
                        </p>
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default AgingReportPage;
