import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiImage, FiUploadCloud, FiTrash2, FiArrowLeft, FiMove, FiChevronRight } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Button, SearchInput, ConfirmDialog, LoadingSpinner } from '../components/ui';
import * as clothingColorApi from '../services/clothingColorApi';
import * as imageClothingApi from '../services/imageClothingApi';
import { logError } from '../services/errorApi';

const ImageClothingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clothingColor, setClothingColor] = useState<any>(null);
  const [clothingColors, setClothingColors] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [loadingList, setLoadingList] = useState(true);

  // Delete confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState<number | null>(null);

  const fetchDetails = useCallback(async () => {
    try {
      const data = await clothingColorApi.getClothingColor(id);
      setClothingColor(data);
    } catch (err: any) {
      logError(err, 'image-clothing-fetch-details');
      setError('No se pudieron cargar los detalles.');
    }
  }, [id]);

  const fetchList = useCallback(async () => {
    try {
      setLoadingList(true);
      const data = await clothingColorApi.getClothingColors();
      const list = Array.isArray(data) ? data : [];
      list.sort((a: any, b: any) => {
        const refA = a.design?.reference || '';
        const refB = b.design?.reference || '';
        const refComp = refA.localeCompare(refB, undefined, { numeric: true, sensitivity: 'base' });
        if (refComp !== 0) return refComp;
        const colorA = a.color?.name || '';
        const colorB = b.color?.name || '';
        return colorA.localeCompare(colorB, undefined, { sensitivity: 'base' });
      });
      setClothingColors(list);
    } catch (err: any) {
      logError(err, 'image-clothing-fetch-list');
      setError('Error al cargar la lista.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  const fetchImages = useCallback(async () => {
    try {
      const imgs = await imageClothingApi.getImages(id);
      setImages(imgs || []);
    } catch {
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

  // Drag & drop for file upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach((f) => formData.append('files', f));
    try {
      await imageClothingApi.uploadImages(id, formData);
      setSelectedFiles([]);
      fetchImages();
    } catch (err: any) {
      logError(err, 'image-upload');
      setError('Error al subir: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const confirmDeleteImage = (imageId: number) => {
    setDeleteImageId(imageId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteImage = async () => {
    if (!deleteImageId) return;
    try {
      await imageClothingApi.deleteImage(deleteImageId);
      setShowDeleteConfirm(false);
      setDeleteImageId(null);
      fetchImages();
    } catch {
      setError('Error al eliminar imagen.');
      setShowDeleteConfirm(false);
    }
  };

  // Drag reorder images
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverReorder = (e: React.DragEvent) => e.preventDefault();

  const handleDropReorder = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (dragIndex === dropIndex) return;
    const newImages = [...images];
    const [movedItem] = newImages.splice(dragIndex, 1);
    newImages.splice(dropIndex, 0, movedItem);
    const updatedImages = newImages.map((img, i) => ({ ...img, position: i + 1 }));
    setImages(updatedImages);
    try {
      const imageIds = updatedImages.map((img) => img.id_image_clothing);
      await imageClothingApi.reorderImages(id, imageIds);
    } catch {
      fetchImages();
    }
  };

  // ===== LIST VIEW (no id param) =====
  if (!id) {
    const filteredList = clothingColors.filter((item) => {
      const term = search.toLowerCase();
      return (
        item.design?.reference?.toLowerCase().includes(term) ||
        item.color?.name?.toLowerCase().includes(term) ||
        item.design?.clothing?.name?.toLowerCase().includes(term)
      );
    });

    const listColumns = [
      { key: 'id', header: 'ID', width: '60px' },
      {
        key: 'reference',
        header: 'Referencia',
        render: (_: any, row: any) => row.design?.reference || 'N/A',
      },
      {
        key: 'color',
        header: 'Color',
        render: (_: any, row: any) => row.color?.name || 'N/A',
      },
      {
        key: 'clothing',
        header: 'Prenda',
        render: (_: any, row: any) => row.design?.clothing?.name || 'N/A',
      },
      {
        key: 'imageCount',
        header: 'Imagenes',
        align: 'center' as const,
        render: (_: any, row: any) => row._count?.imageClothing || 0,
      },
    ];

    return (
      <div className="page-container">
        <PageHeader title="Studio Media Center" icon={<FiImage />} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por referencia, color o prenda..." />
        </div>

        {loadingList ? (
          <LoadingSpinner text="Cargando lista..." />
        ) : (
          <DataTable
            columns={listColumns}
            data={filteredList}
            emptyMessage="No se encontraron referencias"
            onRowClick={(row) => navigate(`/image-clothing/${row.id}`)}
            actions={(row) => (
              <Button variant="primary" size="sm" onClick={() => navigate(`/image-clothing/${row.id}`)}>Abrir Studio</Button>
            )}
          />
        )}
      </div>
    );
  }

  // ===== DETAIL VIEW (with id) =====
  if (error && !clothingColor) {
    return (
      <div className="page-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!clothingColor) {
    return (
      <div className="page-container">
        <LoadingSpinner text="Cargando Media Studio..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem',
        padding: '1rem 1.5rem', borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="ghost" size="sm" icon={<FiArrowLeft />} onClick={() => navigate('/image-clothing')}>Volver</Button>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #475569)', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Inventario</span>
              <FiChevronRight size={10} />
              <span style={{ color: 'var(--primary-color, #d4af37)' }}>Media Studio</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', color: 'var(--text-primary, #1e293b)' }}>
              {clothingColor.design?.reference}
            </h2>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{clothingColor.color?.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #475569)' }}>{clothingColor.design?.clothing?.name}</div>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem' }}>
        {/* Upload Panel */}
        <div style={{
          padding: '1.5rem', borderRadius: 12,
          backgroundColor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>Carga de Activos</h3>
          <form onSubmit={handleUpload}>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              style={{
                border: dragActive ? '2px dashed var(--primary-color, #d4af37)' : '2px dashed rgba(0,0,0,0.1)',
                borderRadius: 12, padding: '2rem', textAlign: 'center', cursor: 'pointer',
                background: dragActive ? 'rgba(212,175,55,0.05)' : 'transparent',
                transition: 'all 0.2s ease', position: 'relative',
              }}
            >
              <FiUploadCloud size={32} style={{ color: 'var(--text-secondary, #475569)', marginBottom: '0.5rem' }} />
              <p style={{ margin: '0.5rem 0 0.25rem', fontWeight: 600, fontSize: '0.9rem' }}>
                {selectedFiles.length > 0 ? `${selectedFiles.length} Listos` : 'Arrastrar Imagenes'}
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #475569)' }}>O clic para explorar</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
              />
            </div>
            {selectedFiles.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <Button variant="primary" type="submit" loading={uploading}>Subir Ahora</Button>
                <Button variant="ghost" onClick={() => setSelectedFiles([])}>Cancelar</Button>
              </div>
            )}
          </form>

          {/* Variant Details */}
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>Detalles Variante</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #475569)' }}>Referencia</span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{clothingColor.design?.reference}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #475569)' }}>Color</span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary-color, #d4af37)' }}>{clothingColor.color?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Panel */}
        <div style={{
          padding: '1.5rem', borderRadius: 12, minHeight: 400,
          backgroundColor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
              Biblioteca ({images.length} Archivos)
            </h3>
            {images.length > 1 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #475569)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiMove size={14} /> Arrastra para ordenar
              </span>
            )}
          </div>

          {images.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary, #475569)' }}>
              <FiImage size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ fontWeight: 600 }}>Sin Imagenes</p>
              <p style={{ fontSize: '0.8rem' }}>Sube nuevas imagenes usando el panel de la izquierda</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {images.map((img, index) => (
                <div
                  key={img.id_image_clothing}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOverReorder}
                  onDrop={(e) => handleDropReorder(e, index)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.75rem', borderRadius: 10,
                    border: '1px solid rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.4)',
                    cursor: 'grab', transition: 'all 0.15s ease',
                  }}
                >
                  <FiMove size={16} style={{ color: 'var(--text-secondary, #475569)', flexShrink: 0 }} />
                  <img
                    src={img.image_url}
                    alt={`Asset ${img.position}`}
                    style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      Pos {String(img.position).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #475569)' }}>
                      {img.image_url.split('/').pop() || `Recurso ${img.id_image_clothing}`}
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" icon={<FiTrash2 />} onClick={() => confirmDeleteImage(img.id_image_clothing)}>
                    Eliminar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Eliminar Imagen"
        message="¿Eliminar esta imagen permanentemente? Esta accion no se puede deshacer."
        variant="danger"
        onConfirm={handleDeleteImage}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default ImageClothingPage;
