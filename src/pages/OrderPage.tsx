import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiEye, FiTruck } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Modal, Button, SearchInput, StatusBadge, LoadingSpinner } from '../components/ui';
import * as orderApi from '../services/orderApi';
import { logError } from '../services/errorApi';
import TransportGuideModal from '../components/order/TransportGuideModal';

const FILTER_TABS = [
  { key: 'ALL', label: 'Todos' },
  { key: 'SHIPPING', label: 'Envios' },
  { key: 'PICKUP', label: 'Para Recoger' },
];

const OrderPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('ALL');

  // Transport guide modal
  const [guideOrder, setGuideOrder] = useState<any>(null);
  const [loadingGuide, setLoadingGuide] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await orderApi.getOrders();
      const sortedData = data.sort((a: any, b: any) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
      setOrders(sortedData);
    } catch (err: any) {
      logError(err, '/order');
      setError('Error al cargar los pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (filterTab !== 'ALL') {
      result = result.filter((o) => o.delivery_method === filterTab);
    }
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.order_reference?.toLowerCase().includes(term) ||
          o.customer?.name?.toLowerCase().includes(term) ||
          o.status?.toLowerCase().includes(term) ||
          String(o.id).includes(term)
      );
    }
    return result;
  }, [orders, filterTab, search]);

  const handleOpenGuide = async (orderId: number) => {
    try {
      setLoadingGuide(true);
      const fullOrder = await orderApi.getOrder(orderId);
      setGuideOrder(fullOrder);
    } catch (err: any) {
      logError(err, '/order-guide');
      setError('Error al cargar los datos del pedido para la guia.');
    } finally {
      setLoadingGuide(false);
    }
  };

  const canGenerateGuide = (status: string) => {
    const allowed = ['pagado', 'enviado', 'entregado', 'aprobado pce'];
    return allowed.includes(status?.toLowerCase());
  };

  const columns = [
    { key: 'id', header: 'ID', width: '70px' },
    {
      key: 'order_reference',
      header: 'Referencia',
      render: (value: any, row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span>{value || '-'}</span>
          {row.delivery_method === 'PICKUP' && (
            <StatusBadge status="Retiro" variant="info" size="sm" />
          )}
          {row.payment_method === 'WOMPI_COD' && (
            <StatusBadge status="PCE" variant="warning" size="sm" />
          )}
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Cliente',
      render: (_: any, row: any) => row.customer?.name || 'N/A',
    },
    {
      key: 'order_date',
      header: 'Fecha',
      render: (value: any) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (value: any) => <StatusBadge status={value} />,
    },
    {
      key: 'total_payment',
      header: 'Factura',
      render: (value: any) => `$${Number(value).toLocaleString()}`,
      align: 'right' as const,
    },
    {
      key: 'paid',
      header: 'Pagado',
      align: 'right' as const,
      render: (_: any, row: any) => {
        if (row.payment_method === 'WOMPI_COD' && row.status !== 'Pagado') {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem' }}>
                ${(row.total_payment - (row.cod_amount || 0)).toLocaleString()}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: 'bold' }}>
                Falta: ${(row.cod_amount || 0).toLocaleString()}
              </span>
            </div>
          );
        }
        if (row.is_paid || ['pagado', 'enviado', 'entregado', 'aprobado pce'].includes(row.status?.toLowerCase())) {
          return <span style={{ color: '#10b981', fontWeight: 'bold' }}>${row.total_payment.toLocaleString()}</span>;
        }
        return <span style={{ color: '#6b7280' }}>$0</span>;
      },
    },
  ];

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.5rem 1rem',
    borderRadius: 8,
    border: active ? '2px solid #f0b429' : '1px solid rgba(0,0,0,0.1)',
    backgroundColor: active ? 'rgba(212,175,55,0.1)' : 'transparent',
    color: active ? '#f0b429' : '#a0a0b0',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.8rem',
    fontFamily: 'Inter, sans-serif',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    transition: 'all 0.2s ease',
  });

  return (
    <div className="page-container">
      <PageHeader title="Gestion de Pedidos" icon={<FiShoppingCart />} />

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por referencia, cliente o estado..." />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {FILTER_TABS.map((tab) => (
            <button key={tab.key} type="button" style={tabStyle(filterTab === tab.key)} onClick={() => setFilterTab(tab.key)}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando pedidos..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredOrders}
          emptyMessage="No hay pedidos para el filtro seleccionado"
          actions={(row) => (
            <>
              <Button
                variant="ghost"
                size="sm"
                icon={<FiTruck />}
                onClick={() => handleOpenGuide(row.id)}
                disabled={!canGenerateGuide(row.status) || row.delivery_method === 'PICKUP'}
              >
                Guia
              </Button>
              <Button variant="info" size="sm" icon={<FiEye />} onClick={() => navigate(`/order/${row.id}`)}>
                Ver
              </Button>
            </>
          )}
        />
      )}

      {/* Transport Guide Modal */}
      {guideOrder && (
        <TransportGuideModal
          order={guideOrder}
          onClose={() => setGuideOrder(null)}
        />
      )}
    </div>
  );
};

export default OrderPage;
