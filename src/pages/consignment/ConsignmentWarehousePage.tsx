import React, { useState, useEffect, useMemo } from 'react';
import { FiHome, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../../components/common/PageHeader';
import { DataTable, Modal, FormField, Button, SearchInput, LoadingSpinner } from '../../components/ui';
import * as warehouseApi from '../../services/consignmentWarehouseApi';
import { getCustomers } from '../../services/customerApi';
import { logError } from '../../services/errorApi';

interface Customer {
  id: number;
  name: string;
  document_number?: string;
  is_consignment_ally?: boolean;
}

interface Warehouse {
  id: number;
  id_customer: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  is_active: boolean;
  customer?: Customer;
}

const emptyForm = {
  id_customer: '',
  name: '',
  address: '',
  city: '',
  state: '',
  is_active: true,
};

const ConsignmentWarehousePage = () => {
  const [items, setItems] = useState<Warehouse[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterCustomer, setFilterCustomer] = useState<string>('');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [wh, cs] = await Promise.all([warehouseApi.getWarehouses(), getCustomers()]);
      setItems(wh);
      setCustomers(cs);
      setError('');
    } catch (err: any) {
      logError(err, '/consignment/warehouses');
      setError('Error al cargar las bodegas de consignación.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const allyCustomers = useMemo(
    () => customers.filter((c) => c.is_consignment_ally),
    [customers],
  );

  const filteredItems = useMemo(() => {
    let arr = items;
    if (filterCustomer) arr = arr.filter((w) => String(w.id_customer) === filterCustomer);
    if (search) {
      const term = search.toLowerCase();
      arr = arr.filter(
        (w) =>
          w.name.toLowerCase().includes(term) ||
          w.customer?.name?.toLowerCase().includes(term) ||
          w.city?.toLowerCase().includes(term),
      );
    }
    return arr;
  }, [items, search, filterCustomer]);

  const openCreateModal = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (row: Warehouse) => {
    setEditing(row);
    setForm({
      id_customer: String(row.id_customer),
      name: row.name || '',
      address: row.address || '',
      city: row.city || '',
      state: row.state || '',
      is_active: row.is_active,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload: any = {
        name: form.name,
        address: form.address || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        is_active: form.is_active,
      };
      if (editing) {
        await warehouseApi.updateWarehouse(editing.id, payload);
      } else {
        if (!form.id_customer) throw new Error('Selecciona un cliente aliado.');
        payload.id_customer = Number(form.id_customer);
        await warehouseApi.createWarehouse(payload);
      }
      closeModal();
      fetchAll();
    } catch (err: any) {
      logError(err, '/consignment/warehouses');
      await Swal.fire({ title: 'Error', text: err.message || 'No se pudo guardar la bodega.', icon: 'error', confirmButtonColor: '#f0b429' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: Warehouse) => {
    const result = await Swal.fire({
      title: 'Eliminar Bodega',
      text: `¿Eliminar la bodega "${row.name}"? Si tiene stock con unidades no se podrá eliminar.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f0b429',
      cancelButtonColor: '#2a2a35',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      await warehouseApi.deleteWarehouse(row.id);
      fetchAll();
    } catch (err: any) {
      logError(err, '/consignment/warehouses');
      await Swal.fire({ title: 'Error', text: err.message || 'No se pudo eliminar la bodega.', icon: 'error', confirmButtonColor: '#f0b429' });
    }
  };

  const columns = [
    { key: 'id', header: 'ID', width: '70px' },
    {
      key: 'customer',
      header: 'Cliente Aliado',
      render: (_: any, row: Warehouse) => row.customer?.name || `#${row.id_customer}`,
    },
    { key: 'name', header: 'Bodega' },
    {
      key: 'location',
      header: 'Ubicación',
      render: (_: any, row: Warehouse) => [row.city, row.state].filter(Boolean).join(', ') || '—',
    },
    {
      key: 'is_active',
      header: 'Estado',
      render: (_: any, row: Warehouse) => (
        <span style={{ color: row.is_active ? '#1f9d55' : '#cbd5e0' }}>
          {row.is_active ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Bodegas de Consignación" icon={<FiHome />} />
      <p style={{ marginTop: '-0.75rem', marginBottom: '1rem', color: '#a0aec0', fontSize: '0.9rem' }}>
        Bodegas virtuales por aliado comercial (F01)
      </p>

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar bodega o cliente..." />
          <select
            value={filterCustomer}
            onChange={(e) => setFilterCustomer(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e0' }}
          >
            <option value="">Todos los clientes</option>
            {allyCustomers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <Button variant="primary" icon={<FiPlus />} onClick={openCreateModal}>
          Nueva Bodega
        </Button>
      </div>

      {/* Info: gestión de aliados se hace desde CustomerPage */}
      <div style={{
        marginBottom: '1rem',
        padding: '0.75rem 1rem',
        background: 'rgba(240,180,41,0.08)',
        border: '1px solid rgba(240,180,41,0.3)',
        borderRadius: '8px',
        fontSize: '0.85rem',
        color: '#f1f1f3',
      }}>
        <strong style={{ color: '#f0b429' }}>ℹ️ {allyCustomers.length} cliente(s) aliado(s) registrados.</strong>{' '}
        Para marcar un cliente como aliado de consignación ve a{' '}
        <a
          href="/customer"
          style={{ color: '#f0b429', textDecoration: 'underline' }}
        >
          Gestión de Clientes
        </a>{' '}
        y edita el cliente.
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando bodegas..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          emptyMessage="No hay bodegas registradas"
          actions={(row) => (
            <>
              <Button variant="edit" size="sm" icon={<FiEdit2 />} onClick={() => openEditModal(row)} />
              <Button variant="destructive" size="sm" icon={<FiTrash2 />} onClick={() => handleDelete(row)} />
            </>
          )}
        />
      )}

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editing ? 'Editar Bodega' : 'Nueva Bodega de Consignación'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!editing && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                  Cliente Aliado *
                </label>
                <select
                  name="id_customer"
                  value={form.id_customer}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e0' }}
                >
                  <option value="">Selecciona un cliente...</option>
                  {allyCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.document_number ? `(${c.document_number})` : ''}
                    </option>
                  ))}
                </select>
                {allyCustomers.length === 0 && (
                  <small style={{ color: '#dc2626' }}>
                    No hay clientes marcados como aliados. Actívalos arriba.
                  </small>
                )}
              </div>
            )}
            <FormField label="Nombre de Bodega" name="name" value={form.name} onChange={handleChange} required placeholder="Ej: Punto Andino" />
            <FormField label="Dirección" name="address" value={form.address} onChange={handleChange} placeholder="Calle 10 #5-30" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormField label="Ciudad" name="city" value={form.city} onChange={handleChange} />
              <FormField label="Departamento" name="state" value={form.state} onChange={handleChange} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" name="is_active" checked={!!form.is_active} onChange={handleChange} />
              Bodega activa
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={saving}>
              {editing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ConsignmentWarehousePage;
