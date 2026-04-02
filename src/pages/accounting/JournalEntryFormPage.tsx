import React, { useState, useEffect } from 'react';
import { FiClipboard, FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

interface JournalLine {
    account_code: string;
    account_name: string;
    debit: number;
    credit: number;
}

const emptyLine = (): JournalLine => ({ account_code: '', account_name: '', debit: 0, credit: 0 });

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '6px', borderRadius: '6px',
    border: '1px solid #2a2a35', fontSize: '13px',
    backgroundColor: '#1a1a24', color: '#f1f1f3',
    outline: 'none',
};

const JournalEntryFormPage = () => {
    const navigate = useNavigate();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [lines, setLines] = useState<JournalLine[]>([emptyLine(), emptyLine()]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [accountSearch, setAccountSearch] = useState<Record<number, string>>({});
    const [showDropdown, setShowDropdown] = useState<number | null>(null);

    useEffect(() => {
        accountingApi.getAccounts().then(data => {
            setAccounts(Array.isArray(data) ? data : data.data || []);
        }).catch(err => logError(err, '/accounting/journal/new'));
    }, []);

    const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
    const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
    const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

    const updateLine = (index: number, field: keyof JournalLine, value: any) => {
        const updated = [...lines];
        updated[index] = { ...updated[index], [field]: value };
        setLines(updated);
    };

    const removeLine = (index: number) => {
        if (lines.length <= 2) return;
        setLines(lines.filter((_, i) => i !== index));
    };

    const selectAccount = (index: number, account: any) => {
        const updated = [...lines];
        updated[index] = { ...updated[index], account_code: account.code, account_name: account.name };
        setLines(updated);
        setShowDropdown(null);
        setAccountSearch({ ...accountSearch, [index]: '' });
    };

    const getFilteredAccounts = (index: number) => {
        const term = (accountSearch[index] || '').toLowerCase();
        if (!term) return accounts.slice(0, 20);
        return accounts.filter(
            a => a.code.toLowerCase().includes(term) || a.name.toLowerCase().includes(term)
        ).slice(0, 20);
    };

    const handleSave = async () => {
        if (!isBalanced) return;
        try {
            setSaving(true);
            await accountingApi.createJournalEntry({
                date,
                description,
                source_type: 'ADJUSTMENT',
                lines: lines.map(l => ({
                    account_code: l.account_code,
                    debit: Number(l.debit) || 0,
                    credit: Number(l.credit) || 0,
                })),
            });
            await Swal.fire({ title: '¡Éxito!', text: 'Asiento contable creado exitosamente.', icon: 'success', confirmButtonColor: '#f0b429' });
            navigate('/accounting/journal');
        } catch (err: any) {
            await Swal.fire({ title: 'Error', text: (err.message || String(err)) || 'Ocurrió un error', icon: 'error', confirmButtonColor: '#f0b429' });
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val || 0);

    return (
        <div className="page-container">
            <PageHeader title="Nuevo Asiento Contable" icon={<FiClipboard />} />

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ minWidth: '180px' }}>
                    <FormField
                        label="Fecha"
                        name="date"
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        required
                    />
                </div>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <FormField
                        label="Descripcion"
                        name="description"
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Descripcion del asiento contable"
                        required
                    />
                </div>
            </div>

            <div style={{
                backgroundColor: '#1a1a24', border: '1px solid #2a2a35',
                borderRadius: 12, overflow: 'hidden',
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                        <thead>
                            <tr>
                                <th style={{ width: '250px', padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b6b7b', borderBottom: '1px solid #2a2a35', backgroundColor: '#1f1f2a' }}>Cuenta PUC</th>
                                <th style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b6b7b', borderBottom: '1px solid #2a2a35', backgroundColor: '#1f1f2a' }}>Nombre Cuenta</th>
                                <th style={{ width: '150px', padding: '0.65rem 1rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b6b7b', borderBottom: '1px solid #2a2a35', backgroundColor: '#1f1f2a' }}>Debito</th>
                                <th style={{ width: '150px', padding: '0.65rem 1rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b6b7b', borderBottom: '1px solid #2a2a35', backgroundColor: '#1f1f2a' }}>Credito</th>
                                <th style={{ width: '50px', padding: '0.65rem 1rem', fontSize: '0.7rem', borderBottom: '1px solid #2a2a35', backgroundColor: '#1f1f2a' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lines.map((line, index) => (
                                <tr key={index}>
                                    <td style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #1f1f2a', position: 'relative' }}>
                                        <input
                                            type="text"
                                            value={line.account_code || accountSearch[index] || ''}
                                            onChange={e => {
                                                setAccountSearch({ ...accountSearch, [index]: e.target.value });
                                                updateLine(index, 'account_code', '');
                                                updateLine(index, 'account_name', '');
                                                setShowDropdown(index);
                                            }}
                                            onFocus={() => setShowDropdown(index)}
                                            placeholder="Buscar cuenta..."
                                            style={inputStyle}
                                        />
                                        {showDropdown === index && (
                                            <div style={{
                                                position: 'absolute', top: '100%', left: '1rem', right: '1rem',
                                                background: '#1f1f2a', border: '1px solid #2a2a35', borderRadius: '6px',
                                                maxHeight: '200px', overflow: 'auto', zIndex: 100,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                                            }}>
                                                {getFilteredAccounts(index).map(a => (
                                                    <div
                                                        key={a.code}
                                                        onClick={() => selectAccount(index, a)}
                                                        style={{
                                                            padding: '6px 10px', cursor: 'pointer', fontSize: '12px',
                                                            borderBottom: '1px solid #2a2a35', color: '#f1f1f3',
                                                        }}
                                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(240, 180, 41, 0.1)')}
                                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                                    >
                                                        <strong style={{ color: '#f0b429' }}>{a.code}</strong> - {a.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ color: '#a0a0b0', fontSize: '13px', padding: '0.5rem 1rem', borderBottom: '1px solid #1f1f2a' }}>{line.account_name || '-'}</td>
                                    <td style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #1f1f2a' }}>
                                        <input
                                            type="number"
                                            value={line.debit || ''}
                                            onChange={e => updateLine(index, 'debit', e.target.value)}
                                            placeholder="0"
                                            min="0"
                                            style={{ ...inputStyle, textAlign: 'right' }}
                                        />
                                    </td>
                                    <td style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #1f1f2a' }}>
                                        <input
                                            type="number"
                                            value={line.credit || ''}
                                            onChange={e => updateLine(index, 'credit', e.target.value)}
                                            placeholder="0"
                                            min="0"
                                            style={{ ...inputStyle, textAlign: 'right' }}
                                        />
                                    </td>
                                    <td style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #1f1f2a' }}>
                                        <button
                                            onClick={() => removeLine(index)}
                                            disabled={lines.length <= 2}
                                            style={{
                                                background: 'none', border: 'none',
                                                cursor: lines.length <= 2 ? 'default' : 'pointer',
                                                color: lines.length <= 2 ? '#3a3a48' : '#f87171', fontSize: '16px',
                                            }}
                                            title="Eliminar linea"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {/* Totals row */}
                            <tr style={{ fontWeight: 700, borderTop: '2px solid #f0b429', background: '#1f1f2a' }}>
                                <td colSpan={2} style={{ textAlign: 'right', paddingRight: '16px', padding: '0.65rem 1rem', color: '#f1f1f3' }}>TOTALES</td>
                                <td style={{ textAlign: 'right', padding: '0.65rem 1rem', color: totalDebit === totalCredit ? '#34d399' : '#f87171' }}>
                                    {formatCurrency(totalDebit)}
                                </td>
                                <td style={{ textAlign: 'right', padding: '0.65rem 1rem', color: totalDebit === totalCredit ? '#34d399' : '#f87171' }}>
                                    {formatCurrency(totalCredit)}
                                </td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {!isBalanced && totalDebit > 0 && (
                    <p style={{ color: '#f87171', fontSize: '13px', margin: '8px 16px 12px', fontWeight: 600 }}>
                        Diferencia: {formatCurrency(Math.abs(totalDebit - totalCredit))} - El asiento debe estar balanceado.
                    </p>
                )}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                <Button variant="secondary" icon={<FiPlus />} onClick={() => setLines([...lines, emptyLine()])}>
                    Agregar Linea
                </Button>
                <Button
                    variant="primary"
                    icon={<FiSave />}
                    onClick={handleSave}
                    disabled={saving || !isBalanced || !description || !date}
                    loading={saving}
                >
                    {saving ? 'Guardando...' : 'Guardar Asiento'}
                </Button>
                <div style={{ marginLeft: 'auto' }}>
                    <Button variant="ghost" onClick={() => navigate('/accounting/journal')}>
                        Cancelar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default JournalEntryFormPage;
