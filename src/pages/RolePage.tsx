import React, { useState, useEffect, useMemo } from 'react';
import { FiShield, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Modal, FormField, Button, SearchInput, LoadingSpinner } from '../components/ui';
import * as roleApi from '../services/roleApi';
import { logError } from '../services/errorApi';

const RolePage = () => {
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
      const data = await roleApi.getRoles();
      setItems(data);
    } catch (err: any) {
      setError('Error al cargar los roles.');
      logError(err, '/role');
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
      (item) => item.name?.toLowerCase().includes(term)
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
        await roleApi.updateRole(editing.id, form);
      } else {
        await roleApi.createRole(form);
      }
      closeModal();
      fetchItems();
    } catch (err: any) {
      const action = editing ? 'actualizar' : 'crear';
      setError(`Error al ${action} el rol.`);
      logError(err, `/role-${action}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: any) => {
    const result = await Swal.fire({
      title: 'Eliminar Rol',
      text: `¿Estas seguro de que deseas eliminar el rol "${row.name}"? Esta accion no se puede deshacer.`,
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
      await roleApi.deleteRole(row.id);
      fetchItems();
    } catch (err: any) {
      setError('Error al eliminar el rol: ' + err.message);
      logError(err, '/role-delete');
    }
  };

  const columns = [
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'name', header: 'Nombre' },
    { key: 'description', header: 'Descripcion' },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Administrar Roles" icon={<FiShield />} />

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre..." />
        <Button variant="primary" icon={<FiPlus />} onClick={openCreateModal}>Crear Rol</Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando roles..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          emptyMessage="No hay roles registrados"
          actions={(row) => (
            <>
              <Button variant="ghost" size="sm" icon={<FiEdit2 />} onClick={() => openEditModal(row)}>Editar</Button>
              <Button variant="ghost" size="sm" icon={<FiTrash2 />} onClick={() => handleDelete(row)}>Eliminar</Button>
            </>
          )}
        />
      )}

      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Editar Rol' : 'Crear Rol'} size="md">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField label="Nombre del Rol" name="name" value={form.name} onChange={handleChange} required placeholder="Ej: Admin" />
            <FormField label="Descripcion" name="description" type="textarea" value={form.description} onChange={handleChange} placeholder="Breve descripcion del rol..." rows={3} />
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

export default RolePage;
