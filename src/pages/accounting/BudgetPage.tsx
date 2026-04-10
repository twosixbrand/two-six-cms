import React, { useState, useEffect } from 'react';
import { FiTarget, FiSave, FiBarChart2, FiArrowLeft, FiDownload, FiCalendar } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

type BudgetRow = {
    id_puc_account: number;
    code: string;
    name: string;
    months: number[];
};

const thStyle: React.CSSProperties = {
    padding: '0.6rem', fontSize: '0.7rem', fontWeight: 500,
    textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b6b7b',
    borderBottom: '1px solid #2a2a35', backgroundColor: '#1f1f2a',
    whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif',
};

const cellInputStyle: React.CSSProperties = {
    width: '100%', padding: '0.4rem', border: '1px solid #2a2a35',
    borderRadius: '4px', textAlign: 'right', fontSize: '0.85rem',
    backgroundColor: '#1a1a24', color: '#f1f1f3', outline: 'none',
    fontFamily: 'Inter, sans-serif',
};

const darkSelectStyle: React.CSSProperties = {
    padding: '0.55rem 0.75rem', borderRadius: 8,
    border: '1px solid #2a2a35', fontSize: '0.875rem',
    backgroundColor: '#1a1a24', color: '#f1f1f3',
    outline: 'none', height: '40px',
    fontFamily: 'Inter, sans-serif',
};

