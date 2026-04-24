import React, { useState, useEffect, useMemo } from 'react';
import { FiMail } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Modal, Button, SearchInput, StatusBadge, LoadingSpinner } from '../components/ui';
import * as subscriberApi from '../services/subscriberApi';
import { logError } from '../services/errorApi';
import { formatDate } from '../utils/dateFormat';

const SubscriberPage = () => {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Discount codes detail modal
  const [showCodesModal, setShowCodesModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any>(null);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await subscriberApi.getSubscribers();
      setSubscribers(data);
    } catch (err: any) {
      logError(err, '/subscribers');
      setError('Error al cargar los suscriptores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const filteredSubscribers = useMemo(() => {
    if (!search) return subscribers;
    const term = search.toLowerCase();
    return subscribers.filter(
      (sub) => sub.email?.toLowerCase().includes(term)
    );
  }, [subscribers, search]);

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await subscriberApi.updateSubscriber(id, { status: !currentStatus });
      setSubscribers((prev) =>
        prev.map((sub) => (sub.id === id ? { ...sub, status: !currentStatus } : sub))
      );
    } catch (err: any) {
      logError(err, '/subscribers/status');
      setError('Error al actualizar el estado.');
    }
  };

  const handleToggleUnsubscribed = async (id: number, currentUnsubscribed: boolean) => {
    try {
      await subscriberApi.updateSubscriber(id, { unsubscribed: !currentUnsubscribed });
      setSubscribers((prev) =>
        prev.map((sub) => (sub.id === id ? { ...sub, unsubscribed: !currentUnsubscribed } : sub))
      );
    } catch (err: any) {
      logError(err, '/subscribers/unsubscribed');
      setError('Error al actualizar el estado de baja.');
    }
  };

  const openCodesModal = (sub: any) => {
    setSelectedSub(sub);
    setShowCodesModal(true);
  };

  const columns = [
    { key: 'id', header: 'ID', width: '60px' },
    { key: 'email', header: 'Correo Electronico' },
    {
      key: 'registeredAt',
      header: 'Fecha Registro',
      render: (value: any) => formatDate(value),
    },
    {
      key: 'status',
      header: 'Activo',
      align: 'center' as const,
      render: (value: any, row: any) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(row.id, row.status)}
          style={{
            padding: '0.25rem 0.75rem',
            borderRadius: 20,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.75rem',
            backgroundColor: value ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: value ? '#16a34a' : '#dc2626',
            transition: 'all 0.2s ease',
          }}
        >
          {value ? 'Si' : 'No'}
        </button>
      ),
    },
    {
      key: 'unsubscribed',
      header: 'Dado de Baja',
      align: 'center' as const,
      render: (value: any, row: any) => (
        <button
          type="button"
          onClick={() => handleToggleUnsubscribed(row.id, row.unsubscribed)}
          style={{
            padding: '0.25rem 0.75rem',
            borderRadius: 20,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.75rem',
            backgroundColor: value ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
            color: value ? '#dc2626' : '#16a34a',
            transition: 'all 0.2s ease',
          }}
        >
          {value ? 'Si' : 'No'}
        </button>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Gestion de Suscriptores" icon={<FiMail />} />

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por email..." />
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando suscriptores..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredSubscribers}
          emptyMessage="No hay suscriptores registrados"
          actions={(row) => (
            <Button variant="ghost" size="sm" onClick={() => openCodesModal(row)}>
              Ver Codigos
            </Button>
          )}
        />
      )}

      {/* Discount Codes Modal */}
      <Modal isOpen={showCodesModal} onClose={() => setShowCodesModal(false)} title={`Codigos de Descuento — ${selectedSub?.email || ''}`} size="md">
        {selectedSub && (
          <div>
            {!selectedSub.discount_code ? (
              <p style={{ color: '#a0a0b0', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
                Este usuario no tiene codigos de descuento registrados.
              </p>
            ) : (
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1rem', borderRadius: 12, border: '1px solid #2a2a35', background: '#2a2a35',
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'monospace' }}>{selectedSub.discount_code}</div>
                  <div style={{ fontSize: '0.75rem', color: '#a0a0b0', marginTop: '0.25rem' }}>Cupon de Bienvenida (10%)</div>
                </div>
                <StatusBadge
                  status={selectedSub.is_discount_used ? 'CONSUMIDO' : 'DISPONIBLE'}
                  variant={selectedSub.is_discount_used ? 'neutral' : 'success'}
                />
              </div>
            )}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <Button variant="ghost" onClick={() => setShowCodesModal(false)}>Cerrar</Button>
        </div>
      </Modal>
    </div>
  );
};

export default SubscriberPage;
