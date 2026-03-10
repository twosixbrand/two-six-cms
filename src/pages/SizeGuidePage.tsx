import React, { useState, useEffect } from 'react';
import { FiGrid } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import SizeGuideForm from '../components/size-guide/SizeGuideForm';
import SizeGuideList from '../components/size-guide/SizeGuideList';
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

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta medida?')) {
            try {
                await deleteSizeGuide(id);
                fetchItems();
            } catch (err) {
                logError(err, '/size-guide');
                setError('No se pudo eliminar la medida.');
            }
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
                        <p>Cargando medidas...</p>
                    ) : (
                        <SizeGuideList
                            items={items}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SizeGuidePage;
