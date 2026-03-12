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
            <h2>Pedidos</h2>
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
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>{order.order_reference || '-'}</span>
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
                                        disabled={!canGenerateGuide(order.status)}
                                        title={canGenerateGuide(order.status) ? 'Generar Guía de Transporte' : 'Disponible solo para pedidos Pagados, Enviados o Entregados'}
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
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan={8} className="text-center">No hay pedidos registrados.</td>
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
