import React, { useState, useEffect } from 'react';
import { FiBarChart2, FiRefreshCcw, FiPrinter, FiDownload } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
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

    const sectionColors: Record<string, { border: string; text: string }> = {
        ACTIVOS: { border: '#60a5fa', text: '#60a5fa' },
        PASIVOS: { border: '#f87171', text: '#f87171' },
        PATRIMONIO: { border: '#34d399', text: '#34d399' },
    };

    const renderSection = (title: string, accounts: any[], total: number, colorKey: string) => {
        const colors = sectionColors[colorKey] || { border: '#f0b429', text: '#f0b429' };
        return (
            <div style={{ flex: 1, minWidth: '280px' }}>
                <h3 style={{ borderBottom: `3px solid ${colors.border}`, paddingBottom: '8px', color: colors.text, fontFamily: 'Inter, sans-serif' }}>{title}</h3>
                {accounts && accounts.length > 0 ? accounts.map((acc: any, i: number) => (
                    <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', padding: '6px 0',
                        borderBottom: '1px solid #2a2a35', fontSize: '13px',
                    }}>
                        <span style={{ color: '#f1f1f3' }}>{acc.code} - {acc.name}</span>
                        <span style={{ fontWeight: 600, color: '#f1f1f3' }}>{formatCurrency(acc.balance)}</span>
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

    return (
        <div className="page-container">
            <PageHeader title="Balance General" icon={<FiBarChart2 />} />

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ minWidth: '120px' }}>
                    <FormField
                        label="Ano"
                        name="year"
                        type="select"
                        value={year}
                        onChange={e => setYear(Number(e.target.value))}
                        options={Array.from({ length: 5 }, (_, i) => ({ value: currentYear - i, label: String(currentYear - i) }))}
                    />
                </div>
                <div style={{ minWidth: '140px' }}>
                    <FormField
                        label="Mes"
                        name="month"
                        type="select"
                        value={month}
                        onChange={e => setMonth(Number(e.target.value))}
                        options={months.map((m, i) => ({ value: i + 1, label: m }))}
                    />
                </div>
                <Button variant="primary" icon={<FiRefreshCcw />} onClick={fetchReport}>Generar</Button>
                <Button variant="secondary" icon={<FiPrinter />} onClick={handlePrint}>Imprimir</Button>
                <Button variant="secondary" icon={<FiDownload />} onClick={() => accountingApi.exportToExcel('balance-sheet', { year: String(year), month: String(month) })}>Exportar Excel</Button>
            </div>

            {error && <p style={{ color: '#f87171', fontSize: '13px', fontWeight: 600 }}>{error}</p>}

            {loading ? (
                <LoadingSpinner size="md" text="Generando balance general..." />
            ) : data ? (
                <div style={{
                    backgroundColor: '#1a1a24', border: '1px solid #2a2a35',
                    borderRadius: 12, padding: '24px',
                }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '4px', color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>Balance General</h2>
                    <p style={{ textAlign: 'center', color: '#a0a0b0', marginBottom: '24px', fontFamily: 'Inter, sans-serif' }}>
                        {months[month - 1]} {year}
                    </p>

                    <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                        {renderSection('ACTIVOS', data.assets || data.activos || [], data.total_assets || data.total_activos || 0, 'ACTIVOS')}
                        {renderSection('PASIVOS', data.liabilities || data.pasivos || [], data.total_liabilities || data.total_pasivos || 0, 'PASIVOS')}
                        {renderSection('PATRIMONIO', data.equity || data.patrimonio || [], data.total_equity || data.total_patrimonio || 0, 'PATRIMONIO')}
                    </div>

                    <div style={{
                        marginTop: '24px', padding: '16px', background: '#1f1f2a', borderRadius: '8px',
                        border: '1px solid #2a2a35',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
                    }}>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#f1f1f3' }}>
                            Total Activos: <span style={{ color: '#60a5fa' }}>{formatCurrency(data.total_assets || data.total_activos || 0)}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#f1f1f3' }}>
                            Pasivos + Patrimonio: <span style={{ color: '#34d399' }}>
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
