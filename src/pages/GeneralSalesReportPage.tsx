import React, { useState, useEffect, useMemo } from 'react';
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiBox } from 'react-icons/fi';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import PageHeader from '../components/common/PageHeader';
import { getGeneralSalesReport } from '../services/reportApi';
import { Button, DataTable, StatusBadge, LoadingSpinner } from '../components/ui';
import './GeneralSalesReportPage.css';

const COLORS = ['#d4af37', '#e8c468', '#f2d890', '#c29b2b', '#9b781a', '#fff'];

const GeneralSalesReportPage = () => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const defaultEnd = new Date();
    const defaultStart = new Date();
    defaultStart.setDate(defaultEnd.getDate() - 30);

    const [startDate, setStartDate] = useState(defaultStart.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(defaultEnd.toISOString().split('T')[0]);

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

    const { dailyData, totalRevenue, totalOrders, totalItems } = useMemo(() => {
        const dateMap = new Map();
        let revenue = 0;
        let orders = 0;
        let itemsCount = 0;

        reportData.forEach(order => {
            const dateObj = new Date(order.order_date);
            const dateStr = dateObj.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });

            revenue += order.total_payment;
            orders += 1;

            const itemsInOrder = order.items.reduce((sum, item) => sum + item.quantity, 0);
            itemsCount += itemsInOrder;

            if (!dateMap.has(dateStr)) {
                dateMap.set(dateStr, { date: dateStr, revenue: 0, sales: 0, timestamp: dateObj.getTime() });
            }
            const current = dateMap.get(dateStr);
            current.revenue += order.total_payment;
            current.sales += 1;
        });

        const sortedDaily = Array.from(dateMap.values()).sort((a, b) => a.timestamp - b.timestamp);

        return {
            dailyData: sortedDaily,
            totalRevenue: revenue,
            totalOrders: orders,
            totalItems: itemsCount
        };
    }, [reportData]);

    const topProductsData = useMemo(() => {
        const productMap = new Map();

        reportData.forEach(order => {
            order.items.forEach(item => {
                const name = item.product_name;
                if (!productMap.has(name)) {
                    productMap.set(name, { name, quantity: 0 });
                }
                productMap.get(name).quantity += item.quantity;
            });
        });

        const sorted = Array.from(productMap.values()).sort((a, b) => b.quantity - a.quantity);
        if (sorted.length > 5) {
            const top5 = sorted.slice(0, 5);
            const othersQty = sorted.slice(5).reduce((sum, p) => sum + p.quantity, 0);
            top5.push({ name: 'Otros', quantity: othersQty });
            return top5;
        }
        return sorted;
    }, [reportData]);


    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const CustomTooltip = ({ active, payload, label, isCurrency = false }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{label}</p>
                    <p className="tooltip-value">
                        {isCurrency ? formatCurrency(payload[0].value) : payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    const tableColumns = [
        {
            key: 'order_id',
            header: 'Orden',
            render: (val: any) => `#${val}`,
        },
        {
            key: 'order_date',
            header: 'Fecha',
            render: (val: any) => new Date(val).toLocaleDateString(),
        },
        {
            key: 'customer',
            header: 'Cliente',
            render: (_val: any, row: any) => (
                <div>
                    <div className="fw-500">{row.customer.name}</div>
                    <small className="text-muted">{row.customer.email}</small>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Estado',
            render: (val: any) => <StatusBadge status={val} />,
        },
        {
            key: 'items',
            header: 'Prendas',
            render: (_val: any, row: any) => (
                <ul className="item-list-compact">
                    {row.items.map((item: any, idx: number) => (
                        <li key={idx}>
                            <span className="qty">{item.quantity}x</span> {item.product_name} <span className="text-muted">({item.size})</span>
                        </li>
                    ))}
                </ul>
            ),
        },
        {
            key: 'total_payment',
            header: 'Total',
            align: 'right' as const,
            render: (val: any) => <span className="fw-600 gold-text">{formatCurrency(val)}</span>,
        },
    ];

    return (
        <div className="report-page-container">
            <PageHeader title="Reporte General de Ventas" icon={<FiTrendingUp />} />

            <form onSubmit={handleSearch} className="report-filters glass-panel">
                <div className="filter-group">
                    <label>Fecha Inicio:</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="filter-group">
                    <label>Fecha Fin:</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required max={new Date().toISOString().split('T')[0]} />
                </div>
                <Button type="submit" variant="primary" loading={loading}>
                    {loading ? 'Cargando...' : 'Actualizar'}
                </Button>
            </form>

            {error && <div className="error-message">{error}</div>}

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card glass-panel">
                    <div className="kpi-icon"><FiDollarSign /></div>
                    <div className="kpi-info">
                        <h3>Ingresos Totales</h3>
                        <p className="kpi-value highlight">{formatCurrency(totalRevenue)}</p>
                    </div>
                </div>
                <div className="kpi-card glass-panel">
                    <div className="kpi-icon"><FiShoppingBag /></div>
                    <div className="kpi-info">
                        <h3>Pedidos Completados</h3>
                        <p className="kpi-value">{totalOrders}</p>
                    </div>
                </div>
                <div className="kpi-card glass-panel">
                    <div className="kpi-icon"><FiBox /></div>
                    <div className="kpi-info">
                        <h3>Prendas Vendidas</h3>
                        <p className="kpi-value">{totalItems}</p>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                <div className="chart-card glass-panel chart-span-2">
                    <h3>Curva de Ingresos (COP)</h3>
                    <div className="chart-wrapper">
                        {dailyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailyData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#d4af37" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888' }} />
                                    <YAxis stroke="#888" tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} />
                                    <RechartsTooltip content={<CustomTooltip isCurrency={true} />} />
                                    <Area type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : <div className="no-data-msg">Sin datos para graficar</div>}
                    </div>
                </div>

                <div className="chart-card glass-panel">
                    <h3>Volumen de Transacciones</h3>
                    <div className="chart-wrapper">
                        {dailyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyData}>
                                    <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888' }} />
                                    <YAxis stroke="#888" allowDecimals={false} />
                                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                    <Bar dataKey="sales" fill="#d4af37" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <div className="no-data-msg">Sin datos para graficar</div>}
                    </div>
                </div>

                <div className="chart-card glass-panel">
                    <h3>Top Prendas Vendidas</h3>
                    <div className="chart-wrapper pie-wrapper">
                        {topProductsData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={topProductsData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="quantity"
                                        stroke="none"
                                    >
                                        {topProductsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <div className="no-data-msg">Sin datos para graficar</div>}
                    </div>
                </div>
            </div>

            {/* Table Detail */}
            <div className="report-table-container glass-panel">
                <h3 className="section-title">Registro Detallado</h3>
                <DataTable
                    columns={tableColumns}
                    data={reportData}
                    loading={loading}
                    emptyMessage="No se encontraron ventas en el rango seleccionado."
                />
            </div>
        </div>
    );
};

export default GeneralSalesReportPage;
