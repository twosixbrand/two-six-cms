import React, { useState, useEffect, useMemo } from 'react';
import { FiClipboard, FiPlus, FiZap, FiX, FiEye, FiSave, FiDollarSign } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../../components/common/PageHeader';
import { DataTable, Modal, Button, SearchInput, LoadingSpinner, FormField } from '../../components/ui';
import * as ccApi from '../../services/consignmentCycleCountApi';
import * as warehouseApi from '../../services/consignmentWarehouseApi';
import * as selloutApi from '../../services/consignmentSelloutApi';
import { logError } from '../../services/errorApi';

const getItemImage = (it: any): string | null =>
  it?.clothingSize?.clothingColor?.imageClothing?.[0]?.image_url ?? it?.image_url ?? it?.product?.image_url ?? null;

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'Borrador', color: '#92400e', bg: '#fef3c7' },
  APPROVED: { label: 'Aprobado', color: '#065f46', bg: '#d1fae5' },
  CANCELLED: { label: 'Cancelado', color: '#991b1b', bg: '#fee2e2' },
};

const currencyCO = (n: number) =>
  (n ?? 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

const ConsignmentCycleCountPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ id_warehouse: '', notes: '' });
  const [creating, setCreating] = useState(false);

  // Count editor (detail)
  const [editing, setEditing] = useState<any | null>(null);
  const [realQtys, setRealQtys] = useState<Record<number, string>>({});
  const [savingItems, setSavingItems] = useState(false);
  const [approving, setApproving] = useState(false);

  // Merma modal
  const [mermaFor, setMermaFor] = useState<any | null>(null);
  const [mermaForm, setMermaForm] = useState<{ price_mode: 'CONSIGNMENT' | 'PENALTY'; penalty_unit_price: string; notes: string }>({
    price_mode: 'CONSIGNMENT',
    penalty_unit_price: '',
    notes: '',
  });
  const [mermaSubmitting, setMermaSubmitting] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [ccs, whs] = await Promise.all([ccApi.getCycleCounts(), warehouseApi.getWarehouses()]);
      setItems(ccs);
      setWarehouses(whs.filter((w: any) => w.is_active));
      setError('');
    } catch (err: any) {
      logError(err, '/consignment/cycle-counts');
      setError('Error al cargar los conteos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredItems = useMemo(() => {
    let arr = items;
    if (statusFilter) arr = arr.filter((c) => c.status === statusFilter);
    if (search) {
      const term = search.toLowerCase();
      arr = arr.filter(
        (c) =>
          String(c.id).includes(term) ||
          c.warehouse?.name?.toLowerCase().includes(term) ||
          c.warehouse?.customer?.name?.toLowerCase().includes(term),
      );
    }
    return arr;
  }, [items, search, statusFilter]);

  const openCreateModal = () => {
    setCreateForm({ id_warehouse: '', notes: '' });
    setShowCreateModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!createForm.id_warehouse) throw new Error('Selecciona una bodega.');
      setCreating(true);
      const created = await ccApi.createCycleCount({
        id_warehouse: Number(createForm.id_warehouse),
        notes: createForm.notes || undefined,
      });
      setShowCreateModal(false);
      fetchAll();
      // Abre el editor con el conteo recién creado
      openEditor(created.id);
    } catch (err: any) {
      logError(err, '/consignment/cycle-counts');
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    } finally {
      setCreating(false);
    }
  };

  const openEditor = async (id: number) => {
    try {
      const full = await ccApi.getCycleCount(id);
      setEditing(full);
      const map: Record<number, string> = {};
      for (const it of full.items) {
        map[it.id] = it.real_qty === null || it.real_qty === undefined ? '' : String(it.real_qty);
      }
      setRealQtys(map);
    } catch (err: any) {
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    }
  };

  const closeEditor = () => {
    setEditing(null);
    setRealQtys({});
  };

  const handleSaveItems = async () => {
    if (!editing) return;
    try {
      setSavingItems(true);
      const payload = editing.items.map((it: any) => ({
        id: it.id,
        real_qty: realQtys[it.id] === '' ? null : parseInt(realQtys[it.id], 10),
      }));
      await ccApi.saveCycleCountItems(editing.id, payload);
      await Swal.fire({ title: 'Guardado', icon: 'success', timer: 1000, showConfirmButton: false });
    } catch (err: any) {
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    } finally {
      setSavingItems(false);
    }
  };

  const handleApprove = async () => {
    if (!editing) return;
    // Primero guarda el progreso
    const hasMissing = editing.items.some((it: any) => realQtys[it.id] === '' || realQtys[it.id] === undefined);
    if (hasMissing) {
      await Swal.fire({
        title: 'Faltan conteos',
        text: 'Captura real_qty en todos los ítems antes de aprobar.',
        icon: 'warning',
        confirmButtonColor: '#f0b429',
      });
      return;
    }
    const confirm = await Swal.fire({
      title: '¿Aprobar conteo?',
      text: 'Se aplicarán los ajustes de stock y no podrás modificar el conteo después.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f0b429',
      cancelButtonColor: '#2a2a35',
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
    });
    if (!confirm.isConfirmed) return;

    try {
      setApproving(true);
      // Guarda progreso antes de aprobar
      const payload = editing.items.map((it: any) => ({
        id: it.id,
        real_qty: parseInt(realQtys[it.id], 10),
      }));
      await ccApi.saveCycleCountItems(editing.id, payload);
      const approved = await ccApi.approveCycleCount(editing.id);

      // Detecta faltantes
      const shortages = approved.items.filter((it: any) => (it.real_qty ?? 0) < it.theoretical_qty);
      fetchAll();

      if (shortages.length > 0) {
        const wantMerma = await Swal.fire({
          title: 'Aprobado con faltantes',
          html: `Hay <strong>${shortages.length}</strong> referencias con faltante. ¿Quieres facturar la merma al cliente ahora?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#f0b429',
          cancelButtonColor: '#2a2a35',
          confirmButtonText: 'Sí, facturar merma',
          cancelButtonText: 'Después',
        });
        closeEditor();
        if (wantMerma.isConfirmed) {
          openMermaModal(approved);
        }
      } else {
        await Swal.fire({ title: 'Aprobado sin discrepancias', icon: 'success', confirmButtonColor: '#f0b429' });
        closeEditor();
      }
    } catch (err: any) {
      logError(err, '/consignment/cycle-counts/approve');
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    } finally {
      setApproving(false);
    }
  };

  const handleCancel = async (row: any) => {
    const result = await Swal.fire({
      title: 'Cancelar conteo',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f0b429',
      cancelButtonColor: '#2a2a35',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
    });
    if (!result.isConfirmed) return;
    try {
      await ccApi.cancelCycleCount(row.id);
      fetchAll();
    } catch (err: any) {
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    }
  };

  const openMermaModal = (count: any) => {
    setMermaFor(count);
    setMermaForm({ price_mode: 'CONSIGNMENT', penalty_unit_price: '', notes: '' });
  };
  const closeMermaModal = () => {
    setMermaFor(null);
  };

  const handleCreateMerma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mermaFor) return;
    if (mermaForm.price_mode === 'PENALTY' && !(parseFloat(mermaForm.penalty_unit_price) > 0)) {
      await Swal.fire({ title: 'Precio inválido', text: 'Ingresa un precio de penalización válido.', icon: 'warning', confirmButtonColor: '#f0b429' });
      return;
    }
    try {
      setMermaSubmitting(true);
      const order = await ccApi.createMermaInvoice(mermaFor.id, {
        price_mode: mermaForm.price_mode,
        penalty_unit_price: mermaForm.price_mode === 'PENALTY' ? parseFloat(mermaForm.penalty_unit_price) : undefined,
        notes: mermaForm.notes || undefined,
      });

      // Dispara DIAN
      let dianResult: any = null;
      let dianError: string | null = null;
      try {
        dianResult = await selloutApi.generateDianForOrder(order.id);
      } catch (err: any) {
        dianError = err.message || 'Error al generar DIAN';
      }

      closeMermaModal();
      fetchAll();

      await Swal.fire({
        title: dianError ? 'Orden creada (DIAN pendiente)' : '¡Merma facturada!',
        html: dianError
          ? `Orden <strong>${order.order_reference}</strong> creada, pero DIAN falló:<br/><code>${dianError}</code>`
          : `Orden <strong>${order.order_reference}</strong> · Total <strong>${currencyCO(order.total_payment)}</strong><br/>DIAN CUFE: <code>${dianResult?.cufe?.slice(0, 16)}...</code>`,
        icon: dianError ? 'warning' : 'success',
        confirmButtonColor: '#f0b429',
      });
    } catch (err: any) {
      logError(err, '/consignment/cycle-counts/merma');
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    } finally {
      setMermaSubmitting(false);
    }
  };

  const columns = [
    { key: 'id', header: 'ID', width: '70px' },
    {
      key: 'warehouse',
      header: 'Cliente / Bodega',
      render: (_: any, row: any) =>
        row.warehouse ? `${row.warehouse.customer?.name} — ${row.warehouse.name}` : `#${row.id_warehouse}`,
    },
    {
      key: 'items',
      header: 'Referencias',
      render: (_: any, row: any) => row.items?.length ?? 0,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (_: any, row: any) => {
        const s = STATUS_LABELS[row.status];
        return (
          <span style={{
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: s?.color,
            background: s?.bg,
          }}>{s?.label}</span>
        );
      },
    },
    {
      key: 'merma',
      header: 'Merma',
      render: (_: any, row: any) => (row.merma_order_id ? `✓ Orden #${row.merma_order_id}` : '—'),
    },
    {
      key: 'approved_at',
      header: 'Aprobado',
      render: (_: any, row: any) => (row.approved_at ? new Date(row.approved_at).toLocaleDateString() : '—'),
    },
  ];

  // Cálculo de discrepancias en el editor
  const editorRows = useMemo(() => {
    if (!editing) return [];
    return editing.items.map((it: any) => {
      const realStr = realQtys[it.id];
      const real = realStr === '' || realStr === undefined ? null : parseInt(realStr, 10);
      const diff = real === null ? null : real - it.theoretical_qty;
      return { ...it, _real: real, _diff: diff };
    });
  }, [editing, realQtys]);

  const totals = useMemo(() => {
    const withCount = editorRows.filter((r: any) => r._real !== null);
    const shortages = withCount.filter((r: any) => r._diff < 0).length;
    const surpluses = withCount.filter((r: any) => r._diff > 0).length;
    const matched = withCount.filter((r: any) => r._diff === 0).length;
    return { total: editorRows.length, counted: withCount.length, shortages, surpluses, matched };
  }, [editorRows]);

  return (
    <div className="page-container">
      <PageHeader title="Conciliación de Inventario" icon={<FiClipboard />} />
      <p style={{ marginTop: '-0.75rem', marginBottom: '1rem', color: '#a0aec0', fontSize: '0.9rem' }}>
        Conteos cíclicos por bodega y facturación manual de merma (F06 + F07)
      </p>

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar..." />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '6px', borderWidth: 1, borderStyle: 'solid', borderColor: '#2a2a35', background: '#1a1a24', color: '#f1f1f3' }}
          >
            <option value="">Todos los estados</option>
            <option value="DRAFT">Borrador</option>
            <option value="APPROVED">Aprobado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
        <Button variant="primary" icon={<FiPlus />} onClick={openCreateModal}>
          Nuevo Conteo
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          emptyMessage="No hay conteos registrados"
          actions={(row: any) => (
            <>
              <Button variant="ghost" size="sm" icon={<FiEye />} onClick={() => openEditor(row.id)} />
              {row.status === 'DRAFT' && (
                <Button variant="ghost" size="sm" icon={<FiX />} onClick={() => handleCancel(row)} />
              )}
              {row.status === 'APPROVED' && !row.merma_order_id && (
                <Button variant="primary" size="sm" icon={<FiDollarSign />} onClick={() => openMermaModal(row)}>
                </Button>
              )}
            </>
          )}
        />
      )}

      {/* Create modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nuevo Conteo Cíclico" size="md">
        <form onSubmit={handleCreate}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Bodega *</label>
              <select
                value={createForm.id_warehouse}
                onChange={(e) => setCreateForm((p) => ({ ...p, id_warehouse: e.target.value }))}
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
              <small style={{ color: '#a0aec0' }}>
                Se tomará un snapshot del stock actual en consignación de la bodega.
              </small>
            </div>
            <FormField
              label="Notas"
              name="notes"
              value={createForm.notes}
              onChange={(e: any) => setCreateForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Ej: Conteo trimestral abril 2026"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={creating}>Crear conteo</Button>
          </div>
        </form>
      </Modal>

      {/* Editor modal */}
      <Modal
        isOpen={!!editing}
        onClose={closeEditor}
        title={editing ? `Conteo #${editing.id} — ${editing.warehouse?.customer?.name} / ${editing.warehouse?.name}` : ''}
        size="lg"
      >
        {editing && (
          <div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div>Estado: <strong>{STATUS_LABELS[editing.status]?.label}</strong></div>
              <div>Total referencias: <strong>{totals.total}</strong></div>
              <div>Contadas: <strong>{totals.counted}</strong></div>
              <div style={{ color: '#065f46' }}>Match: <strong>{totals.matched}</strong></div>
              <div style={{ color: '#991b1b' }}>Faltantes: <strong>{totals.shortages}</strong></div>
              <div style={{ color: '#1e40af' }}>Sobrantes: <strong>{totals.surpluses}</strong></div>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#12121a' }}>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Producto</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem' }}>Teórico</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem' }}>Real</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem' }}>Diff</th>
                  </tr>
                </thead>
                <tbody>
                  {editorRows.map((it: any) => (
                    <tr
                      key={it.id}
                      style={{
                        borderBottom: '1px solid #edf2f7',
                        background:
                          it._diff === null
                            ? 'transparent'
                            : it._diff === 0
                            ? '#f0fdf4'
                            : it._diff < 0
                            ? '#fef2f2'
                            : '#eff6ff',
                      }}
                    >
                      <td style={{ padding: '0.5rem' }}>
                        <img src={getItemImage(it) || ""} alt="" style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover', background: '#2a2a35', marginRight: 6, verticalAlign: 'middle' }} />
                        {it.clothingSize?.clothingColor?.design?.reference}{' '}
                        {it.clothingSize?.clothingColor?.color?.name}{' '}
                        {it.clothingSize?.size?.name}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>{it.theoretical_qty}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        {editing.status === 'DRAFT' ? (
                          <input
                            type="number"
                            min={0}
                            value={realQtys[it.id] ?? ''}
                            onChange={(e) => setRealQtys((prev) => ({ ...prev, [it.id]: e.target.value }))}
                            style={{ width: '70px', padding: '0.3rem', borderRadius: '4px', borderWidth: 1, borderStyle: 'solid', borderColor: '#2a2a35', background: '#1a1a24', color: '#f1f1f3', textAlign: 'right' }}
                          />
                        ) : (
                          it.real_qty ?? '—'
                        )}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600 }}>
                        {it._diff === null ? '—' : it._diff === 0 ? '0' : it._diff > 0 ? `+${it._diff}` : it._diff}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={closeEditor}>Cerrar</Button>
              {editing.status === 'DRAFT' && (
                <>
                  <Button variant="ghost" icon={<FiSave />} onClick={handleSaveItems} loading={savingItems}>
                    Guardar progreso
                  </Button>
                  <Button variant="primary" icon={<FiZap />} onClick={handleApprove} loading={approving}>
                    Aprobar
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Merma modal */}
      <Modal
        isOpen={!!mermaFor}
        onClose={closeMermaModal}
        title={mermaFor ? `Facturar Merma — Conteo #${mermaFor.id}` : ''}
        size="md"
      >
        {mermaFor && (
          <form onSubmit={handleCreateMerma}>
            <p style={{ fontSize: '0.9rem', color: '#4a5568', marginTop: 0 }}>
              Se facturarán los <strong>ítems faltantes</strong> al cliente <strong>{mermaFor.warehouse?.customer?.name}</strong>.
              Elige cómo calcular el precio unitario:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderWidth: 1, borderStyle: 'solid', borderColor: '#2a2a35', background: '#1a1a24', color: '#f1f1f3', borderRadius: '6px' }}>
                <input
                  type="radio"
                  name="price_mode"
                  checked={mermaForm.price_mode === 'CONSIGNMENT'}
                  onChange={() => setMermaForm((p) => ({ ...p, price_mode: 'CONSIGNMENT' }))}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>Precio pactado de consignación</div>
                  <small style={{ color: '#718096' }}>Usa la lista vigente del cliente, o el precio base del producto si no hay.</small>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderWidth: 1, borderStyle: 'solid', borderColor: '#2a2a35', background: '#1a1a24', color: '#f1f1f3', borderRadius: '6px' }}>
                <input
                  type="radio"
                  name="price_mode"
                  checked={mermaForm.price_mode === 'PENALTY'}
                  onChange={() => setMermaForm((p) => ({ ...p, price_mode: 'PENALTY' }))}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>Precio penalizado por contrato</div>
                  <small style={{ color: '#718096' }}>Mismo precio unitario aplicado a todos los faltantes.</small>
                  {mermaForm.price_mode === 'PENALTY' && (
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Precio unitario (COP)"
                      value={mermaForm.penalty_unit_price}
                      onChange={(e) => setMermaForm((p) => ({ ...p, penalty_unit_price: e.target.value }))}
                      style={{ width: '100%', padding: '0.4rem', marginTop: '0.5rem', borderRadius: '4px', borderWidth: 1, borderStyle: 'solid', borderColor: '#2a2a35', background: '#1a1a24', color: '#f1f1f3' }}
                    />
                  )}
                </div>
              </label>
            </div>

            <FormField
              label="Notas"
              name="notes"
              value={mermaForm.notes}
              onChange={(e: any) => setMermaForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Observaciones para la factura..."
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button variant="ghost" onClick={closeMermaModal}>Cancelar</Button>
              <Button variant="primary" icon={<FiDollarSign />} type="submit" loading={mermaSubmitting}>
                Facturar y generar DIAN
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ConsignmentCycleCountPage;
