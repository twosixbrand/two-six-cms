import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { FaBoxOpen } from 'react-icons/fa';
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

            // Filter orders to hide cancelled ones and old collected ones.
            const activeOrders = response.data.filter(order => {
                if (order.status === 'Cancelado') return false;
                
                // If it's collected, only show it if it was processed TODAY.
                if (order.pickup_status === 'COLLECTED') {
                    return isToday(order.updatedAt || order.order_date);
                }
                
                return true;
            });
            
            // Sort: Group by status and sort inside group by date asc
            const statusOrder = {
                'PENDING': 1,
                'PREPARING': 2,
                'READY': 3,
                'COLLECTED': 4,
                'UNCLAIMED': 5
            };

            const sortedOrders = activeOrders.sort((a, b) => {
                const statusA = statusOrder[a.pickup_status || 'PENDING'] || 1;
                const statusB = statusOrder[b.pickup_status || 'PENDING'] || 1;
                
                // Group by status (PENDING -> READY -> COLLECTED)
                if (statusA !== statusB) {
                    return statusA - statusB;
                }

                // Inside the same group, sort chronologically (oldest to newest)
                if (a.pickup_status === 'COLLECTED') {
                    // For collected, order by collection time (updatedAt)
                    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.order_date).getTime();
                    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.order_date).getTime();
                    return dateA - dateB;
                } else {
                    // For pending/ready, order by creation time (order_date)
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
        // Polling para refrescar automáticamente cada 15 segundos sin bloquear la pantalla
        const interval = setInterval(() => fetchOrders(true), 15000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkPreparing = async (id) => {
        try {
            const result = await Swal.fire({
                title: '¿Alistar Pedido?',
                text: "Marca el pedido como 'Preparando'.",
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#f59e0b',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Sí, alistar'
            });

            if (result.isConfirmed) {
                const token = localStorage.getItem('accessToken');
                await axios.post(`${API_BASE_URL}/order/${id}/preparing-for-pickup`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('¡Preparando!', 'El pedido fue marcado como en preparación.', 'success');
                fetchOrders();
            }
        } catch (error) {
            Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
        }
    };

    const handleMarkUnclaimed = async (id) => {
        try {
            const result = await Swal.fire({
                title: '¿Marcar No Reclamado?',
                text: "Marca este pedido como 'No Reclamado' (abandonado).",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Sí, no reclamado'
            });

            if (result.isConfirmed) {
                const token = localStorage.getItem('accessToken');
                await axios.post(`${API_BASE_URL}/order/${id}/unclaimed-pickup`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('¡No Reclamado!', 'El pedido fue marcado como no reclamado.', 'info');
                fetchOrders();
            }
        } catch (error) {
            Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
        }
    };

    const handleMarkReady = async (id) => {
        try {
            const result = await Swal.fire({
                title: '¿Marcar como Listo?',
                text: "Se enviará un correo al cliente notificando que puede recoger el pedido.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#10b981', // green
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
                confirmButtonColor: '#3b82f6', // blue
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
            case 'PREPARING':
                return 'pickup-card-pending';
            case 'READY':
                return 'pickup-card-ready';
            case 'COLLECTED':
                return 'pickup-card-collected';
            case 'UNCLAIMED':
                return 'pickup-card-collected';
            default:
                return 'pickup-card-pending';
        }
    };

    const getStatusText = (pickupStatus) => {
        switch (pickupStatus) {
            case 'PENDING': return 'Pendiente de Revisión';
            case 'PREPARING': return 'Preparando Empaque';
            case 'READY': return 'Listo para Recoger';
            case 'COLLECTED': return 'Entregado (Recogido)';
            case 'UNCLAIMED': return 'No Reclamado (Abandonado)';
            default: return 'Pendiente de Revisión';
        }
    };

    return (
        <div className="page-container pickup-dashboard">
            <PageHeader title="Tablero de Retiros en Tienda" icon={<FaBoxOpen />} />

            <div className="pickup-filters">
                <button className="base-button-refresh" onClick={() => fetchOrders(false)} disabled={loading}>
                    {loading ? 'Actualizando...' : 'Actualizar Listado'}
                </button>
                <div className="pickup-legend">
                    <span className="legend-item pending">Pendiente</span>
                    <span className="legend-item ready">Listo</span>
                    <span className="legend-item collected">Entregado</span>
                </div>
            </div>

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
                            <span className="pickup-badge">{getStatusText(order.pickup_status)}</span>
                        </div>
                        
                        <div className="pickup-card-body">
                            <div className="pickup-info-column">
                                <p><strong>Cliente:</strong> {order.customer?.name}</p>
                                <p><strong>Teléfono:</strong> {order.customer?.current_phone_number}</p>
                                <p><strong>Fecha pedido:</strong> {new Date(order.order_date).toLocaleString()}</p>
                                {order.pickup_pin && (
                                    <div style={{ marginTop: '15px', display: 'inline-block', background: '#fef3c7', padding: '8px 15px', borderRadius: '6px', border: '2px dashed #f59e0b', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                        <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: '#b45309', fontWeight: 'bold', textTransform: 'uppercase' }}>PIN de Seguridad</p>
                                        <p style={{ margin: 0, fontSize: '22px', fontWeight: '900', letterSpacing: '3px', color: '#000' }}>{order.pickup_pin}</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="pickup-products-column">
                                <strong style={{color: '#4b5563', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px'}}>Lista de Empaque:</strong>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                                    {order.orderItems?.map(item => {
                                        const imageUrl = item.product?.image_url || 
                                                         item.product?.clothingSize?.clothingColor?.imageClothing?.[0]?.image_url || 
                                                         item.product?.clothingSize?.clothingColor?.image_url || 
                                                         'https://via.placeholder.com/60?text=No+Img';
                                        
                                        return (
                                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                <img src={imageUrl} alt={item.product_name} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#e2e8f0' }} />
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', fontSize: '15px', color: '#1e293b' }}>{item.product_name}</p>
                                                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                                                        <span style={{ display: 'inline-block', padding: '2px 8px', background: '#f1f5f9', borderRadius: '4px', marginRight: '8px' }}>Color: <strong style={{display: 'inline', color: '#0f172a'}}>{item.color}</strong></span>
                                                        <span style={{ display: 'inline-block', padding: '2px 8px', background: '#f1f5f9', borderRadius: '4px' }}>Talla: <strong style={{display: 'inline', color: '#0f172a'}}>{item.size}</strong></span>
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
                            <button 
                                className="action-btn"
                                style={{ background: '#f8fafc', color: '#475569', boxShadow: 'none', border: '1px solid #cbd5e1', marginRight: 'auto' }}
                                onClick={() => navigate(`/order/${order.id}`)}
                                title="Ver detalles y gestión de la DIAN"
                            >
                                📄 Ver Detalle / DIAN
                            </button>
                            
                            {(!order.pickup_status || order.pickup_status === 'PENDING') && (
                                <button 
                                    className="action-btn btn-ready"
                                    style={{ background: '#f59e0b', color: 'white' }}
                                    onClick={() => handleMarkPreparing(order.id)}
                                >
                                    Alistar
                                </button>
                            )}

                            {(order.pickup_status === 'PREPARING' || order.pickup_status === 'PENDING') && (
                                <button 
                                    className="action-btn btn-ready"
                                    onClick={() => handleMarkReady(order.id)}
                                >
                                    ✔ Notificar Listo
                                </button>
                            )}
                            
                            {(order.pickup_status === 'READY') && (
                                <>
                                    <button 
                                        className="action-btn btn-collect"
                                        onClick={() => handleMarkCollected(order.id)}
                                    >
                                        📦 Entregado
                                    </button>
                                    <button 
                                        className="action-btn"
                                        style={{ background: '#ef4444', color: 'white' }}
                                        onClick={() => handleMarkUnclaimed(order.id)}
                                    >
                                        No Reclamado
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PickupDashboardPage;
