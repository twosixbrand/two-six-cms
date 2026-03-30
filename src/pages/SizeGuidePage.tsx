import React, { useState, useEffect } from 'react';
import { FiGrid, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Modal, FormField, Button, LoadingSpinner } from '../components/ui';
import {
    getSizeGuides,
    createSizeGuide,
    updateSizeGuide,
    deleteSizeGuide,
} from '../services/sizeGuideApi';
import { logError } from '../services/errorApi';

const SizeGuidePage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [form, setForm] = useState({ size: '', width: '', length: '' });

    const fetchItems = async () => {
        try {
            setLoading(true);
            const data = await getSizeGuides();
            setItems(data);
            setError('');
        } catch (err) {
            logError(err, '/size-guide');
            setError('No se pudieron cargar las medidas de la guia.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const openCreateModal = () => {
        setEditingItem(null);
        setForm({ size: '', width: '', length: '' });
        setShowModal(true);
    };

    const openEditModal = (item: any) => {
        setEditingItem(item);
        setForm({
            size: item.size || '',
            width: item.width || '',
            length: item.length || '',
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            if (editingItem) {
                await updateSizeGuide(editingItem.id, form);
            } else {
                await createSizeGuide(form);
            }
            setShowModal(false);
            fetchItems();
        } catch (err) {
            logError(err, '/size-guide');
            setError('Hubo un problema al guardar la medida: ' + err.message);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Eliminar medida',
            text: 'Estas seguro de eliminar esta medida?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f0b429',
            cancelButtonColor: '#2a2a35',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
        });
        if (!result.isConfirmed) return;
        try {
            await deleteSizeGuide(id);
            fetchItems();
        } catch (err) {
            logError(err, '/size-guide');
            setError('No se pudo eliminar la medida.');
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const columns = [
        { key: 'id', header: 'ID', width: '60px' },
        {
            key: 'size',
            header: 'Talla',
            render: (val: any) => <strong>{val}</strong>,
        },
        { key: 'width', header: 'Ancho (cm)' },
        { key: 'length', header: 'Largo (cm)' },
    ];

    return (
        <div className="page-container">
            <PageHeader title="Guia de Tallas" icon={<FiGrid />}>
                <Button variant="primary" icon={<FiPlus />} onClick={openCreateModal}>
                    Nueva Medida
                </Button>
            </PageHeader>
            {error && <p className="error-message">{error}</p>}

            <DataTable
                columns={columns}
                data={items}
                loading={loading}
                emptyMessage="No hay medidas registradas."
                actions={(row) => (
                    <>
                        <Button variant="ghost" size="sm" icon={<FiEdit2 />} onClick={() => openEditModal(row)}>
                            {''}
                        </Button>
                        <Button variant="destructive" size="sm" icon={<FiTrash2 />} onClick={() => handleDelete(row.id)}>
                            {''}
                        </Button>
                    </>
                )}
            />

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingItem ? 'Editar Medida de Talla' : 'Nueva Medida de Talla'}
                size="sm"
                footer={
                    <Button variant="primary" onClick={handleSave} disabled={!form.size || !form.width || !form.length}>
                        {editingItem ? 'Actualizar' : 'Crear'}
                    </Button>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {editingItem && (
                        <FormField label="ID" name="id" type="text" value={editingItem.id} onChange={() => {}} disabled />
                    )}
                    <FormField label="Talla (Letra o Nombre)" name="size" type="text" value={form.size} onChange={handleChange} placeholder="Ej: M, XL, U (Unica)" required />
                    <FormField label="Ancho de Pecho (cm)" name="width" type="text" value={form.width} onChange={handleChange} placeholder="Ej: 53" required />
                    <FormField label="Largo Total (cm)" name="length" type="text" value={form.length} onChange={handleChange} placeholder="Ej: 72" required />
                </div>
            </Modal>
        </div>
    );
};

export default SizeGuidePage;
