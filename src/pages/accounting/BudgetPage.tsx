import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiSave, FiBarChart2, FiArrowLeft } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

type BudgetRow = {
    id_puc_account: number;
    code: string;
    name: string;
    months: number[]; // index 0=Jan..11=Dec
};

const BudgetPage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [rows, setRows] = useState<BudgetRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showComparison, setShowComparison] = useState(false);
    const [comparisonMonth, setComparisonMonth] = useState(new Date().getMonth() + 1);
    const [comparison, setComparison] = useState<any>(null);
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

            // Build rows from accounts that accept movements
            const movableAccounts = accountList.filter((a: any) => a.accepts_movements);

            // Index existing budgets
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

            // Only show rows that have at least one non-zero budget, or if there are no budgets yet, show all
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
            alert('Presupuesto guardado exitosamente');
        } catch (err: any) {
            logError({ message: err.message, page: 'BudgetPage' });
            alert('Error al guardar: ' + err.message);
        }
        setSaving(false);
    };

    const loadComparison = async () => {
        try {
            const data = await accountingApi.getBudgetComparison({ year, month: comparisonMonth });
            setComparison(data);
            setShowComparison(true);
        } catch (err: any) {
            logError({ message: err.message, page: 'BudgetPage' });
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

    // ── Comparison View ──
    if (showComparison && comparison) {
        return (
            <div>
                <PageHeader title="Comparativo Presupuesto vs Ejecucion" icon={<FiBarChart2 />} />
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <button
                        onClick={() => setShowComparison(false)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '8px',
                            background: '#fff', cursor: 'pointer',
                        }}
                    >
                        <FiArrowLeft /> Volver
                    </button>
                    <span style={{ fontWeight: 600 }}>
                        {MONTHS[comparisonMonth - 1]} {year}
                    </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Cuenta</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem' }}>Presupuestado</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem' }}>Ejecutado</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem' }}>Variacion ($)</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem' }}>Variacion (%)</th>
                                <th style={{ textAlign: 'center', padding: '0.75rem' }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(comparison.items || []).map((item: any, idx: number) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.75rem' }}>
                                        <strong>{item.code}</strong> - {item.name}
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '0.75rem' }}>{formatCurrency(item.budgeted)}</td>
                                    <td style={{ textAlign: 'right', padding: '0.75rem' }}>{formatCurrency(item.executed)}</td>
                                    <td style={{
                                        textAlign: 'right', padding: '0.75rem',
                                        color: item.variance > 0 ? '#c62828' : '#2e7d32',
                                    }}>
                                        {formatCurrency(item.variance)}
                                    </td>
                                    <td style={{
                                        textAlign: 'right', padding: '0.75rem',
                                        color: item.variancePercentage > 0 ? '#c62828' : '#2e7d32',
                                    }}>
                                        {item.variancePercentage}%
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                                        <div style={{
                                            width: '100%', height: '8px', borderRadius: '4px',
                                            background: '#eee', overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                width: `${Math.min(Math.abs(item.variancePercentage), 100)}%`,
                                                height: '100%',
                                                background: item.status === 'OVER' ? '#ef5350' : item.status === 'UNDER' ? '#66bb6a' : '#42a5f5',
                                                borderRadius: '4px',
                                            }} />
                                        </div>
                                        <small style={{
                                            color: item.status === 'OVER' ? '#c62828' : '#2e7d32',
                                            fontWeight: 600,
                                        }}>
                                            {item.status === 'OVER' ? 'Sobre presupuesto' : item.status === 'UNDER' ? 'Bajo presupuesto' : 'En meta'}
                                        </small>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {comparison.totals && (
                            <tfoot>
                                <tr style={{ background: '#f8f9fa', fontWeight: 700, borderTop: '2px solid #dee2e6' }}>
                                    <td style={{ padding: '0.75rem' }}>TOTALES</td>
                                    <td style={{ textAlign: 'right', padding: '0.75rem' }}>{formatCurrency(comparison.totals.budgeted)}</td>
                                    <td style={{ textAlign: 'right', padding: '0.75rem' }}>{formatCurrency(comparison.totals.executed)}</td>
                                    <td style={{
                                        textAlign: 'right', padding: '0.75rem',
                                        color: comparison.totals.variance > 0 ? '#c62828' : '#2e7d32',
                                    }}>{formatCurrency(comparison.totals.variance)}</td>
                                    <td colSpan={2}></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        );
    }

    // ── Main Budget View ──
    return (
        <div>
            <PageHeader title="Presupuesto" icon={<FiDollarSign />} />

            <div style={{
                display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600 }}>Ano:</label>
                    <select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
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
                    style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', minWidth: '250px' }}
                >
                    <option value="">+ Agregar cuenta...</option>
                    {accounts
                        .filter((a: any) => a.accepts_movements && !rows.find(r => r.id_puc_account === a.id))
                        .map((a: any) => (
                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                        ))}
                </select>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1.2rem', border: 'none', borderRadius: '8px',
                        background: 'var(--primary-color, #d4af37)', color: '#fff', cursor: 'pointer',
                        fontWeight: 600, opacity: saving ? 0.6 : 1,
                    }}
                >
                    <FiSave /> {saving ? 'Guardando...' : 'Guardar'}
                </button>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: 'auto' }}>
                    <select
                        value={comparisonMonth}
                        onChange={(e) => setComparisonMonth(parseInt(e.target.value))}
                        style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
                    >
                        {MONTHS.map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>
                    <button
                        onClick={loadComparison}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 1rem', border: '1px solid var(--primary-color, #d4af37)',
                            borderRadius: '8px', background: '#fff', cursor: 'pointer',
                            color: 'var(--primary-color, #d4af37)', fontWeight: 600,
                        }}
                    >
                        <FiBarChart2 /> Ver Comparativo
                    </button>
                </div>
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                <th style={{ textAlign: 'left', padding: '0.6rem', position: 'sticky', left: 0, background: '#f8f9fa', minWidth: '200px' }}>
                                    Cuenta PUC
                                </th>
                                {MONTHS.map(m => (
                                    <th key={m} style={{ textAlign: 'center', padding: '0.6rem', minWidth: '100px' }}>{m}</th>
                                ))}
                                <th style={{ textAlign: 'right', padding: '0.6rem', minWidth: '120px' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, ri) => (
                                <tr key={row.id_puc_account} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{
                                        padding: '0.5rem 0.6rem', position: 'sticky', left: 0,
                                        background: '#fff', fontWeight: 500, whiteSpace: 'nowrap',
                                    }}>
                                        <strong>{row.code}</strong> {row.name}
                                    </td>
                                    {row.months.map((val, mi) => (
                                        <td key={mi} style={{ padding: '0.3rem' }}>
                                            <input
                                                type="number"
                                                value={val || ''}
                                                onChange={(e) => handleCellChange(ri, mi, e.target.value)}
                                                placeholder="0"
                                                style={{
                                                    width: '100%', padding: '0.4rem', border: '1px solid #e0e0e0',
                                                    borderRadius: '4px', textAlign: 'right', fontSize: '0.85rem',
                                                }}
                                            />
                                        </td>
                                    ))}
                                    <td style={{ textAlign: 'right', padding: '0.6rem', fontWeight: 600 }}>
                                        {formatCurrency(row.months.reduce((s, v) => s + v, 0))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {rows.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
                            No hay cuentas con presupuesto. Use el selector para agregar cuentas.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BudgetPage;
