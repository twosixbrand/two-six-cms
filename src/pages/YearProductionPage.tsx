import React, { useState, useEffect, useMemo } from 'react';
import { FiCalendar, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Modal, FormField, Button, SearchInput, LoadingSpinner } from '../components/ui';
import * as yearProductionApi from '../services/yearProductionApi';
import { logError } from '../services/errorApi';

const YearProductionPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ id: '', name: '', description: '' });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await yearProductionApi.getYearProductions();
      setItems(data);
      setError('');
    } catch (err: any) {
      logError(err, '/year-production');
      setError('Error al cargar los años de producción.');
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
    setForm({ id: '', name: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (row: any) => {
    setEditing(row);
    setForm({
      id: row.id || '',
      name: row.name || '',
      description: row.description || '',
    });
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
        await yearProductionApi.updateYearProduction(editing.id, form);
      } else {
        await yearProductionApi.createYearProduction(form);
      }
      closeModal();
      fetchItems();
    } catch (err: any) {
      logError(err, '/year-production');
      setError('Error al guardar el año de producción: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: any) => {
    const result = await Swal.fire({
      title: 'Eliminar Año de Producción',
      text: `¿Estás seguro de que deseas eliminar el año "${row.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f0b429',
      cancelButtonColor: '#2a2a35',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      await yearProductionApi.deleteYearProduction(row.id);
      fetchItems();
    } catch (err: any) {
      logError(err, '/year-production');
      await Swal.fire({ title: 'Error', text: 'Error al eliminar el año de producción.', icon: 'error', confirmButtonColor: '#f0b429' });
    }
  };

  const columns = [
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'name', header: 'Año' },
    { key: 'description', header: 'Descripción', render: (value: any) => value || '—' },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Gestión de Años de Producción" icon={<FiCalendar />} />

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por año..." />
        <Button variant="primary" icon={<FiPlus />} onClick={openCreateModal}>Crear Año</Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando años de producción..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          emptyMessage="No hay años de producción registrados"
          actions={(row) => (
            <>
              <Button variant="ghost" size="sm" icon={<FiEdit2 />} onClick={() => openEditModal(row)}>Editar</Button>
              <Button variant="ghost" size="sm" icon={<FiTrash2 />} onClick={() => handleDelete(row)}>Eliminar</Button>
            </>
          )}
        />
      )}

      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Editar Año de Producción' : 'Crear Año de Producción'} size="md">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField
              label="ID"
              name="id"
              value={form.id}
              onChange={handleChange}
              required
              placeholder="Ej: 24"
              disabled={!!editing}
            />
            <FormField label="Año" name="name" value={form.name} onChange={handleChange} required placeholder="Ej: 2024" />
            <FormField label="Descripción" name="description" type="textarea" value={form.description} onChange={handleChange} placeholder="Breve descripción (Opcional)" />
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

export default YearProductionPage;
