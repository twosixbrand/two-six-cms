import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiRefreshCcw, FiPlus, FiEdit2, FiTrash2, FiCheck, FiEye, FiDownload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const paymentStatusColors: Record<string, { className: string; bg: string }> = {
    PENDING: { className: 'status-pending', bg: '#fff8e1' },
    PAID: { className: 'status-active', bg: '#e8f5e9' },
    PARTIAL: { className: 'status-active', bg: '#e3f2fd' },
};

const ExpensePage = () => {
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('ALL');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [expData, catData] = await Promise.all([
                accountingApi.getExpenses({ category, status, startDate, endDate }),
                accountingApi.getExpenseCategories(),
            ]);
            setExpenses(Array.isArray(expData) ? expData : expData.data || []);
            setCategories(Array.isArray(catData) ? catData : []);
        } catch (err) {
            logError(err, '/accounting/expenses');
            setError('Error al cargar gastos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleMarkPaid = async (id: number) => {
        if (!window.confirm('¿Marcar este gasto como pagado?')) return;
        try {
            await accountingApi.markExpensePaid(id);
            fetchData();
        } catch (err: any) {
            alert('Error: ' + (err.message || err));
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Eliminar este gasto?')) return;
        try {
            await accountingApi.deleteExpense(id);
            fetchData();
        } catch (err: any) {
            alert('Error al eliminar: ' + (err.message || err));
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val || 0);

    return (
        <div className="page-container">
            <PageHeader title="Gastos / Compras" icon={<FiDollarSign />} />

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
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Categoría</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}>
                        <option value="">Todas</option>
                        {categories.map((c: any) => (
                            <option key={c.id || c.name} value={c.name || c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Estado</label>
                    <select value={status} onChange={e => setStatus(e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}>
                        <option value="ALL">Todos</option>
                        <option value="PENDING">Pendiente</option>
                        <option value="PAID">Pagado</option>
                        <option value="PARTIAL">Parcial</option>
                    </select>
                </div>
                <button onClick={fetchData} className="btn btn-primary">
                    <FiRefreshCcw /> Buscar
                </button>
                <button onClick={() => navigate('/accounting/expenses/new')} className="btn btn-secondary">
                    <FiPlus /> Registrar Gasto
                </button>
                {startDate && endDate && (
                    <button onClick={() => accountingApi.exportToExcel('expenses', { startDate, endDate })} className="btn btn-secondary">
                        <FiDownload /> Exportar Excel
                    </button>
                )}
            </div>

            {error && <p className="error-message">{error}</p>}

            {loading ? (
                <p>Cargando gastos...</p>
            ) : (
                <div className="list-card full-width">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th># Gasto</th>
                                <th>Fecha</th>
                                <th>Categoría</th>
                                <th>Proveedor</th>
                                <th>Descripción</th>
                                <th>Total</th>
                                <th>Estado Pago</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center' }}>No hay gastos registrados</td></tr>
                            ) : expenses.map((exp: any) => {
                                const statusStyle = paymentStatusColors[exp.payment_status] || paymentStatusColors.PENDING;
                                return (
                                    <tr key={exp.id}>
                                        <td><strong>{exp.expense_number}</strong></td>
                                        <td>{new Date(exp.expense_date || exp.date).toLocaleDateString('es-CO')}</td>
                                        <td>{exp.category}</td>
                                        <td>{exp.provider || '-'}</td>
                                        <td>{exp.description}</td>
                                        <td style={{ textAlign: 'right' }}>{formatCurrency(exp.total)}</td>
                                        <td>
                                            <span className={`status-badge ${statusStyle.className}`} style={{ background: statusStyle.bg }}>
                                                {exp.payment_status}
                                            </span>
                                        </td>
                                        <td style={{ whiteSpace: 'nowrap' }}>
                                            <button
                                                className="btn btn-sm"
                                                onClick={() => navigate(`/accounting/expenses/${exp.id}`)}
                                                style={{ marginRight: '4px', padding: '4px 8px', fontSize: '12px' }}
                                                title="Editar"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            {exp.payment_status !== 'PAID' && (
                                                <button
                                                    className="btn btn-sm"
                                                    onClick={() => handleMarkPaid(exp.id)}
                                                    style={{ marginRight: '4px', padding: '4px 8px', fontSize: '12px', color: '#2e7d32' }}
                                                    title="Marcar como pagado"
                                                >
                                                    <FiCheck />
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-sm"
                                                onClick={() => handleDelete(exp.id)}
                                                style={{ padding: '4px 8px', fontSize: '12px', color: '#e53935' }}
                                                title="Eliminar"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ExpensePage;
