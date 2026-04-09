import React, { useState, useEffect } from 'react';
import { FiPackage, FiPlus, FiList, FiAlertCircle, FiSearch } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../../components/common/PageHeader';
import { Button, LoadingSpinner, DataTable, Modal, FormField, StatusBadge } from '../../components/ui';
import * as inventoryApi from '../../services/inventoryApi';
import * as clothingSizeApi from '../../services/clothingSizeApi'; // Asumimos que existe para buscar productos
import { logError } from '../../services/errorApi';

const reasons = [
    { value: 'MERMA', label: 'Merma / Deterioro' },
    { value: 'REGALO', label: 'Regalo / Muestra Comercial' },
    { value: 'SOBRANTE', label: 'Sobrante de Inventario' },
    { value: 'ERROR_CONTEO', label: 'Error de Conteo' },
];

const InventoryAdjustmentPage = () => {
    const [adjustments, setAdjustments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [form, setForm] = useState({
        reason: 'MERMA',
        description: '',
        items: [{ clothingSizeId: '', quantity: 0 }]
    });

    const [products, setProducts] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await inventoryApi.getAdjustments();
            setAdjustments(data);
            
            // Cargar productos para el selector (esto podría ser una búsqueda dinámica en producción)
            // Aquí cargamos una muestra o el api de búsqueda
            // const productsData = await clothingSizeApi.getAll(); 
            // setProducts(productsData);
        } catch (err) {
            logError(err, 'inventory-adjustments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddItem = () => {
        setForm({ ...form, items: [...form.items, { clothingSizeId: '', quantity: 0 }] });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const payload = {
                ...form,
                items: form.items.map(i => ({
                    clothingSizeId: parseInt(i.clothingSizeId),
                    quantity: parseInt(i.quantity as any)
                }))
            };
            await inventoryApi.createAdjustment(payload);
            Swal.fire('Éxito', 'Ajuste de inventario procesado correctamente.', 'success');
            setShowModal(false);
            fetchData();
        } catch (err) {
            logError(err, 'save-adjustment');
            Swal.fire('Error', 'No se pudo procesar el ajuste.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        { key: 'adjustment_date', header: 'Fecha', render: (val: any) => new Date(val).toLocaleString('es-CO') },
        { 
            key: 'reason', 
            header: 'Motivo', 
            render: (val: any) => {
                const r = reasons.find(x => x.value === val);
                return <StatusBadge status={r?.label || val} variant="info" size="sm" />;
            }
        },
        { key: 'description', header: 'Descripción' },
        { 
            key: 'items', 
            header: 'Items', 
            render: (val: any) => `${val?.length || 0} productos afectados` 
        },
        { key: 'status', header: 'Estado', render: (val: any) => <StatusBadge status={val} variant="success" size="sm" /> }
    ];

    return (
        <div className="page-container">
            <PageHeader 
                title="Ajustes de Inventario" 
                subtitle="Gestión de mermas, regalos y auditoría de stock"
                icon={<FiPackage />} 
            />

            <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
                <Button variant="primary" icon={<FiPlus />} onClick={() => setShowModal(true)}>
                    Nuevo Ajuste
                </Button>
            </div>

            {loading ? <LoadingSpinner size="lg" /> : (
                <DataTable 
                    columns={columns} 
                    data={adjustments} 
                    emptyMessage="No se han registrado ajustes de inventario."
                />
            )}

            <Modal show={showModal} onClose={() => setShowModal(false)} title="Crear Ajuste de Inventario" size="lg">
                <form onSubmit={handleSave}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <FormField label="Motivo del Ajuste" required>
                            <select 
                                className="form-control"
                                value={form.reason}
                                onChange={(e) => setForm({...form, reason: e.target.value})}
                                required
                            >
                                {reasons.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Descripción / Observación">
                            <input 
                                className="form-control"
                                value={form.description}
                                onChange={(e) => setForm({...form, description: e.target.value})}
                                placeholder="Ej: Influencer @pau_fitness, Merma por daño en costura"
                            />
                        </FormField>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <h4 style={{ marginBottom: '12px', fontSize: '0.9rem', color: '#f1f1f3' }}>Productos a Ajustar</h4>
                        {form.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 40px', gap: '10px', marginBottom: '10px' }}>
                                <input 
                                    className="form-control"
                                    type="number"
                                    placeholder="ID de Producto (Size ID)"
                                    value={item.clothingSizeId}
                                    onChange={(e) => {
                                        const newItems = [...form.items];
                                        newItems[idx].clothingSizeId = e.target.value;
                                        setForm({...form, items: newItems});
                                    }}
                                    required
                                />
                                <input 
                                    className="form-control"
                                    type="number"
                                    placeholder="Cantidad (+/-)"
                                    value={item.quantity}
                                    onChange={(e) => {
                                        const newItems = [...form.items];
                                        newItems[idx].quantity = e.target.value as any;
                                        setForm({...form, items: newItems});
                                    }}
                                    required
                                />
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setForm({...form, items: form.items.filter((_, i) => i !== idx)})}
                                    disabled={form.items.length === 1}
                                >
                                    <FiTrash2 size={16} />
                                </Button>
                            </div>
                        ))}
                        <Button variant="ghost" size="sm" icon={<FiPlus />} onClick={handleAddItem}>
                            Añadir otro producto
                        </Button>
                    </div>

                    <div style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button variant="primary" type="submit" loading={saving}>Procesar Ajuste</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const FiTrash2 = ({ size }: { size: number }) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height={size} width={size} xmlns="http://www.w3.org/2000/svg">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

export default InventoryAdjustmentPage;
