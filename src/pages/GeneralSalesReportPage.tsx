import React, { useState, useEffect } from 'react';
import { getGeneralSalesReport } from '../services/reportApi';
import './GeneralSalesReportPage.css';

const GeneralSalesReportPage = () => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getGeneralSalesReport(startDate, endDate);
            setReportData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const today = new Date().toISOString().split('T')[0];
        if (endDate > today) {
            setError("La fecha final no puede ser mayor a la fecha actual.");
            return;
        }
        if (startDate > endDate) {
            setError("La fecha inicial no puede ser mayor a la fecha final.");
            return;
        }
        fetchReport();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="report-page-container">
            <h1>Reporte General de Ventas</h1>

            <form onSubmit={handleSearch} className="report-filters">
                <div className="filter-group">
                    <label htmlFor="startDate">Fecha Inicio:</label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                    />
                </div>
                <div className="filter-group">
                    <label htmlFor="endDate">Fecha Fin:</label>
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        max={new Date().toISOString().split('T')[0]}
                    />
                </div>
                <button type="submit" className="btn-search" disabled={loading}>
                    {loading ? 'Cargando...' : 'Buscar'}
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}

            <div className="report-table-container">
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>ID Orden</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Identificación</th>
                            <th>Estado</th>
                            <th>Items</th>
                            <th>Total Venta</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.length === 0 && !loading ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center' }}>No se encontraron ventas en el rango seleccionado.</td>
                            </tr>
                        ) : (
                            reportData.map((order) => (
                                <tr key={order.order_id}>
                                    <td>{order.order_id}</td>
                                    <td>{new Date(order.order_date).toLocaleDateString()}</td>
                                    <td>
                                        <div>{order.customer.name}</div>
                                        <small>{order.customer.email}</small>
                                    </td>
                                    <td>{order.customer.identification}</td>
                                    <td>{order.status}</td>
                                    <td>
                                        <ul className="item-list">
                                            {order.items.map((item, idx) => (
                                                <li key={idx}>
                                                    {item.quantity}x {item.product_name} ({item.size}, {item.color}) - Ref: {item.design_reference}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td>{formatCurrency(order.total_payment)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GeneralSalesReportPage;
