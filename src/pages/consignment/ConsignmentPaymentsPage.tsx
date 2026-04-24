import React, { useState, useEffect, useMemo } from 'react';
import { FiCreditCard, FiCheck, FiX, FiEye, FiImage } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../../components/common/PageHeader';
import { DataTable, Modal, Button, SearchInput, LoadingSpinner } from '../../components/ui';
import * as paymentApi from '../../services/consignmentPaymentApi';
import { logError } from '../../services/errorApi';
import { formatDate, formatDateTime } from '../../utils/dateFormat';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pendiente', color: '#92400e', bg: '#fef3c7' },
  APPROVED: { label: 'Aprobado', color: '#065f46', bg: '#d1fae5' },
  REJECTED: { label: 'Rechazado', color: '#991b1b', bg: '#fee2e2' },
};

const METHOD_LABELS: Record<string, string> = {
  TRANSFERENCIA: 'Transferencia bancaria',
  EFECTIVO: 'Efectivo',
  OTRO: 'Otro',
};

const currencyCO = (n: number) =>
  (n ?? 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

const ConsignmentPaymentsPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [viewing, setViewing] = useState<any | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const data = await paymentApi.getPayments({ status: statusFilter || undefined });
      setItems(data);
      setError('');
    } catch (err: any) {
      logError(err, '/consignment/payments');
      setError('Error al cargar los pagos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [statusFilter]);

  const filteredItems = useMemo(() => {
    if (!search) return items;
    const term = search.toLowerCase();
    return items.filter(
      (p) =>
        String(p.id).includes(term) ||
        p.customer?.name?.toLowerCase().includes(term) ||
        p.order?.order_reference?.toLowerCase().includes(term),
    );
  }, [items, search]);

  const openDetail = async (row: any) => {
    try {
      const full = await paymentApi.getPayment(row.id);
      setViewing(full);
    } catch (err: any) {
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    }
  };

  const handleApprove = async (payment: any) => {
    try {
      setProcessing(true);
      await paymentApi.approvePayment(payment.id);
      setViewing(null);
      fetchAll();
      await Swal.fire({
        title: 'Pago aprobado',
        text: payment.order?.is_paid ? 'La orden ya estaba marcada como pagada.' : 'La orden se marcó como pagada.',
        icon: 'success',
        confirmButtonColor: '#f0b429',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (payment: any) => {
    const { value: reason } = await Swal.fire({
      title: 'Rechazar pago',
      input: 'textarea',
      inputPlaceholder: 'Motivo del rechazo...',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#2a2a35',
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar',
      inputValidator: (v) => (!v?.trim() ? 'Escribe un motivo.' : null),
    });
    if (!reason) return;
    try {
      await paymentApi.rejectPayment(payment.id, reason);
      setViewing(null);
      fetchAll();
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
      key: 'order',
      header: 'Orden',
      render: (_: any, row: any) => row.order?.order_reference || `#${row.id_order}`,
    },
    {
      key: 'amount',
      header: 'Monto',
      render: (_: any, row: any) => currencyCO(row.amount),
    },
    {
      key: 'payment_method',
      header: 'Medio',
      render: (_: any, row: any) => METHOD_LABELS[row.payment_method] || row.payment_method,
    },
    {
      key: 'proof',
      header: 'Comprobante',
      render: (_: any, row: any) => row.proof_image_url ? (
        <a href={row.proof_image_url} target="_blank" rel="noreferrer" style={{ color: '#f0b429' }}>
          <FiImage /> Ver
        </a>
      ) : '—',
    },
    {
      key: 'status',
      header: 'Estado',
      render: (_: any, row: any) => {
        const st = STATUS_LABELS[row.status];
        return (
          <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, color: st?.color, background: st?.bg }}>
            {st?.label}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (_: any, row: any) => formatDate(row.createdAt),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Pagos de Consignación" icon={<FiCreditCard />} />
      <p style={{ marginTop: '-0.75rem', marginBottom: '1rem', color: '#a0aec0', fontSize: '0.9rem' }}>
        Pagos reportados por los aliados. Verifica comprobantes y aprueba para marcar la orden como pagada.
      </p>

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por cliente u orden..." />
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
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando pagos..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          emptyMessage="No hay pagos registrados"
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
      <Modal isOpen={!!viewing} onClose={() => setViewing(null)} title={viewing ? `Pago #${viewing.id}` : ''} size="md">
        {viewing && (
          <div>
            <p style={{ margin: '0.25rem 0' }}><strong>Cliente:</strong> {viewing.customer?.name}</p>
            <p style={{ margin: '0.25rem 0' }}><strong>Orden:</strong> {viewing.order?.order_reference} ({viewing.order?.status})</p>
            <p style={{ margin: '0.25rem 0' }}><strong>Total orden:</strong> {currencyCO(viewing.order?.total_payment)}</p>
            <p style={{ margin: '0.25rem 0' }}><strong>Monto pago:</strong> {currencyCO(viewing.amount)}</p>
            <p style={{ margin: '0.25rem 0' }}><strong>Medio:</strong> {METHOD_LABELS[viewing.payment_method]}</p>
            {viewing.reference_number && (
              <p style={{ margin: '0.25rem 0' }}><strong>Referencia:</strong> {viewing.reference_number}</p>
            )}
            {viewing.notes && (
              <p style={{ margin: '0.25rem 0', fontStyle: 'italic', color: '#a0aec0' }}>"{viewing.notes}"</p>
            )}
            <p style={{ margin: '0.25rem 0' }}><strong>Fecha:</strong> {formatDateTime(viewing.createdAt)}</p>
            <p style={{ margin: '0.25rem 0' }}>
              <strong>Estado:</strong>{' '}
              <span style={{ padding: '1px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600, color: STATUS_LABELS[viewing.status]?.color, background: STATUS_LABELS[viewing.status]?.bg }}>
                {STATUS_LABELS[viewing.status]?.label}
              </span>
            </p>
            {viewing.rejected_reason && (
              <p style={{ margin: '0.5rem 0', color: '#f87171' }}>Motivo rechazo: {viewing.rejected_reason}</p>
            )}

            {/* Comprobante */}
            {viewing.proof_image_url && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Comprobante de pago:</p>
                {viewing.proof_image_url.endsWith('.pdf') ? (
                  <a href={viewing.proof_image_url} target="_blank" rel="noreferrer"
                    style={{ color: '#f0b429', textDecoration: 'underline' }}>
                    Abrir PDF
                  </a>
                ) : (
                  <img
                    src={viewing.proof_image_url}
                    alt="Comprobante"
                    style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', border: '1px solid #2a2a35' }}
                  />
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              {viewing.status === 'PENDING' && (
                <>
                  <Button variant="destructive" icon={<FiX />} onClick={() => handleReject(viewing)} disabled={processing}>
                    Rechazar
                  </Button>
                  <Button variant="primary" icon={<FiCheck />} onClick={() => handleApprove(viewing)} loading={processing}>
                    {processing ? 'Procesando...' : 'Aprobar pago'}
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

export default ConsignmentPaymentsPage;
