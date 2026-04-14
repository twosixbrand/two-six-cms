import React, { useState, useEffect, useMemo } from 'react';
import { FiRotateCcw, FiPlus, FiTrash2, FiZap, FiX, FiEye, FiFileText } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../../components/common/PageHeader';
import { DataTable, Modal, Button, SearchInput, LoadingSpinner, FormField } from '../../components/ui';
import * as returnApi from '../../services/consignmentReturnApi';
import * as warehouseApi from '../../services/consignmentWarehouseApi';
import { getCustomers } from '../../services/customerApi';
import { getProducts } from '../../services/productApi';
import { getOrders } from '../../services/orderApi';
import { logError } from '../../services/errorApi';

interface ReturnItem {
  id_clothing_size: number;
  quantity: number;
  unit_price?: number;
  reason?: string;
  label: string;
}

const RETURN_TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PORTFOLIO: { label: 'Portafolio', color: '#1e40af', bg: '#dbeafe' },
  WARRANTY: { label: 'Garantía', color: '#92400e', bg: '#fef3c7' },
  POST_SALE: { label: 'Post-venta (NC)', color: '#991b1b', bg: '#fee2e2' },
};

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'Borrador', color: '#4a5568', bg: '#e2e8f0' },
  PROCESSED: { label: 'Procesada', color: '#065f46', bg: '#d1fae5' },
  CANCELLED: { label: 'Cancelada', color: '#991b1b', bg: '#fee2e2' },
};

const productLabel = (p: any) => {
  if (!p) return '—';
  const ref = p.clothingSize?.clothingColor?.design?.reference || '';
  const color = p.clothingSize?.clothingColor?.color?.name || '';
  const size = p.clothingSize?.size?.name || '';
  return `${ref} ${color} ${size}`.trim() || p.sku || `#${p.id}`;
};

