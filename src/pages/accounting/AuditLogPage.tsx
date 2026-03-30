import React, { useState, useEffect } from 'react';
import { FiShield, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const actionColors: Record<string, { bg: string; color: string }> = {
    CREATE: { bg: '#0d3b2e', color: '#34d399' },
    UPDATE: { bg: '#1a2744', color: '#60a5fa' },
    DELETE: { bg: '#3b1515', color: '#f87171' },
    VOID: { bg: '#3b2f0a', color: '#fbbf24' },
};

const entityLabels: Record<string, string> = {
    JOURNAL_ENTRY: 'Asiento Contable',
    EXPENSE: 'Gasto',
    BANK_RECONCILIATION: 'Conciliacion',
    WITHHOLDING: 'Retencion',
};

const entityTypeOptions = [
    { value: '', label: 'Todos' },
    { value: 'JOURNAL_ENTRY', label: 'Asiento Contable' },
    { value: 'EXPENSE', label: 'Gasto' },
    { value: 'BANK_RECONCILIATION', label: 'Conciliacion Bancaria' },
    { value: 'WITHHOLDING', label: 'Retencion' },
];

const thStyle: React.CSSProperties = {
    padding: '0.65rem 1rem', fontSize: '0.7rem', fontWeight: 500,
    textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b6b7b',
    borderBottom: '1px solid #2a2a35', backgroundColor: '#1f1f2a',
    whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif', textAlign: 'left',
};

const tdStyle: React.CSSProperties = {
    padding: '0.65rem 1rem', fontSize: '0.8125rem', color: '#f1f1f3',
    borderBottom: '1px solid #1f1f2a', fontFamily: 'Inter, sans-serif',
};

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
            setError(err.message || 'Error cargando auditoria');
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
        if (!details) return <span style={{ color: '#6b6b7b', fontSize: '12px' }}>Sin detalles</span>;
        try {
            const parsed = JSON.parse(details);
            return (
                <pre style={{
                    background: '#12121a', padding: '10px', borderRadius: '6px',
                    fontSize: '11px', maxHeight: '200px', overflow: 'auto',
                    margin: '8px 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    border: '1px solid #2a2a35', color: '#a0a0b0',
                }}>
                    {JSON.stringify(parsed, null, 2)}
                </pre>
            );
        } catch {
            return <span style={{ fontSize: '12px', color: '#a0a0b0' }}>{details}</span>;
        }
    };

    return (
        <div className="page-container" style={{ minHeight: '70vh' }}>
            <PageHeader title="Auditoria Contable" icon={<FiShield />} />

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px', alignItems: 'flex-end' }}>
                <div style={{ minWidth: '180px' }}>
                    <FormField
                        label="Tipo Entidad"
                        name="entityType"
                        type="select"
                        value={entityType}
                        onChange={e => setEntityType(e.target.value)}
                        options={entityTypeOptions}
                    />
                </div>
                <div style={{ minWidth: '160px' }}>
                    <FormField label="Desde" name="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div style={{ minWidth: '160px' }}>
                    <FormField label="Hasta" name="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <Button variant="secondary" onClick={fetchLogs}>Filtrar</Button>
            </div>

            {error && <p style={{ color: '#f87171', fontSize: '13px', fontWeight: 600 }}>{error}</p>}

            {loading ? (
                <LoadingSpinner size="md" text="Cargando registros..." />
            ) : logs.length === 0 ? (
                <p style={{ color: '#6b6b7b', textAlign: 'center', padding: '40px 0' }}>No hay registros de auditoria.</p>
            ) : (
                <div style={{
                    backgroundColor: '#1a1a24', border: '1px solid #2a2a35',
                    borderRadius: 12, overflow: 'hidden',
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Fecha</th>
                                    <th style={thStyle}>Accion</th>
                                    <th style={thStyle}>Entidad</th>
                                    <th style={thStyle}>ID</th>
                                    <th style={thStyle}>Usuario</th>
                                    <th style={{ ...thStyle, width: '80px' }}>Detalles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log: any) => (
                                    <React.Fragment key={log.id}>
                                        <tr>
                                            <td style={{ ...tdStyle, fontSize: '12px', whiteSpace: 'nowrap' }}>{formatDate(log.createdAt)}</td>
                                            <td style={tdStyle}>
                                                <span style={{
                                                    display: 'inline-block', padding: '2px 10px', borderRadius: '12px',
                                                    fontSize: '11px', fontWeight: 700,
                                                    color: actionColors[log.action]?.color || '#a0a0b0',
                                                    background: actionColors[log.action]?.bg || '#1f1f2a',
                                                }}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td style={{ ...tdStyle, fontSize: '12px' }}>{entityLabels[log.entity_type] || log.entity_type}</td>
                                            <td style={{ ...tdStyle, fontSize: '12px' }}>{log.entity_id}</td>
                                            <td style={{ ...tdStyle, fontSize: '12px' }}>{log.user_name || '\u2014'}</td>
                                            <td style={tdStyle}>
                                                <button
                                                    onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                                                    style={{
                                                        padding: '3px 8px', fontSize: '11px', cursor: 'pointer',
                                                        background: 'transparent', border: '1px solid #2a2a35', borderRadius: '4px',
                                                        display: 'flex', alignItems: 'center', gap: '3px',
                                                        color: '#a0a0b0',
                                                    }}
                                                >
                                                    {expandedRow === log.id ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                                                    {expandedRow === log.id ? 'Ocultar' : 'Ver'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedRow === log.id && (
                                            <tr>
                                                <td colSpan={6} style={{ padding: '8px 12px', background: '#12121a' }}>
                                                    {renderDetails(log.details)}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogPage;
