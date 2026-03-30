import React, { useState, useEffect, useMemo } from 'react';
import { FiAperture, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Modal, FormField, Button, SearchInput, ConfirmDialog, LoadingSpinner } from '../components/ui';
import * as colorApi from '../services/colorApi';
import { logError } from '../services/errorApi';

const ColorPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', hex: '#ffffff' });

  // Delete confirm state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await colorApi.getColors();
      setItems(data);
    } catch (err: any) {
      setError('Error al cargar los colores.');
      logError(err, '/color');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    if (!search) return items;
    const term = search.toLowerCase();
    return items.filter(
      (item) =>
        item.name?.toLowerCase().includes(term) ||
        item.hex?.toLowerCase().includes(term)
    );
  }, [items, search]);

  const openCreateModal = () => {
    setEditing(null);
    setForm({ name: '', hex: '#ffffff' });
    setShowModal(true);
  };

  const openEditModal = (row: any) => {
    setEditing(row);
    setForm({ name: row.name || '', hex: row.hex || '#ffffff' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      if (editing) {
        await colorApi.updateColor(editing.id, form);
      } else {
        await colorApi.createColor(form);
      }
      closeModal();
      fetchItems();
    } catch (err: any) {
      const action = editing ? 'actualizar' : 'crear';
      setError(`Error al ${action} el color.`);
      logError(err, `/color-${action}`);
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
      await colorApi.deleteColor(deleteTarget.id);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchItems();
    } catch (err: any) {
      setError('Error al eliminar el color: ' + err.message);
      logError(err, '/color-delete');
      setShowDeleteConfirm(false);
    }
  };

  const columns = [
    { key: 'id', header: 'ID', width: '80px' },
    {
      key: 'hex',
      header: 'Color',
      render: (value: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: value,
              border: '2px solid rgba(0,0,0,0.1)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{value}</span>
        </div>
      ),
    },
    { key: 'name', header: 'Nombre' },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Administrar Colores" icon={<FiAperture />} />

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o hex..." />
        <Button variant="primary" icon={<FiPlus />} onClick={openCreateModal}>Crear Color</Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando colores..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          emptyMessage="No hay colores registrados"
          actions={(row) => (
            <>
              <Button variant="ghost" size="sm" icon={<FiEdit2 />} onClick={() => openEditModal(row)}>Editar</Button>
              <Button variant="ghost" size="sm" icon={<FiTrash2 />} onClick={() => confirmDelete(row)}>Eliminar</Button>
            </>
          )}
        />
      )}

      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Editar Color' : 'Crear Color'} size="md">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input
                type="color"
                value={form.hex}
                onChange={(e) => setForm((prev) => ({ ...prev, hex: e.target.value }))}
                style={{ width: 50, height: 50, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent' }}
              />
              <div style={{ flex: 1 }}>
                <FormField label="Código Hex" name="hex" value={form.hex} onChange={handleChange} required />
              </div>
            </div>
            <FormField label="Nombre del Color" name="name" value={form.name} onChange={handleChange} required placeholder="Ej: Rojo Oscuro" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={saving}>{editing ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Eliminar Color"
        message={`¿Estás seguro de que deseas eliminar el color "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default ColorPage;
