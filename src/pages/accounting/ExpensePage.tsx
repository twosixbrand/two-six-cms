import React, { useState, useEffect } from 'react';
import { FiCreditCard, FiRefreshCcw, FiPlus, FiEdit2, FiTrash2, FiCheck, FiDownload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import PageHeader from '../../components/common/PageHeader';
import { DataTable, Button, StatusBadge, LoadingSpinner } from '../../components/ui';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

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
        const result = await Swal.fire({
            title: 'Marcar como pagado',
            text: '¿Marcar este gasto como pagado?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f0b429',
            cancelButtonColor: '#2a2a35',
            confirmButtonText: 'Sí, pagado',
            cancelButtonText: 'Cancelar',
        });
        if (!result.isConfirmed) return;
        try {
            await accountingApi.markExpensePaid(id);
            fetchData();
        } catch (err: any) {
            await Swal.fire({ title: 'Error', text: (err.message || String(err)) || 'Ocurrió un error', icon: 'error', confirmButtonColor: '#f0b429' });
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Eliminar gasto',
            text: '¿Eliminar este gasto?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f0b429',
            cancelButtonColor: '#2a2a35',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
        });
        if (!result.isConfirmed) return;
        try {
            await accountingApi.deleteExpense(id);
            fetchData();
        } catch (err: any) {
            await Swal.fire({ title: 'Error', text: (err.message || String(err)) || 'Error al eliminar', icon: 'error', confirmButtonColor: '#f0b429' });
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val || 0);

    const getStatusVariant = (paymentStatus: string) => {
        switch (paymentStatus) {
            case 'PAID': return 'success';
            case 'PENDING': return 'warning';
            case 'PARTIAL': return 'info';
            default: return 'neutral';
        }
    };

    const columns = [
        {
            key: 'expense_number',
            header: '# Gasto',
            render: (val: any) => <strong>{val}</strong>,
        },
        {
            key: 'expense_date',
            header: 'Fecha',
            render: (_val: any, row: any) => new Date(row.expense_date || row.date).toLocaleDateString('es-CO'),
        },
        { key: 'category', header: 'Categoría' },
        {
            key: 'provider',
            header: 'Proveedor',
            render: (val: any) => val || '-',
        },
        { key: 'description', header: 'Descripción' },
        {
            key: 'total',
            header: 'Total',
            align: 'right' as const,
            render: (val: any) => formatCurrency(val),
        },
        {
            key: 'payment_status',
            header: 'Estado Pago',
            render: (val: any) => <StatusBadge status={val} variant={getStatusVariant(val)} size="sm" />,
        },
    ];

    return (
        <div className="page-container">
            <PageHeader title="Gastos / Compras" icon={<FiCreditCard />} />

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Desde</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #2a2a35' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Hasta</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #2a2a35' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Categoría</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #2a2a35', backgroundColor: '#1a1a24', color: '#f1f1f3', height: 40, fontSize: '0.875rem' }}>
                        <option value="">Todas</option>
                        {categories.map((c: any) => (
                            <option key={c.id || c.name} value={c.name || c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Estado</label>
                    <select value={status} onChange={e => setStatus(e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #2a2a35', backgroundColor: '#1a1a24', color: '#f1f1f3', height: 40, fontSize: '0.875rem' }}>
                        <option value="ALL">Todos</option>
                        <option value="PENDING">Pendiente</option>
                        <option value="PAID">Pagado</option>
                        <option value="PARTIAL">Parcial</option>
                    </select>
                </div>
                <Button variant="primary" icon={<FiRefreshCcw />} onClick={fetchData}>
                    Buscar
                </Button>
                <Button variant="secondary" icon={<FiPlus />} onClick={() => navigate('/accounting/expenses/new')}>
                    Registrar Gasto
                </Button>
                {startDate && endDate && (
                    <Button variant="secondary" icon={<FiDownload />} onClick={() => accountingApi.exportToExcel('expenses', { startDate, endDate })}>
                        Exportar Excel
                    </Button>
                )}
            </div>

            {error && <p className="error-message">{error}</p>}

            <DataTable
                columns={columns}
                data={expenses}
                loading={loading}
                emptyMessage="No hay gastos registrados"
                actions={(exp: any) => (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={<FiEdit2 />}
                            onClick={() => navigate(`/accounting/expenses/${exp.id}`)}
                        >
                            {''}
                        </Button>
                        {exp.payment_status !== 'PAID' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={<FiCheck />}
                                onClick={() => handleMarkPaid(exp.id)}
                            >
                                {''}
                            </Button>
                        )}
                        <Button
                            variant="destructive"
                            size="sm"
                            icon={<FiTrash2 />}
                            onClick={() => handleDelete(exp.id)}
                        >
                            {''}
                        </Button>
                    </>
                )}
            />
        </div>
    );
};

export default ExpensePage;
