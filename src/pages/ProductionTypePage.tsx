import React, { useState, useEffect, useMemo } from 'react';
import { FiTool, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Modal, FormField, Button, SearchInput, LoadingSpinner } from '../components/ui';
import * as productionTypeApi from '../services/productionTypeApi';
import { logError } from '../services/errorApi';

const ProductionTypePage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await productionTypeApi.getProductionTypes();
      setItems(data);
    } catch (err: any) {
      setError('Error al cargar los tipos de producción.');
      logError(err, '/production-type');
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
        item.description?.toLowerCase().includes(term)
    );
  }, [items, search]);

  const openCreateModal = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (row: any) => {
    setEditing(row);
    setForm({ name: row.name || '', description: row.description || '' });
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
        await productionTypeApi.updateProductionType(editing.id, form);
      } else {
        await productionTypeApi.createProductionType(form);
      }
      closeModal();
      fetchItems();
    } catch (err: any) {
      setError(`Error al guardar el tipo de producción: ${err.message}`);
      logError(err, '/production-type-save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: any) => {
    const result = await Swal.fire({
      title: 'Eliminar Tipo de Producción',
      text: `¿Estás seguro de que deseas eliminar el tipo "${row.name}"? Esta acción no se puede deshacer.`,
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
      await productionTypeApi.deleteProductionType(row.id);
      fetchItems();
    } catch (err: any) {
      setError('Error al eliminar el tipo de producción.');
      logError(err, '/production-type-delete');
    }
  };

  const columns = [
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'name', header: 'Nombre' },
    { key: 'description', header: 'Descripción', render: (value: any) => value || '—' },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Gestión de Tipos de Producción" icon={<FiTool />} />

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o descripción..." />
        <Button variant="primary" icon={<FiPlus />} onClick={openCreateModal}>Crear Tipo</Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando tipos de producción..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          emptyMessage="No hay tipos de producción registrados"
          actions={(row) => (
            <>
              <Button variant="edit" size="sm" icon={<FiEdit2 />} onClick={() => openEditModal(row)} />
              <Button variant="destructive" size="sm" icon={<FiTrash2 />} onClick={() => handleDelete(row)} />
            </>
          )}
        />
      )}

      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Editar Tipo de Producción' : 'Crear Tipo de Producción'} size="md">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField label="Nombre" name="name" value={form.name} onChange={handleChange} required />
            <FormField label="Descripción" name="description" type="textarea" value={form.description} onChange={handleChange} />
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

export default ProductionTypePage;
