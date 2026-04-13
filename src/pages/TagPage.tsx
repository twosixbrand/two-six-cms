import React, { useState, useEffect, useMemo } from 'react';
import { FiFolder, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Modal, FormField, Button, SearchInput, LoadingSpinner } from '../components/ui';
import * as tagApi from '../services/tagApi';
import { logError } from '../services/errorApi';

const TagPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '' });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await tagApi.getTags();
      setItems(data);
      setError('');
    } catch (err: any) {
      logError(err, '/tag');
      setError('Error al cargar las etiquetas.');
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
    setForm({ name: '' });
    setShowModal(true);
  };

  const openEditModal = (row: any) => {
    setEditing(row);
    setForm({ name: row.name || '' });
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
        await tagApi.updateTag(editing.id, form);
      } else {
        await tagApi.createTag(form);
      }
      closeModal();
      fetchItems();
    } catch (err: any) {
      logError(err, '/tag');
      setError('Error al guardar la etiqueta: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: any) => {
    const result = await Swal.fire({
      title: 'Eliminar Etiqueta',
      text: `¿Estás seguro de que deseas eliminar la etiqueta "${row.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f0b429',
      cancelButtonColor: '#2a2a35',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      await tagApi.deleteTag(row.id);
      fetchItems();
    } catch (err: any) {
      logError(err, '/tag');
      await Swal.fire({ title: 'Error', text: 'Error al eliminar la etiqueta.', icon: 'error', confirmButtonColor: '#f0b429' });
    }
  };

  const columns = [
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'name', header: 'Nombre' },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Gestión de Etiquetas" icon={<FiFolder />} />

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre..." />
        <Button variant="primary" icon={<FiPlus />} onClick={openCreateModal}>Crear Etiqueta</Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando etiquetas..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          emptyMessage="No hay etiquetas registradas"
          actions={(row) => (
            <>
              <Button variant="edit" size="sm" icon={<FiEdit2 />} onClick={() => openEditModal(row)} />
              <Button variant="destructive" size="sm" icon={<FiTrash2 />} onClick={() => handleDelete(row)} />
            </>
          )}
        />
      )}

      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Editar Etiqueta' : 'Crear Etiqueta'} size="md">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField label="Nombre de Etiqueta" name="name" value={form.name} onChange={handleChange} required placeholder="Ej: Ropa de Invierno" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={saving}>{editing ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TagPage;
