import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';
import { FiTruck } from 'react-icons/fi';
import TransportGuideModal from './TransportGuideModal';
import * as orderApi from '../../services/orderApi';
import './OrderList.css';

const OrderList = ({ orders }) => {
    const navigate = useNavigate();
    const [guideOrder, setGuideOrder] = useState(null);
    const [loadingGuide, setLoadingGuide] = useState(false);
    const [filterTab, setFilterTab] = useState('ALL');

    const filteredOrders = orders.filter((o) => filterTab === 'ALL' || o.delivery_method === filterTab);

    const handleOpenGuide = async (orderId) => {
        try {
            setLoadingGuide(true);
            const fullOrder = await orderApi.getOrder(orderId);
            setGuideOrder(fullOrder);
        } catch (err) {
            console.error('Error fetching order for guide:', err);
            alert('Error al cargar los datos del pedido para la guía.');
        } finally {
            setLoadingGuide(false);
        }
    };

    const canGenerateGuide = (status) => {
        const allowed = ['pagado', 'enviado', 'entregado', 'aprobado pce'];
        return allowed.includes(status?.toLowerCase());
    };

    return (
        <div className="list-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2>Pedidos</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => setFilterTab('ALL')} 
                        style={{ padding: '8px 16px', borderRadius: '8px', border: filterTab === 'ALL' ? '2px solid #111' : '1px solid #ccc', backgroundColor: filterTab === 'ALL' ? '#111' : '#fff', color: filterTab === 'ALL' ? '#fff' : '#333', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
                    >
                        Todos
                    </button>
                    <button 
                        onClick={() => setFilterTab('SHIPPING')} 
                        style={{ padding: '8px 16px', borderRadius: '8px', border: filterTab === 'SHIPPING' ? '2px solid #111' : '1px solid #ccc', backgroundColor: filterTab === 'SHIPPING' ? '#111' : '#fff', color: filterTab === 'SHIPPING' ? '#fff' : '#333', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
                    >
                        🚚 Envíos
                    </button>
                    <button 
                        onClick={() => setFilterTab('PICKUP')} 
                        style={{ padding: '8px 16px', borderRadius: '8px', border: filterTab === 'PICKUP' ? '2px solid #111' : '1px solid #ccc', backgroundColor: filterTab === 'PICKUP' ? '#111' : '#fff', color: filterTab === 'PICKUP' ? '#fff' : '#333', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
                    >
                        📍 Para Recoger
                    </button>
                </div>
            </div>
            
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Referencia</th>
                            <th>Cliente</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Factura</th>
                            <th>Pagado</th>
                            <th>Guía</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order) => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <span>{order.order_reference || '-'}</span>
                                        {order.delivery_method === 'PICKUP' && (
                                            <span style={{ 
                                                padding: '2px 8px', 
                                                backgroundColor: '#dbeafe', 
                                                color: '#1e3a8a', 
                                                borderRadius: '12px', 
                                                fontSize: '0.7rem', 
                                                fontWeight: 'bold',
                                                whiteSpace: 'nowrap',
                                                border: '1px solid #bfdbfe'
                                            }}>
                                                📍 Retiro
                                            </span>
                                        )}
                                        {order.payment_method === 'WOMPI_COD' && (
                                            <span style={{ 
                                                padding: '2px 8px', 
                                                backgroundColor: '#fef3c7', 
                                                color: '#b45309', 
                                                borderRadius: '12px', 
                                                fontSize: '0.7rem', 
                                                fontWeight: 'bold',
                                                whiteSpace: 'nowrap',
                                                border: '1px solid #fde68a'
                                            }}>
                                                🚚 PCE
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td>{order.customer?.name || 'N/A'}</td>
                                <td>{new Date(order.order_date).toLocaleDateString()}</td>
                                <td>
                                    <span className={`status-badge ${order.status.toLowerCase().replace(' ', '-')}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>${order.total_payment.toLocaleString()}</td>
                                <td>
                                    {order.payment_method === 'WOMPI_COD' && order.status !== 'Pagado' ? (
                                       <div style={{ display: 'flex', flexDirection: 'column' }}>
                                           <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                                               ${(order.total_payment - (order.cod_amount || 0)).toLocaleString()}
                                           </span>
                                           <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 'bold' }}>
                                               Falta: ${(order.cod_amount || 0).toLocaleString()}
                                           </span>
                                       </div>
                                    ) : order.is_paid || ['pagado', 'enviado', 'entregado', 'aprobado pce'].includes(order.status?.toLowerCase()) ? (
                                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                                            ${order.total_payment.toLocaleString()}
                                        </span>
                                    ) : (
                                        <span style={{ color: '#6b7280' }}>$0</span>
                                    )}
                                </td>
                                <td>
                                    <button
                                        className="action-btn guide-btn"
                                        onClick={() => handleOpenGuide(order.id)}
                                        disabled={!canGenerateGuide(order.status) || order.delivery_method === 'PICKUP'}
                                        title={order.delivery_method === 'PICKUP' ? 'No requiere guía (Recoge en punto)' : canGenerateGuide(order.status) ? 'Generar Guía de Transporte' : 'Disponible solo para pedidos Pagados, Enviados o Entregados'}
                                    >
                                        <FiTruck />
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className="action-btn view-btn"
                                        onClick={() => navigate(`/order/${order.id}`)}
                                        title="Ver Detalle"
                                    >
                                        <FaEye />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredOrders.length === 0 && (
                            <tr>
                                <td colSpan={8} className="text-center" style={{ padding: '2rem' }}>No hay pedidos registrados para el filtro seleccionado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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

export default OrderList;
