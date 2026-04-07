import React, { useState, useEffect } from 'react';
import { FiClock, FiRefreshCcw, FiDownload, FiDollarSign, FiCreditCard, FiPackage } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

// ─── Shared Styles ──────────────────────────────────────────────

const thStyle: React.CSSProperties = {
    padding: '0.65rem 1rem', fontSize: '0.7rem', fontWeight: 500,
    textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b6b7b',
    borderBottom: '1px solid #2a2a35', backgroundColor: '#1f1f2a',
    whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif',
};

const tdStyle: React.CSSProperties = {
    padding: '0.5rem 1rem', fontSize: '0.8125rem', color: '#f1f1f3',
    borderBottom: '1px solid #1f1f2a', fontFamily: 'Inter, sans-serif',
};

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val || 0);

const formatNumber = (val: number) =>
    new Intl.NumberFormat('es-CO').format(val || 0);

// ─── Tab Button Style ───────────────────────────────────────────

const tabStyle = (active: boolean, accentColor: string): React.CSSProperties => ({
    flex: 1,
    padding: '14px 20px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.85rem',
    fontWeight: active ? 700 : 500,
    color: active ? accentColor : '#6b6b7b',
    backgroundColor: active ? 'rgba(255,255,255,0.04)' : 'transparent',
    borderBottom: active ? `3px solid ${accentColor}` : '3px solid transparent',
    transition: 'all 0.25s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
});

// ─── Summary Card ───────────────────────────────────────────────

const SummaryCard = ({ label, value, subLabel, color, borderColor }: {
    label: string; value: string; subLabel?: string; color: string; borderColor: string;
}) => (
    <div style={{
        flex: 1, minWidth: '180px', padding: '20px', borderRadius: '12px',
        background: '#1f1f2a', border: `1px solid ${borderColor}`,
        borderTop: `3px solid ${color}`, textAlign: 'center',
    }}>
        <div style={{ fontSize: '12px', color, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: '22px', fontWeight: 700, color }}>{value}</div>
        {subLabel && (
            <div style={{ fontSize: '11px', color: '#6b6b7b', marginTop: '4px' }}>{subLabel}</div>
        )}
    </div>
);

// ─── Total Highlight Card ───────────────────────────────────────

