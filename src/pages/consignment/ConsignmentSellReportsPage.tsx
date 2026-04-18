import React, { useState, useEffect, useMemo } from 'react';
import { FiInbox, FiCheck, FiX, FiEye } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../../components/common/PageHeader';
import { DataTable, Modal, Button, SearchInput, LoadingSpinner } from '../../components/ui';
import * as reportApi from '../../services/consignmentSellReportApi';
import * as selloutApi from '../../services/consignmentSelloutApi';
import { logError } from '../../services/errorApi';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pendiente', color: '#92400e', bg: '#fef3c7' },
  APPROVED: { label: 'Aprobado', color: '#065f46', bg: '#d1fae5' },
  REJECTED: { label: 'Rechazado', color: '#991b1b', bg: '#fee2e2' },
};

const getItemImage = (it: any): string | null =>
  it?.clothingSize?.clothingColor?.imageClothing?.[0]?.image_url ?? null;

const getItemLabel = (it: any) => {
  const ref = it?.clothingSize?.clothingColor?.design?.reference || '';
  const color = it?.clothingSize?.clothingColor?.color?.name || '';
  const size = it?.clothingSize?.size?.name || '';
  return `${ref} ${color} ${size}`.trim();
};

const ConsignmentSellReportsPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [viewing, setViewing] = useState<any | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const data = await reportApi.getSellReports({ status: statusFilter || undefined });
      setItems(data);
      setError('');
    } catch (err: any) {
      logError(err, '/consignment/sell-reports');
      setError('Error al cargar los reportes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [statusFilter]);

  const filteredItems = useMemo(() => {
    if (!search) return items;
    const term = search.toLowerCase();
    return items.filter(
      (r) =>
        String(r.id).includes(term) ||
        r.customer?.name?.toLowerCase().includes(term) ||
        r.warehouse?.name?.toLowerCase().includes(term),
    );
  }, [items, search]);

  const pendingCount = useMemo(
    () => items.filter((r) => r.status === 'PENDING').length,
    [items],
  );

  const openDetail = async (row: any) => {
    try {
      const full = await reportApi.getSellReport(row.id);
      setViewing(full);
    } catch (err: any) {
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    }
  };

  const handleApprove = async (report: any) => {
    const confirm = await Swal.fire({
      title: '¿Aprobar este reporte?',
      html: `Se procesará el sell-out de <strong>${report.items.length} ref.</strong>
             (${report.items.reduce((s: number, i: any) => s + i.quantity, 0)} uds)
             y se generará la factura DIAN.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f0b429',
      cancelButtonColor: '#2a2a35',
      confirmButtonText: 'Aprobar y facturar',
      cancelButtonText: 'Cancelar',
    });
    if (!confirm.isConfirmed) return;

    try {
      // Construir rows para el sellout existente usando los items del reporte
      const rows = report.items.map((it: any) => ({
        reference: it.clothingSize?.clothingColor?.design?.reference,
        color: it.clothingSize?.clothingColor?.color?.name,
        size: it.clothingSize?.size?.name,
        quantity: it.quantity,
      }));

      // Marcar como aprobado primero
      await reportApi.approveSellReport(report.id);

      // Procesar sell-out
      const order = await selloutApi.processSellout({
        id_customer: report.id_customer,
        id_warehouse: report.id_warehouse,
        rows,
      });

      // Marcar el reporte como aprobado
      // (El backend de sell-reports no tiene un endpoint approve porque
      //  la aprobación se maneja vía el flujo de sell-out existente.
      //  Actualizamos el status directamente.)
      // Por ahora usamos un PATCH genérico o dejamos el status como PENDING
      // y lo manejamos por la existencia de la orden.

      // Disparar DIAN
      let dianResult: any = null;
      let dianError: string | null = null;
      try {
        dianResult = await selloutApi.generateDianForOrder(order.id);
      } catch (err: any) {
        dianError = err.message;
      }

      setViewing(null);
      fetchAll();

      await Swal.fire({
        title: dianError ? 'Sell-out procesado (DIAN pendiente)' : '¡Aprobado y facturado!',
        html: dianError
          ? `Orden <strong>${order.order_reference}</strong> creada. DIAN falló: <code>${dianError}</code>`
          : `Orden <strong>${order.order_reference}</strong> · DIAN CUFE: <code>${dianResult?.cufe?.slice(0, 16)}...</code>`,
        icon: dianError ? 'warning' : 'success',
        confirmButtonColor: '#f0b429',
      });
    } catch (err: any) {
      logError(err, '/consignment/sell-reports/approve');
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    }
  };

  const handleReject = async (report: any) => {
    const { value: reason } = await Swal.fire({
      title: 'Rechazar reporte',
      input: 'textarea',
      inputPlaceholder: 'Motivo del rechazo...',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#2a2a35',
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value?.trim()) return 'Escribe un motivo.';
        return null;
      },
    });
    if (!reason) return;

    try {
      await reportApi.rejectSellReport(report.id, reason);
      setViewing(null);
      fetchAll();
      await Swal.fire({ title: 'Rechazado', icon: 'info', timer: 1500, showConfirmButton: false });
    } catch (err: any) {
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    }
  };

  const columns = [
    { key: 'id', header: 'ID', width: '60px' },
    {
      key: 'customer',
      header: 'Cliente',
      render: (_: any, row: any) => row.customer?.name || `#${row.id_customer}`,
    },
    {
      key: 'warehouse',
      header: 'Bodega',
      render: (_: any, row: any) => row.warehouse?.name || `#${row.id_warehouse}`,
    },
    {
      key: 'items',
      header: 'Ítems',
      render: (_: any, row: any) =>
        row.items
          ? `${row.items.length} ref. · ${row.items.reduce((s: number, i: any) => s + i.quantity, 0)} uds`
          : '—',
    },
    {
      key: 'status',
      header: 'Estado',
      render: (_: any, row: any) => {
        const st = STATUS_LABELS[row.status] || { label: row.status, color: '#000', bg: '#eee' };
        return (
          <span style={{
            display: 'inline-block', padding: '2px 10px', borderRadius: '12px',
            fontSize: '0.75rem', fontWeight: 600, color: st.color, background: st.bg,
          }}>
            {st.label}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (_: any, row: any) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—',
    },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Reportes de Venta del Cliente" icon={<FiInbox />} />
      <p style={{ marginTop: '-0.75rem', marginBottom: '1rem', color: '#a0aec0', fontSize: '0.9rem' }}>
        Ventas reportadas por los aliados desde su portal. Revisa y aprueba para procesar sell-out + DIAN.
      </p>

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por cliente o bodega..." />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '6px', borderWidth: 1, borderStyle: 'solid', borderColor: '#2a2a35', background: '#1a1a24', color: '#f1f1f3' }}
          >
            <option value="">Todos</option>
            <option value="PENDING">Pendientes</option>
            <option value="APPROVED">Aprobados</option>
            <option value="REJECTED">Rechazados</option>
          </select>
        </div>
        {statusFilter === 'PENDING' && pendingCount > 0 && (
          <span style={{ color: '#f0b429', fontWeight: 600, fontSize: '0.9rem' }}>
            {pendingCount} reporte{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando reportes..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          emptyMessage="No hay reportes"
          actions={(row: any) => (
            <>
              <Button variant="ghost" size="sm" icon={<FiEye />} onClick={() => openDetail(row)} />
              {row.status === 'PENDING' && (
                <>
                  <Button variant="primary" size="sm" icon={<FiCheck />} onClick={() => handleApprove(row)} />
                  <Button variant="destructive" size="sm" icon={<FiX />} onClick={() => handleReject(row)} />
                </>
              )}
            </>
          )}
        />
      )}

      {/* Modal detalle */}
      <Modal
        isOpen={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing ? `Reporte #${viewing.id}` : ''}
        size="md"
      >
        {viewing && (
          <div>
            <p style={{ margin: '0.25rem 0' }}><strong>Cliente:</strong> {viewing.customer?.name}</p>
            <p style={{ margin: '0.25rem 0' }}><strong>Bodega:</strong> {viewing.warehouse?.name}</p>
            <p style={{ margin: '0.25rem 0' }}><strong>Fecha:</strong> {new Date(viewing.createdAt).toLocaleString()}</p>
            <p style={{ margin: '0.25rem 0' }}>
              <strong>Estado:</strong>{' '}
              <span style={{
                padding: '1px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600,
                color: STATUS_LABELS[viewing.status]?.color,
                background: STATUS_LABELS[viewing.status]?.bg,
              }}>
                {STATUS_LABELS[viewing.status]?.label}
              </span>
            </p>
            {viewing.notes && <p style={{ margin: '0.5rem 0', fontStyle: 'italic', color: '#a0aec0' }}>"{viewing.notes}"</p>}
            {viewing.rejected_reason && (
              <p style={{ margin: '0.5rem 0', color: '#f87171' }}>Motivo rechazo: {viewing.rejected_reason}</p>
            )}

            <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a35' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem', color: '#a0a0b0' }}>Producto</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem', color: '#a0a0b0' }}>Vendidos</th>
                </tr>
              </thead>
              <tbody>
                {(viewing.items || []).map((it: any) => (
                  <tr key={it.id} style={{ borderBottom: '1px solid #2a2a35' }}>
                    <td style={{ padding: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {getItemImage(it) && (
                          <img src={getItemImage(it)!} alt="" style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover', background: '#2a2a35' }} />
                        )}
                        <span>{getItemLabel(it)}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600, color: '#f1f1f3' }}>
                      {it.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              {viewing.status === 'PENDING' && (
                <>
                  <Button variant="destructive" icon={<FiX />} onClick={() => handleReject(viewing)}>
                    Rechazar
                  </Button>
                  <Button variant="primary" icon={<FiCheck />} onClick={() => handleApprove(viewing)}>
                    Aprobar y facturar
                  </Button>
                </>
              )}
              {viewing.status !== 'PENDING' && (
                <Button variant="primary" onClick={() => setViewing(null)}>Cerrar</Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ConsignmentSellReportsPage;
