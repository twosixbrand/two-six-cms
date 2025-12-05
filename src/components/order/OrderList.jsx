import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';
import './OrderList.css';

const OrderList = ({ orders }) => {
    const navigate = useNavigate();

    return (
        <div className="list-container">
            <h2>Pedidos</h2>
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Total</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
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
                                <td colSpan="6" className="text-center">No hay pedidos registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderList;
