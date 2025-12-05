import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as orderApi from '../services/orderApi';
import { logError } from '../services/errorApi';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const data = await orderApi.getOrder(id);
            setOrder(data);
            setStatus(data.status);
        } catch (err) {
            logError(err, `/order/${id}`);
            setError('Error al cargar el pedido.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handleStatusChange = async () => {
        try {
            setSaving(true);
            await orderApi.updateOrder(id, { status });
            // Recargar datos para confirmar cambios
            await fetchOrder();
            alert('Estado actualizado correctamente');
        } catch (err) {
            logError(err, `/order/${id}`);
            setError('Error al actualizar el estado.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="page-container"><p>Cargando pedido...</p></div>;
    if (!order) return <div className="page-container"><p>Pedido no encontrado.</p></div>;

    return (
        <div className="page-container">
            <div className="header-actions">
                <button className="back-btn" onClick={() => navigate('/order')}>
                    <FaArrowLeft /> Volver
                </button>
                <h1>Detalle del Pedido #{order.id}</h1>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="details-grid">
                {/* Información General */}
                <div className="detail-card">
                    <h3>Información General</h3>
                    <p><strong>Fecha:</strong> {new Date(order.order_date).toLocaleString()}</p>
                    <p><strong>Total:</strong> ${order.total_payment.toLocaleString()}</p>
                    <p><strong>Método de Pago:</strong> {order.payment_method || 'N/A'}</p>
                    <p><strong>Referencia Pago:</strong> {order.transaction_id || 'N/A'}</p>
                    <p><strong>Pagado:</strong> {order.is_paid ? 'Sí' : 'No'}</p>
                </div>

                {/* Información del Cliente */}
                <div className="detail-card">
                    <h3>Cliente</h3>
                    <p><strong>Nombre:</strong> {order.customer?.name}</p>
                    <p><strong>Email:</strong> {order.customer?.email}</p>
                    <p><strong>Teléfono:</strong> {order.customer?.current_phone_number}</p>
                    <p><strong>Dirección de Envío:</strong> {order.shipping_address}</p>
                    <p><strong>Ciudad:</strong> {order.customer?.city}, {order.customer?.state}</p>
                </div>

                {/* Gestión de Estado */}
                <div className="detail-card full-width">
                    <h3>Gestión de Estado</h3>
                    <div className="status-control">
                        <label>Estado del Pedido:</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="form-input"
                        >
                            <option value="Pendiente">Pendiente</option>
                            <option value="Pagado">Pagado</option>
                            <option value="Enviado">Enviado</option>
                            <option value="Entregado">Entregado</option>
                            <option value="Cancelado">Cancelado</option>
                        </select>
                        <button
                            className="action-btn save-btn"
                            onClick={handleStatusChange}
                            disabled={saving || status === order.status}
                        >
                            <FaSave /> {saving ? 'Guardando...' : 'Actualizar Estado'}
                        </button>
                    </div>
                </div>

                {/* Productos */}
                <div className="detail-card full-width">
                    <h3>Productos</h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Talla</th>
                                <th>Color</th>
                                <th>Cantidad</th>
                                <th>Precio Unit.</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.orderItems?.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="product-cell">
                                            {item.product?.image_url && (
                                                <img
                                                    src={item.product.image_url}
                                                    alt={item.product_name}
                                                    className="product-thumb"
                                                    style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }}
                                                />
                                            )}
                                            {item.product_name}
                                        </div>
                                    </td>
                                    <td>{item.size}</td>
                                    <td>{item.color}</td>
                                    <td>{item.quantity}</td>
                                    <td>${item.unit_price.toLocaleString()}</td>
                                    <td>${(item.quantity * item.unit_price).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
