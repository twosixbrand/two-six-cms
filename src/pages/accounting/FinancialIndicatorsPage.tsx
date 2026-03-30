import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiActivity, FiDollarSign, FiPercent, FiShield, FiBox } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const CATEGORY_LABELS: Record<string, string> = {
    LIQUIDITY: 'Liquidez',
    SOLVENCY: 'Solvencia',
    PROFITABILITY: 'Rentabilidad',
    EFFICIENCY: 'Eficiencia',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    LIQUIDITY: <FiDollarSign />,
    SOLVENCY: <FiShield />,
    PROFITABILITY: <FiPercent />,
    EFFICIENCY: <FiBox />,
};

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    green: { bg: 'rgba(52, 211, 153, 0.08)', border: '#34d399', text: '#34d399' },
    yellow: { bg: 'rgba(251, 191, 36, 0.08)', border: '#fbbf24', text: '#fbbf24' },
    red: { bg: 'rgba(248, 113, 113, 0.08)', border: '#f87171', text: '#f87171' },
};

const darkSelectStyle: React.CSSProperties = {
    padding: '0.55rem 0.75rem', borderRadius: 8,
    border: '1px solid #2a2a35', fontSize: '0.875rem',
    backgroundColor: '#1a1a24', color: '#f1f1f3',
    outline: 'none', height: '40px',
    fontFamily: 'Inter, sans-serif',
};

const FinancialIndicatorsPage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadIndicators();
    }, [year, month]);

    const loadIndicators = async () => {
        setLoading(true);
        try {
            const result = await accountingApi.getFinancialIndicators({ year, month });
            setData(result);
        } catch (err: any) {
            logError({ message: err.message, page: 'FinancialIndicatorsPage' });
        }
        setLoading(false);
    };

    const formatValue = (indicator: any) => {
        if (indicator.unit === 'COP') return formatCurrency(indicator.value);
        if (indicator.unit === '%') return `${indicator.value}%`;
        if (indicator.unit === 'veces') return `${indicator.value}x`;
        if (indicator.unit === 'dias') return `${indicator.value} dias`;
        return String(indicator.value);
    };

    // Group indicators by category
    const grouped: Record<string, any[]> = {};
    if (data?.indicators) {
        for (const ind of data.indicators) {
            if (!grouped[ind.category]) grouped[ind.category] = [];
            grouped[ind.category].push(ind);
        }
    }

    return (
        <div className="page-container">
            <PageHeader title="Indicadores Financieros" icon={<FiTrendingUp />} />

            <div style={{
                display: 'flex', gap: '1rem', marginBottom: '2rem',
                alignItems: 'center', flexWrap: 'wrap',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, color: '#a0a0b0', fontFamily: 'Inter, sans-serif' }}>Ano:</label>
                    <select
                        value={year}
                        onChange={e => setYear(parseInt(e.target.value))}
                        style={darkSelectStyle}
                    >
                        {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, color: '#a0a0b0', fontFamily: 'Inter, sans-serif' }}>Mes:</label>
                    <select
                        value={month}
                        onChange={e => setMonth(parseInt(e.target.value))}
                        style={darkSelectStyle}
                    >
                        {MONTHS.map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <LoadingSpinner size="md" text="Cargando indicadores..." />
            ) : data ? (
                <div>
                    {Object.entries(grouped).map(([category, indicators]) => (
                        <div key={category} style={{ marginBottom: '2rem' }}>
                            <h3 style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                marginBottom: '1rem', color: '#f1f1f3', fontFamily: 'Inter, sans-serif',
                            }}>
                                {CATEGORY_ICONS[category]} {CATEGORY_LABELS[category] || category}
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '1rem',
                            }}>
                                {indicators.map((ind: any) => {
                                    const colors = STATUS_COLORS[ind.status] || STATUS_COLORS.yellow;
                                    return (
                                        <div
                                            key={ind.key}
                                            style={{
                                                padding: '1.25rem',
                                                borderRadius: '12px',
                                                border: `2px solid ${colors.border}`,
                                                background: colors.bg,
                                                transition: 'transform 0.15s',
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.85rem', color: '#a0a0b0', marginBottom: '0.3rem' }}>
                                                        {ind.name}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '1.8rem', fontWeight: 800,
                                                        color: colors.text, lineHeight: 1.2,
                                                    }}>
                                                        {formatValue(ind)}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '10px',
                                                    background: 'rgba(255,255,255,0.05)', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '1.2rem', color: colors.text,
                                                }}>
                                                    <FiActivity />
                                                </div>
                                            </div>
                                            <div style={{
                                                marginTop: '0.8rem', fontSize: '0.8rem',
                                                color: '#a0a0b0', lineHeight: 1.4,
                                            }}>
                                                {ind.interpretation}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Raw data summary */}
                    {data.rawData && (
                        <div style={{
                            marginTop: '2rem', padding: '1.5rem', borderRadius: '12px',
                            background: '#1a1a24', border: '1px solid #2a2a35',
                        }}>
                            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>Datos Base</h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: '0.75rem',
                            }}>
                                {[
                                    { label: 'Activos Corrientes', value: data.rawData.activosCorrientes },
                                    { label: 'Pasivos Corrientes', value: data.rawData.pasivosCorrientes },
                                    { label: 'Inventarios', value: data.rawData.inventarios },
                                    { label: 'Total Activos', value: data.rawData.totalActivos },
                                    { label: 'Total Pasivos', value: data.rawData.totalPasivos },
                                    { label: 'Patrimonio', value: data.rawData.patrimonio },
                                    { label: 'Ingresos', value: data.rawData.ingresos },
                                    { label: 'Gastos', value: data.rawData.gastos },
                                    { label: 'Costos', value: data.rawData.costos },
                                    { label: 'Utilidad Neta', value: data.rawData.utilidadNeta },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #2a2a35' }}>
                                        <span style={{ color: '#a0a0b0', fontSize: '0.85rem' }}>{item.label}</span>
                                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f1f1f3' }}>{formatCurrency(item.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <p style={{ textAlign: 'center', color: '#6b6b7b', padding: '2rem' }}>
                    Seleccione ano y mes para ver los indicadores.
                </p>
            )}
        </div>
    );
};

export default FinancialIndicatorsPage;
