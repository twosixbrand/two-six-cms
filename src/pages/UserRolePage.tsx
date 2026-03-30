import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FiLink, FiPlus, FiTrash2 } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Modal, FormField, Button, SearchInput, ConfirmDialog, LoadingSpinner } from '../components/ui';
import * as userRoleApi from '../services/userRoleApi';
import * as userApi from '../services/userApi';
import * as roleApi from '../services/roleApi';
import { logError } from '../services/errorApi';

const UserRolePage = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ id_user_app: '', id_role: '' });

  // Delete confirm state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [assignmentsData, usersData, rolesData] = await Promise.all([
        userRoleApi.getUserRoles(),
        userApi.getUsers(),
        roleApi.getRoles(),
      ]);
      setAssignments(assignmentsData);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err: any) {
      logError(err, '/user-role');
      setError('Error al cargar los datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredAssignments = useMemo(() => {
    if (!search) return assignments;
    const term = search.toLowerCase();
    return assignments.filter(
      (item) =>
        item.user?.name?.toLowerCase().includes(term) ||
        item.role?.name?.toLowerCase().includes(term) ||
        item.user?.email?.toLowerCase().includes(term) ||
        item.user?.login?.toLowerCase().includes(term)
    );
  }, [assignments, search]);

  const openCreateModal = () => {
    setForm({ id_user_app: '', id_role: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id_user_app || !form.id_role) return;
    try {
      setSaving(true);
      setError('');
      await userRoleApi.createUserRole({
        id_user_app: parseInt(form.id_user_app, 10),
        id_role: parseInt(form.id_role, 10),
      });
      closeModal();
      fetchData();
    } catch (err: any) {
      setError('Error al asignar rol: ' + err.message);
      logError(err, '/user-role-save');
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
      await userRoleApi.deleteUserRole(deleteTarget.id);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      setError('Error al eliminar la asignacion: ' + err.message);
      logError(err, '/user-role-delete');
      setShowDeleteConfirm(false);
    }
  };

  const columns = [
    { key: 'id', header: 'ID', width: '80px' },
    {
      key: 'user',
      header: 'Usuario',
      render: (_: any, row: any) => row.user?.name || 'N/A',
    },
    {
      key: 'userLogin',
      header: 'Login',
      render: (_: any, row: any) => row.user?.login || '-',
    },
    {
      key: 'userEmail',
      header: 'Email',
      render: (_: any, row: any) => row.user?.email || '-',
    },
    {
      key: 'role',
      header: 'Rol',
      render: (_: any, row: any) => row.role?.name || 'N/A',
    },
  ];

  const userOptions = users.map((u) => ({ value: u.id, label: `${u.name} (${u.email})` }));
  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }));

  return (
    <div className="page-container">
      <PageHeader title="Asignacion de Roles" icon={<FiLink />} />

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por usuario, email o rol..." />
        <Button variant="primary" icon={<FiPlus />} onClick={openCreateModal}>Asignar Rol</Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando asignaciones..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredAssignments}
          emptyMessage="No hay asignaciones de roles registradas"
          actions={(row) => (
            <Button variant="ghost" size="sm" icon={<FiTrash2 />} onClick={() => confirmDelete(row)}>Eliminar</Button>
          )}
        />
      )}

      <Modal isOpen={showModal} onClose={closeModal} title="Asignar Rol a Usuario" size="md">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField
              label="Usuario"
              name="id_user_app"
              type="select"
              value={form.id_user_app}
              onChange={handleChange}
              required
              placeholder="Seleccione Usuario"
              options={userOptions}
            />
            <FormField
              label="Rol"
              name="id_role"
              type="select"
              value={form.id_role}
              onChange={handleChange}
              required
              placeholder="Seleccione Rol"
              options={roleOptions}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={saving}>Asignar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Eliminar Asignacion"
        message={`¿Estas seguro de que deseas eliminar la asignacion del rol "${deleteTarget?.role?.name}" al usuario "${deleteTarget?.user?.name}"?`}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default UserRolePage;
