import React, { useState, useEffect } from 'react';
import { FiBarChart2, FiRefreshCcw, FiPrinter, FiDownload } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const BalanceSheetPage = () => {
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(currentMonth);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchReport = async () => {
        try {
            setLoading(true);
            setError('');
            const result = await accountingApi.getBalanceSheet({ year, month });
            setData(result);
        } catch (err) {
            logError(err, '/accounting/balance-sheet');
            setError('Error al generar el Balance General.');
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

    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];

    const renderSection = (title: string, accounts: any[], total: number, color: string) => (
        <div style={{ flex: 1, minWidth: '280px' }}>
            <h3 style={{ borderBottom: `3px solid ${color}`, paddingBottom: '8px', color }}>{title}</h3>
            {accounts && accounts.length > 0 ? accounts.map((acc: any, i: number) => (
                <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '6px 0',
                    borderBottom: '1px solid #f0f0f0', fontSize: '13px',
                }}>
                    <span>{acc.code} - {acc.name}</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(acc.balance)}</span>
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

    return (
        <div className="page-container">
            <PageHeader title="Balance General" icon={<FiBarChart2 />} />

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Año</label>
                    <select value={year} onChange={e => setYear(Number(e.target.value))}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}>
                        {Array.from({ length: 5 }, (_, i) => currentYear - i).map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Mes</label>
                    <select value={month} onChange={e => setMonth(Number(e.target.value))}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}>
                        {months.map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>
                </div>
                <button onClick={fetchReport} className="btn btn-primary">
                    <FiRefreshCcw /> Generar
                </button>
                <button onClick={handlePrint} className="btn btn-secondary">
                    <FiPrinter /> Imprimir
                </button>
                <button onClick={() => accountingApi.exportToExcel('balance-sheet', { year: String(year), month: String(month) })} className="btn btn-secondary">
                    <FiDownload /> Exportar Excel
                </button>
            </div>

            {error && <p className="error-message">{error}</p>}

            {loading ? (
                <p>Generando balance general...</p>
            ) : data ? (
                <div className="list-card full-width" style={{ padding: '24px' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '4px' }}>Balance General</h2>
                    <p style={{ textAlign: 'center', color: '#666', marginBottom: '24px' }}>
                        {months[month - 1]} {year}
                    </p>

                    <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                        {renderSection('ACTIVOS', data.assets || data.activos || [], data.total_assets || data.total_activos || 0, '#1565c0')}
                        {renderSection('PASIVOS', data.liabilities || data.pasivos || [], data.total_liabilities || data.total_pasivos || 0, '#c62828')}
                        {renderSection('PATRIMONIO', data.equity || data.patrimonio || [], data.total_equity || data.total_patrimonio || 0, '#2e7d32')}
                    </div>

                    <div style={{
                        marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
                    }}>
                        <div style={{ fontWeight: 700, fontSize: '15px' }}>
                            Total Activos: <span style={{ color: '#1565c0' }}>{formatCurrency(data.total_assets || data.total_activos || 0)}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '15px' }}>
                            Pasivos + Patrimonio: <span style={{ color: '#2e7d32' }}>
                                {formatCurrency((data.total_liabilities || data.total_pasivos || 0) + (data.total_equity || data.total_patrimonio || 0))}
                            </span>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default BalanceSheetPage;
