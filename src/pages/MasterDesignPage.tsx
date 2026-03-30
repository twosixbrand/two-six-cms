import React, { useState, useEffect, useMemo } from 'react';
import { FiPenTool, FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Modal, FormField, Button, SearchInput, ConfirmDialog, LoadingSpinner } from '../components/ui';
import * as masterDesignApi from '../services/masterDesignApi';
import * as clothingApi from '../services/clothingApi';
import * as collectionApi from '../services/collectionApi';
import { logError } from '../services/errorApi';

const MasterDesignPage = () => {
  const [designs, setDesigns] = useState<any[]>([]);
  const [clothings, setClothings] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    manufactured_cost: '',
    description: '',
    id_clothing: '',
    id_collection: '',
    file: null,
  });

  // Delete confirm state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // Providers detail modal
  const [showProvidersModal, setShowProvidersModal] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [designsData, clothingsData, collectionsData] = await Promise.all([
        masterDesignApi.getMasterDesigns(),
        clothingApi.getClothing(),
        collectionApi.getCollections(),
      ]);
      setDesigns(designsData);
      setClothings(clothingsData);
      setCollections(collectionsData);
    } catch (err: any) {
      logError(err, '/master-design');
      setError('Error al cargar datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredDesigns = useMemo(() => {
    let result = designs;
    if (search) {
      const term = search.toLowerCase();
      result = designs.filter(
        (d) =>
          d.reference?.toLowerCase().includes(term) ||
          d.clothing?.name?.toLowerCase().includes(term) ||
          d.collection?.name?.toLowerCase().includes(term) ||
          d.clothing?.gender?.name?.toLowerCase().includes(term)
      );
    }
    return [...result].sort((a, b) => {
      const colA = a.collection?.name || '';
      const colB = b.collection?.name || '';
      const colComp = colA.localeCompare(colB, undefined, { sensitivity: 'base' });
      if (colComp !== 0) return colComp;
      const genA = a.clothing?.gender?.name || '';
      const genB = b.clothing?.gender?.name || '';
      return genA.localeCompare(genB, undefined, { sensitivity: 'base' });
    });
  }, [designs, search]);

  // Available clothings (exclude already used, except current editing one)
  const availableClothings = useMemo(() => {
    const usedClothingIds = designs.map((d) => d.id_clothing);
    return clothings.filter((c) => {
      if (editing?.id_clothing === c.id) return true;
      return !usedClothingIds.includes(c.id);
    });
  }, [clothings, designs, editing]);

  const openCreateModal = () => {
    setEditing(null);
    setForm({ manufactured_cost: '', description: '', id_clothing: '', id_collection: '', file: null });
    setShowModal(true);
  };

  const openEditModal = (row: any) => {
    setEditing(row);
    setForm({
      reference: row.reference || '',
      manufactured_cost: row.manufactured_cost || '',
      description: row.description || '',
      id_clothing: row.id_clothing || '',
      id_collection: row.id_collection || '',
      file: null,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setForm((prev: any) => ({ ...prev, file: files[0] }));
    } else {
      setForm((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      if (editing) {
        await masterDesignApi.updateMasterDesign(editing.id, form);
      } else {
        await masterDesignApi.createMasterDesign(form);
      }
      closeModal();
      fetchData();
    } catch (err: any) {
      const action = editing ? 'actualizar' : 'crear';
      setError(`Error al ${action} el diseno: ${err.message}`);
      logError(err, `/master-design-${action}`);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (row: any) => {
    setDeleteTarget(row);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setError('');
      await masterDesignApi.deleteMasterDesign(deleteTarget.id);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      setError('Error al eliminar el diseno: ' + err.message);
      logError(err, '/master-design-delete');
      setShowDeleteConfirm(false);
    }
  };

  const openProvidersModal = (design: any) => {
    setSelectedProviders(design.designProviders || []);
    setShowProvidersModal(true);
  };

  const columns = [
    {
      key: 'image_url',
      header: 'Img',
      width: '60px',
      render: (value: any, row: any) =>
        value ? (
          <img
            src={`${value}?t=${new Date(row.updatedAt).getTime()}`}
            alt={row.reference}
            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }}
          />
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiPenTool size={16} opacity={0.3} />
          </div>
        ),
    },
    { key: 'reference', header: 'Referencia' },
    {
      key: 'clothing',
      header: 'Prenda',
      render: (_: any, row: any) => row.clothing?.name || 'N/A',
    },
    {
      key: 'gender',
      header: 'Genero',
      render: (_: any, row: any) => row.clothing?.gender?.name || 'N/A',
    },
    {
      key: 'collection',
      header: 'Coleccion',
      render: (_: any, row: any) => row.collection?.name || 'N/A',
    },
    {
      key: 'manufactured_cost',
      header: 'Costo',
      align: 'right' as const,
      render: (value: any) => `$${Number(value).toLocaleString()}`,
    },
  ];

  const clothingOptions = availableClothings.map((c) => ({ value: c.id, label: c.name }));
  const collectionOptions = collections.map((c) => ({ value: c.id, label: c.name }));

  return (
    <div className="page-container">
      <PageHeader title="Master Design" icon={<FiPenTool />} />

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por referencia, prenda o coleccion..." />
        <Button variant="primary" icon={<FiPlus />} onClick={openCreateModal}>Crear Diseno</Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando disenos..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredDesigns}
          emptyMessage="No hay disenos maestros registrados"
          actions={(row) => (
            <>
              <Button variant="ghost" size="sm" icon={<FiEye />} onClick={() => openProvidersModal(row)}>Proveedores</Button>
              <Button variant="ghost" size="sm" icon={<FiEdit2 />} onClick={() => openEditModal(row)}>Editar</Button>
              <Button variant="ghost" size="sm" icon={<FiTrash2 />} onClick={() => confirmDelete(row)}>Eliminar</Button>
            </>
          )}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Editar Master Design' : 'Crear Master Design'} size="xl">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: editing ? '1fr 320px' : '1fr', gap: '1.5rem' }}>
            {/* Left: Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {editing && (
                <FormField label="Referencia" name="reference" value={form.reference || ''} onChange={handleChange} disabled />
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormField
                  label="Prenda"
                  name="id_clothing"
                  type="select"
                  value={form.id_clothing}
                  onChange={handleChange}
                  required
                  placeholder="Seleccione una prenda"
                  options={clothingOptions}
                />
                <FormField
                  label="Coleccion"
                  name="id_collection"
                  type="select"
                  value={form.id_collection}
                  onChange={handleChange}
                  required
                  placeholder="Seleccione una coleccion"
                  options={collectionOptions}
                />
              </div>
              <FormField
                label="Costo de Fabricacion"
                name="manufactured_cost"
                type="number"
                value={form.manufactured_cost}
                onChange={handleChange}
                required
              />
              <FormField
                label="Descripcion"
                name="description"
                type="textarea"
                value={form.description}
                onChange={handleChange}
                rows={4}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a0a0b0', fontFamily: 'Inter, sans-serif' }}>
                  {editing ? 'Cambiar Imagen' : 'Imagen Representativa'}
                </label>
                <input
                  type="file"
                  name="file"
                  accept="image/*"
                  onChange={handleChange}
                  style={{
                    padding: '0.7rem', borderRadius: 12,
                    border: '1px solid #2a2a35', backgroundColor: '#2a2a35',
                    fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', color: '#f1f1f3',
                  }}
                />
              </div>
            </div>

            {/* Right: Image Preview (only when editing) */}
            {editing && (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#13131a', borderRadius: 12, border: '1px solid #2a2a35', padding: '1.5rem',
              }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>
                  Imagen Actual
                </label>
                {editing.image_url ? (
                  <img
                    src={`${editing.image_url}?t=${Date.now()}`}
                    alt={editing.reference || 'Preview'}
                    style={{
                      width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 8,
                      border: '1px solid #2a2a35', backgroundColor: '#0a0a0f',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 8, border: '2px dashed #2a2a35', color: '#6b6b7b', fontSize: '0.85rem',
                  }}>
                    Sin imagen
                  </div>
                )}
                <p style={{ fontSize: '0.75rem', color: '#6b6b7b', marginTop: '0.75rem', textAlign: 'center' }}>
                  Sube un archivo a la izquierda para reemplazar esta imagen
                </p>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #2a2a35', paddingTop: '1rem' }}>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={saving}>{editing ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>

      {/* Providers Detail Modal */}
      <Modal isOpen={showProvidersModal} onClose={() => setShowProvidersModal(false)} title="Proveedores del Diseno" size="md">
        {selectedProviders.length === 0 ? (
          <p style={{ color: '#a0a0b0', textAlign: 'center', padding: '1.5rem 0' }}>
            No hay proveedores asignados a este diseno.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {selectedProviders.map((dp: any) => (
              <div
                key={dp.provider?.id || dp.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem 1rem', borderRadius: 8,
                  border: '1px solid #2a2a35', background: '#2a2a35',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{dp.provider?.company_name || 'N/A'}</span>
                <span style={{ fontSize: '0.75rem', color: '#a0a0b0' }}>ID: {dp.provider?.id}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <Button variant="ghost" onClick={() => setShowProvidersModal(false)}>Cerrar</Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Eliminar Diseno"
        message={`¿Estas seguro de que deseas eliminar el diseno "${deleteTarget?.reference}"? Esta accion no se puede deshacer.`}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default MasterDesignPage;
