import React, { useState, useEffect } from 'react';
import { FiClock, FiRefreshCcw, FiPrinter } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

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
        { key: 'current', label: '0-30 Dias', color: '#2e7d32', bg: '#e8f5e9', border: '#a5d6a7' },
        { key: 'days31_60', label: '31-60 Dias', color: '#e65100', bg: '#fff3e0', border: '#ffcc80' },
        { key: 'days61_90', label: '61-90 Dias', color: '#c62828', bg: '#fce4ec', border: '#ef9a9a' },
        { key: 'over90', label: 'Mas de 90 Dias', color: '#4a148c', bg: '#f3e5f5', border: '#ce93d8' },
    ] : [];

    const renderOrderTable = (orders: any[], bucketLabel: string) => {
        if (!orders || orders.length === 0) return null;
        return (
            <div style={{ marginTop: '16px' }}>
                <h4 style={{ marginBottom: '8px' }}>{bucketLabel}</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                            <th style={{ padding: '8px' }}>Referencia</th>
                            <th style={{ padding: '8px' }}>Cliente</th>
                            <th style={{ padding: '8px' }}>Fecha Pedido</th>
                            <th style={{ padding: '8px' }}>Estado</th>
                            <th style={{ padding: '8px', textAlign: 'center' }}>Dias</th>
                            <th style={{ padding: '8px', textAlign: 'right' }}>Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((o: any, i: number) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '6px 8px', fontWeight: 600 }}>{o.orderReference || `#${o.orderId}`}</td>
                                <td style={{ padding: '6px 8px' }}>{o.customerName}</td>
                                <td style={{ padding: '6px 8px' }}>{new Date(o.orderDate).toLocaleDateString('es-CO')}</td>
                                <td style={{ padding: '6px 8px' }}>
                                    <span style={{
                                        padding: '2px 8px', borderRadius: '12px', fontSize: '11px',
                                        background: '#e3f2fd', color: '#1565c0',
                                    }}>
                                        {o.status}
                                    </span>
                                </td>
                                <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600 }}>{o.daysOutstanding}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(o.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="page-container">
            <PageHeader title="Cartera por Edades" icon={<FiClock />} />

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <button onClick={fetchReport} className="btn btn-primary">
                    <FiRefreshCcw /> Actualizar
                </button>
                <button onClick={handlePrint} className="btn btn-secondary">
                    <FiPrinter /> Imprimir
                </button>
            </div>

            {error && <p className="error-message">{error}</p>}

            {loading ? (
                <p>Generando reporte de cartera...</p>
            ) : data ? (
                <div className="list-card full-width" style={{ padding: '24px' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '4px' }}>Cartera por Edades (Cuentas por Cobrar)</h2>
                    <p style={{ textAlign: 'center', color: '#666', marginBottom: '24px' }}>
                        Generado: {new Date(data.generatedAt).toLocaleString('es-CO')} | Total pedidos: {data.totalOrders}
                    </p>

                    {/* Summary Cards */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                        {summaryCards.map((card) => {
                            const bucket = data.summary[card.key];
                            return (
                                <div key={card.key} style={{
                                    flex: 1, minWidth: '180px', padding: '20px', borderRadius: '8px',
                                    background: card.bg, border: `1px solid ${card.border}`, textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: '12px', color: card.color, fontWeight: 600 }}>{card.label}</div>
                                    <div style={{ fontSize: '22px', fontWeight: 700, color: card.color }}>
                                        {formatCurrency(bucket?.total || 0)}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                                        {bucket?.count || 0} pedidos
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Total Outstanding */}
                    <div style={{
                        padding: '16px', borderRadius: '8px', background: '#263238', color: '#fff',
                        textAlign: 'center', marginBottom: '24px',
                    }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.8 }}>Total Cartera Pendiente</div>
                        <div style={{ fontSize: '28px', fontWeight: 700 }}>{formatCurrency(data.totalOutstanding)}</div>
                    </div>

                    {/* Detail Tables */}
                    {renderOrderTable(data.detail?.current, 'Corriente (0-30 dias)')}
                    {renderOrderTable(data.detail?.days31_60, '31-60 Dias')}
                    {renderOrderTable(data.detail?.days61_90, '61-90 Dias')}
                    {renderOrderTable(data.detail?.over90, 'Mas de 90 Dias')}

                    {data.totalOrders === 0 && (
                        <p style={{ color: '#999', textAlign: 'center', fontSize: '14px', marginTop: '24px' }}>
                            No hay cuentas por cobrar pendientes
                        </p>
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default AgingReportPage;
