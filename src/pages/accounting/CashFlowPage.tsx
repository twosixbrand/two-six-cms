import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiRefreshCcw, FiPrinter } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const CashFlowPage = () => {
    const [startDate, setStartDate] = useState(`${currentYear}-${String(currentMonth).padStart(2, '0')}-01`);
    const [endDate, setEndDate] = useState(
        new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]
    );
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchReport = async () => {
        try {
            setLoading(true);
            setError('');
            const result = await accountingApi.getCashFlow({ startDate, endDate });
            setData(result);
        } catch (err) {
            logError(err, '/accounting/reports/cash-flow');
            setError('Error al generar el Flujo de Caja.');
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

    const renderLineItems = (items: any[]) => (
        items.map((item: any, i: number) => (
            <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', padding: '6px 0',
                borderBottom: '1px solid #f0f0f0', fontSize: '13px', paddingLeft: '16px',
            }}>
                <span>{item.concept}</span>
                <span style={{ fontWeight: 600, color: item.amount >= 0 ? '#2e7d32' : '#c62828' }}>
                    {formatCurrency(item.amount)}
                </span>
            </div>
        ))
    );

    const renderSection = (title: string, section: any, color: string) => (
        <div style={{ marginBottom: '24px' }}>
            <h3 style={{ borderBottom: `3px solid ${color}`, paddingBottom: '8px', color, marginBottom: '12px' }}>
                {title}
            </h3>
            {section?.netIncome !== undefined && (
                <div style={{
                    display: 'flex', justifyContent: 'space-between', padding: '6px 0',
                    borderBottom: '1px solid #f0f0f0', fontSize: '13px', paddingLeft: '16px',
                }}>
                    <span>Utilidad Neta del Periodo</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(section.netIncome)}</span>
                </div>
            )}
            {section?.adjustments && renderLineItems(section.adjustments)}
            {section?.items && renderLineItems(section.items)}
            <div style={{
                display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                borderTop: '2px solid #333', fontWeight: 700, fontSize: '15px', marginTop: '8px',
            }}>
                <span>Total {title}</span>
                <span style={{ color: section?.total >= 0 ? '#2e7d32' : '#c62828' }}>
                    {formatCurrency(section?.total || 0)}
                </span>
            </div>
        </div>
    );

    return (
        <div className="page-container">
            <PageHeader title="Flujo de Caja" icon={<FiTrendingUp />} />

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Fecha Inicio</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Fecha Fin</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} />
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
                <p>Generando flujo de caja...</p>
            ) : data ? (
                <div className="list-card full-width" style={{ padding: '24px' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '4px' }}>Estado de Flujo de Efectivo</h2>
                    <p style={{ textAlign: 'center', color: '#666', marginBottom: '24px' }}>
                        {startDate} al {endDate}
                    </p>

                    {renderSection('Actividades de Operacion', data.operatingActivities, '#1565c0')}
                    {renderSection('Actividades de Inversion', data.investingActivities, '#e65100')}
                    {renderSection('Actividades de Financiacion', data.financingActivities, '#6a1b9a')}

                    {/* Summary */}
                    <div style={{ marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span>Efectivo al Inicio del Periodo:</span>
                                <span style={{ fontWeight: 700 }}>{formatCurrency(data.openingCash)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span>Cambio Neto en Efectivo:</span>
                                <span style={{ fontWeight: 700, color: data.netChange >= 0 ? '#2e7d32' : '#c62828' }}>
                                    {formatCurrency(data.netChange)}
                                </span>
                            </div>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', fontSize: '16px',
                                borderTop: '2px solid #333', paddingTop: '10px', fontWeight: 700,
                            }}>
                                <span>Efectivo al Final del Periodo:</span>
                                <span style={{ color: '#1565c0' }}>{formatCurrency(data.closingCash)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default CashFlowPage;
