import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiRefreshCcw, FiPrinter, FiDownload } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
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

    const renderSection = (title: string, accounts: any[], total: number, color: string) => (
        <div style={{ marginBottom: '24px' }}>
            <h3 style={{ borderBottom: `3px solid ${color}`, paddingBottom: '8px', color }}>{title}</h3>
            {accounts && accounts.length > 0 ? accounts.map((acc: any, i: number) => (
                <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '6px 0',
                    borderBottom: '1px solid #f0f0f0', fontSize: '13px',
                }}>
                    <span>{acc.code} - {acc.name}</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(acc.amount || acc.balance)}</span>
                </div>
            )) : (
                <p style={{ color: '#999', fontSize: '13px' }}>Sin datos</p>
            )}
            <div style={{
                display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                borderTop: '2px solid #333', fontWeight: 700, fontSize: '15px', marginTop: '8px',
            }}>
                <span>Total {title}</span>
                <span>{formatCurrency(total)}</span>
            </div>
        </div>
    );

    const totalIncome = data?.total_income || data?.total_ingresos || 0;
    const totalExpenses = data?.total_expenses || data?.total_gastos || 0;
    const totalCosts = data?.total_costs || data?.total_costos || 0;
    const netResult = totalIncome - totalExpenses - totalCosts;

    return (
        <div className="page-container">
            <PageHeader title="Estado de Resultados" icon={<FiTrendingUp />} />

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Desde</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Hasta</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} />
                </div>
                <button onClick={fetchReport} className="btn btn-primary">
                    <FiRefreshCcw /> Generar
                </button>
                <button onClick={handlePrint} className="btn btn-secondary">
                    <FiPrinter /> Imprimir
                </button>
                <button onClick={() => accountingApi.exportToExcel('income-statement', { startDate, endDate })} className="btn btn-secondary">
                    <FiDownload /> Exportar Excel
                </button>
            </div>

            {error && <p className="error-message">{error}</p>}

            {loading ? (
                <p>Generando estado de resultados...</p>
            ) : data ? (
                <div className="list-card full-width" style={{ padding: '24px' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '4px' }}>Estado de Resultados</h2>
                    <p style={{ textAlign: 'center', color: '#666', marginBottom: '24px' }}>
                        {new Date(startDate).toLocaleDateString('es-CO')} - {new Date(endDate).toLocaleDateString('es-CO')}
                    </p>

                    {renderSection('INGRESOS (Clase 4)', data.income || data.ingresos || [], totalIncome, '#2e7d32')}
                    {renderSection('GASTOS (Clase 5)', data.expenses || data.gastos || [], totalExpenses, '#c62828')}
                    {renderSection('COSTOS (Clase 6)', data.costs || data.costos || [], totalCosts, '#e65100')}

                    <div style={{
                        padding: '16px', background: netResult >= 0 ? '#e8f5e9' : '#ffebee',
                        borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        borderLeft: `4px solid ${netResult >= 0 ? '#4caf50' : '#e53935'}`,
                    }}>
                        <span style={{ fontWeight: 700, fontSize: '16px' }}>
                            {netResult >= 0 ? 'Utilidad del Periodo' : 'Pérdida del Periodo'}
                        </span>
                        <span style={{
                            fontWeight: 700, fontSize: '18px',
                            color: netResult >= 0 ? '#2e7d32' : '#c62828',
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
