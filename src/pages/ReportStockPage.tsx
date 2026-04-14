import React, { useState, useEffect, useMemo } from 'react';
import { FiDatabase, FiBox, FiTag, FiBarChart2 } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { LoadingSpinner, DataTable, Button } from '../components/ui';
import * as clothingSizeApi from '../services/clothingSizeApi';
import { logError } from '../services/errorApi';
import './ReportStockPage.css';

const ReportStockPage = () => {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await clothingSizeApi.getClothingSizes();
            setInventoryItems(data);
        } catch (err) {
            logError(err, '/reports/stock');
            setError('Error al obtener datos de inventario. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const totals = useMemo(() => {
        const totalItems = inventoryItems.reduce((acc, item) => acc + (item.quantity_available || 0), 0);
        
        // Group by Design (Reference)
        const designMap = new Map();
        // Group by Variant (Color + Size - essentially each row, but we ensure uniqueness per reference+color+size)
        const variantList = inventoryItems.map(item => ({
            reference: item.clothingColor?.design?.reference || 'N/A',
            product: item.clothingColor?.design?.clothing?.name || 'N/A',
            color: item.clothingColor?.color?.name || 'N/A',
            size: item.size?.name || 'N/A',
            available: item.quantity_available || 0,
            produced: item.quantity_produced || 0,
            sold: item.quantity_sold || 0,
        }));

        inventoryItems.forEach(item => {
            const ref = item.clothingColor?.design?.reference || 'Desconocido';
            const productName = item.clothingColor?.design?.clothing?.name || 'Desconocido';
            const available = item.quantity_available || 0;

            if (!designMap.has(ref)) {
                designMap.set(ref, { 
                    reference: ref, 
                    productName, 
                    total_available: 0,
                    variants_count: 0
                });
            }
            const current = designMap.get(ref);
            current.total_available += available;
            current.variants_count += 1;
        });

        return {
            totalGeneral: totalItems,
            totalDesigns: designMap.size,
            byDesign: Array.from(designMap.values()).sort((a, b) => b.total_available - a.total_available),
            byVariant: variantList.sort((a, b) => a.reference.localeCompare(b.reference))
        };
    }, [inventoryItems]);

    const designColumns = [
        { key: 'reference', header: 'Referencia' },
        { key: 'productName', header: 'Producto' },
        { key: 'variants_count', header: 'Variantes', align: 'center' as const },
        { 
            key: 'total_available', 
            header: 'Disponible Total', 
            align: 'right' as const,
            render: (val: number) => <span style={{ fontWeight: 600, color: val > 0 ? '#f0b429' : '#6b6b7b' }}>{val}</span>
        },
    ];

    const variantColumns = [
        { key: 'reference', header: 'Ref' },
        { key: 'product', header: 'Producto' },
        { 
            key: 'variant', 
            header: 'Variante (Color / Talla)',
            render: (_: any, row: any) => `${row.color} / ${row.size}`
        },
        { key: 'produced', header: 'Producido', align: 'right' as const },
        { key: 'sold', header: 'Vendido', align: 'right' as const },
        { 
            key: 'available', 
            header: 'Disponible', 
            align: 'right' as const,
            render: (val: number) => <span style={{ fontWeight: 700, color: val > 0 ? '#f0b429' : '#6b6b7b' }}>{val}</span>
        },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
                <LoadingSpinner text="Generando reporte de inventario..." />
            </div>
        );
    }

    return (
        <div className="report-stock-container">
            <PageHeader title="Reporte Detallado de Stock" icon={<FiBarChart2 />} />

            {error && <p className="error-message">{error}</p>}

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-icon"><FiDatabase /></div>
                    <div className="kpi-info">
                        <h3>Total Pendas Disponibles</h3>
                        <p className="kpi-value">{totals.totalGeneral}</p>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon"><FiBox /></div>
                    <div className="kpi-info">
                        <h3>Diseños en Inventario</h3>
                        <p className="kpi-value">{totals.totalDesigns}</p>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon"><FiTag /></div>
                    <div className="kpi-info">
                        <h3>Total Variantes</h3>
                        <p className="kpi-value">{inventoryItems.length}</p>
                    </div>
                </div>
            </div>

            {/* Totales por Diseño */}
            <div className="report-section">
                <div className="section-header">
                    <h2>Resumen por Diseño</h2>
                </div>
                <div className="glass-panel">
                    <DataTable 
                        columns={designColumns} 
                        data={totals.byDesign} 
                        pageSize={10}
                    />
                </div>
            </div>

            {/* Detalle por Variante */}
            <div className="report-section">
                <div className="section-header">
                    <h2>Detalle por Variante</h2>
                </div>
                <div className="glass-panel">
                    <DataTable 
                        columns={variantColumns} 
                        data={totals.byVariant} 
                        pageSize={15}
                    />
                </div>
            </div>
        </div>
    );
};

export default ReportStockPage;
