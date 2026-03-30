import React, { useState } from 'react';
import { FiDatabase, FiSearch, FiDownload } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const currentYear = new Date().getFullYear();

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val || 0);

const thStyle: React.CSSProperties = {
    padding: '0.65rem 1rem', fontSize: '0.7rem', fontWeight: 500,
    textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b6b7b',
    borderBottom: '1px solid #2a2a35', backgroundColor: '#1f1f2a',
    whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif', textAlign: 'left',
};

const tdStyleBase: React.CSSProperties = {
    padding: '0.65rem 1rem', fontSize: '0.8125rem', color: '#f1f1f3',
    borderBottom: '1px solid #1f1f2a', fontFamily: 'Inter, sans-serif',
    whiteSpace: 'nowrap',
};

const ExogenaPage = () => {
    const [year, setYear] = useState(currentYear - 1);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('1001');

    const handlePreview = async () => {
        try {
            setLoading(true);
            setError('');
            const result = await accountingApi.previewExogena(year);
            setData(result);
        } catch (err) {
            logError(err, '/accounting/exogena');
            setError('Error al previsualizar la informacion exogena.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        try {
            setLoading(true);
            setError('');
            await accountingApi.generateExogena(year);
        } catch (err) {
            logError(err, '/accounting/exogena');
            setError('Error al generar el archivo Excel.');
        } finally {
            setLoading(false);
        }
    };

    const tabStyle = (active: boolean): React.CSSProperties => ({
        padding: '10px 20px',
        border: 'none',
        borderBottom: active ? '3px solid #f0b429' : '3px solid transparent',
        background: 'transparent',
        color: active ? '#f0b429' : '#6b6b7b',
        fontWeight: active ? 600 : 400,
        fontSize: '14px',
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
    });

    const monthNames = [
        '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];

    return (
        <div className="page-container">
            <PageHeader title="Informacion Exogena (Medios Magneticos DIAN)" icon={<FiDatabase />} />

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ minWidth: '140px' }}>
                    <FormField
                        label="Ano Gravable"
                        name="year"
                        type="select"
                        value={year}
                        onChange={e => setYear(Number(e.target.value))}
                        options={Array.from({ length: 6 }, (_, i) => ({ value: currentYear - i, label: String(currentYear - i) }))}
                    />
                </div>
                <Button variant="primary" icon={<FiSearch />} onClick={handlePreview} disabled={loading} loading={loading}>Previsualizar</Button>
                <Button variant="secondary" icon={<FiDownload />} onClick={handleGenerate} disabled={loading}>Generar Excel</Button>
            </div>

            {error && <p style={{ color: '#f87171', fontSize: '13px', fontWeight: 600 }}>{error}</p>}

            {loading && <LoadingSpinner size="md" text="Procesando informacion exogena..." />}

            {data && !loading && (
                <>
                    {/* Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                        {[
                            { label: 'Proveedores Reportados', value: data.summary?.totalProviders || 0, color: '#60a5fa', isCurrency: false },
                            { label: 'Clientes Reportados', value: data.summary?.totalCustomers || 0, color: '#34d399', isCurrency: false },
                            { label: 'Total Pagos', value: data.summary?.totalPayments || 0, color: '#f87171', isCurrency: true },
                            { label: 'Total Ingresos', value: data.summary?.totalRevenue || 0, color: '#fbbf24', isCurrency: true },
                            { label: 'IVA Descontable', value: data.summary?.totalIvaDescontable || 0, color: '#a78bfa', isCurrency: true },
                            { label: 'IVA Generado', value: data.summary?.totalIvaGenerado || 0, color: '#22d3ee', isCurrency: true },
                        ].map((card, i) => (
                            <div key={i} style={{
                                background: '#1a1a24', borderRadius: '12px', padding: '16px',
                                border: '1px solid #2a2a35', borderLeft: `4px solid ${card.color}`,
                            }}>
                                <div style={{ fontSize: '11px', color: '#6b6b7b', fontWeight: 600, marginBottom: '4px' }}>{card.label}</div>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: card.color }}>
                                    {card.isCurrency ? formatCurrency(card.value) : card.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div style={{ borderBottom: '1px solid #2a2a35', marginBottom: '20px', display: 'flex', gap: '4px' }}>
                        <button style={tabStyle(activeTab === '1001')} onClick={() => setActiveTab('1001')}>Formato 1001</button>
                        <button style={tabStyle(activeTab === '1005')} onClick={() => setActiveTab('1005')}>Formato 1005</button>
                        <button style={tabStyle(activeTab === '1006')} onClick={() => setActiveTab('1006')}>Formato 1006</button>
                        <button style={tabStyle(activeTab === '1007')} onClick={() => setActiveTab('1007')}>Formato 1007</button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === '1001' && (
                        <div>
                            <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>
                                Formato 1001 - Pagos a Terceros ({data.format1001?.length || 0} proveedores)
                            </h3>
                            <div style={{ overflowX: 'auto', backgroundColor: '#1a1a24', borderRadius: 12, border: '1px solid #2a2a35' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={thStyle}>NIT Proveedor</th>
                                            <th style={thStyle}>Razon Social</th>
                                            <th style={thStyle}>Concepto</th>
                                            <th style={{ ...thStyle, textAlign: 'right' }}>Base Gravable</th>
                                            <th style={{ ...thStyle, textAlign: 'right' }}>Retencion</th>
                                            <th style={{ ...thStyle, textAlign: 'right' }}>IVA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!data.format1001 || data.format1001.length === 0) ? (
                                            <tr><td colSpan={6} style={{ ...tdStyleBase, textAlign: 'center', padding: '40px', color: '#6b6b7b' }}>Sin datos</td></tr>
                                        ) : data.format1001.map((item: any, i: number) => (
                                            <tr key={i}>
                                                <td style={tdStyleBase}>{item.nit}</td>
                                                <td style={tdStyleBase}>{item.name}</td>
                                                <td style={tdStyleBase}>{item.concept}</td>
                                                <td style={{ ...tdStyleBase, textAlign: 'right' }}>{formatCurrency(item.base_amount)}</td>
                                                <td style={{ ...tdStyleBase, textAlign: 'right' }}>{formatCurrency(item.retention_amount)}</td>
                                                <td style={{ ...tdStyleBase, textAlign: 'right' }}>{formatCurrency(item.tax_amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === '1005' && (
                        <div>
                            <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>
                                Formato 1005 - IVA Descontable ({data.format1005?.length || 0} proveedores)
                            </h3>
                            <div style={{ overflowX: 'auto', backgroundColor: '#1a1a24', borderRadius: 12, border: '1px solid #2a2a35' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={thStyle}>NIT Proveedor</th>
                                            <th style={thStyle}>Razon Social</th>
                                            <th style={{ ...thStyle, textAlign: 'right' }}>IVA Descontable</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!data.format1005 || data.format1005.length === 0) ? (
                                            <tr><td colSpan={3} style={{ ...tdStyleBase, textAlign: 'center', padding: '40px', color: '#6b6b7b' }}>Sin datos</td></tr>
                                        ) : data.format1005.map((item: any, i: number) => (
                                            <tr key={i}>
                                                <td style={tdStyleBase}>{item.nit}</td>
                                                <td style={tdStyleBase}>{item.name}</td>
                                                <td style={{ ...tdStyleBase, textAlign: 'right' }}>{formatCurrency(item.iva_descontable)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === '1006' && (
                        <div>
                            <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>
                                Formato 1006 - IVA Generado por Mes
                            </h3>
                            <div style={{ overflowX: 'auto', backgroundColor: '#1a1a24', borderRadius: 12, border: '1px solid #2a2a35' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={thStyle}>Mes</th>
                                            <th style={{ ...thStyle, textAlign: 'right' }}>IVA Generado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!data.format1006 || data.format1006.length === 0) ? (
                                            <tr><td colSpan={2} style={{ ...tdStyleBase, textAlign: 'center', padding: '40px', color: '#6b6b7b' }}>Sin datos</td></tr>
                                        ) : data.format1006.map((item: any, i: number) => (
                                            <tr key={i}>
                                                <td style={tdStyleBase}>{monthNames[item.month] || `Mes ${item.month}`}</td>
                                                <td style={{ ...tdStyleBase, textAlign: 'right' }}>{formatCurrency(item.iva_generado)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === '1007' && (
                        <div>
                            <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>
                                Formato 1007 - Ingresos Recibidos de Terceros ({data.format1007?.length || 0} clientes)
                            </h3>
                            <div style={{ overflowX: 'auto', backgroundColor: '#1a1a24', borderRadius: 12, border: '1px solid #2a2a35' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={thStyle}>NIT / CC Cliente</th>
                                            <th style={thStyle}>Nombre / Razon Social</th>
                                            <th style={{ ...thStyle, textAlign: 'right' }}>Ingresos Brutos</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!data.format1007 || data.format1007.length === 0) ? (
                                            <tr><td colSpan={3} style={{ ...tdStyleBase, textAlign: 'center', padding: '40px', color: '#6b6b7b' }}>Sin datos</td></tr>
                                        ) : data.format1007.map((item: any, i: number) => (
                                            <tr key={i}>
                                                <td style={tdStyleBase}>{item.nit}</td>
                                                <td style={tdStyleBase}>{item.name}</td>
                                                <td style={{ ...tdStyleBase, textAlign: 'right' }}>{formatCurrency(item.total_revenue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ExogenaPage;
