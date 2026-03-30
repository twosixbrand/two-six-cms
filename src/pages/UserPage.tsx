import React, { useState, useEffect, useMemo } from 'react';
import { FiUsers, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Modal, FormField, Button, SearchInput, LoadingSpinner } from '../components/ui';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userApi';
import { logError } from '../services/errorApi';

const UserPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', login: '', email: '', phone: '', password: '' });

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUsers();
      setItems(data);
    } catch (err: any) {
      setError('Error al cargar los usuarios.');
      logError(err, '/user');
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
        item.email?.toLowerCase().includes(term) ||
        item.login?.toLowerCase().includes(term)
    );
  }, [items, search]);

  const openCreateModal = () => {
    setEditing(null);
    setForm({ name: '', login: '', email: '', phone: '', password: '' });
    setShowModal(true);
  };

  const openEditModal = (row: any) => {
    setEditing(row);
    setForm({ name: row.name || '', login: row.login || '', email: row.email || '', phone: row.phone || '', password: '' });
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
      const userData: any = { ...form };
      // Don't send password if blank during update
      if (editing && !userData.password) {
        delete userData.password;
      }
      if (editing) {
        await updateUser(editing.id, userData);
      } else {
        await createUser(userData);
      }
      closeModal();
      fetchItems();
    } catch (err: any) {
      const action = editing ? 'actualizar' : 'crear';
      setError(`Error al ${action} el usuario: ${err.message}`);
      logError(err, `/user-${action}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: any) => {
    const result = await Swal.fire({
      title: 'Eliminar Usuario',
      text: `¿Estas seguro de que deseas eliminar al usuario "${row.name}"? Esta accion no se puede deshacer.`,
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
      await deleteUser(row.id);
      fetchItems();
    } catch (err: any) {
      setError('Error al eliminar el usuario: ' + err.message);
      logError(err, '/user-delete');
    }
  };

  const columns = [
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'name', header: 'Nombre' },
    { key: 'login', header: 'Login' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Telefono' },
    {
      key: 'roles',
      header: 'Roles',
      render: (value: any) =>
        value && value.length > 0
          ? value.map((r: any) => r.name).join(', ')
          : '-',
    },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Administrar Usuarios" icon={<FiUsers />} />

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, email o login..." />
        <Button variant="primary" icon={<FiPlus />} onClick={openCreateModal}>Crear Usuario</Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando usuarios..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          emptyMessage="No hay usuarios registrados"
          actions={(row) => (
            <>
              <Button variant="ghost" size="sm" icon={<FiEdit2 />} onClick={() => openEditModal(row)}>Editar</Button>
              <Button variant="ghost" size="sm" icon={<FiTrash2 />} onClick={() => handleDelete(row)}>Eliminar</Button>
            </>
          )}
        />
      )}

      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Editar Usuario' : 'Crear Usuario'} size="md">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField label="Nombre" name="name" value={form.name} onChange={handleChange} required placeholder="Nombre completo" />
            <FormField label="Login" name="login" value={form.login} onChange={handleChange} required placeholder="Nombre de usuario" />
            <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="correo@ejemplo.com" />
            <FormField label="Telefono" name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="3001234567" />
            <FormField
              label="Contrasena"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required={!editing}
              placeholder={editing ? 'Dejar vacio para mantener la actual' : 'Contrasena'}
            />
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

export default UserPage;