const BudgetPage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [rows, setRows] = useState<BudgetRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showComparison, setShowComparison] = useState(false);
    const [showAnnual, setShowAnnual] = useState(false);
    const [comparisonMonth, setComparisonMonth] = useState(new Date().getMonth() + 1);
    const [comparison, setComparison] = useState<any>(null);
    const [annualComparison, setAnnualComparison] = useState<any>(null);
    const [accounts, setAccounts] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, [year]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [budgets, accts] = await Promise.all([
                accountingApi.getBudgets(year),
                accountingApi.getAccounts({ level: 4 }),
            ]);

            const accountList = Array.isArray(accts) ? accts : (accts.data || []);
            setAccounts(accountList);

            const movableAccounts = accountList.filter((a: any) => a.accepts_movements);

            const budgetMap: Record<string, number> = {};
            const budgetArr = Array.isArray(budgets) ? budgets : [];
            for (const b of budgetArr) {
                budgetMap[`${b.id_puc_account}-${b.month}`] = b.budgeted_amount;
            }

            const newRows: BudgetRow[] = movableAccounts.map((a: any) => ({
                id_puc_account: a.id,
                code: a.code,
                name: a.name,
                months: Array.from({ length: 12 }, (_, i) => budgetMap[`${a.id}-${i + 1}`] || 0),
            }));

            const hasAnyBudget = newRows.some(r => r.months.some(m => m !== 0));
            setRows(hasAnyBudget ? newRows.filter(r => r.months.some(m => m !== 0)) : newRows.slice(0, 20));
        } catch (err: any) {
            logError({ message: err.message, page: 'BudgetPage' });
        }
        setLoading(false);
    };

    const handleCellChange = (rowIndex: number, monthIndex: number, value: string) => {
        const numValue = parseFloat(value) || 0;
        setRows(prev => {
            const updated = [...prev];
            updated[rowIndex] = {
                ...updated[rowIndex],
                months: updated[rowIndex].months.map((m, i) => i === monthIndex ? numValue : m),
            };
            return updated;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const promises: Promise<any>[] = [];
            for (const row of rows) {
                for (let m = 0; m < 12; m++) {
                    if (row.months[m] > 0) {
                        promises.push(
                            accountingApi.upsertBudget({
                                year,
                                month: m + 1,
                                id_puc_account: row.id_puc_account,
                                budgeted_amount: row.months[m],
                            }),
                        );
                    }
                }
            }
            await Promise.all(promises);
            await Swal.fire({ title: '¡Éxito!', text: 'Presupuesto guardado exitosamente', icon: 'success', confirmButtonColor: '#f0b429' });
        } catch (err: any) {
            logError({ message: err.message, page: 'BudgetPage' });
            await Swal.fire({ title: 'Error', text: err.message || 'Error al guardar', icon: 'error', confirmButtonColor: '#f0b429' });
        }
        setSaving(false);
    };

    const loadComparison = async () => {
        setLoading(true);
        try {
            const data = await accountingApi.getBudgetComparison({ year, month: comparisonMonth });
            setComparison(data);
            setShowComparison(true);
            setShowAnnual(false);
        } catch (err: any) {
            logError({ message: err.message, page: 'BudgetPage' });
        }
        setLoading(false);
    };

    const loadAnnualComparison = async () => {
        setLoading(true);
        try {
            const data = await accountingApi.getAnnualBudgetComparison(year);
            setAnnualComparison(data);
            setShowComparison(true);
            setShowAnnual(true);
        } catch (err: any) {
            logError({ message: err.message, page: 'BudgetPage' });
        }
        setLoading(false);
    };

    const handleExport = async () => {
        try {
            await accountingApi.exportToExcel('budget-comparison', { year: String(year) });
        } catch (err: any) {
            logError({ message: err.message, page: 'BudgetPage' });
            Swal.fire({ title: 'Error', text: 'No se pudo exportar el presupuesto', icon: 'error', confirmButtonColor: '#f0b429' });
        }
    };

    const addAccountRow = (accountId: number) => {
        const acct = accounts.find((a: any) => a.id === accountId);
        if (!acct) return;
        if (rows.find(r => r.id_puc_account === accountId)) return;
        setRows(prev => [...prev, {
            id_puc_account: acct.id,
            code: acct.code,
            name: acct.name,
            months: Array(12).fill(0),
        }]);
    };

    // Comparison View (Monthly or Annual)
    if (showComparison && (comparison || annualComparison)) {
        const data = showAnnual ? annualComparison : comparison;
        const items = data.items || [];
        const grandTotals = showAnnual ? data.grandTotals : data.totals;

        return (
            <div className="page-container">
                <PageHeader title={`Comparativo Presupuesto vs Ejecución ${showAnnual ? 'ANUAL' : 'MENSUAL'}`} icon={<FiBarChart2 />} />
                
                {/* Summary Dashcards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: '#1a1a24', padding: '1.5rem', borderRadius: '12px', border: '1px solid #2a2a35', borderLeft: '4px solid #60a5fa' }}>
                        <div style={{ color: '#6b6b7b', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Total Presupuestado</div>
                        <div style={{ color: '#f1f1f3', fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(grandTotals.budgeted)}</div>
                    </div>
                    <div style={{ background: '#1a1a24', padding: '1.5rem', borderRadius: '12px', border: '1px solid #2a2a35', borderLeft: '4px solid #f0b429' }}>
                        <div style={{ color: '#6b6b7b', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Total Ejecutado</div>
                        <div style={{ color: '#f1f1f3', fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(grandTotals.executed)}</div>
                    </div>
                    <div style={{ 
                        background: '#1a1a24', padding: '1.5rem', borderRadius: '12px', border: '1px solid #2a2a35', 
                        borderLeft: `4px solid ${grandTotals.variance > 0 ? '#f87171' : '#34d399'}` 
                    }}>
                        <div style={{ color: '#6b6b7b', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Desviación Total</div>
                        <div style={{ color: grandTotals.variance > 0 ? '#f87171' : '#34d399', fontSize: '1.5rem', fontWeight: 700 }}>
                            {formatCurrency(grandTotals.variance)}
                        </div>
                    </div>
                    <div style={{ background: '#1a1a24', padding: '1.5rem', borderRadius: '12px', border: '1px solid #2a2a35', borderLeft: '4px solid #a78bfa' }}>
                        <div style={{ color: '#6b6b7b', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Cumplimiento</div>
                        <div style={{ color: '#f1f1f3', fontSize: '1.5rem', fontWeight: 700 }}>
                            {grandTotals.budgeted > 0 ? Math.round((grandTotals.executed / grandTotals.budgeted) * 100) : 0}%
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button variant="secondary" icon={<FiArrowLeft />} onClick={() => setShowComparison(false)}>
                        Volver al Editor
                    </Button>
                    <div style={{ backgroundColor: '#1a1a24', padding: '0.4rem 1rem', borderRadius: '8px', border: '1px solid #2a2a35' }}>
                        <span style={{ fontWeight: 600, color: '#f0b429' }}>
                            {showAnnual ? `Año Completo ${year}` : `${MONTHS[comparisonMonth - 1]} ${year}`}
                        </span>
                    </div>

                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                        <Button variant="outline" icon={<FiDownload />} onClick={handleExport}>
                            Exportar Excel (Año Completo)
                        </Button>
                        {!showAnnual ? (
                            <Button variant="outline" icon={<FiCalendar />} onClick={loadAnnualComparison}>
                                Ver Vista Anual
                            </Button>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <select
                                    value={comparisonMonth}
                                    onChange={(e) => setComparisonMonth(parseInt(e.target.value))}
                                    style={darkSelectStyle}
                                >
                                    {MONTHS.map((m, i) => (
                                        <option key={i} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                                <Button variant="outline" icon={<FiBarChart2 />} onClick={loadComparison}>
                                    Ver Vista Mensual
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ overflowX: 'auto', backgroundColor: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 12 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr>
                                <th style={{ ...thStyle, textAlign: 'left' }}>Cuenta</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Presupuestado</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Ejecutado</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Variación ($)</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Variación (%)</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item: any, idx: number) => {
                                const budgetVal = showAnnual ? item.totals.budgeted : item.budgeted;
                                const executedVal = showAnnual ? item.totals.executed : item.executed;
                                const varianceVal = showAnnual ? item.totals.variance : item.variance;
                                const percentageVal = showAnnual ? item.totals.variancePercentage : item.variancePercentage;
                                const statusVal = showAnnual ? (varianceVal > 0 ? 'OVER' : varianceVal < 0 ? 'UNDER' : 'ON_TARGET') : item.status;

                                return (
                                    <tr key={idx} style={{ borderBottom: '1px solid #1f1f2a' }}>
                                        <td style={{ padding: '0.75rem 1rem', color: '#f1f1f3' }}>
                                            <strong style={{ color: '#f0b429' }}>{item.code}</strong> - {item.name}
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#f1f1f3' }}>{formatCurrency(budgetVal)}</td>
                                        <td style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#f1f1f3' }}>{formatCurrency(executedVal)}</td>
                                        <td style={{
                                            textAlign: 'right', padding: '0.75rem 1rem',
                                            color: varianceVal > 0 ? '#f87171' : '#34d399',
                                        }}>
                                            {formatCurrency(varianceVal)}
                                        </td>
                                        <td style={{
                                            textAlign: 'right', padding: '0.75rem 1rem',
                                            color: percentageVal > 0 ? '#f87171' : '#34d399',
                                        }}>
                                            {percentageVal}%
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '0.75rem 1rem' }}>
                                            <div style={{
                                                width: '100%', height: '8px', borderRadius: '4px',
                                                background: '#2a2a35', overflow: 'hidden',
                                                marginBottom: '4px'
                                            }}>
                                                <div style={{
                                                    width: `${Math.min(Math.abs(percentageVal), 100)}%`,
                                                    height: '100%',
                                                    background: statusVal === 'OVER' ? '#f87171' : statusVal === 'UNDER' ? '#34d399' : '#60a5fa',
                                                    borderRadius: '4px',
                                                }} />
                                            </div>
                                            <small style={{
                                                color: statusVal === 'OVER' ? '#f87171' : '#34d399',
                                                fontWeight: 600,
                                                fontSize: '0.7rem'
                                            }}>
                                                {statusVal === 'OVER' ? 'Sobre presupuesto' : statusVal === 'UNDER' ? 'Bajo presupuesto' : 'En meta'}
                                            </small>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        {grandTotals && (
                            <tfoot>
                                <tr style={{ background: '#1f1f2a', fontWeight: 700, borderTop: '2px solid #f0b429' }}>
                                    <td style={{ padding: '0.75rem 1rem', color: '#f1f1f3' }}>TOTALES GENERALES</td>
                                    <td style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#f1f1f3' }}>{formatCurrency(grandTotals.budgeted)}</td>
                                    <td style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#f1f1f3' }}>{formatCurrency(grandTotals.executed)}</td>
                                    <td style={{
                                        textAlign: 'right', padding: '0.75rem 1rem',
                                        color: grandTotals.variance > 0 ? '#f87171' : '#34d399',
                                    }}>{formatCurrency(grandTotals.variance)}</td>
                                    <td colSpan={2}></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        );
    }

    // Main Budget View
    return (
        <div className="page-container">
            <PageHeader title="Presupuesto" icon={<FiTarget />} />

            <div style={{
                display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label htmlFor="year-select" style={{ fontWeight: 600, color: '#a0a0b0', fontFamily: 'Inter, sans-serif' }}>Ano:</label>
                    <select
                        id="year-select"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        style={darkSelectStyle}
                    >
                        {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <select
                    onChange={(e) => {
                        if (e.target.value) addAccountRow(parseInt(e.target.value));
                        e.target.value = '';
                    }}
                    style={{ ...darkSelectStyle, minWidth: '250px', height: 'auto' }}
                >
                    <option value="">+ Agregar cuenta...</option>
                    {accounts
                        .filter((a: any) => a.accepts_movements && !rows.find(r => r.id_puc_account === a.id))
                        .map((a: any) => (
                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                        ))}
                </select>

                <Button
                    variant="primary"
                    icon={<FiSave />}
                    onClick={handleSave}
                    disabled={saving}
                    loading={saving}
                >
                    {saving ? 'Guardando...' : 'Guardar'}
                </Button>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: 'auto' }}>
                    <select
                        value={comparisonMonth}
                        onChange={(e) => setComparisonMonth(parseInt(e.target.value))}
                        style={darkSelectStyle}
                    >
                        {MONTHS.map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>
                    <Button variant="outline" icon={<FiBarChart2 />} onClick={loadComparison}>
                        Ver Comparativo
                    </Button>
                    <Button variant="outline" icon={<FiCalendar />} onClick={loadAnnualComparison}>
                        Comparativo Anual
                    </Button>
                </div>
            </div>

            {loading ? (
                <LoadingSpinner size="md" text="Cargando..." />
            ) : (
                <div style={{ overflowX: 'auto', backgroundColor: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 12 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr>
                                <th style={{ ...thStyle, textAlign: 'left', position: 'sticky', left: 0, minWidth: '200px', zIndex: 1 }}>
                                    Cuenta PUC
                                </th>
                                {MONTHS.map(m => (
                                    <th key={m} style={{ ...thStyle, textAlign: 'center', minWidth: '100px' }}>{m}</th>
                                ))}
                                <th style={{ ...thStyle, textAlign: 'right', minWidth: '120px' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, ri) => (
                                <tr key={row.id_puc_account} style={{ borderBottom: '1px solid #1f1f2a' }}>
                                    <td style={{
                                        padding: '0.5rem 0.6rem', position: 'sticky', left: 0,
                                        background: '#1a1a24', fontWeight: 500, whiteSpace: 'nowrap',
                                        color: '#f1f1f3', fontFamily: 'Inter, sans-serif', zIndex: 1,
                                    }}>
                                        <strong style={{ color: '#f0b429' }}>{row.code}</strong> {row.name}
                                    </td>
                                    {row.months.map((val, mi) => (
                                        <td key={mi} style={{ padding: '0.3rem' }}>
                                            <input
                                                type="number"
                                                value={val || ''}
                                                onChange={(e) => handleCellChange(ri, mi, e.target.value)}
                                                placeholder="0"
                                                style={cellInputStyle}
                                            />
                                        </td>
                                    ))}
                                    <td style={{ textAlign: 'right', padding: '0.6rem', fontWeight: 600, color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>
                                        {formatCurrency(row.months.reduce((s, v) => s + v, 0))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {rows.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#6b6b7b', padding: '2rem' }}>
                            No hay cuentas con presupuesto. Use el selector para agregar cuentas.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BudgetPage;
