import React, { useState, useEffect } from 'react';
import { FiActivity, FiRefreshCcw, FiPrinter, FiDownload } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const IncomeStatementPage = () => {
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchReport = async () => {
        try {
            setLoading(true);
            setError('');
            const result = await accountingApi.getIncomeStatement({ startDate, endDate });
            setData(result);
        } catch (err) {
            logError(err, '/accounting/income-statement');
            setError('Error al generar el Estado de Resultados.');
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

    const sectionColors: Record<string, { border: string; text: string }> = {
        INGRESOS: { border: '#34d399', text: '#34d399' },
        GASTOS: { border: '#f87171', text: '#f87171' },
        COSTOS: { border: '#fbbf24', text: '#fbbf24' },
    };

    const renderSection = (title: string, accounts: any[], total: number, colorKey: string) => {
        const colors = sectionColors[colorKey] || { border: '#f0b429', text: '#f0b429' };
        return (
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ borderBottom: `3px solid ${colors.border}`, paddingBottom: '8px', color: colors.text, fontFamily: 'Inter, sans-serif' }}>{title}</h3>
                {accounts && accounts.length > 0 ? accounts.map((acc: any, i: number) => (
                    <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', padding: '6px 0',
                        borderBottom: '1px solid #2a2a35', fontSize: '13px',
                    }}>
                        <span style={{ color: '#f1f1f3' }}>{acc.code} - {acc.name}</span>
                        <span style={{ fontWeight: 600, color: '#f1f1f3' }}>{formatCurrency(acc.amount || acc.balance)}</span>
                    </div>
                )) : (
                    <p style={{ color: '#6b6b7b', fontSize: '13px' }}>Sin datos</p>
                )}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                    borderTop: '2px solid #3a3a48', fontWeight: 700, fontSize: '15px', marginTop: '8px', color: '#f1f1f3',
                }}>
                    <span>Total {title}</span>
                    <span>{formatCurrency(total)}</span>
                </div>
            </div>
        );
    };

    const totalIncome = data?.total_income || data?.total_ingresos || 0;
    const totalExpenses = data?.total_expenses || data?.total_gastos || 0;
    const totalCosts = data?.total_costs || data?.total_costos || 0;
    const netResult = totalIncome - totalExpenses - totalCosts;

    return (
        <div className="page-container">
            <PageHeader title="Estado de Resultados" icon={<FiActivity />} />

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ minWidth: '160px' }}>
                    <FormField label="Desde" name="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div style={{ minWidth: '160px' }}>
                    <FormField label="Hasta" name="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <Button variant="primary" icon={<FiRefreshCcw />} onClick={fetchReport}>Generar</Button>
                <Button variant="secondary" icon={<FiPrinter />} onClick={handlePrint}>Imprimir</Button>
                <Button variant="secondary" icon={<FiDownload />} onClick={() => accountingApi.exportToExcel('income-statement', { startDate, endDate })}>Exportar Excel</Button>
            </div>

            {error && <p style={{ color: '#f87171', fontSize: '13px', fontWeight: 600 }}>{error}</p>}

            {loading ? (
                <LoadingSpinner size="md" text="Generando estado de resultados..." />
            ) : data ? (
                <div style={{
                    backgroundColor: '#1a1a24', border: '1px solid #2a2a35',
                    borderRadius: 12, padding: '24px',
                }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '4px', color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>Estado de Resultados</h2>
                    <p style={{ textAlign: 'center', color: '#a0a0b0', marginBottom: '24px', fontFamily: 'Inter, sans-serif' }}>
                        {new Date(startDate).toLocaleDateString('es-CO')} - {new Date(endDate).toLocaleDateString('es-CO')}
                    </p>

                    {renderSection('INGRESOS (Clase 4)', data.income || data.ingresos || [], totalIncome, 'INGRESOS')}
                    {renderSection('GASTOS (Clase 5)', data.expenses || data.gastos || [], totalExpenses, 'GASTOS')}
                    {renderSection('COSTOS (Clase 6)', data.costs || data.costos || [], totalCosts, 'COSTOS')}

                    <div style={{
                        padding: '16px', background: netResult >= 0 ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                        borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        borderLeft: `4px solid ${netResult >= 0 ? '#34d399' : '#f87171'}`,
                        border: `1px solid ${netResult >= 0 ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`,
                        borderLeftWidth: '4px',
                    }}>
                        <span style={{ fontWeight: 700, fontSize: '16px', color: '#f1f1f3' }}>
                            {netResult >= 0 ? 'Utilidad del Periodo' : 'Perdida del Periodo'}
                        </span>
                        <span style={{
                            fontWeight: 700, fontSize: '18px',
                            color: netResult >= 0 ? '#34d399' : '#f87171',
                        }}>
                            {formatCurrency(netResult)}
                        </span>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default IncomeStatementPage;
