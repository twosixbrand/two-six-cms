import React, { useState, useEffect } from 'react';
import { FiList, FiRefreshCcw, FiDownload } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';
import { formatDate } from '../../utils/dateFormat';


const darkInputStyle: React.CSSProperties = {
    width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8,
    border: '1px solid #2a2a35', fontSize: '0.875rem',
    backgroundColor: '#1a1a24', color: '#f1f1f3',
    outline: 'none', height: '40px', boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif',
};

const thStyle: React.CSSProperties = {
    padding: '0.65rem 1rem', fontSize: '0.7rem', fontWeight: 500,
    textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b6b7b',
    borderBottom: '1px solid #2a2a35', backgroundColor: '#1f1f2a',
    whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif',
};

const tdStyle: React.CSSProperties = {
    padding: '0.65rem 1rem', fontSize: '0.8125rem', color: '#f1f1f3',
    borderBottom: '1px solid #1f1f2a', fontFamily: 'Inter, sans-serif',
};

const GeneralLedgerPage = () => {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [accountSearch, setAccountSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        accountingApi.getAccounts().then(res => {
            setAccounts(Array.isArray(res) ? res : res.data || []);
        }).catch(err => logError(err, '/accounting/general-ledger'));
    }, []);

    const fetchReport = async () => {
        if (!selectedAccount) {
            setError('Seleccione una cuenta.');
            return;
        }
        try {
            setLoading(true);
            setError('');
            const result = await accountingApi.getGeneralLedger({
                account: selectedAccount,
                startDate,
                endDate,
            });
            setData(result);
        } catch (err) {
            logError(err, '/accounting/general-ledger');
            setError('Error al generar el Libro Mayor.');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val || 0);

    const filteredAccounts = accounts.filter(a => {
        const term = accountSearch.toLowerCase();
        if (!term) return true;
        return a.code.toLowerCase().includes(term) || a.name.toLowerCase().includes(term);
    }).slice(0, 20);

    const entries = data?.entries || data?.movements || data || [];
    const totals = data?.totals || null;

    return (
        <div className="page-container" style={{ minHeight: '70vh' }}>
            <PageHeader title="Libro Mayor" icon={<FiList />} />

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end', position: 'relative', zIndex: 50 }}>
                <div style={{ position: 'relative', minWidth: '280px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.3rem', color: '#a0a0b0', fontFamily: 'Inter, sans-serif' }}>Cuenta PUC</label>
                    <input
                        type="text"
                        value={selectedAccount || accountSearch}
                        onChange={e => {
                            setAccountSearch(e.target.value);
                            setSelectedAccount('');
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="Buscar cuenta..."
                        style={darkInputStyle}
                    />
                    {showDropdown && (
                        <div style={{
                            position: 'absolute', top: '100%', left: 0, right: 0,
                            background: '#1f1f2a', border: '1px solid #2a2a35', borderRadius: '6px',
                            maxHeight: '200px', overflow: 'auto', zIndex: 9999,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        }}>
                            {filteredAccounts.map(a => (
                                <div key={a.code}
                                    onClick={() => {
                                        setSelectedAccount(a.code);
                                        setShowDropdown(false);
                                        setAccountSearch('');
                                    }}
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
                <div style={{ minWidth: '160px' }}>
                    <FormField label="Desde" name="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div style={{ minWidth: '160px' }}>
                    <FormField label="Hasta" name="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <Button variant="primary" icon={<FiRefreshCcw />} onClick={fetchReport}>Consultar</Button>
                {selectedAccount && (
                    <Button variant="secondary" icon={<FiDownload />} onClick={() => accountingApi.exportToExcel('general-ledger', { account: selectedAccount, startDate, endDate })}>Exportar Excel</Button>
                )}
            </div>

            {error && <p style={{ color: '#f87171', fontSize: '13px', fontWeight: 600 }}>{error}</p>}

            {loading ? (
                <LoadingSpinner size="md" text="Generando libro mayor..." />
            ) : data ? (
                <div style={{
                    backgroundColor: '#1a1a24', border: '1px solid #2a2a35',
                    borderRadius: 12, overflow: 'hidden',
                }}>
                    {data.account_name && (
                        <div style={{ padding: '12px 16px', background: '#1f1f2a', borderBottom: '1px solid #2a2a35', color: '#f1f1f3' }}>
                            <strong style={{ color: '#f0b429' }}>{data.account_code}</strong> - {data.account_name}
                        </div>
                    )}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                            <thead>
                                <tr>
                                    <th style={{ ...thStyle, textAlign: 'left' }}>Fecha</th>
                                    <th style={{ ...thStyle, textAlign: 'left' }}># Asiento</th>
                                    <th style={{ ...thStyle, textAlign: 'left' }}>Descripcion</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>Debito</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>Credito</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>Saldo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(Array.isArray(entries) ? entries : []).length === 0 ? (
                                    <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: '#6b6b7b' }}>No hay movimientos para este periodo</td></tr>
                                ) : (Array.isArray(entries) ? entries : []).map((entry: any, i: number) => (
                                    <tr key={i}>
                                        <td style={tdStyle}>{formatDate(entry.entry_date)}</td>
                                        <td style={tdStyle}>{entry.entry_number}</td>
                                        <td style={tdStyle}>{entry.description}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>{entry.debit ? formatCurrency(entry.debit) : '-'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>{entry.credit ? formatCurrency(entry.credit) : '-'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(entry.running_balance ?? entry.balance)}</td>
                                    </tr>
                                ))}
                                {totals && (
                                    <tr style={{ fontWeight: 700, borderTop: '2px solid #f0b429', background: '#1f1f2a' }}>
                                        <td colSpan={3} style={{ ...tdStyle, textAlign: 'right' }}>TOTALES</td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(totals.total_debit)}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(totals.total_credit)}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(totals.final_balance)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default GeneralLedgerPage;
