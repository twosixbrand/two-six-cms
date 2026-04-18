import React, { useState, useEffect } from 'react';
import { FiClipboard, FiPlus, FiChevronDown, FiChevronUp, FiChevronRight, FiDownload, FiRefreshCcw } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { DataTable, Button, StatusBadge, LoadingSpinner, FormField } from '../../components/ui';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

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

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'POSTED': return 'success';
            case 'DRAFT': return 'warning';
            case 'VOIDED': return 'error';
            default: return 'neutral';
        }
    };

    const inputStyle: React.CSSProperties = {
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid #2a2a35',
        backgroundColor: '#1a1a24',
        color: '#f1f1f3',
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.875rem',
        height: '40px',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '12px',
        fontWeight: 600,
        marginBottom: '4px',
        color: '#a0a0b0',
    };

    return (
        <div className="page-container">
            <PageHeader title="Asientos Contables" icon={<FiClipboard />} />

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                    <label style={labelStyle}>Desde</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                        style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>Hasta</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                        style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>Origen</label>
                    <select value={sourceType} onChange={e => setSourceType(e.target.value)}
                        style={inputStyle}>
                        <option value="ALL">Todos</option>
                        <option value="SALE">Venta</option>
                        <option value="EXPENSE">Gasto</option>
                        <option value="ADJUSTMENT">Ajuste</option>
                    </select>
                </div>
                <Button variant="primary" icon={<FiRefreshCcw />} onClick={fetchEntries}>
                    Buscar
                </Button>
                <Button variant="secondary" icon={<FiPlus />} onClick={() => navigate('/accounting/journal/new')}>
                    Nuevo Asiento
                </Button>
                {startDate && endDate && (
                    <Button variant="secondary" icon={<FiDownload />} onClick={() => accountingApi.exportToExcel('journal-entries', { startDate, endDate })}>
                        Exportar Excel
                    </Button>
                )}
            </div>

            {error && <p className="error-message">{error}</p>}

            {loading ? (
                <LoadingSpinner text="Cargando asientos contables..." />
            ) : (
                <div style={{
                    overflowX: 'auto',
                    borderRadius: 8,
                    backgroundColor: '#1a1a24',
                    border: '1px solid #2a2a35',
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        minWidth: 800,
                    }}>
                        <thead>
                            <tr>
                                {['', '# Asiento', 'Fecha', 'Descripcion', 'Origen', 'Total Debito', 'Total Credito', 'Estado'].map((h, i) => (
                                    <th key={i} style={{
                                        padding: '0.65rem 1rem',
                                        textAlign: i >= 5 && i <= 6 ? 'right' : 'left',
                                        fontSize: '0.7rem',
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        color: '#6b6b7b',
                                        borderBottom: '1px solid #2a2a35',
                                        backgroundColor: '#1f1f2a',
                                        whiteSpace: 'nowrap',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {entries.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#a0a0b0' }}>No hay asientos contables</td></tr>
                            ) : entries.map((entry: any) => (
                                <React.Fragment key={entry.id}>
                                    <tr
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => toggleExpand(entry.id)}
                                    >
                                        <td style={{ width: '30px', padding: '0.65rem 1rem', borderBottom: '1px solid #1f1f2a', color: '#a0a0b0' }}>
                                            {expandedEntry === entry.id ? <FiChevronDown /> : <FiChevronRight />}
                                        </td>
                                        <td style={{ padding: '0.65rem 1rem', borderBottom: '1px solid #1f1f2a', color: '#f1f1f3' }}>
                                            <strong>{entry.entry_number}</strong>
                                        </td>
                                        <td style={{ padding: '0.65rem 1rem', borderBottom: '1px solid #1f1f2a', color: '#f1f1f3' }}>
                                            {new Date(entry.entry_date).toLocaleDateString('es-CO')}
                                        </td>
                                        <td style={{ padding: '0.65rem 1rem', borderBottom: '1px solid #1f1f2a', color: '#f1f1f3' }}>
                                            {entry.description}
                                        </td>
                                        <td style={{ padding: '0.65rem 1rem', borderBottom: '1px solid #1f1f2a' }}>
                                            <StatusBadge status={entry.source_type} variant="info" size="sm" />
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '0.65rem 1rem', borderBottom: '1px solid #1f1f2a', color: '#f1f1f3' }}>
                                            {formatCurrency(entry.total_debit)}
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '0.65rem 1rem', borderBottom: '1px solid #1f1f2a', color: '#f1f1f3' }}>
                                            {formatCurrency(entry.total_credit)}
                                        </td>
                                        <td style={{ padding: '0.65rem 1rem', borderBottom: '1px solid #1f1f2a' }}>
                                            <StatusBadge
                                                status={entry.status}
                                                variant={getStatusVariant(entry.status)}
                                                size="sm"
                                            />
                                        </td>
                                    </tr>
                                    {expandedEntry === entry.id && entry.lines && (
                                        <tr>
                                            <td colSpan={8} style={{ padding: '0 16px 12px 48px', background: '#13131a', borderBottom: '1px solid #2a2a35' }}>
                                                <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr style={{ borderBottom: '1px solid #2a2a35' }}>
                                                            <th style={{ textAlign: 'left', padding: '6px 8px', color: '#6b6b7b', fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cuenta</th>
                                                            <th style={{ textAlign: 'left', padding: '6px 8px', color: '#6b6b7b', fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nombre</th>
                                                            <th style={{ textAlign: 'right', padding: '6px 8px', color: '#6b6b7b', fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Debito</th>
                                                            <th style={{ textAlign: 'right', padding: '6px 8px', color: '#6b6b7b', fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Credito</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {entry.lines.map((line: any, i: number) => (
                                                            <tr key={i} style={{ borderBottom: '1px solid #1f1f2a' }}>
                                                                <td style={{ padding: '6px 8px', color: '#f1f1f3' }}>{line.account_code}</td>
                                                                <td style={{ padding: '6px 8px', color: '#f1f1f3' }}>{line.account_name}</td>
                                                                <td style={{ padding: '6px 8px', textAlign: 'right', color: '#f1f1f3' }}>
                                                                    {line.debit ? formatCurrency(line.debit) : '-'}
                                                                </td>
                                                                <td style={{ padding: '6px 8px', textAlign: 'right', color: '#f1f1f3' }}>
                                                                    {line.credit ? formatCurrency(line.credit) : '-'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                {entry.metadata && (() => {
                                                    let meta: any = null;
                                                    try { meta = JSON.parse(entry.metadata); } catch { meta = null; }
                                                    if (!meta) return null;
                                                    const hasContent = meta.customer_nit || meta.customer_name || meta.notes || meta.reference;
                                                    if (!hasContent) return null;
                                                    return (
                                                        <div style={{ marginTop: 10, padding: '8px 12px', background: '#1a1a24', borderRadius: 6, border: '1px solid #2a2a35', fontSize: 12 }}>
                                                            <div style={{ color: '#6b6b7b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Metadata</div>
                                                            {meta.customer_name && <div style={{ color: '#f1f1f3' }}><span style={{ color: '#a0a0b0' }}>Cliente:</span> {meta.customer_name}</div>}
                                                            {meta.customer_nit && <div style={{ color: '#f1f1f3' }}><span style={{ color: '#a0a0b0' }}>NIT/CC:</span> {meta.customer_nit}</div>}
                                                            {meta.reference && <div style={{ color: '#f1f1f3' }}><span style={{ color: '#a0a0b0' }}>Referencia:</span> {meta.reference}</div>}
                                                            {meta.notes && <div style={{ color: '#f1f1f3', marginTop: 4 }}><span style={{ color: '#a0a0b0' }}>Notas:</span> {meta.notes}</div>}
                                                        </div>
                                                    );
                                                })()}
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
