import React, { useState, useEffect, useMemo } from 'react';
import { FiTag, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Modal, FormField, Button, SearchInput, ConfirmDialog, LoadingSpinner } from '../components/ui';
import * as typeClothingApi from '../services/typeClothingApi';
import { logError } from '../services/errorApi';

const TypeClothingPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ id: '', name: '' });

  // Delete confirm state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await typeClothingApi.getTypeClothings();
      setItems(data);
      setError('');
    } catch (err: any) {
      logError(err, '/type-clothing');
      setError('Error al cargar los tipos de prenda.');
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
    return items.filter((item) => item.name?.toLowerCase().includes(term));
  }, [items, search]);

  const openCreateModal = () => {
    setEditing(null);
    setForm({ id: '', name: '' });
    setShowModal(true);
  };

  const openEditModal = (row: any) => {
    setEditing(row);
    setForm({ id: row.id || '', name: row.name || '' });
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
      if (editing) {
        await typeClothingApi.updateTypeClothing(form.id, form);
      } else {
        await typeClothingApi.createTypeClothing(form);
      }
      closeModal();
      fetchItems();
    } catch (err: any) {
      logError(err, '/type-clothing');
      setError('Error al guardar el tipo de prenda.');
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
      await typeClothingApi.deleteTypeClothing(deleteTarget.id);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchItems();
    } catch (err: any) {
      logError(err, '/type-clothing');
      setError('Error al eliminar el tipo de prenda.');
      setShowDeleteConfirm(false);
    }
  };

  const columns = [
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'name', header: 'Nombre' },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Gestión de Tipos de Prenda" icon={<FiTag />} />

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre..." />
        <Button variant="primary" icon={<FiPlus />} onClick={openCreateModal}>Crear Tipo</Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando tipos de prenda..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          emptyMessage="No hay tipos de prenda registrados"
          actions={(row) => (
            <>
              <Button variant="ghost" size="sm" icon={<FiEdit2 />} onClick={() => openEditModal(row)}>Editar</Button>
              <Button variant="ghost" size="sm" icon={<FiTrash2 />} onClick={() => confirmDelete(row)}>Eliminar</Button>
            </>
          )}
        />
      )}

      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Editar Tipo de Prenda' : 'Crear Tipo de Prenda'} size="md">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField
              label="ID (2 caracteres)"
              name="id"
              value={form.id}
              onChange={handleChange}
              required
              placeholder="Ej: CM"
              disabled={!!editing}
            />
            <FormField label="Nombre" name="name" value={form.name} onChange={handleChange} required placeholder="Ej: Camiseta" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={saving}>{editing ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Eliminar Tipo de Prenda"
        message={`¿Estás seguro de que deseas eliminar el tipo "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default TypeClothingPage;
