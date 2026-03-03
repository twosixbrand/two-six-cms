import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiTrash2, FiArrowLeft, FiGrid, FiMove, FiImage, FiChevronRight, FiInfo, FiSearch } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import * as clothingColorApi from '../services/clothingColorApi';
import * as imageClothingApi from '../services/imageClothingApi';
import { logError } from '../services/errorApi';
import '../styles/ImageClothingPage.css';

const ImageClothingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [clothingColor, setClothingColor] = useState(null);
    const [clothingColors, setClothingColors] = useState([]);
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchDetails = useCallback(async () => {
        try {
            const data = await clothingColorApi.getClothingColor(id);
            setClothingColor(data);
        } catch (err) {
            logError(err, 'image-clothing-fetch-details');
            setError('Could not load clothing color details.');
        }
    }, [id]);

    const fetchList = useCallback(async () => {
        try {
            const data = await clothingColorApi.getClothingColors();
            const list = Array.isArray(data) ? data : [];
            list.sort((a, b) => {
                const refA = a.design?.reference || '';
                const refB = b.design?.reference || '';
                const refCompare = refA.localeCompare(refB, undefined, { numeric: true, sensitivity: 'base' });

                if (refCompare !== 0) return refCompare;

                const colorA = a.color?.name || '';
                const colorB = b.color?.name || '';
                return colorA.localeCompare(colorB, undefined, { sensitivity: 'base' });
            });
            setClothingColors(list);
        } catch (err) {
            logError(err, 'image-clothing-fetch-list');
            setError('Failed to load list.');
        }
    }, []);

    const fetchImages = useCallback(async () => {
        try {
            const imgs = await imageClothingApi.getImages(id);
            setImages(imgs || []);
        } catch (err) {
            setImages([]);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchDetails();
            fetchImages();
        } else {
            fetchList();
        }
    }, [id, fetchDetails, fetchImages, fetchList]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (selectedFiles.length === 0) return;
        setUploading(true);
        const formData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) formData.append('files', selectedFiles[i]);
        try {
            await imageClothingApi.uploadImages(id, formData);
            setSelectedFiles([]);
            fetchImages();
        } catch (err) {
            logError(err, 'image-upload');
            alert('Error: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (imageId) => {
        if (!window.confirm("¿Eliminar imagen permanentemente?")) return;
        try {
            await imageClothingApi.deleteImage(imageId);
            fetchImages();
        } catch (err) {
            alert("Error al eliminar");
        }
    };

    const handleDragStart = (e, index) => {
        e.dataTransfer.setData('text/plain', index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => e.preventDefault();

    const handleDropReorder = async (e, dropIndex) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (dragIndex === dropIndex) return;
        const newImages = [...images];
        const [movedItem] = newImages.splice(dragIndex, 1);
        newImages.splice(dropIndex, 0, movedItem);
        const updatedImages = newImages.map((img, index) => ({ ...img, position: index + 1 }));
        setImages(updatedImages);
        try {
            const imageIds = updatedImages.map(img => img.id_image_clothing);
            await imageClothingApi.reorderImages(id, imageIds);
        } catch (err) { fetchImages(); }
    };

    if (!id) {
        const filteredClothingColors = clothingColors.filter(item => {
            const term = searchTerm.toLowerCase();
            const ref = item.design?.reference?.toLowerCase() || '';
            const colorName = item.color?.name?.toLowerCase() || '';
            const clothingName = item.design?.clothing?.name?.toLowerCase() || '';
            return ref.includes(term) || colorName.includes(term) || clothingName.includes(term);
        });

        return (
            <div className="page-container">
                <PageHeader title="Studio Media Center" icon={<FiImage />}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                        <FiSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '1.2rem', zIndex: 2 }} />
                        <input
                            type="text"
                            placeholder="Buscar por referencia, color o prenda..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="studio-search-input"
                        />
                    </div>
                </PageHeader>
                <div className="studio-cards-grid">
                    {filteredClothingColors.map(item => (
                        <div key={item.id} className="studio-ref-card">
                            <div className="ref-card-content">
                                <div className={`ref-badge ${item._count?.imageClothing > 0 ? 'has-images' : ''}`}>
                                    {item.design?.reference?.substring(0, 2) || 'RX'}
                                </div>
                                <div className="ref-info">
                                    <h3>{item.design?.reference}</h3>
                                    <p>{item.color?.name}</p>
                                    <span className="ref-category">{item.design?.clothing?.name}</span>
                                </div>
                            </div>
                            <div className="ref-card-actions">
                                <button className="btn-primary" onClick={() => navigate(`/image-clothing/${item.id}`)}>
                                    Abrir Studio
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredClothingColors.length === 0 && (
                        <div className="empty-search">
                            <FiSearch className="empty-icon" />
                            <p>No se encontraron referencias para "{searchTerm}"</p>
                            <button className="btn-secondary" onClick={() => setSearchTerm('')}>Limpiar búsqueda</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (error) return <div className="page-container"><p className="error-message">{error}</p></div>;
    if (!clothingColor) return <div className="page-container"><p style={{ textAlign: 'center' }}>Cargando Media Studio...</p></div>;

    return (
        <div className="page-container image-clothing-container">
            {/* Header del Studio */}
            <div className="form-card studio-header" style={{ padding: '1rem 1.5rem', marginBottom: '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }} onClick={() => navigate('/image-clothing')}>
                        <FiArrowLeft />
                    </button>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>Inventario</span>
                            <FiChevronRight size={10} />
                            <span style={{ color: 'var(--primary-color)' }}>Media Studio</span>
                        </div>
                        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {clothingColor.design?.reference}
                            <span style={{ color: 'var(--primary-color)', fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: 'rgba(212,175,55,0.1)', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Studio Active</span>
                        </h2>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{clothingColor.color?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{clothingColor.design?.clothing?.name}</div>
                </div>
            </div>

            <div className="studio-content">
                {/* Panel Izquierdo: Subida / Info */}
                <div className="upload-section">
                    <form
                        onSubmit={handleUpload}
                        style={{ position: 'relative' }}
                    >
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', textAlign: 'left', borderBottom: 'none', paddingBottom: '0' }}>Carga de Activos</h3>

                        <div
                            className={`dropzone ${dragActive ? 'active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                        >
                            <FiUploadCloud className="dropzone-icon" />
                            <p>{selectedFiles.length > 0 ? `${selectedFiles.length} Listos` : 'Arrastrar Imágenes'}</p>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>O clic para explorar</span>
                            <input type="file" multiple accept="image/*" onChange={handleFileChange} />
                        </div>

                        {selectedFiles.length > 0 && (
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <button type="submit" className="btn-primary" disabled={uploading} style={{ flex: 1 }}>
                                    {uploading ? 'PROCESANDO...' : 'SUBIR AHORA'}
                                </button>
                                <button type="button" className="btn-secondary" onClick={() => setSelectedFiles([])} style={{ flex: 1 }}>
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </form>

                    <div style={{ marginTop: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', textAlign: 'left', borderBottom: 'none', paddingBottom: '0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiInfo color="var(--primary-color)" /> Detalles Variante
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Referencia</span>
                                <span style={{ fontWeight: 600 }}>{clothingColor.design?.reference}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Color</span>
                                <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{clothingColor.color?.name}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel Derecho: Galería / Token List */}
                <div className="list-card gallery-section" style={{ minHeight: '500px' }}>
                    <div className="gallery-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: 'rgba(212,175,55,0.1)', padding: '0.8rem', borderRadius: '12px', display: 'flex' }}>
                                <FiGrid color="var(--primary-color)" size={20} />
                            </div>
                            <div>
                                <h3>Biblioteca</h3>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{images.length} Archivos</div>
                            </div>
                        </div>
                        {images.length > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0.5rem 1rem', background: 'var(--surface-color)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                                <FiMove size={14} color="var(--primary-color)" /> Arrastra para ordenar
                            </div>
                        )}
                    </div>

                    <div className="token-list">
                        {images.map((img, index) => (
                            <div
                                key={img.id_image_clothing}
                                className="token-card"
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDropReorder(e, index)}
                            >
                                <div className="token-drag-handle">
                                    <FiMove size={20} />
                                </div>
                                <div className="token-thumbnail">
                                    <img src={img.image_url} alt={`Asset ${img.position}`} />
                                </div>
                                <div className="token-info">
                                    <div className="token-position">
                                        <span>Pos</span>
                                        <span>0{img.position}</span>
                                    </div>
                                    <div className="token-details">
                                        <span className="token-name">{img.image_url.split('/').pop() || `Recurso ${img.id_image_clothing}`}</span>
                                        <span className="token-meta">Asset Cargado</span>
                                    </div>
                                    <div className="token-actions">
                                        <button
                                            type="button"
                                            className="btn-destructive"
                                            style={{ padding: '0.6rem', borderRadius: '8px' }}
                                            onClick={() => handleDelete(img.id_image_clothing)}
                                            title="Eliminar imagen"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {images.length === 0 && (
                            <div className="empty-gallery">
                                <FiImage />
                                <div>Sin Imágenes</div>
                                <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Sube nuevas imágenes usando el panel de la izquierda</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageClothingPage;
