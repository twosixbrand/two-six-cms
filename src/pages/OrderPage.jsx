import React, { useState, useEffect } from 'react';
import OrderList from '../components/order/OrderList';
import * as orderApi from '../services/orderApi';
import { logError } from '../services/errorApi';

const OrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await orderApi.getOrders();
            // Ordenar por fecha descendente (más recientes primero)
            const sortedData = data.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
            setOrders(sortedData);
        } catch (err) {
            logError(err, '/order');
            setError('Error al cargar los pedidos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="page-container">
            <h1>Gestión de Pedidos</h1>
            {error && <p className="error-message">{error}</p>}
            {loading ? (
                <p>Cargando pedidos...</p>
            ) : (
                <div className="list-card full-width">
                    <OrderList orders={orders} />
                </div>
            )}
        </div>
    );
};

export default OrderPage;
