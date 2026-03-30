import React, { useState, useEffect } from 'react';
import { FiGrid } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import SizeGuideForm from '../components/size-guide/SizeGuideForm';
import SizeGuideList from '../components/size-guide/SizeGuideList';
import { LoadingSpinner, ConfirmDialog } from '../components/ui';
import {
    getSizeGuides,
    createSizeGuide,
    updateSizeGuide,
    deleteSizeGuide,
} from '../services/sizeGuideApi';
import { logError } from '../services/errorApi';

const SizeGuidePage = () => {
    const [items, setItems] = useState([]);
    const [currentItem, setCurrentItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

    const fetchItems = async () => {
        try {
            setLoading(true);
            const data = await getSizeGuides();
            setItems(data);
            setError('');
        } catch (err) {
            logError(err, '/size-guide');
            setError('No se pudieron cargar las medidas de la guía.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSave = async (sizeGuideData) => {
        try {
            if (currentItem) {
                await updateSizeGuide(currentItem.id, sizeGuideData);
            } else {
                await createSizeGuide(sizeGuideData);
            }
            fetchItems();
            setCurrentItem(null);
        } catch (err) {
            logError(err, '/size-guide');
            setError('Hubo un problema al guardar la medida: ' + err.message);
        }
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
    };

    const handleCancelEdit = () => {
        setCurrentItem(null);
    };

    const handleDelete = (id) => {
        setDeleteConfirm({ open: true, id });
    };

    const confirmDelete = async () => {
        if (deleteConfirm.id === null) return;
        try {
            await deleteSizeGuide(deleteConfirm.id);
            fetchItems();
        } catch (err) {
            logError(err, '/size-guide');
            setError('No se pudo eliminar la medida.');
        } finally {
            setDeleteConfirm({ open: false, id: null });
        }
    };

    return (
        <div className="page-container">
            <PageHeader title="Guía de Tallas" icon={<FiGrid />} />
            {error && <p className="error-message">{error}</p>}
            <div className="grid-container" style={{ gridTemplateColumns: '300px 1fr' }}>
                <div className="form-card">
                    <SizeGuideForm
                        onSave={handleSave}
                        currentItem={currentItem}
                        onCancel={handleCancelEdit}
                    />
                </div>
                <div className="list-card">
                    {loading ? (
                        <LoadingSpinner text="Cargando medidas..." />
                    ) : (
                        <SizeGuideList
                            items={items}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm.open}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ open: false, id: null })}
                title="Eliminar medida"
                message="¿Estás seguro de eliminar esta medida?"
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="danger"
            />
        </div>
    );
};

export default SizeGuidePage;
