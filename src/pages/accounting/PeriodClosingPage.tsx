import React, { useState, useEffect } from 'react';
import { FiLock, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const monthNames = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const PeriodClosingPage = () => {
    const [closings, setClosings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [processing, setProcessing] = useState(false);

    // Monthly closing form
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const [closeYear, setCloseYear] = useState(currentYear);
    const [closeMonth, setCloseMonth] = useState(currentMonth > 1 ? currentMonth - 1 : 12);

    // Annual closing form
    const [annualYear, setAnnualYear] = useState(currentYear - 1);

    const fetchClosings = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await accountingApi.getClosings();
            setClosings(data);
        } catch (err: any) {
            setError(err.message || 'Error cargando cierres contables');
            logError(err, '/accounting/closing');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchClosings(); }, []);

    const handleClosePeriod = async () => {
        if (!window.confirm(`Confirmar cierre contable de ${monthNames[closeMonth]} ${closeYear}. Esta accion no se puede deshacer.`)) {
            return;
        }
        setProcessing(true);
        setError('');
        setSuccess('');
        try {
            await accountingApi.closePeriod({ year: closeYear, month: closeMonth });
            setSuccess(`Periodo ${monthNames[closeMonth]} ${closeYear} cerrado exitosamente`);
            fetchClosings();
        } catch (err: any) {
            setError(err.message || 'Error cerrando periodo');
            logError(err, '/accounting/closing');
        } finally {
            setProcessing(false);
        }
    };

    const handleAnnualClose = async () => {
        if (!window.confirm(`Confirmar cierre contable ANUAL de ${annualYear}. Se cerraran todos los meses pendientes y se trasladara la utilidad/perdida. Esta accion no se puede deshacer.`)) {
            return;
        }
        setProcessing(true);
        setError('');
        setSuccess('');
        try {
            await accountingApi.annualClose({ year: annualYear });
            setSuccess(`Cierre anual ${annualYear} completado exitosamente`);
            fetchClosings();
        } catch (err: any) {
            setError(err.message || 'Error en cierre anual');
            logError(err, '/accounting/closing');
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('es-CO', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency', currency: 'COP', minimumFractionDigits: 0,
        }).format(amount);
    };

    const yearOptions = [];
    for (let y = currentYear; y >= currentYear - 5; y--) {
        yearOptions.push(y);
    }

    return (
        <div>
            <PageHeader title="Cierre Contable" icon={<FiLock />} />

            {error && (
                <div style={{
                    background: '#ffebee', color: '#c62828', padding: '12px 16px',
                    borderRadius: '8px', marginBottom: '16px', border: '1px solid #ef9a9a',
                }}>
                    {error}
                </div>
            )}
            {success && (
                <div style={{
                    background: '#e8f5e9', color: '#2e7d32', padding: '12px 16px',
                    borderRadius: '8px', marginBottom: '16px', border: '1px solid #a5d6a7',
                }}>
                    {success}
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {/* Monthly Closing */}
                <div style={{
                    flex: 1, minWidth: '300px', background: '#fff', borderRadius: '12px',
                    padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0',
                }}>
                    <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiCalendar /> Cerrar Mes
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#666' }}>Anio</label>
                            <select
                                value={closeYear}
                                onChange={(e) => setCloseYear(Number(e.target.value))}
                                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
                            >
                                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#666' }}>Mes</label>
                            <select
                                value={closeMonth}
                                onChange={(e) => setCloseMonth(Number(e.target.value))}
                                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
                            >
                                {monthNames.slice(1).map((name, i) => (
                                    <option key={i + 1} value={i + 1}>{name}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleClosePeriod}
                            disabled={processing}
                            style={{
                                padding: '8px 20px', background: '#1565c0', color: '#fff',
                                border: 'none', borderRadius: '6px', cursor: processing ? 'not-allowed' : 'pointer',
                                fontSize: '14px', fontWeight: 500, opacity: processing ? 0.6 : 1,
                            }}
                        >
                            {processing ? 'Procesando...' : 'Cerrar Mes'}
                        </button>
                    </div>
                </div>

                {/* Annual Closing */}
                <div style={{
                    flex: 1, minWidth: '300px', background: '#fff', borderRadius: '12px',
                    padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0',
                }}>
                    <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiLock /> Cierre Anual
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#666' }}>Anio</label>
                            <select
                                value={annualYear}
                                onChange={(e) => setAnnualYear(Number(e.target.value))}
                                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
                            >
                                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={handleAnnualClose}
                            disabled={processing}
                            style={{
                                padding: '8px 20px', background: '#c62828', color: '#fff',
                                border: 'none', borderRadius: '6px', cursor: processing ? 'not-allowed' : 'pointer',
                                fontSize: '14px', fontWeight: 500, opacity: processing ? 0.6 : 1,
                            }}
                        >
                            {processing ? 'Procesando...' : 'Cierre Anual'}
                        </button>
                    </div>
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '8px', marginBottom: 0 }}>
                        Cierra todos los meses pendientes y traslada la utilidad/perdida a Resultados de Ejercicios Anteriores.
                    </p>
                </div>
            </div>

            {/* Table */}
            <div style={{
                background: '#fff', borderRadius: '12px', overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0',
            }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee' }}>
                    <h3 style={{ margin: 0 }}>Cierres Realizados</h3>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Cargando...</div>
                ) : closings.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                        No se han realizado cierres contables aun.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ background: '#f5f5f5' }}>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Periodo</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Tipo</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>Utilidad / Perdida</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>Estado</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Cerrado por</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {closings.map((c: any) => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '12px 16px' }}>
                                            {c.closing_type === 'ANNUAL'
                                                ? `${c.year} (Anual)`
                                                : `${monthNames[c.month] || '-'} ${c.year}`}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{
                                                display: 'inline-block', padding: '2px 10px', borderRadius: '12px',
                                                fontSize: '12px', fontWeight: 500,
                                                background: c.closing_type === 'ANNUAL' ? '#e3f2fd' : '#f3e5f5',
                                                color: c.closing_type === 'ANNUAL' ? '#1565c0' : '#7b1fa2',
                                            }}>
                                                {c.closing_type === 'ANNUAL' ? 'Anual' : 'Mensual'}
                                            </span>
                                        </td>
                                        <td style={{
                                            padding: '12px 16px', textAlign: 'right', fontWeight: 600,
                                            color: c.profit_loss >= 0 ? '#2e7d32' : '#c62828',
                                        }}>
                                            {formatCurrency(c.profit_loss)}
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            {c.status === 'CLOSED' ? (
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    padding: '2px 10px', borderRadius: '12px', fontSize: '12px',
                                                    background: '#e8f5e9', color: '#2e7d32', fontWeight: 500,
                                                }}>
                                                    <FiCheckCircle size={12} /> Cerrado
                                                </span>
                                            ) : (
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    padding: '2px 10px', borderRadius: '12px', fontSize: '12px',
                                                    background: '#ffebee', color: '#c62828', fontWeight: 500,
                                                }}>
                                                    <FiXCircle size={12} /> Reversado
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: '#666' }}>
                                            {c.closed_by || '-'}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: '#666' }}>
                                            {formatDate(c.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PeriodClosingPage;
