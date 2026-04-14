import React, { useState, useEffect, useMemo } from 'react';
import { FiDollarSign, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../../components/common/PageHeader';
import { DataTable, Modal, FormField, Button, SearchInput, LoadingSpinner } from '../../components/ui';
import * as priceApi from '../../services/consignmentPriceApi';
import { getCustomers } from '../../services/customerApi';
import { getProducts } from '../../services/productApi';
import { logError } from '../../services/errorApi';

interface Customer {
  id: number;
  name: string;
  document_number?: string;
  is_consignment_ally?: boolean;
}

interface ConsignmentPrice {
  id: number;
  id_customer: number;
  id_product: number;
  price: number;
  valid_from: string;
  valid_to?: string | null;
  customer?: Customer;
  product?: any;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  id_customer: '',
  id_product: '',
  price: '',
  valid_from: todayIso(),
  valid_to: '',
};

const ConsignmentPricePage = () => {
  const [items, setItems] = useState<ConsignmentPrice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterCustomer, setFilterCustomer] = useState<string>('');
  const [onlyActive, setOnlyActive] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ConsignmentPrice | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [prices, cs, ps] = await Promise.all([
        priceApi.getConsignmentPrices({ only_active: onlyActive }),
        getCustomers(),
        getProducts(),
      ]);
      setItems(prices);
      setCustomers(cs);
      setProducts(Array.isArray(ps) ? ps : ps.items || []);
      setError('');
    } catch (err: any) {
      logError(err, '/consignment/prices');
      setError('Error al cargar los precios de consignación.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [onlyActive]);

  const allyCustomers = useMemo(
    () => customers.filter((c) => c.is_consignment_ally),
    [customers],
  );

  const filteredItems = useMemo(() => {
    let arr = items;
    if (filterCustomer) arr = arr.filter((p) => String(p.id_customer) === filterCustomer);
    if (search) {
      const term = search.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.customer?.name?.toLowerCase().includes(term) ||
          p.product?.sku?.toLowerCase().includes(term) ||
          p.product?.clothingSize?.clothingColor?.design?.reference?.toLowerCase().includes(term),
      );
    }
    return arr;
  }, [items, search, filterCustomer]);

  const openCreateModal = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (row: ConsignmentPrice) => {
    setEditing(row);
    setForm({
      id_customer: String(row.id_customer),
      id_product: String(row.id_product),
      price: String(row.price),
      valid_from: row.valid_from.slice(0, 10),
      valid_to: row.valid_to ? row.valid_to.slice(0, 10) : '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const priceNumber = parseFloat(form.price);
      if (!(priceNumber > 0)) throw new Error('El precio debe ser mayor a 0.');

      if (editing) {
        await priceApi.updateConsignmentPrice(editing.id, {
          price: priceNumber,
          valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : undefined,
          valid_to: form.valid_to ? new Date(form.valid_to).toISOString() : null,
        });
      } else {
        if (!form.id_customer || !form.id_product) {
          throw new Error('Selecciona cliente y producto.');
        }
        await priceApi.createConsignmentPrice({
          id_customer: Number(form.id_customer),
          id_product: Number(form.id_product),
          price: priceNumber,
          valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : undefined,
          valid_to: form.valid_to ? new Date(form.valid_to).toISOString() : null,
        });
      }
      closeModal();
      fetchAll();
    } catch (err: any) {
      logError(err, '/consignment/prices');
      await Swal.fire({
        title: 'Error',
        text: err.message || 'No se pudo guardar el precio.',
        icon: 'error',
        confirmButtonColor: '#f0b429',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: ConsignmentPrice) => {
    const result = await Swal.fire({
      title: 'Eliminar Precio',
      text: '¿Eliminar este registro de precio? Si estaba vigente, no se aplicará más en facturas sell-out.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f0b429',
      cancelButtonColor: '#2a2a35',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      await priceApi.deleteConsignmentPrice(row.id);
      fetchAll();
    } catch (err: any) {
      logError(err, '/consignment/prices');
      await Swal.fire({ title: 'Error', text: err.message || 'No se pudo eliminar.', icon: 'error', confirmButtonColor: '#f0b429' });
    }
  };

  const productLabel = (p: any) => {
    if (!p) return '—';
    const ref = p.clothingSize?.clothingColor?.design?.reference || '';
    const color = p.clothingSize?.clothingColor?.color?.name || '';
    const size = p.clothingSize?.size?.name || '';
    return `${ref} ${color} ${size}`.trim() || p.sku || `#${p.id}`;
  };

  const columns = [
    { key: 'id', header: 'ID', width: '70px' },
    {
      key: 'customer',
      header: 'Cliente',
      render: (row: ConsignmentPrice) => row.customer?.name || `#${row.id_customer}`,
    },
    {
      key: 'product',
      header: 'Producto',
      render: (row: ConsignmentPrice) => productLabel(row.product),
    },
    {
      key: 'price',
      header: 'Precio',
      render: (row: ConsignmentPrice) =>
        row.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }),
    },
    {
      key: 'valid_from',
      header: 'Desde',
      render: (row: ConsignmentPrice) => row.valid_from?.slice(0, 10),
    },
    {
      key: 'valid_to',
      header: 'Hasta',
      render: (row: ConsignmentPrice) => (row.valid_to ? row.valid_to.slice(0, 10) : '—'),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Lista de Precios por Cliente" icon={<FiDollarSign />} />
      <p style={{ marginTop: '-0.75rem', marginBottom: '1rem', color: '#a0aec0', fontSize: '0.9rem' }}>
        Precios diferenciados aplicables solo a facturas Sell-out (F02)
      </p>

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar cliente, SKU o referencia..." />
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
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem' }}>
            <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
            Solo vigentes
          </label>
        </div>
        <Button variant="primary" icon={<FiPlus />} onClick={openCreateModal}>
          Nuevo Precio
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando precios..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          emptyMessage="No hay precios registrados"
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
        title={editing ? 'Editar Precio de Consignación' : 'Nuevo Precio de Consignación'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!editing && (
              <>
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
                    <option value="">Selecciona...</option>
                    {allyCustomers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                    Producto *
                  </label>
                  <select
                    name="id_product"
                    value={form.id_product}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e0' }}
                  >
                    <option value="">Selecciona...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {productLabel(p)}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <FormField
              label="Precio (COP)"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              required
              placeholder="85000"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormField label="Vigente desde" name="valid_from" type="date" value={form.valid_from} onChange={handleChange} />
              <FormField label="Vigente hasta (opcional)" name="valid_to" type="date" value={form.valid_to} onChange={handleChange} />
            </div>
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

export default ConsignmentPricePage;
