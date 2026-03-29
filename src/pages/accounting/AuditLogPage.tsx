import React, { useState, useEffect } from 'react';
import { FiShield, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const actionColors: Record<string, { bg: string; color: string }> = {
    CREATE: { bg: '#e8f5e9', color: '#2e7d32' },
    UPDATE: { bg: '#e3f2fd', color: '#1565c0' },
    DELETE: { bg: '#ffebee', color: '#c62828' },
    VOID: { bg: '#fff3e0', color: '#e65100' },
};

const entityLabels: Record<string, string> = {
    JOURNAL_ENTRY: 'Asiento Contable',
    EXPENSE: 'Gasto',
    BANK_RECONCILIATION: 'Conciliación',
    WITHHOLDING: 'Retención',
};

const entityTypeOptions = [
    { value: '', label: 'Todos' },
    { value: 'JOURNAL_ENTRY', label: 'Asiento Contable' },
    { value: 'EXPENSE', label: 'Gasto' },
    { value: 'BANK_RECONCILIATION', label: 'Conciliación Bancaria' },
    { value: 'WITHHOLDING', label: 'Retención' },
];

const AuditLogPage = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [entityType, setEntityType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        setError('');
        try {
            const params: any = { limit: 100 };
            if (entityType) params.entityType = entityType;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const data = await accountingApi.getAuditLog(params);
            setLogs(data);
        } catch (err: any) {
            setError(err.message || 'Error cargando auditoría');
            logError(err, '/accounting/audit-log');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLogs(); }, []);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('es-CO', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const renderDetails = (details: string | null) => {
        if (!details) return <span style={{ color: '#999', fontSize: '12px' }}>Sin detalles</span>;
        try {
            const parsed = JSON.parse(details);
            return (
                <pre style={{
                    background: '#f8f9fa', padding: '10px', borderRadius: '6px',
                    fontSize: '11px', maxHeight: '200px', overflow: 'auto',
                    margin: '8px 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    border: '1px solid #eee',
                }}>
                    {JSON.stringify(parsed, null, 2)}
                </pre>
            );
        } catch {
            return <span style={{ fontSize: '12px' }}>{details}</span>;
        }
    };

    return (
        <div className="page-container" style={{ minHeight: '70vh' }}>
            <PageHeader title="Auditoría Contable" icon={<FiShield />} />

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px', alignItems: 'flex-end' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Tipo Entidad</label>
                    <select
                        value={entityType}
                        onChange={e => setEntityType(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px', minWidth: '180px' }}
                    >
                        {entityTypeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Desde</label>
                    <input
                        type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Hasta</label>
                    <input
                        type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}
                    />
                </div>
                <button onClick={fetchLogs} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                    Filtrar
                </button>
            </div>

            {error && <p className="error-message">{error}</p>}

            {loading ? (
                <p>Cargando registros...</p>
            ) : logs.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>No hay registros de auditoría.</p>
            ) : (
                <div className="list-card full-width">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Acción</th>
                                <th>Entidad</th>
                                <th>ID</th>
                                <th>Usuario</th>
                                <th style={{ width: '80px' }}>Detalles</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log: any) => (
                                <React.Fragment key={log.id}>
                                    <tr>
                                        <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{formatDate(log.createdAt)}</td>
                                        <td>
                                            <span style={{
                                                display: 'inline-block', padding: '2px 10px', borderRadius: '12px',
                                                fontSize: '11px', fontWeight: 700,
                                                color: actionColors[log.action]?.color || '#555',
                                                background: actionColors[log.action]?.bg || '#f5f5f5',
                                            }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '12px' }}>{entityLabels[log.entity_type] || log.entity_type}</td>
                                        <td style={{ fontSize: '12px' }}>{log.entity_id}</td>
                                        <td style={{ fontSize: '12px' }}>{log.user_name || '—'}</td>
                                        <td>
                                            <button
                                                onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                                                style={{
                                                    padding: '3px 8px', fontSize: '11px', cursor: 'pointer',
                                                    background: 'none', border: '1px solid #ddd', borderRadius: '4px',
                                                    display: 'flex', alignItems: 'center', gap: '3px',
                                                }}
                                            >
                                                {expandedRow === log.id ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                                                {expandedRow === log.id ? 'Ocultar' : 'Ver'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedRow === log.id && (
                                        <tr>
                                            <td colSpan={6} style={{ padding: '8px 12px', background: '#fafafa' }}>
                                                {renderDetails(log.details)}
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

export default AuditLogPage;
