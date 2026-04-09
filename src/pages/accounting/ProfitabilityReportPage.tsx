import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiRefreshCcw, FiDownload, FiLayers, FiTag, FiDollarSign } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import { Button, DataTable, LoadingSpinner, StatusBadge } from '../../components/ui';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const ProfitabilityReportPage = () => {
    const [activeTab, setActiveTab] = useState<'collection' | 'design'>('collection');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    
    // Filtros
    const now = new Date();
    const [startDate, setStartDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(now.toISOString().split('T')[0]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = activeTab === 'collection' 
                ? await accountingApi.getProfitabilityByCollection(startDate, endDate)
                : await accountingApi.getProfitabilityByDesign(startDate, endDate);
            setData(result);
        } catch (err) {
            logError(err, 'profitability-report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

    const getMarginVariant = (margin: number) => {
        if (margin >= 40) return 'success';
        if (margin >= 20) return 'info';
        if (margin > 0) return 'warning';
        return 'error';
    };

    const columns = [
        { 
            key: 'name', 
            header: activeTab === 'collection' ? 'Colección' : 'Diseño',
            render: (val: any, row: any) => (
                <div>
                    <div style={{ fontWeight: 700, color: '#f1f1f3' }}>{val}</div>
                    {activeTab === 'design' && <div style={{ fontSize: '11px', color: '#6b6b7b' }}>{row.collection}</div>}
                </div>
            )
        },
        { key: 'qtySold', header: 'Cant. Vendida', align: 'center' as const },
        { 
            key: 'grossRevenue', 
            header: 'Ingreso Bruto', 
            align: 'right' as const,
            render: (val: any) => formatCurrency(val)
        },
        { 
            key: 'manufacturedCost', 
            header: 'Costo Fab.', 
            align: 'right' as const,
            render: (val: any) => <span style={{ color: '#f87171' }}>-{formatCurrency(val)}</span>
        },
        { 
            key: 'gatewayCommissions', 
            header: 'Comisiones/Imp', 
            align: 'right' as const,
            render: (_val: any, row: any) => <span style={{ color: '#f87171' }}>-{formatCurrency(row.gatewayCommissions + row.taxes)}</span>
        },
        { 
            key: 'netProfit', 
            header: 'Utilidad Real', 
            align: 'right' as const,
            render: (val: any) => <strong style={{ color: val > 0 ? '#10b981' : '#f87171' }}>{formatCurrency(val)}</strong>
        },
        { 
            key: 'marginPercentage', 
            header: 'Margen', 
            align: 'center' as const,
            render: (val: any) => (
                <StatusBadge 
                    status={`${val.toFixed(1)}%`} 
                    variant={getMarginVariant(val)} 
                    size="sm" 
                />
            )
        }
    ];

    return (
        <div className="page-container">
            <PageHeader 
                title="Análisis de Rentabilidad Real" 
                subtitle="Margen neto tras descontar manufactura, pasarelas e impuestos"
                icon={<FiTrendingUp />} 
            />

            <div style={{ marginBottom: '24px', display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#a0a0b0', marginBottom: '4px' }}>Desde</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-control" style={{ width: '160px' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#a0a0b0', marginBottom: '4px' }}>Hasta</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-control" style={{ width: '160px' }} />
                </div>
                <Button variant="primary" icon={<FiRefreshCcw />} onClick={fetchData}>Actualizar Análisis</Button>
                <Button variant="secondary" icon={<FiDownload />} onClick={() => accountingApi.exportToExcel('profitability', { startDate, endDate, type: activeTab })}>Exportar</Button>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid #2a2a35', marginBottom: '24px' }}>
                <button 
                    style={{ 
                        padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer',
                        borderBottom: activeTab === 'collection' ? '2px solid #38bdf8' : 'none',
                        color: activeTab === 'collection' ? '#38bdf8' : '#6b6b7b'
                    }}
                    onClick={() => setActiveTab('collection')}
                >
                    <FiLayers style={{ marginRight: '8px' }} /> Por Colección
                </button>
                <button 
                    style={{ 
                        padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer',
                        borderBottom: activeTab === 'design' ? '2px solid #38bdf8' : 'none',
                        color: activeTab === 'design' ? '#38bdf8' : '#6b6b7b'
                    }}
                    onClick={() => setActiveTab('design')}
                >
                    <FiTag style={{ marginRight: '8px' }} /> Por Diseño Detallado
                </button>
            </div>

            {loading ? <LoadingSpinner size="lg" /> : (
                <DataTable 
                    columns={columns} 
                    data={data} 
                    emptyMessage="No se encontraron ventas para el periodo seleccionado."
                />
            )}

            <div style={{ marginTop: '24px', padding: '20px', background: '#13131a', borderRadius: '12px', border: '1px solid #2a2a35' }}>
                <h4 style={{ color: '#f1f1f3', marginBottom: '10px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiDollarSign /> Nota sobre el cálculo
                </h4>
                <p style={{ color: '#6b6b7b', fontSize: '0.85rem', margin: 0 }}>
                    La utilidad real mostrada es una aproximación contable que descuenta: (1) Costo de fabricación parametrizado en el diseño, 
                    (2) Comisión estimada de pasarela Wompi (3.49% + $900), y (3) Retenciones de ICA y Autorretención de Renta causadas por la venta.
                </p>
            </div>
        </div>
    );
};

export default ProfitabilityReportPage;
