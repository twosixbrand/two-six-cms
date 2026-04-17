import React, { useState, useEffect, useMemo } from 'react';
import { FiTruck, FiPlus, FiTrash2, FiSend, FiX, FiEye, FiPrinter } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../../components/common/PageHeader';
import { DataTable, Modal, FormField, Button, SearchInput, LoadingSpinner } from '../../components/ui';
import * as dispatchApi from '../../services/consignmentDispatchApi';
import * as warehouseApi from '../../services/consignmentWarehouseApi';
import * as priceApi from '../../services/consignmentPriceApi';
import { getProducts } from '../../services/productApi';
import { logError } from '../../services/errorApi';

const getItemImage = (it: any): string | null =>
  it?.clothingSize?.clothingColor?.imageClothing?.[0]?.image_url ?? it?.image_url ?? it?.product?.image_url ?? null;

interface DispatchItem {
  id_clothing_size: number;
  quantity: number;
  label: string;
  max_available: number; // stock disponible del producto
}

interface Dispatch {
  id: number;
  dispatch_number: string;
  status: 'PENDIENTE' | 'EN_TRANSITO' | 'RECIBIDO' | 'CANCELADO';
  qr_token: string;
  notes?: string;
  sent_at?: string | null;
  received_at?: string | null;
  received_by?: string | null;
  id_warehouse: number;
  warehouse?: {
    id: number;
    name: string;
    customer?: { id: number; name: string };
  };
  items?: any[];
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PENDIENTE: { label: 'Borrador', color: '#92400e', bg: '#fef3c7' },
  EN_TRANSITO: { label: 'En tránsito', color: '#1e40af', bg: '#dbeafe' },
  RECIBIDO: { label: 'Recibido', color: '#065f46', bg: '#d1fae5' },
  CANCELADO: { label: 'Cancelado', color: '#991b1b', bg: '#fee2e2' },
};

const WEB_PUBLIC_URL = import.meta.env.VITE_WEB_PUBLIC_URL || 'http://localhost:3000';

const productLabel = (p: any) => {
  if (!p) return '—';
  // El admin endpoint devuelve campos planos (reference, color_name, size_name)
  // y el include anidado (clothingSize.clothingColor...) como fallback.
  const ref = p.reference || p.clothingSize?.clothingColor?.design?.reference || '';
  const color = p.color_name || p.clothingSize?.clothingColor?.color?.name || '';
  const size = p.size_name || p.clothingSize?.size?.name || '';
  return `${ref}-${color}-${size}`.trim() || p.sku || `#${p.id}`;
};

const ConsignmentDispatchPage = () => {
  const [items, setItems] = useState<Dispatch[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState<{
    id_warehouse: string;
    notes: string;
    items: DispatchItem[];
  }>({ id_warehouse: '', notes: '', items: [] });

  // Productos filtrados: solo los que tienen precio vigente para el cliente de la bodega
  const [allowedProductIds, setAllowedProductIds] = useState<Set<number> | null>(null);

  // Detail / QR modal
  const [viewingDispatch, setViewingDispatch] = useState<Dispatch | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [ds, whs, ps] = await Promise.all([
        dispatchApi.getDispatches(),
        warehouseApi.getWarehouses(),
        getProducts(),
      ]);
      setItems(ds);
      setWarehouses(whs.filter((w: any) => w.is_active));
      setProducts(Array.isArray(ps) ? ps : ps.items || []);
      setError('');
    } catch (err: any) {
      logError(err, '/consignment/dispatches');
      setError('Error al cargar los despachos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Cuando cambia la bodega, carga los precios vigentes del cliente dueño
  // y filtra la lista de productos a solo los que tienen precio pactado.
  useEffect(() => {
    if (!createForm.id_warehouse || !showCreateModal) {
      setAllowedProductIds(null);
      return;
    }
    const wh = warehouses.find((w: any) => String(w.id) === createForm.id_warehouse);
    if (!wh) { setAllowedProductIds(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const prices = await priceApi.getConsignmentPrices({
          id_customer: wh.id_customer,
          only_active: true,
        });
        if (cancelled) return;
        setAllowedProductIds(new Set(prices.map((p: any) => p.id_product)));
      } catch (err) {
        logError(err, '/consignment/dispatches/load-prices');
        setAllowedProductIds(null);
      }
    })();
    return () => { cancelled = true; };
  }, [createForm.id_warehouse, showCreateModal, warehouses]);

  const dispatchableProducts = useMemo(() => {
    if (!allowedProductIds) return products;
    return products.filter((p: any) => allowedProductIds.has(p.id));
  }, [products, allowedProductIds]);

  const filteredItems = useMemo(() => {
    let arr = items;
    if (statusFilter) arr = arr.filter((d) => d.status === statusFilter);
    if (search) {
      const term = search.toLowerCase();
      arr = arr.filter(
        (d) =>
          d.dispatch_number.toLowerCase().includes(term) ||
          d.warehouse?.name?.toLowerCase().includes(term) ||
          d.warehouse?.customer?.name?.toLowerCase().includes(term),
      );
    }
    return arr;
  }, [items, search, statusFilter]);

  const openCreateModal = () => {
    setCreateForm({ id_warehouse: '', notes: '', items: [] });
    setShowCreateModal(true);
  };
  const closeCreateModal = () => setShowCreateModal(false);

  const addItemRow = () => {
    setCreateForm((prev) => ({
      ...prev,
      items: [...prev.items, { id_clothing_size: 0, quantity: 1, label: '', max_available: 0 }],
    }));
  };

  const updateItemRow = (idx: number, patch: Partial<DispatchItem>) => {
    setCreateForm((prev) => ({
      ...prev,
      items: prev.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    }));
  };

  const removeItemRow = (idx: number) => {
    setCreateForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const handleProductSelect = (idx: number, productId: string) => {
    const product = dispatchableProducts.find((p: any) => String(p.id) === productId);
    if (product) {
      const available = product.quantity_available ?? product.clothingSize?.quantity_available ?? 0;
      updateItemRow(idx, {
        id_clothing_size: product.id_clothing_size || product.clothingSize?.id,
        label: productLabel(product),
        max_available: available,
        quantity: Math.min(1, available),
      });
    }
  };

  const [createError, setCreateError] = useState('');

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    // Validaciones locales — error inline, sin loading
    if (!createForm.id_warehouse) { setCreateError('Selecciona una bodega destino.'); return; }
    if (createForm.items.length === 0) { setCreateError('Agrega al menos un ítem.'); return; }
    for (const it of createForm.items) {
      if (!it.id_clothing_size) { setCreateError('Selecciona producto en todos los ítems.'); return; }
      if (!(it.quantity > 0)) { setCreateError('Todas las cantidades deben ser mayores a 0.'); return; }
    }

    try {
      setSaving(true);
      await dispatchApi.createDispatch({
        id_warehouse: Number(createForm.id_warehouse),
        notes: createForm.notes || undefined,
        items: createForm.items.map((it) => ({
          id_clothing_size: it.id_clothing_size,
          quantity: it.quantity,
        })),
      });
      closeCreateModal();
      fetchAll();
      await Swal.fire({
        title: 'Despacho creado',
        text: 'El despacho queda en borrador. Revísalo y pulsa "Enviar" cuando quieras generar el QR.',
        icon: 'success',
        confirmButtonColor: '#f0b429',
      });
    } catch (err: any) {
      logError(err, '/consignment/dispatches');
      setCreateError(err.message || 'Error al crear el despacho.');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async (row: Dispatch) => {
    try {
      // 1. Pre-send: verifica stock actual vs solicitado
      const check = await dispatchApi.preSendDispatch(row.id);

      if (check.has_changes) {
        // Hay diferencias — muestra alerta con detalle
        const changedRows = check.items
          .filter((it: any) => it.changed)
          .map(
            (it: any) =>
              `<tr>
                <td style="padding:4px 8px">${it.reference} ${it.color} ${it.size}</td>
                <td style="padding:4px 8px;text-align:right"><s>${it.requested}</s></td>
                <td style="padding:4px 8px;text-align:right;color:#34d399">${it.available}</td>
                <td style="padding:4px 8px;text-align:right;font-weight:700">${it.adjusted}</td>
              </tr>`,
          )
          .join('');

        const confirm = await Swal.fire({
          title: 'Stock cambio desde la creacion',
          html: `
            <p style="margin-bottom:8px;font-size:13px;color:#666">
              Algunos productos se vendieron en la web despues de crear este borrador.
              Las cantidades se ajustarán al stock disponible actual:
            </p>
            <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:8px">
              <thead>
                <tr style="border-bottom:2px solid #e2e8f0;color:#888">
                  <th style="text-align:left;padding:4px 8px">Producto</th>
                  <th style="text-align:right;padding:4px 8px">Solicitado</th>
                  <th style="text-align:right;padding:4px 8px">Disponible</th>
                  <th style="text-align:right;padding:4px 8px">Se enviara</th>
                </tr>
              </thead>
              <tbody>${changedRows}</tbody>
            </table>
          `,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#f0b429',
          cancelButtonColor: '#2a2a35',
          confirmButtonText: 'Enviar con cantidades ajustadas',
          cancelButtonText: 'Cancelar',
          width: 600,
        });

        if (!confirm.isConfirmed) return;

        // Envía con ajuste automático
        await dispatchApi.sendDispatch(row.id, { adjust_to_available: true });
      } else {
        // Sin cambios — confirma normalmente
        const confirm = await Swal.fire({
          title: '¿Enviar despacho?',
          html: `Stock verificado: todas las cantidades estan disponibles.<br/><strong>Se descontara del inventario y se generara el QR.</strong>`,
          icon: 'success',
          showCancelButton: true,
          confirmButtonColor: '#f0b429',
          cancelButtonColor: '#2a2a35',
          confirmButtonText: 'Enviar',
          cancelButtonText: 'Cancelar',
        });
        if (!confirm.isConfirmed) return;

        await dispatchApi.sendDispatch(row.id);
      }

      fetchAll();
      const fresh = await dispatchApi.getDispatch(row.id);
      setViewingDispatch(fresh);
    } catch (err: any) {
      logError(err, '/consignment/dispatches/send');
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    }
  };

  const handleCancel = async (row: Dispatch) => {
    const result = await Swal.fire({
      title: 'Cancelar despacho',
      text: `¿Cancelar el despacho ${row.dispatch_number}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f0b429',
      cancelButtonColor: '#2a2a35',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
    });
    if (!result.isConfirmed) return;
    try {
      await dispatchApi.cancelDispatch(row.id);
      fetchAll();
    } catch (err: any) {
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    }
  };

  const handleDelete = async (row: Dispatch) => {
    const result = await Swal.fire({
      title: 'Eliminar despacho',
      text: `Se eliminará ${row.dispatch_number}. Solo permitido si no afectó stock.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f0b429',
      cancelButtonColor: '#2a2a35',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      await dispatchApi.deleteDispatch(row.id);
      fetchAll();
    } catch (err: any) {
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    }
  };

  const openDetail = async (row: Dispatch) => {
    try {
      const full = await dispatchApi.getDispatch(row.id);
      setViewingDispatch(full);
    } catch (err: any) {
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    }
  };

  const confirmationUrl = (token: string) =>
    `${WEB_PUBLIC_URL}/consignment/dispatch/${token}`;

  const qrImageSrc = (token: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
      confirmationUrl(token),
    )}`;

  const columns = [
    { key: 'dispatch_number', header: 'Nº Despacho', width: '150px' },
    {
      key: 'warehouse',
      header: 'Cliente / Bodega',
      render: (_: any, row: Dispatch) =>
        row.warehouse
          ? `${row.warehouse.customer?.name || ''} — ${row.warehouse.name}`
          : `#${row.id_warehouse}`,
    },
    {
      key: 'items_count',
      header: 'Ítems',
      render: (_: any, row: Dispatch) => {
        if (!row.items || row.items.length === 0) return '—';
        const totalQty = row.items.reduce((s: number, i: any) => s + i.quantity, 0);
        return `${row.items.length} ref. · ${totalQty} uds`;
      },
    },
    {
      key: 'status',
      header: 'Estado',
      render: (_: any, row: Dispatch) => {
        const s = STATUS_LABELS[row.status] || { label: row.status, color: '#000', bg: '#eee' };
        return (
          <span
            style={{
              display: 'inline-block',
              padding: '2px 10px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: s.color,
              background: s.bg,
            }}
          >
            {s.label}
          </span>
        );
      },
    },
    {
      key: 'sent_at',
      header: 'Enviado',
      render: (_: any, row: Dispatch) => (row.sent_at ? new Date(row.sent_at).toLocaleDateString() : '—'),
    },
    {
      key: 'received_at',
      header: 'Recibido',
      render: (_: any, row: Dispatch) =>
        row.received_at
          ? `${new Date(row.received_at).toLocaleDateString()}${row.received_by ? ' · ' + row.received_by : ''}`
          : '—',
    },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Despachos de Consignación" icon={<FiTruck />} />
      <p style={{ marginTop: '-0.75rem', marginBottom: '1rem', color: '#a0aec0', fontSize: '0.9rem' }}>
        Despachos con validación QR escaneable desde móvil (F03)
      </p>

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por número, cliente o bodega..." />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '6px', borderWidth: 1, borderStyle: 'solid', borderColor: '#2a2a35', background: '#1a1a24', color: '#f1f1f3' }}
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Borrador</option>
            <option value="EN_TRANSITO">En tránsito</option>
            <option value="RECIBIDO">Recibido</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
        <Button variant="primary" icon={<FiPlus />} onClick={openCreateModal}>
          Nuevo Despacho
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando despachos..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          emptyMessage="No hay despachos registrados"
          actions={(row: Dispatch) => (
            <>
              <Button variant="ghost" size="sm" icon={<FiEye />} onClick={() => openDetail(row)} />
              {row.status === 'PENDIENTE' && (
                <>
                  <Button variant="primary" size="sm" icon={<FiSend />} onClick={() => handleSend(row)} />
                  <Button variant="ghost" size="sm" icon={<FiX />} onClick={() => handleCancel(row)} />
                  <Button variant="destructive" size="sm" icon={<FiTrash2 />} onClick={() => handleDelete(row)} />
                </>
              )}
              {(row.status === 'EN_TRANSITO' || row.status === 'RECIBIDO') && (
                <Button variant="ghost" size="sm" icon={<FiPrinter />} onClick={() => openDetail(row)} />
              )}
            </>
          )}
        />
      )}

      {/* === Modal de creación === */}
      <Modal isOpen={showCreateModal} onClose={closeCreateModal} title="Nuevo Despacho de Consignación" size="lg">
        <form onSubmit={handleCreateSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600, color: '#f1f1f3' }}>
                Bodega destino *
              </label>
              <select
                value={createForm.id_warehouse}
                onChange={(e) => setCreateForm((p) => ({ ...p, id_warehouse: e.target.value, items: [] }))}
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', borderWidth: 1, borderStyle: 'solid', borderColor: '#2a2a35', background: '#1a1a24', color: '#f1f1f3' }}
              >
                <option value="">Selecciona...</option>
                {warehouses.map((w: any) => (
                  <option key={w.id} value={w.id}>
                    {w.customer?.name} — {w.name}
                  </option>
                ))}
              </select>
            </div>

            <FormField label="Notas (opcional)" name="notes" value={createForm.notes}
              onChange={(e: any) => setCreateForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Observaciones para el cliente..." />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong style={{ color: '#f1f1f3' }}>Ítems del despacho</strong>
                <Button variant="ghost" size="sm" icon={<FiPlus />} onClick={addItemRow}>
                  Agregar ítem
                </Button>
              </div>

              {createForm.id_warehouse && allowedProductIds !== null && dispatchableProducts.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: '#f87171', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                  No hay productos con precio de consignación vigente para este cliente. Configura precios en "Precios por Cliente" primero.
                </p>
              )}

              {createForm.items.length === 0 && dispatchableProducts.length > 0 && (
                <p style={{ fontSize: '0.85rem', color: '#a0aec0', fontStyle: 'italic' }}>Sin ítems todavía. Pulsa "Agregar ítem" para comenzar.</p>
              )}

              {createForm.items.map((it, idx) => {
                const overMax = it.max_available > 0 && it.quantity > it.max_available;
                return (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 120px 40px',
                    gap: '0.5rem',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                    padding: '0.6rem 0.75rem',
                    background: '#1a1a24',
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: overMax ? '#f87171' : '#2a2a35',
                    borderRadius: '8px',
                  }}
                >
                  <div>
                    <select
                      value={it.id_clothing_size ? String(dispatchableProducts.find((p: any) => (p.id_clothing_size || p.clothingSize?.id) === it.id_clothing_size)?.id || '') : ''}
                      onChange={(e) => handleProductSelect(idx, e.target.value)}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', borderWidth: 1, borderStyle: 'solid', borderColor: '#2a2a35', background: '#12121a', color: '#f1f1f3', fontSize: '0.85rem' }}
                    >
                      <option value="">Selecciona producto...</option>
                      {dispatchableProducts.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {productLabel(p)} (disp: {p.quantity_available ?? 0})
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={it.max_available > 0 ? it.max_available : undefined}
                    value={it.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      const capped = it.max_available > 0 ? Math.min(val, it.max_available) : val;
                      updateItemRow(idx, { quantity: capped });
                    }}
                    placeholder="Cant."
                    style={{ padding: '0.45rem', borderRadius: '6px', borderWidth: 1, borderStyle: 'solid', borderColor: overMax ? '#f87171' : '#2a2a35', background: '#12121a', color: '#f1f1f3', textAlign: 'right', fontSize: '0.85rem' }}
                  />
                  <Button variant="destructive" size="sm" icon={<FiTrash2 />} onClick={() => removeItemRow(idx)} />
                </div>
                );
              })}
            </div>
          </div>

          {createError && (
            <p style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(248,113,113,0.08)', borderRadius: '6px' }}>
              {createError}
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={closeCreateModal}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={saving}>Crear borrador</Button>
          </div>
        </form>
      </Modal>

      {/* === Modal de detalle + QR === */}
      <Modal
        isOpen={!!viewingDispatch}
        onClose={() => setViewingDispatch(null)}
        title={viewingDispatch ? `Despacho ${viewingDispatch.dispatch_number}` : ''}
        size="lg"
      >
        {viewingDispatch && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Cliente:</strong> {viewingDispatch.warehouse?.customer?.name}
              <br />
              <strong>Bodega:</strong> {viewingDispatch.warehouse?.name}
              <br />
              <strong>Estado:</strong>{' '}
              <span style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: STATUS_LABELS[viewingDispatch.status]?.color,
                background: STATUS_LABELS[viewingDispatch.status]?.bg,
              }}>
                {STATUS_LABELS[viewingDispatch.status]?.label}
              </span>
              {viewingDispatch.received_at && (
                <>
                  <br />
                  <strong>Recibido:</strong> {new Date(viewingDispatch.received_at).toLocaleString()} por {viewingDispatch.received_by}
                </>
              )}
              {viewingDispatch.notes && (
                <>
                  <br />
                  <strong>Notas:</strong> {viewingDispatch.notes}
                </>
              )}
            </div>

            {(viewingDispatch.status === 'EN_TRANSITO' || viewingDispatch.status === 'RECIBIDO') && (
              <div style={{ textAlign: 'center', padding: '1rem', background: '#12121a', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#4a5568' }}>
                  El cliente escanea este QR para confirmar la recepción:
                </p>
                <img
                  src={qrImageSrc(viewingDispatch.qr_token)}
                  alt="QR de recepción"
                  style={{ width: '220px', height: '220px' }}
                />
                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#718096', wordBreak: 'break-all' }}>
                  {confirmationUrl(viewingDispatch.qr_token)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(confirmationUrl(viewingDispatch.qr_token));
                    Swal.fire({ title: 'URL copiada', icon: 'success', timer: 1200, showConfirmButton: false });
                  }}
                >
                  Copiar URL
                </Button>
              </div>
            )}

            <div>
              <strong>Ítems:</strong>
              <table style={{ width: '100%', marginTop: '0.5rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.85rem' }}>Producto</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem', fontSize: '0.85rem' }}>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {(viewingDispatch.items || []).map((it: any) => (
                    <tr key={it.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                      <td style={{ padding: '0.5rem', fontSize: '0.9rem' }}>
                        <img src={getItemImage(it) || ""} alt="" style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover', background: '#2a2a35', marginRight: 6, verticalAlign: 'middle' }} />
                        {it.clothingSize?.clothingColor?.design?.reference}{' '}
                        {it.clothingSize?.clothingColor?.color?.name}{' '}
                        {it.clothingSize?.size?.name}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.9rem' }}>{it.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button variant="primary" onClick={() => setViewingDispatch(null)}>Cerrar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ConsignmentDispatchPage;
