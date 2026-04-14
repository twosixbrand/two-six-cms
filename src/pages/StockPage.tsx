import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FiBox, FiEdit2 } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { SearchInput, LoadingSpinner, DataTable, Modal, FormField, Button } from '../components/ui';
import * as clothingSizeApi from '../services/clothingSizeApi';
import { logError } from '../services/errorApi';

const StockPage = () => {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [currentItem, setCurrentItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [pageSize, setPageSize] = useState(15);
    const [formData, setFormData] = useState({
        quantity_produced: 0,
        quantity_available: 0,
        quantity_sold: 0,
        quantity_on_consignment: 0,
        quantity_under_warranty: 0,
        quantity_minimum_alert: 0,
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await clothingSizeApi.getClothingSizes();
            setInventoryItems(data);
        } catch (err) {
            logError(err, '/stock');
            setError('Failed to fetch inventory. ' + err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (currentItem) {
            setFormData({
                quantity_produced: currentItem.quantity_produced || 0,
                quantity_available: currentItem.quantity_available || 0,
                quantity_sold: currentItem.quantity_sold || 0,
                quantity_on_consignment: currentItem.quantity_on_consignment || 0,
                quantity_under_warranty: currentItem.quantity_under_warranty || 0,
                quantity_minimum_alert: currentItem.quantity_minimum_alert || 0,
            });
        }
    }, [currentItem]);

    const filteredInventory = useMemo(() => {
        let items = inventoryItems;
        if (searchTerm) {
            const searchTermLower = searchTerm.toLowerCase();
            items = inventoryItems.filter(item => {
                const fieldsToSearch = [
                    item.clothingColor?.design?.reference,
                    item.clothingColor?.design?.clothing?.name,
                    item.clothingColor?.color?.name,
                    item.size?.name,
                    item.id.toString()
                ];
                return fieldsToSearch.some(field =>
                    field?.toLowerCase().includes(searchTermLower)
                );
            });
        }

        // Add pre-computed sort keys for DataTable internal sorting
        return items.map(item => ({
            ...item,
            sort_reference: item.clothingColor?.design?.reference || '',
            sort_product: item.clothingColor?.design?.clothing?.name || '',
            sort_variant: `${item.clothingColor?.color?.name || ''} ${item.size?.name || ''}`,
        }));
    }, [inventoryItems, searchTerm]);

    const handleSave = async () => {
        try {
            setError('');
            if (currentItem) {
                await clothingSizeApi.updateClothingSize(currentItem.id, {
                    ...formData,
                    id_size: currentItem.id_size,
                    id_clothing_color: currentItem.id_clothing_color,
                });
            }
            fetchData();
            setCurrentItem(null);
        } catch (err) {
            logError(err, '/stock-save');
            setError('Failed to update inventory. ' + err.message);
        }
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
    };

    const handleCancel = () => {
        setCurrentItem(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const columns = [
        {
            key: 'image',
            header: 'Imagen',
            render: (_: any, row: any) => {
                const imageUrl = row.clothingColor?.imageClothing?.[0]?.image_url;
                return (
                    <div style={{ width: 40, height: 40, borderRadius: 6, overflow: 'hidden', backgroundColor: '#13131a', border: '1px solid #2a2a35' }}>
                        {imageUrl ? (
                            <img src={imageUrl} alt="Prenda" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#6b6b7b' }}>N/A</div>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'sort_reference',
            header: 'Ref',
            render: (_: any, row: any) => row.clothingColor?.design?.reference || '-',
        },
        {
            key: 'sort_product',
            header: 'Producto',
            render: (_: any, row: any) => row.clothingColor?.design?.clothing?.name || '-',
        },
        {
            key: 'sort_variant',
            header: 'Variante',
            render: (_: any, row: any) => (
                <span style={{
                    background: 'rgba(240, 180, 41, 0.1)',
                    padding: '3px 8px',
                    borderRadius: 12,
                    fontSize: '0.85em',
                    color: '#f0b429',
                }}>
                    {row.clothingColor?.color?.name} / {row.size?.name}
                </span>
            ),
        },
        {
            key: 'quantity_produced',
            header: 'Producidos',
            align: 'right' as const,
        },
        {
            key: 'quantity_available',
            header: 'Disponibles',
            align: 'right' as const,
            render: (val: any, row: any) => (
                <span style={{
                    color: (row.quantity_minimum_alert !== null && val <= row.quantity_minimum_alert) ? '#f87171' : '#f1f1f3',
                    fontWeight: (row.quantity_minimum_alert !== null && val <= row.quantity_minimum_alert) ? 700 : 400,
                }}>
                    {val}
                </span>
            ),
        },
        {
            key: 'quantity_sold',
            header: 'Vendidos',
            align: 'right' as const,
        },
        {
            key: 'quantity_minimum_alert',
            header: 'Alerta',
            align: 'right' as const,
            render: (val: any) => val !== null ? val : '-',
        },
    ];

    return (
        <div className="page-container">
            <PageHeader title="Inventory Management" icon={<FiBox />}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search by ref, color, size..."
                    />
                </div>
            </PageHeader>
            {error && <p className="error-message">{error}</p>}

            <DataTable
                columns={columns}
                data={filteredInventory}
                loading={loading}
                emptyMessage="No stock records found."
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                actions={(row) => (
                    <Button variant="edit" size="sm" icon={<FiEdit2 />} onClick={() => handleEdit(row)}>
                        Editar
                    </Button>
                )}
            />

            <Modal
                isOpen={currentItem !== null}
                onClose={handleCancel}
                title="Editar Inventario"
                size="md"
                footer={
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                        <Button variant="primary" onClick={handleSave} type="submit">
                            Actualizar Inventario
                        </Button>
                        <Button variant="secondary" onClick={handleCancel}>
                            Cancelar
                        </Button>
                    </div>
                }
            >
                {currentItem && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{
                            padding: '0.85rem 1rem',
                            background: '#13131a',
                            borderRadius: 12,
                            border: '1px solid #2a2a35',
                            color: '#f1f1f3',
                            fontWeight: 500,
                        }}>
                            <span style={{ color: '#f0b429' }}>Variante: </span>
                            {currentItem.clothingColor?.design?.reference} ({currentItem.clothingColor?.color?.name} - {currentItem.size?.name})
                        </div>

                        <FormField label="Producidos" name="quantity_produced" type="number" value={formData.quantity_produced} onChange={handleChange} required />
                        <FormField label="Disponibles" name="quantity_available" type="number" value={formData.quantity_available} onChange={handleChange} required />
                        <FormField label="Vendidos" name="quantity_sold" type="number" value={formData.quantity_sold} onChange={handleChange} required />
                        <FormField label="En Consignacion" name="quantity_on_consignment" type="number" value={formData.quantity_on_consignment} onChange={handleChange} required />
                        <FormField label="En Garantia" name="quantity_under_warranty" type="number" value={formData.quantity_under_warranty} onChange={handleChange} required />

                        <div style={{ borderTop: '1px solid #2a2a35', paddingTop: '1rem', marginTop: '0.5rem' }}>
                            <FormField label="Alerta de Cantidad Minima" name="quantity_minimum_alert" type="number" value={formData.quantity_minimum_alert} onChange={handleChange} placeholder="Ej. 5" />
                            <small style={{ display: 'block', marginTop: '5px', color: '#a0a0b0' }}>Alertar cuando la cantidad baje de este umbral.</small>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default StockPage;
