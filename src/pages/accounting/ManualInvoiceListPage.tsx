import React, { useEffect, useMemo, useState } from 'react';
import { FiDownload, FiFileText, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const API_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3050/api';
const API_KEY = (import.meta as any).env?.VITE_DIAN_API_KEY || 'TwoSixAdminKey123!';

type ManualInvoiceRow = {
    id: number;
    document_number: string;
    cufe_code: string | null;
    issue_date: string;
    status: string;
    environment: string;
    email_sent: boolean;
    dian_authorized_at: string | null;
    customer: { name: string; doc_type: string; doc_number: string; email?: string } | null;
    operation_date: string | null;
    subtotal: number | null;
    iva_total: number | null;
    total: number | null;
    items_count: number;
    cash_receipt: { id: number; entry_number: string; entry_date: string } | null;
    journal_entry: { id: number; entry_number: string } | null;
};

const formatCurrency = (val: number | null) =>
    val == null ? '—' : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

const formatDate = (val: string | null) => {
    if (!val) return '—';
    const d = new Date(val);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-CO');
};

const statusBadgeColor = (status: string) => {
    switch (status) {
        case 'AUTHORIZED': return { bg: '#134e2a', fg: '#34d399' };
        case 'SENT': return { bg: '#1e3a5f', fg: '#60a5fa' };
        case 'REJECTED': return { bg: '#5f1e1e', fg: '#f87171' };
        default: return { bg: '#2a2a35', fg: '#a0a0b0' };
    }
};

const ManualInvoiceListPage: React.FC = () => {
    const navigate = useNavigate();
    const [rows, setRows] = useState<ManualInvoiceRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('');
    const [search, setSearch] = useState('');

    const load = () => {
        setLoading(true);
        accountingApi.listManualDianInvoices({
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            status: status || undefined,
            search: search || undefined,
        })
            .then((data) => setRows(Array.isArray(data) ? data : []))
            .catch((err) => logError(err, '/accounting/regularization/list'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const totals = useMemo(() => {
        return rows.reduce(
            (acc, r) => ({
                subtotal: acc.subtotal + (r.subtotal || 0),
                iva: acc.iva + (r.iva_total || 0),
                total: acc.total + (r.total || 0),
            }),
            { subtotal: 0, iva: 0, total: 0 },
        );
    }, [rows]);

    const downloadFile = (url: string, filename: string) => {
        fetch(url, { headers: { 'x-api-key': API_KEY } })
            .then((r) => r.blob())
            .then((blob) => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                link.click();
                URL.revokeObjectURL(link.href);
            })
            .catch((err) => logError(err, '/accounting/regularization/list/download'));
    };

    return (
        <div className="page-container">
            <PageHeader title="Regularizaciones DIAN" icon={<FiFileText />}>
                <Button variant="primary" icon={<FiPlus />} onClick={() => navigate('/accounting/regularization/manual-sale')}>
                    Nueva regularización
                </Button>
            </PageHeader>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                    <label style={{ display: 'block', color: '#a0a0b0', fontSize: 12, marginBottom: 4 }}>Desde</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                        style={{ padding: 8, background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 6, color: '#f1f1f3' }} />
                </div>
                <div>
                    <label style={{ display: 'block', color: '#a0a0b0', fontSize: 12, marginBottom: 4 }}>Hasta</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                        style={{ padding: 8, background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 6, color: '#f1f1f3' }} />
                </div>
                <div>
                    <label style={{ display: 'block', color: '#a0a0b0', fontSize: 12, marginBottom: 4 }}>Estado</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}
                        style={{ padding: 8, background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 6, color: '#f1f1f3' }}>
                        <option value="">Todos</option>
                        <option value="AUTHORIZED">AUTHORIZED</option>
                        <option value="SENT">SENT</option>
                        <option value="REJECTED">REJECTED</option>
                    </select>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                    <label style={{ display: 'block', color: '#a0a0b0', fontSize: 12, marginBottom: 4 }}>Buscar (factura, cliente, NIT)</label>
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ej. SETP, Juliana, 123..."
                        style={{ width: '100%', padding: 8, background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 6, color: '#f1f1f3' }} />
                </div>
                <Button variant="primary" icon={<FiRefreshCw />} onClick={load} loading={loading}>Buscar</Button>
            </div>

            <div style={{ background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1100 }}>
                        <thead>
                            <tr style={{ background: '#1f1f2a' }}>
                                {['# Factura', 'Emisión', 'Op. original', 'Cliente', 'NIT/CC', 'Recibo cruzado', 'Asiento', 'Subtotal', 'IVA', 'Total', 'Estado', 'Email', 'Acciones'].map((h) => (
                                    <th key={h} style={{ padding: '10px 12px', fontSize: 11, color: '#6b6b7b', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: h === 'Subtotal' || h === 'IVA' || h === 'Total' ? 'right' : 'left', borderBottom: '1px solid #2a2a35' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={13} style={{ padding: 24, textAlign: 'center', color: '#6b6b7b' }}>No hay regularizaciones emitidas.</td>
                                </tr>
                            )}
                            {rows.map((r) => {
                                const badge = statusBadgeColor(r.status);
                                return (
                                    <tr key={r.id} style={{ borderBottom: '1px solid #1f1f2a' }}>
                                        <td style={{ padding: '10px 12px', color: '#f1f1f3', fontSize: 13 }}>
                                            <strong>{r.document_number}</strong>
                                            {r.cufe_code && <div style={{ color: '#6b6b7b', fontSize: 10, fontFamily: 'monospace' }}>{r.cufe_code.slice(0, 20)}…</div>}
                                        </td>
                                        <td style={{ padding: '10px 12px', color: '#a0a0b0', fontSize: 12 }}>{formatDate(r.issue_date)}</td>
                                        <td style={{ padding: '10px 12px', color: '#a0a0b0', fontSize: 12 }}>{formatDate(r.operation_date)}</td>
                                        <td style={{ padding: '10px 12px', color: '#f1f1f3', fontSize: 13 }}>
                                            {r.customer?.name || '—'}
                                            {r.customer?.email && <div style={{ color: '#6b6b7b', fontSize: 11 }}>{r.customer.email}</div>}
                                        </td>
                                        <td style={{ padding: '10px 12px', color: '#a0a0b0', fontSize: 12 }}>{r.customer?.doc_number || '—'}</td>
                                        <td style={{ padding: '10px 12px', color: '#a0a0b0', fontSize: 12 }}>
                                            {r.cash_receipt ? (
                                                <Link to={`/accounting/journal?search=${r.cash_receipt.entry_number}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>
                                                    {r.cash_receipt.entry_number}
                                                </Link>
                                            ) : '—'}
                                        </td>
                                        <td style={{ padding: '10px 12px', color: '#a0a0b0', fontSize: 12 }}>
                                            {r.journal_entry ? (
                                                <Link to={`/accounting/journal?search=${r.journal_entry.entry_number}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>
                                                    {r.journal_entry.entry_number}
                                                </Link>
                                            ) : '—'}
                                        </td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#f1f1f3', fontSize: 13 }}>{formatCurrency(r.subtotal)}</td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#f1f1f3', fontSize: 13 }}>{formatCurrency(r.iva_total)}</td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#f0b429', fontSize: 13, fontWeight: 600 }}>{formatCurrency(r.total)}</td>
                                        <td style={{ padding: '10px 12px' }}>
                                            <span style={{ background: badge.bg, color: badge.fg, padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{r.status}</span>
                                        </td>
                                        <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 14 }}>
                                            {r.email_sent ? <span title="Enviado" style={{ color: '#34d399' }}>✓</span> : <span title="Pendiente" style={{ color: '#f87171' }}>✗</span>}
                                        </td>
                                        <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                                            <button
                                                onClick={() => downloadFile(`${API_URL.replace('/api', '')}/v1/dian/invoices/${r.id}/pdf`, `${r.document_number}.pdf`)}
                                                title="PDF"
                                                style={{ background: 'none', border: '1px solid #2a2a35', borderRadius: 6, padding: '4px 8px', color: '#f0b429', cursor: 'pointer', marginRight: 6, fontSize: 12 }}
                                            >
                                                <FiDownload style={{ verticalAlign: 'middle' }} /> PDF
                                            </button>
                                            <button
                                                onClick={() => downloadFile(`${API_URL.replace('/api', '')}/v1/dian/invoices/${r.id}/xml`, `${r.document_number}.xml`)}
                                                title="XML"
                                                style={{ background: 'none', border: '1px solid #2a2a35', borderRadius: 6, padding: '4px 8px', color: '#60a5fa', cursor: 'pointer', fontSize: 12 }}
                                            >
                                                XML
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        {rows.length > 0 && (
                            <tfoot>
                                <tr style={{ background: '#1f1f2a', fontWeight: 700 }}>
                                    <td colSpan={7} style={{ padding: '10px 12px', textAlign: 'right', color: '#a0a0b0', fontSize: 12 }}>TOTALES ({rows.length})</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#f1f1f3', fontSize: 13 }}>{formatCurrency(totals.subtotal)}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#f1f1f3', fontSize: 13 }}>{formatCurrency(totals.iva)}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#f0b429', fontSize: 13 }}>{formatCurrency(totals.total)}</td>
                                    <td colSpan={3}></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManualInvoiceListPage;
