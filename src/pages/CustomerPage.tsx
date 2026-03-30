import React, { useState, useEffect, useMemo } from 'react';
import { FiUsers, FiEdit2 } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Modal, FormField, Button, SearchInput, LoadingSpinner, StatusBadge } from '../components/ui';
import * as customerApi from '../services/customerApi';
import locationApi from '../services/locationApi';
import { logError } from '../services/errorApi';

const CustomerPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', current_phone_number: '', shipping_address: '',
    city: '', state: '', postal_code: '', country: '',
  });

  // Location state
  const [departments, setDepartments] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await customerApi.getCustomers();
      setItems(data);
    } catch (err: any) {
      setError('Error al cargar los clientes.');
      logError(err, '/customer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    const loadDepts = async () => {
      try {
        const data = await locationApi.getDepartments();
        setDepartments(data);
      } catch (err) {
        console.error('Error loading departments:', err);
      }
    };
    loadDepts();
  }, []);

  // Load cities when department changes
  useEffect(() => {
    if (!selectedDeptId) {
      setCities([]);
      return;
    }
    const loadCities = async () => {
      try {
        const data = await locationApi.getCities(selectedDeptId);
        setCities(data);
      } catch (err) {
        console.error('Error loading cities:', err);
      }
    };
    loadCities();
  }, [selectedDeptId]);

  const filteredItems = useMemo(() => {
    if (!search) return items;
    const term = search.toLowerCase();
    return items.filter(
      (item) =>
        item.name?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        item.document_number?.toLowerCase().includes(term) ||
        item.current_phone_number?.toLowerCase().includes(term)
    );
  }, [items, search]);

  const openEditModal = (row: any) => {
    setEditing(row);
    setForm({
      name: row.name || '',
      email: row.email || '',
      current_phone_number: row.current_phone_number || '',
      shipping_address: row.shipping_address || '',
      city: row.city || '',
      state: row.state || '',
      postal_code: row.postal_code || '',
      country: row.country || '',
    });
    // Find matching department
    if (row.state && departments.length > 0) {
      const dept = departments.find((d: any) => d.name === row.state);
      setSelectedDeptId(dept ? String(dept.id) : '');
    } else {
      setSelectedDeptId('');
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setSelectedDeptId('');
    setCities([]);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (e: any) => {
    const deptId = e.target.value;
    setSelectedDeptId(deptId);
    const dept = departments.find((d: any) => String(d.id) === deptId);
    setForm((prev) => ({ ...prev, state: dept ? dept.name : '', city: '' }));
  };

  const handleCityChange = (e: any) => {
    setForm((prev) => ({ ...prev, city: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      setSaving(true);
      setError('');
      await customerApi.updateCustomer(editing.id, form);
      closeModal();
      fetchItems();
    } catch (err: any) {
      setError('Error al actualizar el cliente: ' + err.message);
      logError(err, '/customer-update');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'id', header: 'ID', width: '60px' },
    {
      key: 'document_number',
      header: 'Documento',
      render: (value: any, row: any) => value ? `${row.identificationType?.name || 'Doc'}: ${value}` : '-',
    },
    { key: 'name', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    { key: 'current_phone_number', header: 'Telefono' },
    {
      key: 'city',
      header: 'Ubicacion',
      render: (_: any, row: any) => [row.city, row.state].filter(Boolean).join(', ') || '-',
    },
    {
      key: 'is_registered',
      header: 'Estado',
      render: (value: any) => (
        <StatusBadge status={value ? 'Registrado' : 'Invitado'} variant={value ? 'success' : 'warning'} size="sm" />
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Gestion de Clientes" icon={<FiUsers />} />

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, email o documento..." />
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando clientes..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          emptyMessage="No hay clientes registrados"
          actions={(row) => (
            <Button variant="ghost" size="sm" icon={<FiEdit2 />} onClick={() => openEditModal(row)}>Editar</Button>
          )}
        />
      )}

      <Modal isOpen={showModal} onClose={closeModal} title="Editar Cliente" size="lg">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {editing?.document_number && (
              <div style={{ padding: '0.6rem 1rem', background: 'rgba(212,175,55,0.08)', borderRadius: 10, fontSize: '0.8rem', color: 'var(--text-secondary, #475569)' }}>
                <strong>Documento:</strong> {editing.document_number}
              </div>
            )}
            <FormField label="Nombre" name="name" value={form.name} onChange={handleChange} required />
            <FormField label="Correo Electronico" name="email" type="email" value={form.email} onChange={handleChange} required />
            <FormField label="Telefono" name="current_phone_number" type="tel" value={form.current_phone_number} onChange={handleChange} required />
            <FormField label="Direccion de Envio" name="shipping_address" value={form.shipping_address} onChange={handleChange} />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <FormField
                  label="Departamento"
                  name="state"
                  type="select"
                  value={selectedDeptId}
                  onChange={handleDepartmentChange}
                  placeholder="Seleccionar departamento..."
                  options={departments.map((d: any) => ({ value: String(d.id), label: d.name }))}
                />
              </div>
              <div style={{ flex: 1 }}>
                <FormField
                  label="Ciudad"
                  name="city"
                  type="select"
                  value={form.city}
                  onChange={handleCityChange}
                  placeholder="Seleccionar ciudad..."
                  options={cities.map((c: any) => ({ value: c.name, label: c.name }))}
                  disabled={!selectedDeptId}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <FormField label="Codigo Postal" name="postal_code" value={form.postal_code} onChange={handleChange} />
              </div>
              <div style={{ flex: 1 }}>
                <FormField label="Pais" name="country" value={form.country} onChange={handleChange} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={saving}>Actualizar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerPage;
