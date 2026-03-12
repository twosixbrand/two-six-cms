import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as orderApi from '../services/orderApi';
import { logError } from '../services/errorApi';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { FiFileText } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
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

    const handleStatusChange = async (overrideStatus?: string) => {
        const finalStatus = overrideStatus || status;
        if (!finalStatus) return;

        try {
            setSaving(true);
            await orderApi.updateOrder(id, { status: finalStatus });
            // Refresh order
            const updatedOrder = await orderApi.getOrder(id);
            setOrder(updatedOrder);
            setStatus(updatedOrder.status);
            alert(`Estado actualizado exitosamente a ${finalStatus}`);
        } catch (err) {
            console.error('Error updating order status:', err);
            alert('Error al actualizar el estado del pedido.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="page-container"><p>Cargando pedido...</p></div>;
    if (!order) return <div className="page-container"><p>Pedido no encontrado.</p></div>;

    return (
        <div className="page-container">
            <PageHeader title={`Detalle del Pedido ${order.order_reference || '#' + order.id}`} icon={<FiFileText />}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="back-btn" onClick={() => navigate('/order')}>
                        <FaArrowLeft /> Volver
                    </button>
                </div>
            </PageHeader>

            {error && <p className="error-message">{error}</p>}

            <div className="details-grid">
                {/* Información General */}
                <div className="detail-card">
                    <h3>Información General</h3>
                    <p><strong>Fecha:</strong> {new Date(order.order_date).toLocaleString()}</p>
                    <p><strong>Total:</strong> ${order.total_payment.toLocaleString()}</p>
                    <p><strong>Pagado:</strong> {order.is_paid ? 'Sí' : 'No'}</p>
                    {order.payment_method === 'WOMPI_COD' && (
                        <div style={{ marginTop: '10px', background: '#fef3c7', padding: '10px', borderRadius: '4px', borderLeft: '4px solid #f59e0b' }}>
                            <p style={{ margin: 0, color: '#b45309', fontWeight: 'bold' }}>⚠️ PEDIDO PAGO CONTRA ENTREGA</p>
                            <p style={{ margin: '5px 0 0 0', color: '#92400e' }}>Valor Recaudo: <strong>${order.cod_amount?.toLocaleString()}</strong></p>
                        </div>
                    )}

                    {order.payments && order.payments.length > 0 ? (
                        <>
                            <h4 style={{ marginTop: '15px', marginBottom: '10px', borderBottom: '1px solid #eee' }}>Pagos</h4>
                            {order.payments.map((payment, index) => (
                                <div key={payment.id || index} style={{ marginBottom: '10px', fontSize: '0.9em' }}>
                                    <p><strong>Método:</strong> {payment.paymentMethod?.name || 'N/A'}</p>
                                    <p><strong>Ref:</strong> {payment.transaction_reference || 'N/A'}</p>
                                    <p><strong>Estado:</strong> {payment.status}</p>
                                    <p><strong>Fecha:</strong> {new Date(payment.transaction_date).toLocaleString()}</p>
                                </div>
                            ))}
                        </>
                    ) : (
                        <p><em>No hay pagos registrados</em></p>
                    )}
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
                            <option value="Aprobado PCE">Aprobado PCE</option>
                            <option value="Pagado">Pagado</option>
                            <option value="Enviado">Enviado</option>
                            <option value="Entregado">Entregado</option>
                            <option value="Cancelado">Cancelado</option>
                        </select>
                        <button
                            className="action-btn save-btn"
                            onClick={() => handleStatusChange()}
                            disabled={saving || status === order.status}
                        >
                            <FaSave /> {saving ? 'Guardando...' : 'Actualizar Estado'}
                        </button>
                    </div>

                    {order.payment_method === 'WOMPI_COD' && order.status === 'Enviado' && (
                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                            <p style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#666' }}>
                                Si la transportadora ya entregó el dinero del recaudo, marca el pedido como Pagado.
                            </p>
                            <button
                                className="action-btn"
                                style={{ background: '#10b981', color: 'white', fontWeight: 'bold', width: '100%', padding: '10px' }}
                                onClick={() => {
                                    setStatus('Pagado');
                                    handleStatusChange('Pagado');
                                }}
                                disabled={saving}
                            >
                                ✅ Confirmar Recaudo Recibido (${order.cod_amount?.toLocaleString()})
                            </button>
                        </div>
                    )}
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
