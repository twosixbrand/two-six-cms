import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FiPackage, FiDownload, FiSearch, FiArrowUp, FiArrowDown, FiLayers, FiDollarSign, FiEye } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import { Button, LoadingSpinner, DataTable, Modal, StatusBadge } from '../../components/ui';
import * as inventoryApi from '../../services/inventoryApi';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';
import { formatDate, formatDateTime } from '../../utils/dateFormat';

/* ───────────────── helpers ───────────────── */

const currencyCO = (v: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

const sourceLabels: Record<string, string> = {
    SALE: 'Venta',
    ADJUSTMENT: 'Ajuste',
    PURCHASE: 'Compra',
    RETURN: 'Devolución',
    CONSIGNMENT_DISPATCH: 'Despacho Consignación',
    CONSIGNMENT_RETURN: 'Devolución Consignación',
    CONSIGNMENT_SELLOUT: 'Sell-out Consignación',
};

const sourceColors: Record<string, string> = {
    SALE: '#60a5fa',
    ADJUSTMENT: '#fbbf24',
    PURCHASE: '#34d399',
    RETURN: '#f87171',
    CONSIGNMENT_DISPATCH: '#c084fc',
    CONSIGNMENT_RETURN: '#fb923c',
    CONSIGNMENT_SELLOUT: '#38bdf8',
};

/* ───────────────── KPI Card ───────────────── */

const KpiCard = ({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string | number; accent: string }) => (
    <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16162a 100%)',
        border: '1px solid #2a2a40',
        borderRadius: 16,
        padding: '1.25rem 1.5rem',
        flex: '1 1 200px',
        minWidth: 180,
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transition: 'transform .15s, box-shadow .15s',
    }}>
        <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `${accent}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: accent,
            fontSize: 20,
            flexShrink: 0,
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '0.78rem', color: '#8888a0', letterSpacing: '.03em', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f1f1f3' }}>{value}</div>
        </div>
    </div>
);

/* ───────────────── filter chips ───────────────── */

const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        style={{
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: '0.82rem',
            fontWeight: 500,
            cursor: 'pointer',
            border: active ? '1px solid #f0b429' : '1px solid #2a2a40',
            background: active ? 'rgba(240,180,41,.14)' : 'transparent',
            color: active ? '#f0b429' : '#a0a0b0',
            transition: 'all .15s',
        }}
    >
        {label}
    </button>
);

/* ───────────────── Component ───────────────── */

const InventoryKardexPage = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [sourceFilter, setSourceFilter] = useState('');
    const [pageSize, setPageSize] = useState(20);
    const [detailItem, setDetailItem] = useState<any | null>(null);
    const [detailKardex, setDetailKardex] = useState<any[]>([]);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const result = await inventoryApi.getKardexAll({
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                type: typeFilter || undefined,
                sourceType: sourceFilter || undefined,
                search: searchTerm || undefined,
            });
            setData(result);
        } catch (err) {
            logError(err, 'kardex-page');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, typeFilter, sourceFilter, searchTerm]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /* ── KPIs ── */
    const kpis = useMemo(() => {
        const totalMovements = data.length;
        let totalEntradas = 0;
        let totalSalidas = 0;
        let valorCostoMovido = 0;
        for (const m of data) {
            const absQty = Math.abs(m.quantity || 0);
            if (m.type === 'ENTRADA' || m.type === 'IN') totalEntradas += absQty;
            if (m.type === 'SALIDA' || m.type === 'OUT') totalSalidas += absQty;
            valorCostoMovido += absQty * (m.unit_cost || 0);
        }
        return { totalMovements, totalEntradas, totalSalidas, valorCostoMovido };
    }, [data]);

    /* ── Sources únicas para filtro ── */
    const uniqueSources = useMemo(() => {
        const set = new Set<string>();
        for (const m of data) if (m.source_type) set.add(m.source_type);
        return Array.from(set).sort();
    }, [data]);

    /* ── Detail modal ── */
    const openDetail = async (row: any) => {
        setDetailItem(row);
        setDetailLoading(true);
        try {
            const csId = row.id_clothing_size || row.clothingSize?.id;
            if (csId) {
                const items = await inventoryApi.getKardex(csId);
                setDetailKardex(items);
            }
        } catch (err) {
            logError(err, 'kardex-detail');
        } finally {
            setDetailLoading(false);
        }
    };

    /* ── Export ── */
    const handleExport = () => {
        const params: Record<string, string> = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (typeFilter) params.type = typeFilter;
        if (sourceFilter) params.sourceType = sourceFilter;
        if (searchTerm) params.search = searchTerm;
        accountingApi.exportToExcel('kardex', params);
    };

    /* ── Table columns ── */
    const columns = [
        {
            key: 'date',
            header: 'Fecha',
            render: (val: any) => (
                <span style={{ fontSize: '0.85em', whiteSpace: 'nowrap' }}>{formatDate(val)}</span>
            ),
        },
        {
            key: 'clothingSize',
            header: 'Producto',
            render: (_: any, row: any) => {
                const cs = row.clothingSize;
                const cc = cs?.clothingColor;
                const design = cc?.design;
                const imgUrl = cc?.imageClothing?.[0]?.image_url;
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 8, overflow: 'hidden',
                            backgroundColor: '#13131a', border: '1px solid #2a2a35', flexShrink: 0,
                        }}>
                            {imgUrl ? (
                                <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#6b6b7b' }}>N/A</div>
                            )}
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.88em', color: '#f0b429' }}>{design?.reference || '—'}</div>
                            <div style={{ fontSize: '0.8em', color: '#a0a0b0' }}>{design?.clothing?.name || '—'}</div>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'variant',
            header: 'Variante',
            render: (_: any, row: any) => {
                const cs = row.clothingSize;
                return (
                    <span style={{
                        background: 'rgba(240,180,41,.1)',
                        padding: '3px 10px',
                        borderRadius: 12,
                        fontSize: '0.82em',
                        color: '#f0b429',
                    }}>
                        {cs?.clothingColor?.color?.name || '?'} / {cs?.size?.name || '?'}
                    </span>
                );
            },
        },
        {
            key: 'type',
            header: 'Tipo',
            render: (val: any) => {
                const isEntrada = val === 'ENTRADA' || val === 'IN';
                return (
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        color: isEntrada ? '#34d399' : '#f87171',
                        fontWeight: 600, fontSize: '0.85em',
                    }}>
                        {isEntrada ? <FiArrowDown size={14} /> : <FiArrowUp size={14} />}
                        {val}
                    </span>
                );
            },
        },
        {
            key: 'source_type',
            header: 'Origen',
            render: (val: any) => (
                <span style={{
                    padding: '3px 10px',
                    borderRadius: 12,
                    fontSize: '0.8em',
                    fontWeight: 600,
                    background: `${sourceColors[val] || '#6b6b7b'}20`,
                    color: sourceColors[val] || '#a0a0b0',
                    whiteSpace: 'nowrap',
                }}>
                    {sourceLabels[val] || val}
                </span>
            ),
        },
        {
            key: 'source_id',
            header: 'Ref.',
            align: 'center' as const,
            render: (val: any) => val ? <span style={{ color: '#a0a0b0', fontSize: '0.85em' }}>#{val}</span> : '—',
        },
        {
            key: 'quantity',
            header: 'Cant.',
            align: 'right' as const,
            render: (val: any) => (
                <span style={{ fontWeight: 700, color: val < 0 ? '#f87171' : val > 0 ? '#34d399' : '#f1f1f3' }}>
                    {val > 0 ? `+${val}` : val}
                </span>
            ),
        },
        {
            key: 'balance_before',
            header: 'Antes',
            align: 'right' as const,
            render: (val: any) => <span style={{ color: '#a0a0b0', fontSize: '0.85em' }}>{val ?? '—'}</span>,
        },
        {
            key: 'balance_after',
            header: 'Después',
            align: 'right' as const,
            render: (val: any) => <span style={{ fontWeight: 600 }}>{val ?? '—'}</span>,
        },
        {
            key: 'unit_cost',
            header: 'Costo Unit.',
            align: 'right' as const,
            render: (val: any) => <span style={{ fontSize: '0.85em' }}>{val ? currencyCO(val) : '—'}</span>,
        },
    ];

    return (
        <div className="page-container">
            <PageHeader
                title="Kardex de Inventario"
                subtitle="Historial completo de movimientos de stock — entradas, salidas, ajustes y ventas"
                icon={<FiPackage />}
            >
                <Button variant="secondary" icon={<FiDownload />} onClick={handleExport}>
                    Exportar Excel
                </Button>
            </PageHeader>

            {/* ── Filtros ── */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20, alignItems: 'center',
            }}>
                <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 320 }}>
                    <FiSearch size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b6b7b' }} />
                    <input
                        id="kardex-search"
                        type="text"
                        placeholder="Buscar ref, producto, color, talla…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Buscar movimientos"
                        style={{
                            width: '100%',
                            padding: '10px 12px 10px 38px',
                            background: '#13131a',
                            border: '1px solid #2a2a40',
                            borderRadius: 10,
                            color: '#f1f1f3',
                            fontSize: '0.88rem',
                            outline: 'none',
                        }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <label style={{ fontSize: '0.8rem', color: '#8888a0', whiteSpace: 'nowrap' }}>Desde</label>
                    <input
                        id="kardex-start-date"
                        type="text"
                        placeholder="YYYY-MM-DD"
                        inputMode="numeric"
                        maxLength={10}
                        pattern="\d{4}-\d{2}-\d{2}"
                        value={startDate}
                        aria-label="Fecha Desde"
                        onChange={(e) => {
                            const digits = e.target.value.replace(/[^0-9]/g, '');
                            let formatted = '';
                            for (let i = 0; i < digits.length && i < 8; i++) {
                                if (i === 4 || i === 6) formatted += '-';
                                formatted += digits[i];
                            }
                            setStartDate(formatted);
                        }}
                        style={{
                            width: 140,
                            padding: '10px 12px', background: '#13131a', border: '1px solid #2a2a40',
                            borderRadius: 10, color: '#f1f1f3', fontSize: '0.88rem', outline: 'none',
                        }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <label style={{ fontSize: '0.8rem', color: '#8888a0', whiteSpace: 'nowrap' }}>Hasta</label>
                    <input
                        id="kardex-end-date"
                        type="text"
                        placeholder="YYYY-MM-DD"
                        inputMode="numeric"
                        maxLength={10}
                        pattern="\d{4}-\d{2}-\d{2}"
                        value={endDate}
                        aria-label="Fecha Hasta"
                        onChange={(e) => {
                            const digits = e.target.value.replace(/[^0-9]/g, '');
                            let formatted = '';
                            for (let i = 0; i < digits.length && i < 8; i++) {
                                if (i === 4 || i === 6) formatted += '-';
                                formatted += digits[i];
                            }
                            setEndDate(formatted);
                        }}
                        style={{
                            width: 140,
                            padding: '10px 12px', background: '#13131a', border: '1px solid #2a2a40',
                            borderRadius: 10, color: '#f1f1f3', fontSize: '0.88rem', outline: 'none',
                        }}
                    />
                </div>
            </div>

            {/* ── Chips de tipo ── */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <Chip label="Todos" active={!typeFilter} onClick={() => setTypeFilter('')} />
                <Chip label="↗ Entradas" active={typeFilter === 'ENTRADA'} onClick={() => setTypeFilter(typeFilter === 'ENTRADA' ? '' : 'ENTRADA')} />
                <Chip label="↘ Salidas" active={typeFilter === 'SALIDA'} onClick={() => setTypeFilter(typeFilter === 'SALIDA' ? '' : 'SALIDA')} />
                <div style={{ width: 1, background: '#2a2a40', margin: '0 4px' }} />
                <Chip label="Todos los orígenes" active={!sourceFilter} onClick={() => setSourceFilter('')} />
                {uniqueSources.map(s => (
                    <Chip key={s} label={sourceLabels[s] || s} active={sourceFilter === s} onClick={() => setSourceFilter(sourceFilter === s ? '' : s)} />
                ))}
            </div>

            {/* ── KPIs ── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                <KpiCard icon={<FiLayers />} label="Total Movimientos" value={kpis.totalMovements} accent="#60a5fa" />
                <KpiCard icon={<FiArrowDown />} label="Total Entradas" value={kpis.totalEntradas} accent="#34d399" />
                <KpiCard icon={<FiArrowUp />} label="Total Salidas" value={kpis.totalSalidas} accent="#f87171" />
                <KpiCard icon={<FiDollarSign />} label="Valor Costo Movido" value={currencyCO(kpis.valorCostoMovido)} accent="#fbbf24" />
            </div>

            {/* ── Tabla ── */}
            {loading ? <LoadingSpinner size="lg" text="Cargando movimientos…" /> : (
                <DataTable
                    columns={columns}
                    data={data}
                    emptyMessage="No se encontraron movimientos de inventario."
                    pageSize={pageSize}
                    onPageSizeChange={setPageSize}
                    rowTestId="kardex-row"
                    actions={(row: any) => (
                        <Button variant="ghost" size="sm" icon={<FiEye />} onClick={() => openDetail(row)} />
                    )}
                />
            )}

            {/* ── Modal Detalle ── */}
            <Modal
                isOpen={!!detailItem}
                onClose={() => { setDetailItem(null); setDetailKardex([]); }}
                title={detailItem ? `Kardex — ${detailItem.clothingSize?.clothingColor?.design?.reference || '?'} (${detailItem.clothingSize?.clothingColor?.color?.name || '?'} / ${detailItem.clothingSize?.size?.name || '?'})` : ''}
                size="lg"
            >
                {detailItem && (
                    <div>
                        {/* Product info */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 16,
                            padding: '1rem', background: '#13131a', borderRadius: 12,
                            border: '1px solid #2a2a35', marginBottom: 20,
                        }}>
                            <div style={{
                                width: 60, height: 60, borderRadius: 10, overflow: 'hidden',
                                backgroundColor: '#0d0d14', border: '1px solid #2a2a35', flexShrink: 0,
                            }}>
                                {detailItem.clothingSize?.clothingColor?.imageClothing?.[0]?.image_url ? (
                                    <img
                                        src={detailItem.clothingSize.clothingColor.imageClothing[0].image_url}
                                        alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#6b6b7b' }}>N/A</div>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0b429' }}>
                                    {detailItem.clothingSize?.clothingColor?.design?.reference}
                                </div>
                                <div style={{ color: '#a0a0b0', fontSize: '0.9rem' }}>
                                    {detailItem.clothingSize?.clothingColor?.design?.clothing?.name} — {detailItem.clothingSize?.clothingColor?.color?.name} / {detailItem.clothingSize?.size?.name}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.78rem', color: '#8888a0' }}>Stock Actual</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f1f3' }}>
                                    {detailItem.clothingSize?.quantity_available ?? '—'}
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        {detailLoading ? <LoadingSpinner text="Cargando historial…" /> : (
                            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #2a2a40' }}>
                                            <th style={{ textAlign: 'left', padding: '8px 6px', color: '#8888a0', fontWeight: 500 }}>Fecha</th>
                                            <th style={{ textAlign: 'left', padding: '8px 6px', color: '#8888a0', fontWeight: 500 }}>Tipo</th>
                                            <th style={{ textAlign: 'left', padding: '8px 6px', color: '#8888a0', fontWeight: 500 }}>Origen</th>
                                            <th style={{ textAlign: 'right', padding: '8px 6px', color: '#8888a0', fontWeight: 500 }}>Cant.</th>
                                            <th style={{ textAlign: 'right', padding: '8px 6px', color: '#8888a0', fontWeight: 500 }}>Saldo</th>
                                            <th style={{ textAlign: 'left', padding: '8px 6px', color: '#8888a0', fontWeight: 500 }}>Descripción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detailKardex.map((k: any, i: number) => (
                                            <tr key={k.id || i} style={{ borderBottom: '1px solid #1e1e30' }}>
                                                <td style={{ padding: '8px 6px', whiteSpace: 'nowrap' }}>{formatDate(k.date)}</td>
                                                <td style={{ padding: '8px 6px' }}>
                                                    <span style={{
                                                        color: (k.type === 'ENTRADA' || k.type === 'IN') ? '#34d399' : '#f87171',
                                                        fontWeight: 600,
                                                    }}>
                                                        {k.type}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '8px 6px' }}>
                                                    <span style={{
                                                        padding: '2px 8px', borderRadius: 10, fontSize: '0.8em',
                                                        background: `${sourceColors[k.source_type] || '#6b6b7b'}20`,
                                                        color: sourceColors[k.source_type] || '#a0a0b0',
                                                    }}>
                                                        {sourceLabels[k.source_type] || k.source_type}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 700, color: k.quantity < 0 ? '#f87171' : '#34d399' }}>
                                                    {k.quantity > 0 ? `+${k.quantity}` : k.quantity}
                                                </td>
                                                <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 600 }}>
                                                    {k.balance_after ?? '—'}
                                                </td>
                                                <td style={{ padding: '8px 6px', color: '#a0a0b0', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {k.description || '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {detailKardex.length === 0 && (
                                    <p style={{ textAlign: 'center', color: '#6b6b7b', padding: '2rem 0' }}>
                                        No hay movimientos registrados para esta variante.
                                    </p>
                                )}
                            </div>
                        )}

                        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button variant="primary" onClick={() => { setDetailItem(null); setDetailKardex([]); }}>
                                Cerrar
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default InventoryKardexPage;
