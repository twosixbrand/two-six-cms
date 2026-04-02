import React, { useState, useEffect } from 'react';
import { FiRepeat, FiRefreshCcw, FiPrinter } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
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

    const sectionColors: Record<string, string> = {
        'Actividades de Operacion': '#60a5fa',
        'Actividades de Inversion': '#fbbf24',
        'Actividades de Financiacion': '#a78bfa',
    };

    const renderLineItems = (items: any[]) => (
        items.map((item: any, i: number) => (
            <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', padding: '6px 0',
                borderBottom: '1px solid #2a2a35', fontSize: '13px', paddingLeft: '16px',
            }}>
                <span style={{ color: '#f1f1f3' }}>{item.concept}</span>
                <span style={{ fontWeight: 600, color: item.amount >= 0 ? '#34d399' : '#f87171' }}>
                    {formatCurrency(item.amount)}
                </span>
            </div>
        ))
    );

    const renderSection = (title: string, section: any, color: string) => (
        <div style={{ marginBottom: '24px' }}>
            <h3 style={{ borderBottom: `3px solid ${color}`, paddingBottom: '8px', color, marginBottom: '12px', fontFamily: 'Inter, sans-serif' }}>
                {title}
            </h3>
            {section?.netIncome !== undefined && (
                <div style={{
                    display: 'flex', justifyContent: 'space-between', padding: '6px 0',
                    borderBottom: '1px solid #2a2a35', fontSize: '13px', paddingLeft: '16px',
                }}>
                    <span style={{ color: '#f1f1f3' }}>Utilidad Neta del Periodo</span>
                    <span style={{ fontWeight: 600, color: '#f1f1f3' }}>{formatCurrency(section.netIncome)}</span>
                </div>
            )}
            {section?.adjustments && renderLineItems(section.adjustments)}
            {section?.items && renderLineItems(section.items)}
            <div style={{
                display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                borderTop: '2px solid #3a3a48', fontWeight: 700, fontSize: '15px', marginTop: '8px', color: '#f1f1f3',
            }}>
                <span>Total {title}</span>
                <span style={{ color: section?.total >= 0 ? '#34d399' : '#f87171' }}>
                    {formatCurrency(section?.total || 0)}
                </span>
            </div>
        </div>
    );

    return (
        <div className="page-container">
            <PageHeader title="Flujo de Caja" icon={<FiRepeat />} />

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ minWidth: '160px' }}>
                    <FormField label="Fecha Inicio" name="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div style={{ minWidth: '160px' }}>
                    <FormField label="Fecha Fin" name="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <Button variant="primary" icon={<FiRefreshCcw />} onClick={fetchReport}>Generar</Button>
                <Button variant="secondary" icon={<FiPrinter />} onClick={handlePrint}>Imprimir</Button>
            </div>

            {error && <p style={{ color: '#f87171', fontSize: '13px', fontWeight: 600 }}>{error}</p>}

            {loading ? (
                <LoadingSpinner size="md" text="Generando flujo de caja..." />
            ) : data ? (
                <div style={{
                    backgroundColor: '#1a1a24', border: '1px solid #2a2a35',
                    borderRadius: 12, padding: '24px',
                }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '4px', color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>Estado de Flujo de Efectivo</h2>
                    <p style={{ textAlign: 'center', color: '#a0a0b0', marginBottom: '24px', fontFamily: 'Inter, sans-serif' }}>
                        {startDate} al {endDate}
                    </p>

                    {renderSection('Actividades de Operacion', data.operatingActivities, sectionColors['Actividades de Operacion'])}
                    {renderSection('Actividades de Inversion', data.investingActivities, sectionColors['Actividades de Inversion'])}
                    {renderSection('Actividades de Financiacion', data.financingActivities, sectionColors['Actividades de Financiacion'])}

                    {/* Summary */}
                    <div style={{ marginTop: '24px', padding: '16px', background: '#1f1f2a', borderRadius: '8px', border: '1px solid #2a2a35' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#f1f1f3' }}>
                                <span>Efectivo al Inicio del Periodo:</span>
                                <span style={{ fontWeight: 700 }}>{formatCurrency(data.openingCash)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#f1f1f3' }}>
                                <span>Cambio Neto en Efectivo:</span>
                                <span style={{ fontWeight: 700, color: data.netChange >= 0 ? '#34d399' : '#f87171' }}>
                                    {formatCurrency(data.netChange)}
                                </span>
                            </div>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', fontSize: '16px',
                                borderTop: '2px solid #3a3a48', paddingTop: '10px', fontWeight: 700, color: '#f1f1f3',
                            }}>
                                <span>Efectivo al Final del Periodo:</span>
                                <span style={{ color: '#60a5fa' }}>{formatCurrency(data.closingCash)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default CashFlowPage;
