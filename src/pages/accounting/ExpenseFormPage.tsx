import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiSave } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const ExpenseFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [categories, setCategories] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [accountSearch, setAccountSearch] = useState('');
    const [showAccountDropdown, setShowAccountDropdown] = useState(false);

    const [form, setForm] = useState({
        category: '',
        account_code: '',
        account_name: '',
        provider: '',
        invoice_number: '',
        description: '',
        subtotal: 0,
        tax_amount: 0,
        retention_amount: 0,
        total: 0,
        expense_date: new Date().toISOString().split('T')[0],
        due_date: '',
        notes: '',
    });

    useEffect(() => {
        Promise.all([
            accountingApi.getExpenseCategories(),
            accountingApi.getAccounts(),
        ]).then(([catData, accData]) => {
            setCategories(Array.isArray(catData) ? catData : []);
            setAccounts(Array.isArray(accData) ? accData : accData.data || []);
        }).catch(err => logError(err, '/accounting/expenses/form'));

        if (isEdit) {
            accountingApi.getExpenses().then(data => {
                const list = Array.isArray(data) ? data : data.data || [];
                const exp = list.find((e: any) => String(e.id) === String(id));
                if (exp) {
                    setForm({
                        category: exp.category || '',
                        account_code: exp.account_code || '',
                        account_name: exp.account_name || '',
                        provider: exp.provider || '',
                        invoice_number: exp.invoice_number || '',
                        description: exp.description || '',
                        subtotal: exp.subtotal || 0,
                        tax_amount: exp.tax_amount || 0,
                        retention_amount: exp.retention_amount || 0,
                        total: exp.total || 0,
                        expense_date: exp.expense_date?.split('T')[0] || exp.date?.split('T')[0] || '',
                        due_date: exp.due_date?.split('T')[0] || '',
                        notes: exp.notes || '',
                    });
                }
            }).catch(err => logError(err, '/accounting/expenses/form'));
        }
    }, [id]);

    // Auto-calculate total
    useEffect(() => {
        const subtotal = Number(form.subtotal) || 0;
        const tax = Number(form.tax_amount) || 0;
        const retention = Number(form.retention_amount) || 0;
        setForm(prev => ({ ...prev, total: subtotal + tax - retention }));
    }, [form.subtotal, form.tax_amount, form.retention_amount]);

    const filteredAccounts = accounts.filter(a => {
        const term = accountSearch.toLowerCase();
        if (!term) return true;
        return a.code.toLowerCase().includes(term) || a.name.toLowerCase().includes(term);
    }).slice(0, 20);

    const selectAccount = (account: any) => {
        setForm({ ...form, account_code: account.code, account_name: account.name });
        setShowAccountDropdown(false);
        setAccountSearch('');
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            if (isEdit) {
                await accountingApi.updateExpense(Number(id), form);
            } else {
                await accountingApi.createExpense(form);
            }
            await Swal.fire({ title: '¡Éxito!', text: isEdit ? 'Gasto actualizado.' : 'Gasto registrado exitosamente.', icon: 'success', confirmButtonColor: '#f0b429' });
            navigate('/accounting/expenses');
        } catch (err: any) {
            await Swal.fire({ title: 'Error', text: (err.message || String(err)) || 'Ocurrió un error', icon: 'error', confirmButtonColor: '#f0b429' });
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val || 0);

    const darkInputStyle: React.CSSProperties = {
        width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8,
        border: '1px solid #2a2a35', fontSize: '0.875rem',
        backgroundColor: '#1a1a24', color: '#f1f1f3',
        outline: 'none', height: '40px', boxSizing: 'border-box',
        fontFamily: 'Inter, sans-serif',
    };

    return (
        <div className="page-container">
            <PageHeader title={isEdit ? 'Editar Gasto' : 'Registrar Gasto'} icon={<FiDollarSign />} />

            <div style={{
                backgroundColor: '#1a1a24', border: '1px solid #2a2a35',
                borderRadius: 12, padding: '24px',
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {/* Category */}
                    <FormField
                        label="Categoria"
                        name="category"
                        type="select"
                        value={form.category}
                        onChange={e => setForm({ ...form, category: e.target.value })}
                        placeholder="Seleccionar categoria..."
                        options={categories.map((c: any) => ({ value: c.name || c.id, label: c.name }))}
                    />

                    {/* PUC Account */}
                    <div style={{ position: 'relative' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#a0a0b0', marginBottom: '0.3rem', display: 'block', fontFamily: 'Inter, sans-serif' }}>
                            Cuenta PUC
                        </label>
                        <input
                            type="text"
                            value={form.account_code ? `${form.account_code} - ${form.account_name}` : accountSearch}
                            onChange={e => {
                                setAccountSearch(e.target.value);
                                setForm({ ...form, account_code: '', account_name: '' });
                                setShowAccountDropdown(true);
                            }}
                            onFocus={() => setShowAccountDropdown(true)}
                            placeholder="Buscar cuenta PUC..."
                            style={darkInputStyle}
                        />
                        {showAccountDropdown && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0,
                                background: '#1f1f2a', border: '1px solid #2a2a35', borderRadius: '6px',
                                maxHeight: '200px', overflow: 'auto', zIndex: 100,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                            }}>
                                {filteredAccounts.map(a => (
                                    <div key={a.code} onClick={() => selectAccount(a)}
                                        style={{
                                            padding: '6px 10px', cursor: 'pointer', fontSize: '12px',
                                            borderBottom: '1px solid #2a2a35', color: '#f1f1f3',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(240, 180, 41, 0.1)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                        <strong style={{ color: '#f0b429' }}>{a.code}</strong> - {a.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Provider */}
                    <FormField
                        label="Proveedor (opcional)"
                        name="provider"
                        type="text"
                        value={form.provider}
                        onChange={e => setForm({ ...form, provider: e.target.value })}
                        placeholder="Nombre del proveedor"
                    />

                    {/* Invoice Number */}
                    <FormField
                        label="No. Factura"
                        name="invoice_number"
                        type="text"
                        value={form.invoice_number}
                        onChange={e => setForm({ ...form, invoice_number: e.target.value })}
                        placeholder="Numero de factura"
                    />

                    {/* Description */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <FormField
                            label="Descripcion"
                            name="description"
                            type="text"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Descripcion del gasto"
                            required
                        />
                    </div>

                    {/* Amounts */}
                    <FormField
                        label="Subtotal"
                        name="subtotal"
                        type="number"
                        value={form.subtotal || ''}
                        onChange={e => setForm({ ...form, subtotal: Number(e.target.value) })}
                        placeholder="0"
                        required
                    />
                    <FormField
                        label="IVA (Impuesto)"
                        name="tax_amount"
                        type="number"
                        value={form.tax_amount || ''}
                        onChange={e => setForm({ ...form, tax_amount: Number(e.target.value) })}
                        placeholder="0"
                    />
                    <FormField
                        label="Retencion"
                        name="retention_amount"
                        type="number"
                        value={form.retention_amount || ''}
                        onChange={e => setForm({ ...form, retention_amount: Number(e.target.value) })}
                        placeholder="0"
                    />
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#a0a0b0', marginBottom: '0.3rem', display: 'block', fontFamily: 'Inter, sans-serif' }}>
                            Total
                        </label>
                        <div style={{
                            ...darkInputStyle, background: '#12121a', fontWeight: 700, fontSize: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                        }}>
                            {formatCurrency(form.total)}
                        </div>
                        <span style={{ fontSize: '11px', color: '#6b6b7b' }}>Subtotal + IVA - Retencion</span>
                    </div>

                    {/* Dates */}
                    <FormField
                        label="Fecha del Gasto"
                        name="expense_date"
                        type="date"
                        value={form.expense_date}
                        onChange={e => setForm({ ...form, expense_date: e.target.value })}
                    />
                    <FormField
                        label="Fecha de Vencimiento"
                        name="due_date"
                        type="date"
                        value={form.due_date}
                        onChange={e => setForm({ ...form, due_date: e.target.value })}
                    />

                    {/* Notes */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <FormField
                            label="Notas"
                            name="notes"
                            type="textarea"
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            placeholder="Notas adicionales..."
                            rows={3}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                    <Button
                        variant="primary"
                        icon={<FiSave />}
                        onClick={handleSave}
                        disabled={saving || !form.description || !form.subtotal}
                        loading={saving}
                    >
                        {saving ? 'Guardando...' : isEdit ? 'Actualizar Gasto' : 'Registrar Gasto'}
                    </Button>
                    <Button variant="ghost" onClick={() => navigate('/accounting/expenses')}>
                        Cancelar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ExpenseFormPage;
