import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { FaBoxOpen } from 'react-icons/fa';
import { Button, StatusBadge, LoadingSpinner } from '../components/ui';
import { FiRefreshCcw } from 'react-icons/fi';
import '../styles/PickupDashboardPage.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PickupDashboardPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(`${API_BASE_URL}/order?delivery_method=PICKUP&sort=asc`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const today = new Date();
            const isToday = (dateString) => {
                if (!dateString) return false;
                const d = new Date(dateString);
                return d.getDate() === today.getDate() &&
                       d.getMonth() === today.getMonth() &&
                       d.getFullYear() === today.getFullYear();
            };

            const activeOrders = response.data.filter(order => {
                if (order.status === 'Cancelado') return false;
                if (order.pickup_status === 'COLLECTED') {
                    return isToday(order.updatedAt || order.order_date);
                }
                return true;
            });

            const statusOrder = {
                'PENDING': 1,
                'READY': 2,
                'COLLECTED': 3
            };

            const sortedOrders = activeOrders.sort((a, b) => {
                const statusA = statusOrder[a.pickup_status || 'PENDING'] || 1;
                const statusB = statusOrder[b.pickup_status || 'PENDING'] || 1;

                if (statusA !== statusB) {
                    return statusA - statusB;
                }

                if (a.pickup_status === 'COLLECTED') {
                    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.order_date).getTime();
                    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.order_date).getTime();
                    return dateA - dateB;
                } else {
                    const dateA = new Date(a.order_date).getTime();
                    const dateB = new Date(b.order_date).getTime();
                    return dateA - dateB;
                }
            });

            setOrders(sortedOrders);
        } catch (error) {
            console.error('Error fetching pickup orders:', error);
            if (!isBackground) Swal.fire('Error', 'No se pudieron cargar los pedidos para retirar', 'error');
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(() => fetchOrders(true), 15000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkReady = async (id) => {
        try {
            const result = await Swal.fire({
                title: '¿Marcar como Listo?',
                text: "Se enviará un correo al cliente notificando que puede recoger el pedido.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Sí, está listo'
            });

            if (result.isConfirmed) {
                const token = localStorage.getItem('accessToken');
                await axios.post(`${API_BASE_URL}/order/${id}/ready-for-pickup`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                Swal.fire('¡Listo!', 'El pedido fue marcado como listo y el cliente fue notificado.', 'success');
                fetchOrders();
            }
        } catch (error) {
            Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
        }
    };

    const handleMarkCollected = async (id) => {
        try {
            const result = await Swal.fire({
                title: '¿Entregar Pedido?',
                text: "Marca este pedido como entregado (Collected).",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3b82f6',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Sí, entregado'
            });

            if (result.isConfirmed) {
                const token = localStorage.getItem('accessToken');
                await axios.post(`${API_BASE_URL}/order/${id}/collected`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                Swal.fire('¡Entregado!', 'El pedido ha sido entregado exitosamente.', 'success');
                fetchOrders();
            }
        } catch (error) {
            Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
        }
    };

    const getStatusStyle = (pickupStatus) => {
        switch (pickupStatus) {
            case 'PENDING':
                return 'pickup-card-pending';
            case 'READY':
                return 'pickup-card-ready';
            case 'COLLECTED':
                return 'pickup-card-collected';
            default:
                return 'pickup-card-pending';
        }
    };

    const getStatusText = (pickupStatus) => {
        switch (pickupStatus) {
            case 'PENDING': return 'Pendiente de Preparación';
            case 'READY': return 'Listo para Recoger';
            case 'COLLECTED': return 'Entregado (Recogido)';
            default: return 'Pendiente de Preparación';
        }
    };

    const getStatusVariant = (pickupStatus) => {
        switch (pickupStatus) {
            case 'PENDING': return 'warning';
            case 'READY': return 'info';
            case 'COLLECTED': return 'success';
            default: return 'warning';
        }
    };

    return (
        <div className="page-container pickup-dashboard">
            <PageHeader title="Tablero de Retiros en Tienda" icon={<FaBoxOpen />} />

            <div className="pickup-filters">
                <Button
                    variant="primary"
                    icon={<FiRefreshCcw />}
                    onClick={() => fetchOrders(false)}
                    loading={loading}
                >
                    {loading ? 'Actualizando...' : 'Actualizar Listado'}
                </Button>
                <div className="pickup-legend">
                    <span className="legend-item pending">Pendiente</span>
                    <span className="legend-item ready">Listo</span>
                    <span className="legend-item collected">Entregado</span>
                </div>
            </div>

            {loading && orders.length === 0 && (
                <LoadingSpinner text="Cargando pedidos para retirar..." />
            )}

            <div className="pickup-board">
                {orders.length === 0 && !loading && (
                    <div className="no-orders-message">
                        No hay pedidos para retirar en este momento.
                    </div>
                )}

                {orders.map(order => (
                    <div key={order.id} className={`pickup-card ${getStatusStyle(order.pickup_status)}`}>
                        <div className="pickup-card-header">
                            <h2>Referencia: {order.order_reference}</h2>
                            <StatusBadge
                                status={getStatusText(order.pickup_status)}
                                variant={getStatusVariant(order.pickup_status)}
                            />
                        </div>

                        <div className="pickup-card-body">
                            <div className="pickup-info-column">
                                <p><strong>Cliente:</strong> {order.customer?.name}</p>
                                <p><strong>Teléfono:</strong> {order.customer?.current_phone_number}</p>
                                <p><strong>Fecha pedido:</strong> {new Date(order.order_date).toLocaleString()}</p>
                                {order.pickup_pin && (
                                    <div style={{ marginTop: '15px', display: 'inline-block', background: 'rgba(240, 180, 41, 0.1)', padding: '8px 15px', borderRadius: '6px', border: '2px dashed #f0b429', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                                        <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: '#f0b429', fontWeight: 'bold', textTransform: 'uppercase' }}>PIN de Seguridad</p>
                                        <p style={{ margin: 0, fontSize: '22px', fontWeight: '900', letterSpacing: '3px', color: '#f1f1f3' }}>{order.pickup_pin}</p>
                                    </div>
                                )}
                            </div>

                            <div className="pickup-products-column">
                                <strong style={{color: '#a0a0b0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px'}}>Lista de Empaque:</strong>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                                    {order.orderItems?.map(item => {
                                        const imageUrl = item.product?.image_url ||
                                                         item.product?.clothingSize?.clothingColor?.imageClothing?.[0]?.image_url ||
                                                         item.product?.clothingSize?.clothingColor?.image_url ||
                                                         'https://via.placeholder.com/60?text=No+Img';

                                        return (
                                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: '#13131a', borderRadius: '8px', border: '1px solid #2a2a35' }}>
                                                <img src={imageUrl} alt={item.product_name} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#2a2a35' }} />
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', fontSize: '15px', color: '#f1f1f3' }}>{item.product_name}</p>
                                                    <p style={{ margin: 0, fontSize: '13px', color: '#a0a0b0' }}>
                                                        <span style={{ display: 'inline-block', padding: '2px 8px', background: '#1f1f2a', borderRadius: '4px', marginRight: '8px' }}>Color: <strong style={{display: 'inline', color: '#f1f1f3'}}>{item.color}</strong></span>
                                                        <span style={{ display: 'inline-block', padding: '2px 8px', background: '#1f1f2a', borderRadius: '4px' }}>Talla: <strong style={{display: 'inline', color: '#f1f1f3'}}>{item.size}</strong></span>
                                                    </p>
                                                </div>
                                                <div style={{ background: '#3b82f6', color: 'white', fontWeight: 'bold', fontSize: '16px', padding: '8px 16px', borderRadius: '6px', textAlign: 'center', minWidth: '40px' }}>
                                                    x{item.quantity}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="pickup-card-actions">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/order/${order.id}`)}
                            >
                                Ver Detalle / DIAN
                            </Button>

                            {(!order.pickup_status || order.pickup_status === 'PENDING') && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleMarkReady(order.id)}
                                >
                                    Marcar: Listo para Recoger
                                </Button>
                            )}

                            {(order.pickup_status === 'READY' || order.pickup_status === 'PENDING') && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleMarkCollected(order.id)}
                                >
                                    Entregado a Cliente
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PickupDashboardPage;
