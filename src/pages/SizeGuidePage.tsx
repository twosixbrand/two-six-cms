import React, { useState, useEffect } from 'react';
import {
    getSizeGuides,
    createSizeGuide,
    updateSizeGuide,
    deleteSizeGuide,
} from '../services/sizeGuideApi';
import SizeGuideForm from '../components/size-guide/SizeGuideForm';
import SizeGuideList from '../components/size-guide/SizeGuideList';
import Header from '../components/layout/Header/Header';
import Swal from 'sweetalert2';

const SizeGuidePage = () => {
    const [items, setItems] = useState([]);
    const [currentItem, setCurrentItem] = useState(null);

    // Fetch Items on Initialization
    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const data = await getSizeGuides();
            setItems(data);
        } catch (error) {
            console.error('Failed to fetch size guides', error);
            Swal.fire('Error', 'No se pudieron cargar las medidas de la guía.', 'error');
        }
    };

    const handleSave = async (sizeGuideData) => {
        try {
            if (currentItem) {
                await updateSizeGuide(currentItem.id, sizeGuideData);
                Swal.fire('¡Actualizado!', 'Medida actualizada correctamente.', 'success');
            } else {
                await createSizeGuide(sizeGuideData);
                Swal.fire('¡Creado!', 'Medida añadida correctamente.', 'success');
            }
            fetchItems();
            setCurrentItem(null);
        } catch (error) {
            console.error('Error saving size guide:', error);
            Swal.fire('Error', 'Hubo un problema al guardar la medida.', 'error');
        }
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
    };

    const handleCancelEdit = () => {
        setCurrentItem(null);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            try {
                await deleteSizeGuide(id);
                fetchItems();
                Swal.fire('Eliminado', 'La medida ha sido eliminada.', 'success');
            } catch (error) {
                console.error('Error deleting size guide:', error);
                Swal.fire('Error', 'No se pudo eliminar la medida.', 'error');
            }
        }
    };

    return (
        <div className="layout-content">
            <Header />

            <div className="dashboard-content">
                <div className="section-header">
                    <h2>Medidas Registradas</h2>
                    <p>
                        Administra las equivalencias de ancho y largo para las diferentes
                        tallas de camisetas que se muestran en el portal web público.
                    </p>
                </div>

                <div className="row">
                    <div className="col-md-4 mb-4">
                        <div className="card h-100">
                            <div className="card-body">
                                <SizeGuideForm
                                    onSave={handleSave}
                                    currentItem={currentItem}
                                    onCancel={handleCancelEdit}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-8 mb-4">
                        <div className="card h-100">
                            <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Medidas Disponibles</h5>
                            </div>
                            <div className="card-body p-0">
                                <SizeGuideList
                                    items={items}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SizeGuidePage;