const TotalCard = ({ label, value, accentColor }: {
    label: string; value: string; accentColor: string;
}) => (
    <div style={{
        padding: '16px', borderRadius: '12px',
        background: `${accentColor}11`, border: `1px solid ${accentColor}33`,
        textAlign: 'center', marginBottom: '24px',
    }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#a0a0b0' }}>{label}</div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: accentColor }}>{value}</div>
    </div>
);

// ═══════════════════════════════════════════════════════════════
// TAB 1: Cuentas por Cobrar (CxC)
// ═══════════════════════════════════════════════════════════════

const CxCTab = ({ data }: { data: any }) => {
    const summaryCards = data?.summary ? [
        { key: 'current', label: '0-30 Dias', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.3)' },
        { key: 'days31_60', label: '31-60 Dias', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.3)' },
        { key: 'days61_90', label: '61-90 Dias', color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.3)' },
        { key: 'over90', label: 'Mas de 90 Dias', color: '#a78bfa', borderColor: 'rgba(167, 139, 250, 0.3)' },
    ] : [];

    const renderOrderTable = (orders: any[], bucketLabel: string) => {
        if (!orders || orders.length === 0) return null;
        return (
            <div style={{ marginTop: '16px' }}>
                <h4 style={{ marginBottom: '8px', color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>{bucketLabel}</h4>
                <div style={{ overflowX: 'auto', backgroundColor: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 8 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Referencia</th>
                                <th style={thStyle}>Cliente</th>
                                <th style={thStyle}>Fecha Pedido</th>
                                <th style={thStyle}>Estado</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>Dias</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o: any, i: number) => (
                                <tr key={i}>
                                    <td style={{ ...tdStyle, fontWeight: 600 }}>{o.orderReference || `#${o.orderId}`}</td>
                                    <td style={tdStyle}>{o.customerName}</td>
                                    <td style={tdStyle}>{new Date(o.orderDate).toLocaleDateString('es-CO')}</td>
                                    <td style={tdStyle}>
                                        <StatusBadge status={o.status} size="sm" />
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600 }}>{o.daysOutstanding}</td>
                                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(o.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <>
            <h2 style={{ textAlign: 'center', marginBottom: '4px', color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>
                Cuentas por Cobrar (CxC)
            </h2>
            <p style={{ textAlign: 'center', color: '#a0a0b0', marginBottom: '24px', fontFamily: 'Inter, sans-serif' }}>
                Generado: {new Date(data.generatedAt).toLocaleString('es-CO')} | Total pedidos: {data.totalOrders}
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {summaryCards.map((card) => {
                    const bucket = data.summary[card.key];
                    return (
                        <SummaryCard
                            key={card.key}
                            label={card.label}
                            value={formatCurrency(bucket?.total || 0)}
                            subLabel={`${bucket?.count || 0} pedidos`}
                            color={card.color}
                            borderColor={card.borderColor}
                        />
                    );
                })}
            </div>

            <TotalCard label="Total Cartera Pendiente" value={formatCurrency(data.totalOutstanding)} accentColor="#f0b429" />

            {renderOrderTable(data.detail?.current, 'Corriente (0-30 dias)')}
            {renderOrderTable(data.detail?.days31_60, '31-60 Dias')}
            {renderOrderTable(data.detail?.days61_90, '61-90 Dias')}
            {renderOrderTable(data.detail?.over90, 'Mas de 90 Dias')}

            {data.totalOrders === 0 && (
                <p style={{ color: '#6b6b7b', textAlign: 'center', fontSize: '14px', marginTop: '24px' }}>
                    No hay cuentas por cobrar pendientes
                </p>
            )}
        </>
    );
};

// ═══════════════════════════════════════════════════════════════
// TAB 2: Cuentas por Pagar (CxP)
// ═══════════════════════════════════════════════════════════════

const CxPTab = ({ data }: { data: any }) => {
    const summaryCards = data?.summary ? [
        { key: 'current', label: '0-30 Dias', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' },
        { key: 'days31_60', label: '31-60 Dias', color: '#fb923c', borderColor: 'rgba(251, 146, 60, 0.3)' },
        { key: 'days61_90', label: '61-90 Dias', color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.3)' },
        { key: 'over90', label: 'Mas de 90 Dias', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' },
    ] : [];

    const renderExpenseTable = (items: any[], bucketLabel: string) => {
        if (!items || items.length === 0) return null;
        return (
            <div style={{ marginTop: '16px' }}>
                <h4 style={{ marginBottom: '8px', color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>{bucketLabel}</h4>
                <div style={{ overflowX: 'auto', backgroundColor: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 8 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Nro Gasto</th>
                                <th style={thStyle}>Proveedor</th>
                                <th style={thStyle}>Factura</th>
                                <th style={thStyle}>Categoria</th>
                                <th style={thStyle}>Fecha Gasto</th>
                                <th style={thStyle}>Fecha Vencimiento</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>Dias</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item: any, i: number) => (
                                <tr key={i}>
                                    <td style={{ ...tdStyle, fontWeight: 600 }}>{item.expenseNumber}</td>
                                    <td style={tdStyle}>{item.providerName}</td>
                                    <td style={tdStyle}>{item.invoiceNumber || '—'}</td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem',
                                            background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8',
                                        }}>
                                            {item.category}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>{new Date(item.expenseDate).toLocaleDateString('es-CO')}</td>
                                    <td style={tdStyle}>{item.dueDate ? new Date(item.dueDate).toLocaleDateString('es-CO') : 'Sin fecha'}</td>
                                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600, color: item.daysOutstanding > 60 ? '#f87171' : '#f1f1f3' }}>
                                        {item.daysOutstanding}
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <>
            <h2 style={{ textAlign: 'center', marginBottom: '4px', color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>
                Cuentas por Pagar (CxP)
            </h2>
            <p style={{ textAlign: 'center', color: '#a0a0b0', marginBottom: '24px', fontFamily: 'Inter, sans-serif' }}>
                Generado: {new Date(data.generatedAt).toLocaleString('es-CO')} | Total gastos pendientes: {data.totalExpenses}
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {summaryCards.map((card) => {
                    const bucket = data.summary[card.key];
                    return (
                        <SummaryCard
                            key={card.key}
                            label={card.label}
                            value={formatCurrency(bucket?.total || 0)}
                            subLabel={`${bucket?.count || 0} gastos`}
                            color={card.color}
                            borderColor={card.borderColor}
                        />
                    );
                })}
            </div>

            <TotalCard label="Total por Pagar" value={formatCurrency(data.totalOutstanding)} accentColor="#fb923c" />

            {renderExpenseTable(data.detail?.current, 'Corriente (0-30 dias)')}
            {renderExpenseTable(data.detail?.days31_60, '31-60 Dias')}
            {renderExpenseTable(data.detail?.days61_90, '61-90 Dias')}
            {renderExpenseTable(data.detail?.over90, 'Mas de 90 Dias')}

            {data.totalExpenses === 0 && (
                <p style={{ color: '#6b6b7b', textAlign: 'center', fontSize: '14px', marginTop: '24px' }}>
                    No hay cuentas por pagar pendientes
                </p>
            )}
        </>
    );
};

// ═══════════════════════════════════════════════════════════════
// TAB 3: Valoración de Inventario
// ═══════════════════════════════════════════════════════════════

const InventoryTab = ({ data }: { data: any }) => {
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    const toggleCategory = (name: string) => {
        setExpandedCategories(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const summary = data?.summary || {};

    return (
        <>
            <h2 style={{ textAlign: 'center', marginBottom: '4px', color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>
                Valoracion de Inventario
            </h2>
            <p style={{ textAlign: 'center', color: '#a0a0b0', marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}>
                Generado: {new Date(data.generatedAt).toLocaleString('es-CO')} | Metodo: Costo de Produccion (NIC 2 / NIIF)
            </p>
            <p style={{ textAlign: 'center', color: '#6b6b7b', marginBottom: '24px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem' }}>
                Valorado al costo de manufactura (manufactured_cost) conforme a NIC 2: menor entre costo y valor neto realizable
            </p>

            {/* Summary Cards */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <SummaryCard
                    label="Productos Activos"
                    value={formatNumber(summary.totalActiveProducts)}
                    color="#818cf8"
                    borderColor="rgba(129, 140, 248, 0.3)"
                />
                <SummaryCard
                    label="Total Unidades"
                    value={formatNumber(summary.totalUnits)}
                    color="#38bdf8"
                    borderColor="rgba(56, 189, 248, 0.3)"
                />
                <SummaryCard
                    label="Valor (Costo Produccion)"
                    value={formatCurrency(summary.totalCostValue)}
                    subLabel="Base contable NIIF"
                    color="#34d399"
                    borderColor="rgba(52, 211, 153, 0.3)"
                />
                <SummaryCard
                    label="Valor (Precio Venta)"
                    value={formatCurrency(summary.totalSaleValue)}
                    subLabel="Valor neto realizable"
                    color="#fbbf24"
                    borderColor="rgba(251, 191, 36, 0.3)"
                />
            </div>

            {/* Margin Card */}
            <TotalCard
                label="Margen Potencial del Inventario"
                value={formatCurrency(summary.potentialMargin)}
                accentColor="#818cf8"
            />

            {/* Category Breakdown */}
            {(data.categories || []).map((cat: any) => {
                const isExpanded = expandedCategories[cat.categoryName] !== false; // expanded by default
                return (
                    <div key={cat.categoryName} style={{ marginBottom: '16px' }}>
                        <div
                            onClick={() => toggleCategory(cat.categoryName)}
                            style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                                background: '#1f1f2a', border: '1px solid #2a2a35',
                                transition: 'background 0.2s',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f1f3', fontFamily: 'Inter' }}>
                                    {isExpanded ? '▾' : '▸'} {cat.categoryName}
                                </span>
                                <span style={{
                                    padding: '2px 10px', borderRadius: '12px', fontSize: '0.7rem',
                                    background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', fontWeight: 600,
                                }}>
                                    {cat.items.length} productos
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '24px', fontSize: '0.8rem', fontFamily: 'Inter' }}>
                                <span style={{ color: '#6b6b7b' }}>
                                    Uds: <strong style={{ color: '#38bdf8' }}>{formatNumber(cat.totalUnits)}</strong>
                                </span>
                                <span style={{ color: '#6b6b7b' }}>
                                    Costo: <strong style={{ color: '#34d399' }}>{formatCurrency(cat.totalCostValue)}</strong>
                                </span>
                                <span style={{ color: '#6b6b7b' }}>
                                    Venta: <strong style={{ color: '#fbbf24' }}>{formatCurrency(cat.totalSaleValue)}</strong>
                                </span>
                            </div>
                        </div>

                        {isExpanded && (
                            <div style={{ overflowX: 'auto', backgroundColor: '#1a1a24', border: '1px solid #2a2a35', borderRadius: '0 0 8px 8px', borderTop: 'none' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                                    <thead>
                                        <tr>
                                            <th style={thStyle}>SKU</th>
                                            <th style={thStyle}>Producto</th>
                                            <th style={thStyle}>Tipo</th>
                                            <th style={thStyle}>Color</th>
                                            <th style={thStyle}>Talla</th>
                                            <th style={{ ...thStyle, textAlign: 'center' }}>Cantidad</th>
                                            <th style={{ ...thStyle, textAlign: 'right' }}>Costo Unit.</th>
                                            <th style={{ ...thStyle, textAlign: 'right' }}>Precio Venta</th>
                                            <th style={{ ...thStyle, textAlign: 'right' }}>Valor Costo</th>
                                            <th style={{ ...thStyle, textAlign: 'right' }}>Valor Venta</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cat.items.map((item: any, idx: number) => (
                                            <tr key={idx} style={{ opacity: item.quantityAvailable === 0 ? 0.5 : 1 }}>
                                                <td style={{ ...tdStyle, fontWeight: 600, fontFamily: 'monospace', fontSize: '0.75rem' }}>{item.sku}</td>
                                                <td style={tdStyle}>
                                                    {item.productName}
                                                    {item.isOutlet && (
                                                        <span style={{
                                                            marginLeft: '6px', padding: '1px 6px', borderRadius: '4px',
                                                            fontSize: '0.65rem', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24',
                                                        }}>
                                                            OUTLET
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={tdStyle}>{item.typeName}</td>
                                                <td style={tdStyle}>{item.colorName}</td>
                                                <td style={{ ...tdStyle, textAlign: 'center' }}>{item.sizeName}</td>
                                                <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600 }}>{item.quantityAvailable}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(item.unitCost)}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(item.unitSalePrice)}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: '#34d399' }}>{formatCurrency(item.lineCostValue)}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: '#fbbf24' }}>{formatCurrency(item.lineSaleValue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })}

            {(data.categories || []).length === 0 && (
                <p style={{ color: '#6b6b7b', textAlign: 'center', fontSize: '14px', marginTop: '24px' }}>
                    No hay productos activos en inventario
                </p>
            )}
        </>
    );
};

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

type TabKey = 'cxc' | 'cxp' | 'inventory';

const AgingReportPage = () => {
    const [activeTab, setActiveTab] = useState<TabKey>('cxc');
    const [cxcData, setCxcData] = useState<any>(null);
    const [cxpData, setCxpData] = useState<any>(null);
    const [inventoryData, setInventoryData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchCxC = async () => {
        try {
            setLoading(true);
            setError('');
            const result = await accountingApi.getAgingReport();
            setCxcData(result);
        } catch (err) {
            logError(err, '/accounting/reports/aging');
            setError('Error al generar el reporte de Cuentas por Cobrar.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCxP = async () => {
        try {
            setLoading(true);
            setError('');
            const result = await accountingApi.getPayablesAging();
            setCxpData(result);
        } catch (err) {
            logError(err, '/accounting/reports/aging/payables');
            setError('Error al generar el reporte de Cuentas por Pagar.');
        } finally {
            setLoading(false);
        }
    };

    const fetchInventory = async () => {
        try {
            setLoading(true);
            setError('');
            const result = await accountingApi.getInventoryValuation();
            setInventoryData(result);
        } catch (err) {
            logError(err, '/accounting/reports/aging/inventory');
            setError('Error al generar la valoracion de inventario.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentTab = () => {
        if (activeTab === 'cxc') fetchCxC();
        else if (activeTab === 'cxp') fetchCxP();
        else fetchInventory();
    };

    useEffect(() => {
        fetchCxC(); // Load CxC by default
    }, []);

    useEffect(() => {
        // Lazy-load tabs when first selected
        if (activeTab === 'cxp' && !cxpData) fetchCxP();
        if (activeTab === 'inventory' && !inventoryData) fetchInventory();
    }, [activeTab]);

    const handleExport = async () => {
        try {
            const exportMap: Record<TabKey, string> = {
                cxc: 'aging-receivables',
                cxp: 'aging-payables',
                inventory: 'inventory-valuation',
            };
            await accountingApi.exportToExcel(exportMap[activeTab], {});
        } catch (err) {
            logError(err, 'export-aging');
            setError('Error al exportar a Excel.');
        }
    };

    const tabAccents: Record<TabKey, string> = {
        cxc: '#f0b429',
        cxp: '#fb923c',
        inventory: '#818cf8',
    };

    return (
        <div className="page-container">
            <PageHeader title="Cartera y Valoracion" icon={<FiClock />} />

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <Button variant="primary" icon={<FiRefreshCcw />} onClick={fetchCurrentTab}>Actualizar</Button>
                <Button variant="secondary" icon={<FiDownload />} onClick={handleExport}>Exportar Excel</Button>
            </div>

            {error && <p style={{ color: '#f87171', fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>{error}</p>}

            {/* Tab Bar */}
            <div style={{
                display: 'flex', borderBottom: '1px solid #2a2a35', marginBottom: '24px',
                backgroundColor: '#1a1a24', borderRadius: '12px 12px 0 0', overflow: 'hidden',
            }}>
                <button id="tab-cxc" style={tabStyle(activeTab === 'cxc', tabAccents.cxc)} onClick={() => setActiveTab('cxc')}>
                    <FiDollarSign size={16} /> Cuentas x Cobrar (CxC)
                </button>
                <button id="tab-cxp" style={tabStyle(activeTab === 'cxp', tabAccents.cxp)} onClick={() => setActiveTab('cxp')}>
                    <FiCreditCard size={16} /> Cuentas x Pagar (CxP)
                </button>
                <button id="tab-inventory" style={tabStyle(activeTab === 'inventory', tabAccents.inventory)} onClick={() => setActiveTab('inventory')}>
                    <FiPackage size={16} /> Valoracion Inventario
                </button>
            </div>

            {/* Tab Content */}
            {loading ? (
                <LoadingSpinner size="md" text="Generando reporte..." />
            ) : (
                <div style={{
                    backgroundColor: '#1a1a24', border: '1px solid #2a2a35',
                    borderRadius: '0 0 12px 12px', padding: '24px',
                }}>
                    {activeTab === 'cxc' && cxcData && <CxCTab data={cxcData} />}
                    {activeTab === 'cxp' && cxpData && <CxPTab data={cxpData} />}
                    {activeTab === 'inventory' && inventoryData && <InventoryTab data={inventoryData} />}

                    {/* Empty state when data hasn't loaded */}
                    {activeTab === 'cxc' && !cxcData && !loading && (
                        <p style={{ color: '#6b6b7b', textAlign: 'center', padding: '40px' }}>
                            Haz clic en "Actualizar" para cargar los datos.
                        </p>
                    )}
                    {activeTab === 'cxp' && !cxpData && !loading && (
                        <p style={{ color: '#6b6b7b', textAlign: 'center', padding: '40px' }}>
                            Haz clic en "Actualizar" para cargar los datos.
                        </p>
                    )}
                    {activeTab === 'inventory' && !inventoryData && !loading && (
                        <p style={{ color: '#6b6b7b', textAlign: 'center', padding: '40px' }}>
                            Haz clic en "Actualizar" para cargar los datos.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AgingReportPage;
