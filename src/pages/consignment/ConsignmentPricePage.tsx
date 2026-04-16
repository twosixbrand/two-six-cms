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

  // Multi-select de productos (modo create bulk)
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [productSearch, setProductSearch] = useState('');
  // Productos que ya tienen precio vigente para el cliente seleccionado —
  // se excluyen de la lista al crear para evitar duplicados.
  const [existingProductIds, setExistingProductIds] = useState<Set<number>>(new Set());

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

  // Al seleccionar cliente en el modal de creación, carga los productos
  // que ya tienen precio vigente para ese cliente y excluirlos de la lista.
  useEffect(() => {
    if (editing || !form.id_customer || !showModal) {
      setExistingProductIds(new Set());
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const existing = await priceApi.getConsignmentPrices({
          id_customer: Number(form.id_customer),
          only_active: true,
        });
        if (cancelled) return;
        const ids = new Set<number>(existing.map((p: any) => p.id_product));
        setExistingProductIds(ids);
        // Limpia de la selección cualquier producto que ya esté asignado
        setSelectedProducts((prev) => {
          const next = new Set<number>();
          prev.forEach((id) => {
            if (!ids.has(id)) next.add(id);
          });
          return next;
        });
      } catch (err) {
        logError(err, '/consignment/prices/existing');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [form.id_customer, editing, showModal]);

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
    setSelectedProducts(new Set());
    setProductSearch('');
    setFormError('');
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
    setSelectedProducts(new Set([row.id_product]));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setSelectedProducts(new Set());
    setProductSearch('');
  };

  const toggleProduct = (id: number) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const productLabel = (p: any) => {
    if (!p) return '—';
    const ref = p.clothingSize?.clothingColor?.design?.reference || '';
    const color = p.clothingSize?.clothingColor?.color?.name || '';
    const size = p.clothingSize?.size?.name || '';
    return `${ref} ${color} ${size}`.trim() || p.sku || `#${p.id}`;
  };

  const availableProducts = useMemo(
    () => products.filter((p: any) => !existingProductIds.has(p.id)),
    [products, existingProductIds],
  );

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return availableProducts;
    const term = productSearch.toLowerCase();
    return availableProducts.filter((p: any) => {
      const label = productLabel(p).toLowerCase();
      return label.includes(term) || p.sku?.toLowerCase?.()?.includes(term);
    });
  }, [availableProducts, productSearch]);

  const excludedCount = products.length - availableProducts.length;

  const selectAllFiltered = () => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      for (const p of filteredProducts) next.add(p.id);
      return next;
    });
  };

  const clearSelection = () => setSelectedProducts(new Set());

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  // Error de validación inline (dentro del modal, sin swal)
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validaciones locales: NO activan saving, muestran error inline
    const priceNumber = parseFloat(form.price);
    if (!(priceNumber > 0)) {
      setFormError('El precio debe ser mayor a 0.');
      return;
    }
    if (!editing) {
      if (!form.id_customer) {
        setFormError('Selecciona un cliente aliado.');
        return;
      }
      if (selectedProducts.size === 0) {
        setFormError('Selecciona al menos un producto.');
        return;
      }
    }

    // Validaciones pasaron — ahora sí llama al backend
    try {
      setSaving(true);

      if (editing) {
        await priceApi.updateConsignmentPrice(editing.id, {
          price: priceNumber,
          valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : undefined,
          valid_to: form.valid_to ? new Date(form.valid_to).toISOString() : null,
        });
      } else {
        const result = await priceApi.bulkCreateConsignmentPrice({
          id_customer: Number(form.id_customer),
          id_products: Array.from(selectedProducts),
          price: priceNumber,
          valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : undefined,
          valid_to: form.valid_to ? new Date(form.valid_to).toISOString() : null,
        });
        closeModal();
        fetchAll();
        await Swal.fire({
          title: 'Precios creados',
          text: `${result.created_count} precio(s) creado(s) correctamente.`,
          icon: 'success',
          confirmButtonColor: '#f0b429',
          timer: 2000,
          showConfirmButton: false,
        });
        return;
      }
      closeModal();
      fetchAll();
    } catch (err: any) {
      logError(err, '/consignment/prices');
      setFormError(err.message || 'No se pudo guardar el precio.');
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



  const columns = [
    { key: 'id', header: 'ID', width: '70px' },
    {
      key: 'customer',
      header: 'Cliente',
      render: (_: any, row: ConsignmentPrice) => row.customer?.name || `#${row.id_customer}`,
    },
    {
      key: 'product',
      header: 'Producto',
      render: (_: any, row: ConsignmentPrice) => productLabel(row.product),
    },
    {
      key: 'price',
      header: 'Precio',
      render: (_: any, row: ConsignmentPrice) =>
        row.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }),
    },
    {
      key: 'valid_from',
      header: 'Desde',
      render: (_: any, row: ConsignmentPrice) => row.valid_from?.slice(0, 10),
    },
    {
      key: 'valid_to',
      header: 'Hasta',
      render: (_: any, row: ConsignmentPrice) => (row.valid_to ? row.valid_to.slice(0, 10) : '—'),
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
            style={{ padding: '0.5rem', borderRadius: '6px', borderWidth: 1, borderStyle: 'solid', borderColor: '#2a2a35', background: '#1a1a24', color: '#f1f1f3' }}
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
        title={editing ? 'Editar Precio de Consignación' : 'Nuevos Precios de Consignación'}
        size="lg"
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
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', borderWidth: 1, borderStyle: 'solid', borderColor: '#2a2a35', background: '#1a1a24', color: '#f1f1f3' }}
                  >
                    <option value="">Selecciona...</option>
                    {allyCustomers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                {!form.id_customer ? (
                  <p style={{ fontSize: '0.85rem', color: '#a0a0b0', fontStyle: 'italic', margin: 0 }}>
                    Selecciona un cliente aliado para ver los productos disponibles.
                  </p>
                ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      Productos * <span style={{ color: '#f0b429' }}>({selectedProducts.size} seleccionado{selectedProducts.size !== 1 ? 's' : ''})</span>
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={selectAllFiltered}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.6rem',
                          background: 'transparent',
                          border: '1px solid #2a2a35',
                          borderRadius: '4px',
                          color: '#f0b429',
                          cursor: 'pointer',
                        }}
                      >
                        Seleccionar todos {productSearch ? '(filtrados)' : ''}
                      </button>
                      <button
                        type="button"
                        onClick={clearSelection}
                        disabled={selectedProducts.size === 0}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.6rem',
                          background: 'transparent',
                          border: '1px solid #2a2a35',
                          borderRadius: '4px',
                          color: selectedProducts.size > 0 ? '#f1f1f3' : '#3a3a48',
                          cursor: selectedProducts.size > 0 ? 'pointer' : 'not-allowed',
                        }}
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por referencia, color, talla o SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #2a2a35',
                      background: '#1a1a24',
                      color: '#f1f1f3',
                      marginBottom: '0.5rem',
                    }}
                  />
                  {form.id_customer && excludedCount > 0 && (
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#a0a0b0',
                      margin: '0 0 0.5rem',
                      fontStyle: 'italic',
                    }}>
                      ℹ️ {excludedCount} producto{excludedCount !== 1 ? 's' : ''} ocult{excludedCount !== 1 ? 'os' : 'o'} porque ya tiene{excludedCount !== 1 ? 'n' : ''} precio vigente para este cliente. Para cambiarlo{excludedCount !== 1 ? 's' : ''} usa el botón editar en la tabla.
                    </p>
                  )}
                  <div
                    style={{
                      maxHeight: '240px',
                      overflowY: 'auto',
                      border: '1px solid #2a2a35',
                      borderRadius: '6px',
                      background: '#1a1a24',
                    }}
                  >
                    {filteredProducts.length === 0 ? (
                      <p style={{ padding: '0.75rem', color: '#a0a0b0', fontSize: '0.85rem', margin: 0 }}>
                        {productSearch
                          ? 'Sin coincidencias.'
                          : availableProducts.length === 0 && form.id_customer
                          ? 'Todos los productos ya tienen precio vigente para este cliente.'
                          : 'No hay productos.'}
                      </p>
                    ) : (
                      filteredProducts.map((p: any) => {
                        const checked = selectedProducts.has(p.id);
                        return (
                          <label
                            key={p.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.4rem 0.6rem',
                              borderBottom: '1px solid #2a2a35',
                              cursor: 'pointer',
                              background: checked ? 'rgba(240,180,41,0.08)' : 'transparent',
                              fontSize: '0.85rem',
                              color: '#f1f1f3',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleProduct(p.id)}
                            />
                            <span>{productLabel(p)}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
                )}
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
          {formError && (
            <p style={{
              color: '#f87171',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginTop: '0.75rem',
              padding: '0.5rem 0.75rem',
              background: 'rgba(248,113,113,0.08)',
              borderRadius: '6px',
            }}>
              {formError}
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={saving}>
              {editing
                ? 'Actualizar'
                : selectedProducts.size > 1
                ? `Crear ${selectedProducts.size} precios`
                : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ConsignmentPricePage;
