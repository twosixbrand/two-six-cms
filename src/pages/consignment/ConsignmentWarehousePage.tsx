import React, { useState, useEffect, useMemo } from 'react';
import { FiHome, FiPlus, FiEdit2, FiTrash2, FiPackage } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../../components/common/PageHeader';
import { DataTable, Modal, FormField, Button, SearchInput, LoadingSpinner } from '../../components/ui';
import * as warehouseApi from '../../services/consignmentWarehouseApi';
import { getCustomers } from '../../services/customerApi';
import { logError } from '../../services/errorApi';
import { formatDate } from '../../utils/dateFormat';

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

  // Stock modal
  const [stockWarehouse, setStockWarehouse] = useState<Warehouse | null>(null);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [kardexItems, setKardexItems] = useState<any[]>([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [stockTab, setStockTab] = useState<'stock' | 'kardex'>('stock');
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

  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!editing && !form.id_customer) {
      setFormError('Selecciona un cliente aliado.');
      return;
    }

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
        payload.id_customer = Number(form.id_customer);
        await warehouseApi.createWarehouse(payload);
      }
      closeModal();
      fetchAll();
    } catch (err: any) {
      logError(err, '/consignment/warehouses');
      setFormError(err.message || 'No se pudo guardar la bodega.');
    } finally {
      setSaving(false);
    }
  };

  const openStockModal = async (row: Warehouse) => {
    try {
      setStockWarehouse(row);
      setStockTab('stock');
      setLoadingStock(true);
      const [stockData, kardexData] = await Promise.all([
        warehouseApi.getWarehouseStock(row.id),
        warehouseApi.getWarehouseKardex(row.id),
      ]);
      setStockItems(stockData);
      setKardexItems(kardexData);
    } catch (err: any) {
      logError(err, '/consignment/warehouses/stock');
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    } finally {
      setLoadingStock(false);
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
            style={{ padding: '0.5rem', borderRadius: '6px', borderWidth: 1, borderStyle: 'solid', borderColor: '#2a2a35', background: '#1a1a24', color: '#f1f1f3' }}
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
              <Button variant="ghost" size="sm" icon={<FiPackage />} onClick={() => openStockModal(row)} />
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
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', borderWidth: 1, borderStyle: 'solid', borderColor: '#2a2a35', background: '#1a1a24', color: '#f1f1f3' }}
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
          {formError && (
            <p style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(248,113,113,0.08)', borderRadius: '6px' }}>
              {formError}
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={saving}>
              {editing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Stock modal */}
      <Modal
        isOpen={!!stockWarehouse}
        onClose={() => { setStockWarehouse(null); setStockItems([]); setKardexItems([]); }}
        title={stockWarehouse ? `Stock — ${stockWarehouse.customer?.name} / ${stockWarehouse.name}` : ''}
        size="lg"
      >
        {loadingStock ? (
          <LoadingSpinner text="Cargando stock..." />
        ) : (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #2a2a35', marginBottom: '1rem' }}>
              {(['stock', 'kardex'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setStockTab(t)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: stockTab === t ? '2px solid #f0b429' : '2px solid transparent',
                    color: stockTab === t ? '#f0b429' : '#a0a0b0',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  {t === 'stock' ? `Stock actual (${stockItems.length})` : `Movimientos (${kardexItems.length})`}
                </button>
              ))}
            </div>

            {stockTab === 'stock' && stockItems.length === 0 ? (
              <p style={{ color: '#a0aec0', textAlign: 'center', padding: '2rem 0' }}>
                Esta bodega no tiene stock en consignación.
              </p>
            ) : stockTab === 'stock' ? (
            <>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#f0b429', fontWeight: 600 }}>
                  {stockItems.filter((s: any) => s.status === 'PENDIENTE_RECEPCION').reduce((a: number, s: any) => a + s.quantity, 0)}
                </span>{' '}
                uds pendientes de recepción
              </div>
              <div>
                <span style={{ color: '#34d399', fontWeight: 600 }}>
                  {stockItems.filter((s: any) => s.status === 'EN_CONSIGNACION').reduce((a: number, s: any) => a + s.quantity, 0)}
                </span>{' '}
                uds en consignación
              </div>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#1f1f2a' }}>
                  <tr style={{ borderBottom: '1px solid #2a2a35' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem', color: '#a0a0b0' }}>Producto</th>
                    <th style={{ textAlign: 'center', padding: '0.5rem', color: '#a0a0b0' }}>Estado</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem', color: '#a0a0b0' }}>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {stockItems.map((s: any) => {
                    const img = s.clothingSize?.clothingColor?.imageClothing?.[0]?.image_url;
                    const ref = s.clothingSize?.clothingColor?.design?.reference || '';
                    const color = s.clothingSize?.clothingColor?.color?.name || '';
                    const size = s.clothingSize?.size?.name || '';
                    const isPending = s.status === 'PENDIENTE_RECEPCION';
                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid #2a2a35' }}>
                        <td style={{ padding: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {img && <img src={img} alt="" style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover', background: '#2a2a35' }} />}
                            <span>{ref} {color} {size}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 10px',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: isPending ? '#92400e' : '#065f46',
                            background: isPending ? '#fef3c7' : '#d1fae5',
                          }}>
                            {isPending ? 'Pendiente recepción' : 'En consignación'}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600, color: '#f1f1f3' }}>
                          {s.quantity}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </>
            ) : null}

            {/* Tab Kardex */}
            {stockTab === 'kardex' && (
              kardexItems.length === 0 ? (
                <p style={{ color: '#a0aec0', textAlign: 'center', padding: '2rem 0' }}>
                  No hay movimientos registrados para esta bodega.
                </p>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#1f1f2a' }}>
                      <tr style={{ borderBottom: '1px solid #2a2a35' }}>
                        <th style={{ textAlign: 'left', padding: '0.4rem 0.5rem', color: '#a0a0b0' }}>Fecha</th>
                        <th style={{ textAlign: 'left', padding: '0.4rem 0.5rem', color: '#a0a0b0' }}>Tipo</th>
                        <th style={{ textAlign: 'left', padding: '0.4rem 0.5rem', color: '#a0a0b0' }}>Producto</th>
                        <th style={{ textAlign: 'center', padding: '0.4rem 0.5rem', color: '#a0a0b0' }}>E/S</th>
                        <th style={{ textAlign: 'right', padding: '0.4rem 0.5rem', color: '#a0a0b0' }}>Cant</th>
                        <th style={{ textAlign: 'left', padding: '0.4rem 0.5rem', color: '#a0a0b0' }}>Descripcion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kardexItems.map((k: any) => {
                        const img = k.clothingSize?.clothingColor?.imageClothing?.[0]?.image_url;
                        const ref = k.clothingSize?.clothingColor?.design?.reference || '';
                        const color = k.clothingSize?.clothingColor?.color?.name || '';
                        const size = k.clothingSize?.size?.name || '';
                        const isIn = k.type === 'IN';
                        return (
                          <tr key={k.id} style={{ borderBottom: '1px solid #2a2a35' }}>
                            <td style={{ padding: '0.4rem 0.5rem', whiteSpace: 'nowrap', color: '#a0aec0' }}>
                              {formatDate(k.date || k.createdAt)}
                            </td>
                            <td style={{ padding: '0.4rem 0.5rem' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                color: '#f1f1f3',
                                background: k.source_type.includes('DISPATCH') ? '#1e40af'
                                  : k.source_type.includes('SELLOUT') ? '#065f46'
                                  : k.source_type.includes('RETURN') ? '#92400e'
                                  : k.source_type.includes('CYCLE') ? '#7c3aed'
                                  : k.source_type.includes('MERMA') ? '#991b1b'
                                  : '#4a5568',
                              }}>
                                {k.source_type.replace('CONSIGNMENT_', '').replace('_', ' ')}
                              </span>
                            </td>
                            <td style={{ padding: '0.4rem 0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                {img && <img src={img} alt="" style={{ width: 22, height: 22, borderRadius: 3, objectFit: 'cover', background: '#2a2a35' }} />}
                                <span>{ref} {color} {size}</span>
                              </div>
                            </td>
                            <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center' }}>
                              <span style={{
                                fontWeight: 700,
                                color: isIn ? '#34d399' : '#f87171',
                              }}>
                                {isIn ? 'IN' : 'OUT'}
                              </span>
                            </td>
                            <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: 600, color: '#f1f1f3' }}>
                              {k.quantity}
                            </td>
                            <td style={{ padding: '0.4rem 0.5rem', color: '#a0aec0', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {k.description || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <Button variant="primary" onClick={() => { setStockWarehouse(null); setStockItems([]); setKardexItems([]); }}>Cerrar</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ConsignmentWarehousePage;
