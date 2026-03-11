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
        const allowed = ['pagado', 'enviado', 'entregado'];
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
                            <th>Total</th>
                            <th>Guía</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{order.order_reference || '-'}</td>
                                <td>{order.customer?.name || 'N/A'}</td>
                                <td>{new Date(order.order_date).toLocaleDateString()}</td>
                                <td>
                                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>${order.total_payment.toLocaleString()}</td>
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
                                <td colSpan={7} className="text-center">No hay pedidos registrados.</td>
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
