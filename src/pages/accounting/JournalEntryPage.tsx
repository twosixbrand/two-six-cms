import React, { useState, useEffect } from 'react';
import { FiFileText, FiRefreshCcw, FiPlus, FiChevronDown, FiChevronRight, FiDownload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const statusColors: Record<string, string> = {
    POSTED: 'status-active',
    DRAFT: 'status-pending',
    VOIDED: 'status-inactive',
};

const statusBgColors: Record<string, string> = {
    POSTED: '#e8f5e9',
    DRAFT: '#fff8e1',
    VOIDED: '#ffebee',
};

const JournalEntryPage = () => {
    const navigate = useNavigate();
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sourceType, setSourceType] = useState('ALL');
    const [expandedEntry, setExpandedEntry] = useState<number | null>(null);

    const fetchEntries = async () => {
        try {
            setLoading(true);
            const data = await accountingApi.getJournalEntries({ startDate, endDate, sourceType });
            setEntries(Array.isArray(data) ? data : data.data || []);
        } catch (err) {
            logError(err, '/accounting/journal');
            setError('Error al cargar asientos contables.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    const toggleExpand = (id: number) => {
        setExpandedEntry(prev => (prev === id ? null : id));
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val || 0);

    return (
        <div className="page-container">
            <PageHeader title="Asientos Contables" icon={<FiFileText />} />

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
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Origen</label>
                    <select value={sourceType} onChange={e => setSourceType(e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}>
                        <option value="ALL">Todos</option>
                        <option value="SALE">Venta</option>
                        <option value="EXPENSE">Gasto</option>
                        <option value="ADJUSTMENT">Ajuste</option>
                    </select>
                </div>
                <button onClick={fetchEntries} className="btn btn-primary">
                    <FiRefreshCcw /> Buscar
                </button>
                <button onClick={() => navigate('/accounting/journal/new')} className="btn btn-secondary">
                    <FiPlus /> Nuevo Asiento
                </button>
                {startDate && endDate && (
                    <button onClick={() => accountingApi.exportToExcel('journal-entries', { startDate, endDate })} className="btn btn-secondary">
                        <FiDownload /> Exportar Excel
                    </button>
                )}
            </div>

            {error && <p className="error-message">{error}</p>}

            {loading ? (
                <p>Cargando asientos contables...</p>
            ) : (
                <div className="list-card full-width">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th># Asiento</th>
                                <th>Fecha</th>
                                <th>Descripción</th>
                                <th>Origen</th>
                                <th>Total Débito</th>
                                <th>Total Crédito</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center' }}>No hay asientos contables</td></tr>
                            ) : entries.map((entry: any) => (
                                <React.Fragment key={entry.id}>
                                    <tr
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => toggleExpand(entry.id)}
                                    >
                                        <td style={{ width: '30px' }}>
                                            {expandedEntry === entry.id ? <FiChevronDown /> : <FiChevronRight />}
                                        </td>
                                        <td><strong>{entry.entry_number}</strong></td>
                                        <td>{new Date(entry.date).toLocaleDateString('es-CO')}</td>
                                        <td>{entry.description}</td>
                                        <td>
                                            <span style={{
                                                fontSize: '11px', padding: '2px 8px',
                                                borderRadius: '10px', background: '#e3f2fd', fontWeight: 600,
                                            }}>
                                                {entry.source_type}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>{formatCurrency(entry.total_debit)}</td>
                                        <td style={{ textAlign: 'right' }}>{formatCurrency(entry.total_credit)}</td>
                                        <td>
                                            <span
                                                className={`status-badge ${statusColors[entry.status] || ''}`}
                                                style={{ background: statusBgColors[entry.status] || '#eee' }}
                                            >
                                                {entry.status}
                                            </span>
                                        </td>
                                    </tr>
                                    {expandedEntry === entry.id && entry.lines && (
                                        <tr>
                                            <td colSpan={8} style={{ padding: '0 16px 12px 48px', background: '#fafafa' }}>
                                                <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                            <th style={{ textAlign: 'left', padding: '6px 8px' }}>Cuenta</th>
                                                            <th style={{ textAlign: 'left', padding: '6px 8px' }}>Nombre</th>
                                                            <th style={{ textAlign: 'right', padding: '6px 8px' }}>Débito</th>
                                                            <th style={{ textAlign: 'right', padding: '6px 8px' }}>Crédito</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {entry.lines.map((line: any, i: number) => (
                                                            <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                                <td style={{ padding: '6px 8px' }}>{line.account_code}</td>
                                                                <td style={{ padding: '6px 8px' }}>{line.account_name}</td>
                                                                <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                                                                    {line.debit ? formatCurrency(line.debit) : '-'}
                                                                </td>
                                                                <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                                                                    {line.credit ? formatCurrency(line.credit) : '-'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default JournalEntryPage;
