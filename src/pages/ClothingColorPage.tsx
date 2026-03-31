import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FiDroplet, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Modal, FormField, Button, SearchInput, LoadingSpinner } from '../components/ui';
import * as clothingColorApi from '../services/clothingColorApi';
import * as masterDesignApi from '../services/masterDesignApi';
import * as colorApi from '../services/colorApi';
import * as sizeApi from '../services/sizeApi';
import * as genderApi from '../services/genderApi';
import { logError } from '../services/errorApi';

const ClothingColorPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [genders, setGenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ id_design: '', id_color: '' });

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createDesign, setCreateDesign] = useState('');
  const [createColor, setCreateColor] = useState('');
  const [sizeSelections, setSizeSelections] = useState<Record<number, { selected: boolean; quantity: number }>>({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [itemsData, designsData, colorsData, sizesData, gendersData] = await Promise.all([
        clothingColorApi.getClothingColors(),
        masterDesignApi.getMasterDesigns(),
        colorApi.getColors(),
        sizeApi.getSizes(),
        genderApi.getGenders(),
      ]);
      setItems(itemsData);
      setDesigns(designsData);
      setColors(colorsData);
      setSizes(sizesData);
      setGenders(gendersData);
    } catch (err: any) {
      logError(err, '/clothing-color');
      setError('Error al cargar datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sortedItems = useMemo(() => {
    let result = items;
    if (search) {
      const term = search.toLowerCase();
      result = items.filter(
        (item) =>
          item.design?.clothing?.name?.toLowerCase().includes(term) ||
          item.design?.reference?.toLowerCase().includes(term) ||
          item.color?.name?.toLowerCase().includes(term)
      );
    }
    return [...result].sort((a, b) => {
      const refA = a.design?.reference || '';
      const refB = b.design?.reference || '';
      return refA.localeCompare(refB, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [items, search]);

  // Edit
  const openEditModal = (row: any) => {
    setEditing(row);
    setEditForm({ id_design: row.id_design || '', id_color: row.id_color || '' });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditing(null);
  };

  const handleEditChange = (e: any) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      setSaving(true);
      setError('');
      const dataToSave: any = { id_color: Number(editForm.id_color) };
      await clothingColorApi.updateClothingColor(editing.id, dataToSave);
      closeEditModal();
      fetchData();
    } catch (err: any) {
      setError('Error al actualizar: ' + err.message);
      logError(err, '/clothing-color-update');
    } finally {
      setSaving(false);
    }
  };

  // Create (contextual)
  const openCreateModal = () => {
    setCreateDesign('');
    setCreateColor('');
    setSizeSelections({});
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleSizeToggle = (sizeId: number) => {
    setSizeSelections((prev) => {
      const current = prev[sizeId] || { selected: false, quantity: 0 };
      return { ...prev, [sizeId]: { ...current, selected: !current.selected } };
    });
  };

  const handleSizeQuantityChange = (sizeId: number, qty: string) => {
    setSizeSelections((prev) => ({
      ...prev,
      [sizeId]: { ...prev[sizeId], quantity: parseInt(qty, 10) || 0 },
    }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sizesData: any[] = [];
    Object.keys(sizeSelections).forEach((sizeId) => {
      const sel = sizeSelections[Number(sizeId)];
      if (sel.selected) {
        sizesData.push({ id_size: parseInt(sizeId, 10), quantity_produced: sel.quantity, quantity_available: sel.quantity });
      }
    });
    if (sizesData.length === 0) {
      setError('Seleccione al menos una talla.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      const payload = { id_design: createDesign, id_color: createColor, sizes: JSON.stringify(sizesData) };
      const result = await clothingColorApi.createContextual(payload);
      closeCreateModal();
      fetchData();
      if (result && result.clothingColor && result.clothingColor.id) {
        const swalResult = await Swal.fire({
          title: '¡Color creado!',
          text: 'Color de prenda creado. ¿Desea subir imágenes ahora?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#f0b429',
          cancelButtonColor: '#2a2a35',
          confirmButtonText: 'Sí, subir imágenes',
          cancelButtonText: 'No, después',
        });
        if (swalResult.isConfirmed) {
          window.location.href = `/image-clothing/${result.clothingColor.id}`;
        }
      }
    } catch (err: any) {
      setError('Error al crear: ' + err.message);
      logError(err, '/clothing-color-create');
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async (row: any) => {
    const result = await Swal.fire({
      title: 'Eliminar Color de Prenda',
      text: '¿Estas seguro de que deseas eliminar este color de prenda? Esta accion no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f0b429',
      cancelButtonColor: '#2a2a35',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      setError('');
      await clothingColorApi.deleteClothingColor(row.id);
      fetchData();
    } catch (err: any) {
      setError('Error al eliminar: ' + err.message);
      logError(err, '/clothing-color-delete');
    }
  };

  const columns = [
    { key: 'id', header: 'ID', width: '60px' },
    {
      key: 'design',
      header: 'Referencia',
      render: (_: any, row: any) => row.design?.reference || 'N/A',
    },
    {
      key: 'clothing',
      header: 'Prenda',
      render: (_: any, row: any) => row.design?.clothing?.name || 'N/A',
    },
    {
      key: 'color',
      header: 'Color',
      render: (_: any, row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 14, height: 14, borderRadius: '50%',
            backgroundColor: row.color?.hex_code || '#ccc',
            border: '1px solid rgba(0,0,0,0.1)',
          }} />
          <span>{row.color?.name || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'gender',
      header: 'Genero',
      render: (_: any, row: any) => row.design?.clothing?.gender?.name || 'N/A',
    },
  ];

  const designOptions = designs.map((d) => ({
    value: d.id,
    label: `${d.reference} - ${d.clothing?.name || ''} (${d.collection?.name || ''})`,
  }));
  const colorOptions = colors.map((c) => ({ value: c.id, label: c.name }));

  return (
    <div className="page-container">
      <PageHeader title="Colores de Prenda" icon={<FiDroplet />} />

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por referencia, prenda o color..." />
        <Button variant="primary" icon={<FiPlus />} onClick={openCreateModal}>Crear Versiones</Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando datos..." />
      ) : (
        <DataTable
          columns={columns}
          data={sortedItems}
          emptyMessage="No hay colores de prendas registrados"
          actions={(row) => (
            <>
              <Button variant="edit" size="sm" icon={<FiEdit2 />} onClick={() => openEditModal(row)} />
              <Button variant="destructive" size="sm" icon={<FiTrash2 />} onClick={() => handleDelete(row)} />
            </>
          )}
        />
      )}

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={closeEditModal} title="Editar Color de Prenda" size="md">
        <form onSubmit={handleEditSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField
              label="Diseno"
              name="id_design"
              type="select"
              value={editForm.id_design}
              onChange={handleEditChange}
              disabled
              options={designOptions}
            />
            <FormField
              label="Color"
              name="id_color"
              type="select"
              value={editForm.id_color}
              onChange={handleEditChange}
              required
              placeholder="Seleccione Color"
              options={colorOptions}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={closeEditModal}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={saving}>Actualizar</Button>
          </div>
        </form>
      </Modal>

      {/* Create Modal (Contextual) */}
      <Modal isOpen={showCreateModal} onClose={closeCreateModal} title="Crear Versiones por Talla" size="lg">
        <form onSubmit={handleCreateSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField
              label="Diseno (Producto Padre)"
              name="id_design"
              type="select"
              value={createDesign}
              onChange={(e: any) => setCreateDesign(e.target.value)}
              required
              placeholder="Seleccione Diseño"
              options={designOptions}
            />
            <FormField
              label="Color"
              name="id_color"
              type="select"
              value={createColor}
              onChange={(e: any) => setCreateColor(e.target.value)}
              required
              placeholder="Seleccione Color"
              options={colorOptions}
            />

            <div>
              <h4 style={{ margin: '0.5rem 0 1rem', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#f1f1f3' }}>
                Seleccionar Tallas
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {sizes.map((size: any) => {
                  const isSelected = sizeSelections[size.id]?.selected || false;
                  return (
                    <div
                      key={size.id}
                      style={{
                        border: isSelected ? '2px solid #f0b429' : '1px solid #2a2a35',
                        padding: '0.75rem',
                        borderRadius: 12,
                        background: isSelected ? 'rgba(212,175,55,0.05)' : 'transparent',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                        <input type="checkbox" checked={isSelected} onChange={() => handleSizeToggle(size.id)} />
                        {size.name}
                      </label>
                      {isSelected && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <FormField
                            label="Cant."
                            name={`qty_${size.id}`}
                            type="number"
                            value={sizeSelections[size.id]?.quantity || 0}
                            onChange={(e: any) => handleSizeQuantityChange(size.id, e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={closeCreateModal}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={saving} disabled={!createDesign || !createColor}>Crear Versiones</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClothingColorPage;