const currencyCO = (n: number) =>
  (n ?? 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

const ConsignmentReturnPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{
    return_type: 'PORTFOLIO' | 'WARRANTY' | 'POST_SALE';
    id_customer: string;
    id_warehouse: string;
    id_order: string;
    notes: string;
    items: ReturnItem[];
  }>({
    return_type: 'PORTFOLIO',
    id_customer: '',
    id_warehouse: '',
    id_order: '',
    notes: '',
    items: [],
  });

  const [viewing, setViewing] = useState<any | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [rs, cs, whs, ps, os] = await Promise.all([
        returnApi.getReturns(),
        getCustomers(),
        warehouseApi.getWarehouses(),
        getProducts(),
        getOrders(),
      ]);
      setItems(rs);
      setCustomers(cs);
      setWarehouses(whs);
      setProducts(Array.isArray(ps) ? ps : ps.items || []);
      setOrders(Array.isArray(os) ? os : os.items || []);
      setError('');
    } catch (err: any) {
      logError(err, '/consignment/returns');
      setError('Error al cargar devoluciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const allyCustomers = useMemo(() => customers.filter((c) => c.is_consignment_ally), [customers]);

  const warehousesForCustomer = useMemo(
    () => warehouses.filter((w) => form.id_customer && String(w.id_customer) === form.id_customer),
    [warehouses, form.id_customer],
  );

  const selloutOrdersForCustomer = useMemo(
    () =>
      orders.filter(
        (o) =>
          form.id_customer &&
          String(o.id_customer) === form.id_customer &&
          o.status === 'SELLOUT',
      ),
    [orders, form.id_customer],
  );

  const filteredItems = useMemo(() => {
    let arr = items;
    if (typeFilter) arr = arr.filter((r) => r.return_type === typeFilter);
    if (search) {
      const term = search.toLowerCase();
      arr = arr.filter(
        (r) =>
          String(r.id).includes(term) ||
          r.warehouse?.name?.toLowerCase().includes(term) ||
          r.warehouse?.customer?.name?.toLowerCase().includes(term),
      );
    }
    return arr;
  }, [items, search, typeFilter]);

  const openCreateModal = () => {
    setForm({
      return_type: 'PORTFOLIO',
      id_customer: '',
      id_warehouse: '',
      id_order: '',
      notes: '',
      items: [],
    });
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const addItemRow = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id_clothing_size: 0, quantity: 1, unit_price: undefined, reason: '', label: '' },
      ],
    }));
  };

  const updateItemRow = (idx: number, patch: Partial<ReturnItem>) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    }));
  };

  const removeItemRow = (idx: number) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const handleProductSelect = (idx: number, productId: string) => {
    const product = products.find((p: any) => String(p.id) === productId);
    if (product) {
      updateItemRow(idx, {
        id_clothing_size: product.id_clothing_size || product.clothingSize?.id,
        label: productLabel(product),
        unit_price: form.return_type === 'POST_SALE' ? product.price : undefined,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!form.id_warehouse) throw new Error('Selecciona una bodega.');
      if (form.items.length === 0) throw new Error('Agrega al menos un ítem.');
      if (form.return_type === 'POST_SALE' && !form.id_order) {
        throw new Error('Selecciona la orden original para una devolución post-venta.');
      }
      for (const it of form.items) {
        if (!it.id_clothing_size) throw new Error('Selecciona producto en todos los ítems.');
        if (!(it.quantity > 0)) throw new Error('Las cantidades deben ser mayores a 0.');
        if (form.return_type === 'POST_SALE' && !(it.unit_price && it.unit_price > 0)) {
          throw new Error('Las devoluciones post-venta requieren precio unitario en todos los ítems.');
        }
      }

      setSaving(true);
      await returnApi.createReturn({
        id_warehouse: Number(form.id_warehouse),
        return_type: form.return_type,
        id_order: form.id_order ? Number(form.id_order) : undefined,
        notes: form.notes || undefined,
        items: form.items.map((it) => ({
          id_clothing_size: it.id_clothing_size,
          quantity: it.quantity,
          unit_price: it.unit_price,
          reason: it.reason || undefined,
        })),
      });
      closeModal();
      fetchAll();
      await Swal.fire({
        title: 'Devolución creada',
        text: 'Queda en borrador. Pulsa "Procesar" cuando quieras aplicar los movimientos de stock.',
        icon: 'success',
        confirmButtonColor: '#f0b429',
      });
    } catch (err: any) {
      logError(err, '/consignment/returns');
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    } finally {
      setSaving(false);
    }
  };

  const handleProcess = async (row: any) => {
    const result = await Swal.fire({
      title: '¿Procesar devolución?',
      html: `Se aplicarán los movimientos de stock. <strong>No se puede deshacer.</strong>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f0b429',
      cancelButtonColor: '#2a2a35',
      confirmButtonText: 'Sí, procesar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;

    try {
      const processed = await returnApi.processReturn(row.id);
      fetchAll();

      // Si es POST_SALE y tiene orden con factura DIAN, ofrecemos generar la nota crédito
      if (
        row.return_type === 'POST_SALE' &&
        processed.order?.dianEInvoicings?.length > 0
      ) {
        const invoice = processed.order.dianEInvoicings[0];
        const wantNC = await Swal.fire({
          title: '¿Generar Nota Crédito DIAN?',
          html: `La orden <strong>${processed.order.order_reference}</strong> tiene factura DIAN <code>${invoice.document_number}</code>. ¿Generar la nota crédito por los ítems devueltos?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#f0b429',
          cancelButtonColor: '#2a2a35',
          confirmButtonText: 'Sí, generar NC',
          cancelButtonText: 'Después',
        });

        if (wantNC.isConfirmed) {
          try {
            const lines = processed.items.map((it: any) => ({
              description: `Devolución item ${it.id_clothing_size}`,
              quantity: it.quantity,
              unitPrice: it.unit_price || 0,
              taxPercent: 19,
            }));
            const nc = await returnApi.generateDianCreditNote(invoice.id, {
              lines,
              reasonCode: '2',
              reasonDesc: 'Anulación parcial por devolución extemporánea',
            });
            if (nc?.noteId) {
              await returnApi.attachCreditNote(row.id, nc.noteId);
            }
            await Swal.fire({
              title: 'Nota crédito generada',
              html: `CUDE: <code>${nc.cude?.slice(0, 16)}...</code>`,
              icon: 'success',
              confirmButtonColor: '#f0b429',
            });
            fetchAll();
          } catch (err: any) {
            await Swal.fire({
              title: 'Error generando NC',
              text: err.message,
              icon: 'error',
              confirmButtonColor: '#f0b429',
            });
          }
        }
      } else {
        await Swal.fire({ title: 'Procesada', icon: 'success', timer: 1200, showConfirmButton: false });
      }
    } catch (err: any) {
      logError(err, '/consignment/returns/process');
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    }
  };

  const handleCancel = async (row: any) => {
    const result = await Swal.fire({
      title: 'Cancelar devolución',
      text: `¿Cancelar devolución #${row.id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f0b429',
      cancelButtonColor: '#2a2a35',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
    });
    if (!result.isConfirmed) return;
    try {
      await returnApi.cancelReturn(row.id);
      fetchAll();
    } catch (err: any) {
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    }
  };

  const handleDelete = async (row: any) => {
    const result = await Swal.fire({
      title: 'Eliminar',
      text: `¿Eliminar devolución #${row.id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f0b429',
      cancelButtonColor: '#2a2a35',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      await returnApi.deleteReturn(row.id);
      fetchAll();
    } catch (err: any) {
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    }
  };

  const openDetail = async (row: any) => {
    try {
      const full = await returnApi.getReturn(row.id);
      setViewing(full);
    } catch (err: any) {
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    }
  };

  const columns = [
    { key: 'id', header: 'ID', width: '70px' },
    {
      key: 'return_type',
      header: 'Tipo',
      render: (row: any) => {
        const t = RETURN_TYPE_LABELS[row.return_type];
        return (
          <span style={{
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: t.color,
            background: t.bg,
          }}>
            {t.label}
          </span>
        );
      },
    },
    {
      key: 'warehouse',
      header: 'Cliente / Bodega',
      render: (row: any) =>
        row.warehouse ? `${row.warehouse.customer?.name} — ${row.warehouse.name}` : `#${row.id_warehouse}`,
    },
    {
      key: 'order',
      header: 'Orden',
      render: (row: any) => row.order?.order_reference || '—',
    },
    {
      key: 'items_count',
      header: 'Ítems',
      render: (row: any) =>
        row.items
          ? `${row.items.length} (${row.items.reduce((s: number, i: any) => s + i.quantity, 0)} u.)`
          : '—',
    },
    {
      key: 'status',
      header: 'Estado',
      render: (row: any) => {
        const s = STATUS_LABELS[row.status];
        return (
          <span style={{
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: s.color,
            background: s.bg,
          }}>
            {s.label}
          </span>
        );
      },
    },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Devoluciones y Garantías" icon={<FiRotateCcw />} />
      <p style={{ marginTop: '-0.75rem', marginBottom: '1rem', color: '#a0aec0', fontSize: '0.9rem' }}>
        Devoluciones por portafolio, garantías y notas crédito extemporáneas (F04 + F05)
      </p>

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por ID, cliente o bodega..." />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e0' }}
          >
            <option value="">Todos los tipos</option>
            <option value="PORTFOLIO">Portafolio</option>
            <option value="WARRANTY">Garantía</option>
            <option value="POST_SALE">Post-venta (NC)</option>
          </select>
        </div>
        <Button variant="primary" icon={<FiPlus />} onClick={openCreateModal}>
          Nueva Devolución
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          emptyMessage="No hay devoluciones registradas"
          actions={(row: any) => (
            <>
              <Button variant="ghost" size="sm" icon={<FiEye />} onClick={() => openDetail(row)} />
              {row.status === 'DRAFT' && (
                <>
                  <Button variant="primary" size="sm" icon={<FiZap />} onClick={() => handleProcess(row)} />
                  <Button variant="ghost" size="sm" icon={<FiX />} onClick={() => handleCancel(row)} />
                  <Button variant="destructive" size="sm" icon={<FiTrash2 />} onClick={() => handleDelete(row)} />
                </>
              )}
              {row.credit_note_id && (
                <span title="Tiene nota crédito DIAN"><FiFileText /></span>
              )}
            </>
          )}
        />
      )}

      {/* === Create modal === */}
      <Modal isOpen={showModal} onClose={closeModal} title="Nueva Devolución" size="lg">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Tipo *</label>
              <select
                value={form.return_type}
                onChange={(e) => setForm((p) => ({ ...p, return_type: e.target.value as any, items: [] }))}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e0' }}
              >
                <option value="PORTFOLIO">Portafolio (obsolescencia) — vuelve al stock disponible</option>
                <option value="WARRANTY">Garantía (defectuosa) — marca como garantía</option>
                <option value="POST_SALE">Post-venta — requiere nota crédito DIAN</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Cliente *</label>
                <select
                  value={form.id_customer}
                  onChange={(e) => setForm((p) => ({ ...p, id_customer: e.target.value, id_warehouse: '', id_order: '' }))}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e0' }}
                >
                  <option value="">Selecciona...</option>
                  {allyCustomers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Bodega *</label>
                <select
                  value={form.id_warehouse}
                  onChange={(e) => setForm((p) => ({ ...p, id_warehouse: e.target.value }))}
                  required
                  disabled={!form.id_customer}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e0' }}
                >
                  <option value="">Selecciona...</option>
                  {warehousesForCustomer.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {form.return_type === 'POST_SALE' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Orden original *</label>
                <select
                  value={form.id_order}
                  onChange={(e) => setForm((p) => ({ ...p, id_order: e.target.value }))}
                  required
                  disabled={!form.id_customer}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e0' }}
                >
                  <option value="">Selecciona...</option>
                  {selloutOrdersForCustomer.map((o: any) => (
                    <option key={o.id} value={o.id}>
                      {o.order_reference} · {currencyCO(o.total_payment)}
                    </option>
                  ))}
                </select>
                {selloutOrdersForCustomer.length === 0 && form.id_customer && (
                  <small style={{ color: '#dc2626' }}>
                    No hay órdenes sell-out para este cliente.
                  </small>
                )}
              </div>
            )}

            <FormField
              label="Notas (opcional)"
              name="notes"
              value={form.notes}
              onChange={(e: any) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Motivo, referencia, etc."
            />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong>Ítems</strong>
                <Button variant="ghost" size="sm" icon={<FiPlus />} onClick={addItemRow}>Agregar</Button>
              </div>
              {form.items.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: '#a0aec0' }}>Sin ítems todavía.</p>
              )}
              {form.items.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: form.return_type === 'POST_SALE' ? '1.5fr 80px 120px 1fr 40px' : '1.5fr 80px 1fr 40px',
                    gap: '0.5rem',
                    alignItems: 'end',
                    marginBottom: '0.5rem',
                    padding: '0.5rem',
                    background: '#f7fafc',
                    borderRadius: '6px',
                  }}
                >
                  <select
                    value={it.id_clothing_size ? String(products.find((p: any) => (p.id_clothing_size || p.clothingSize?.id) === it.id_clothing_size)?.id || '') : ''}
                    onChange={(e) => handleProductSelect(idx, e.target.value)}
                    style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                  >
                    <option value="">Producto...</option>
                    {products.map((p: any) => (
                      <option key={p.id} value={p.id}>{productLabel(p)}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    placeholder="Cant."
                    value={it.quantity}
                    onChange={(e) => updateItemRow(idx, { quantity: parseInt(e.target.value) || 0 })}
                    style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                  />
                  {form.return_type === 'POST_SALE' && (
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Precio unitario"
                      value={it.unit_price ?? ''}
                      onChange={(e) => updateItemRow(idx, { unit_price: parseFloat(e.target.value) || 0 })}
                      style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                    />
                  )}
                  <input
                    type="text"
                    placeholder="Motivo"
                    value={it.reason || ''}
                    onChange={(e) => updateItemRow(idx, { reason: e.target.value })}
                    style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                  />
                  <Button variant="destructive" size="sm" icon={<FiTrash2 />} onClick={() => removeItemRow(idx)} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={saving}>Crear borrador</Button>
          </div>
        </form>
      </Modal>

      {/* === Detail modal === */}
      <Modal
        isOpen={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing ? `Devolución #${viewing.id}` : ''}
        size="md"
      >
        {viewing && (
          <div>
            <p style={{ margin: '0.25rem 0' }}>
              <strong>Tipo:</strong> {RETURN_TYPE_LABELS[viewing.return_type]?.label}
            </p>
            <p style={{ margin: '0.25rem 0' }}>
              <strong>Cliente:</strong> {viewing.warehouse?.customer?.name}
            </p>
            <p style={{ margin: '0.25rem 0' }}>
              <strong>Bodega:</strong> {viewing.warehouse?.name}
            </p>
            <p style={{ margin: '0.25rem 0' }}>
              <strong>Estado:</strong> {STATUS_LABELS[viewing.status]?.label}
            </p>
            {viewing.order && (
              <p style={{ margin: '0.25rem 0' }}>
                <strong>Orden:</strong> {viewing.order.order_reference}
              </p>
            )}
            {viewing.credit_note_id && (
              <p style={{ margin: '0.25rem 0' }}>
                <strong>Nota Crédito DIAN:</strong> #{viewing.credit_note_id}
              </p>
            )}
            {viewing.notes && (
              <p style={{ margin: '0.5rem 0', fontStyle: 'italic' }}>{viewing.notes}</p>
            )}

            <table style={{ width: '100%', marginTop: '0.5rem', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Producto</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem' }}>Cant.</th>
                  {viewing.return_type === 'POST_SALE' && (
                    <th style={{ textAlign: 'right', padding: '0.5rem' }}>Precio</th>
                  )}
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {(viewing.items || []).map((it: any) => (
                  <tr key={it.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={{ padding: '0.5rem' }}>
                      {it.clothingSize?.clothingColor?.design?.reference}{' '}
                      {it.clothingSize?.clothingColor?.color?.name}{' '}
                      {it.clothingSize?.size?.name}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>{it.quantity}</td>
                    {viewing.return_type === 'POST_SALE' && (
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        {it.unit_price ? currencyCO(it.unit_price) : '—'}
                      </td>
                    )}
                    <td style={{ padding: '0.5rem' }}>{it.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button variant="primary" onClick={() => setViewing(null)}>Cerrar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ConsignmentReturnPage;
