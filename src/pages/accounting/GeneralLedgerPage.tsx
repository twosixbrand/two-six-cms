import React, { useState, useEffect } from 'react';
import { FiBookOpen, FiRefreshCcw, FiDownload } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

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
            <PageHeader title="Libro Mayor" icon={<FiBookOpen />} />

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end', position: 'relative', zIndex: 50 }}>
                <div style={{ position: 'relative', minWidth: '280px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Cuenta PUC</label>
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
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                    />
                    {showDropdown && (
                        <div style={{
                            position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff',
                            border: '1px solid #ddd', borderRadius: '4px', maxHeight: '200px', overflow: 'auto',
                            zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }}>
                            {filteredAccounts.map(a => (
                                <div key={a.code}
                                    onClick={() => {
                                        setSelectedAccount(a.code);
                                        setShowDropdown(false);
                                        setAccountSearch('');
                                    }}
                                    style={{ padding: '6px 10px', cursor: 'pointer', fontSize: '12px', borderBottom: '1px solid #f5f5f5' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#f0f4ff')}
                                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                                    <strong>{a.code}</strong> - {a.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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
                <button onClick={fetchReport} className="btn btn-primary">
                    <FiRefreshCcw /> Consultar
                </button>
                {selectedAccount && (
                    <button onClick={() => accountingApi.exportToExcel('general-ledger', { account: selectedAccount, startDate, endDate })} className="btn btn-secondary">
                        <FiDownload /> Exportar Excel
                    </button>
                )}
            </div>

            {error && <p className="error-message">{error}</p>}

            {loading ? (
                <p>Generando libro mayor...</p>
            ) : data ? (
                <div className="list-card full-width">
                    {data.account_name && (
                        <div style={{ padding: '12px 16px', background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
                            <strong>{data.account_code}</strong> - {data.account_name}
                        </div>
                    )}
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th># Asiento</th>
                                <th>Descripción</th>
                                <th style={{ textAlign: 'right' }}>Débito</th>
                                <th style={{ textAlign: 'right' }}>Crédito</th>
                                <th style={{ textAlign: 'right' }}>Saldo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(Array.isArray(entries) ? entries : []).length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center' }}>No hay movimientos para este periodo</td></tr>
                            ) : (Array.isArray(entries) ? entries : []).map((entry: any, i: number) => (
                                <tr key={i}>
                                    <td>{new Date(entry.date).toLocaleDateString('es-CO')}</td>
                                    <td>{entry.entry_number}</td>
                                    <td>{entry.description}</td>
                                    <td style={{ textAlign: 'right' }}>{entry.debit ? formatCurrency(entry.debit) : '-'}</td>
                                    <td style={{ textAlign: 'right' }}>{entry.credit ? formatCurrency(entry.credit) : '-'}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(entry.running_balance ?? entry.balance)}</td>
                                </tr>
                            ))}
                            {/* Totals row */}
                            {totals && (
                                <tr style={{ fontWeight: 700, borderTop: '2px solid #333', background: '#f8f9fa' }}>
                                    <td colSpan={3} style={{ textAlign: 'right' }}>TOTALES</td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(totals.total_debit)}</td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(totals.total_credit)}</td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(totals.final_balance)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </div>
    );
};

export default GeneralLedgerPage;
