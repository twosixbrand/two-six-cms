import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiSave } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
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
            // Load existing expense for editing
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
            alert(isEdit ? 'Gasto actualizado.' : 'Gasto registrado exitosamente.');
            navigate('/accounting/expenses');
        } catch (err: any) {
            alert('Error: ' + (err.message || err));
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val || 0);

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px',
    };
    const labelStyle: React.CSSProperties = {
        display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px',
    };

    return (
        <div className="page-container">
            <PageHeader title={isEdit ? 'Editar Gasto' : 'Registrar Gasto'} icon={<FiDollarSign />} />

            <div className="list-card full-width" style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {/* Category */}
                    <div>
                        <label style={labelStyle}>Categoría</label>
                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                            <option value="">Seleccionar categoría...</option>
                            {categories.map((c: any) => (
                                <option key={c.id || c.name} value={c.name || c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* PUC Account */}
                    <div style={{ position: 'relative' }}>
                        <label style={labelStyle}>Cuenta PUC</label>
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
                            style={inputStyle}
                        />
                        {showAccountDropdown && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff',
                                border: '1px solid #ddd', borderRadius: '4px', maxHeight: '200px', overflow: 'auto',
                                zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}>
                                {filteredAccounts.map(a => (
                                    <div key={a.code} onClick={() => selectAccount(a)}
                                        style={{ padding: '6px 10px', cursor: 'pointer', fontSize: '12px', borderBottom: '1px solid #f5f5f5' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = '#f0f4ff')}
                                        onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                                        <strong>{a.code}</strong> - {a.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Provider */}
                    <div>
                        <label style={labelStyle}>Proveedor (opcional)</label>
                        <input type="text" value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })}
                            placeholder="Nombre del proveedor" style={inputStyle} />
                    </div>

                    {/* Invoice Number */}
                    <div>
                        <label style={labelStyle}>No. Factura</label>
                        <input type="text" value={form.invoice_number} onChange={e => setForm({ ...form, invoice_number: e.target.value })}
                            placeholder="Número de factura" style={inputStyle} />
                    </div>

                    {/* Description */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={labelStyle}>Descripción</label>
                        <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Descripción del gasto" style={inputStyle} />
                    </div>

                    {/* Amounts */}
                    <div>
                        <label style={labelStyle}>Subtotal</label>
                        <input type="number" value={form.subtotal || ''} onChange={e => setForm({ ...form, subtotal: Number(e.target.value) })}
                            min="0" placeholder="0" style={{ ...inputStyle, textAlign: 'right' }} />
                    </div>
                    <div>
                        <label style={labelStyle}>IVA (Impuesto)</label>
                        <input type="number" value={form.tax_amount || ''} onChange={e => setForm({ ...form, tax_amount: Number(e.target.value) })}
                            min="0" placeholder="0" style={{ ...inputStyle, textAlign: 'right' }} />
                    </div>
                    <div>
                        <label style={labelStyle}>Retención</label>
                        <input type="number" value={form.retention_amount || ''} onChange={e => setForm({ ...form, retention_amount: Number(e.target.value) })}
                            min="0" placeholder="0" style={{ ...inputStyle, textAlign: 'right' }} />
                    </div>
                    <div>
                        <label style={labelStyle}>Total</label>
                        <div style={{
                            ...inputStyle, background: '#f5f5f5', fontWeight: 700, fontSize: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                        }}>
                            {formatCurrency(form.total)}
                        </div>
                        <span style={{ fontSize: '11px', color: '#888' }}>Subtotal + IVA - Retención</span>
                    </div>

                    {/* Dates */}
                    <div>
                        <label style={labelStyle}>Fecha del Gasto</label>
                        <input type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })}
                            style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Fecha de Vencimiento</label>
                        <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}
                            style={inputStyle} />
                    </div>

                    {/* Notes */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={labelStyle}>Notas</label>
                        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                            rows={3} placeholder="Notas adicionales..." style={{ ...inputStyle, resize: 'vertical' }} />
                    </div>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" onClick={handleSave}
                        disabled={saving || !form.description || !form.subtotal}>
                        <FiSave /> {saving ? 'Guardando...' : isEdit ? 'Actualizar Gasto' : 'Registrar Gasto'}
                    </button>
                    <button className="btn" onClick={() => navigate('/accounting/expenses')}>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExpenseFormPage;
