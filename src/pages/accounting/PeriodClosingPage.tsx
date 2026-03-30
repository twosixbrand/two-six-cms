import React, { useState, useEffect } from 'react';
import { FiLock, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const monthNames = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const thStyle: React.CSSProperties = {
    padding: '0.65rem 1rem', fontSize: '0.7rem', fontWeight: 500,
    textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b6b7b',
    borderBottom: '1px solid #2a2a35', backgroundColor: '#1f1f2a',
    whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif', textAlign: 'left',
};

const tdStyleBase: React.CSSProperties = {
    padding: '0.65rem 1rem', fontSize: '0.8125rem', color: '#f1f1f3',
    borderBottom: '1px solid #1f1f2a', fontFamily: 'Inter, sans-serif',
};

const PeriodClosingPage = () => {
    const [closings, setClosings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [processing, setProcessing] = useState(false);

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const [closeYear, setCloseYear] = useState(currentYear);
    const [closeMonth, setCloseMonth] = useState(currentMonth > 1 ? currentMonth - 1 : 12);

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
        <div className="page-container">
            <PageHeader title="Cierre Contable" icon={<FiLock />} />

            {error && (
                <div style={{
                    background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', padding: '12px 16px',
                    borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(248, 113, 113, 0.2)',
                }}>
                    {error}
                </div>
            )}
            {success && (
                <div style={{
                    background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', padding: '12px 16px',
                    borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(52, 211, 153, 0.2)',
                }}>
                    {success}
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {/* Monthly Closing */}
                <div style={{
                    flex: 1, minWidth: '300px', background: '#1a1a24', borderRadius: '12px',
                    padding: '20px', border: '1px solid #2a2a35',
                }}>
                    <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>
                        <FiCalendar /> Cerrar Mes
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div style={{ minWidth: '100px' }}>
                            <FormField
                                label="Ano"
                                name="closeYear"
                                type="select"
                                value={closeYear}
                                onChange={(e) => setCloseYear(Number(e.target.value))}
                                options={yearOptions.map(y => ({ value: y, label: String(y) }))}
                            />
                        </div>
                        <div style={{ minWidth: '120px' }}>
                            <FormField
                                label="Mes"
                                name="closeMonth"
                                type="select"
                                value={closeMonth}
                                onChange={(e) => setCloseMonth(Number(e.target.value))}
                                options={monthNames.slice(1).map((name, i) => ({ value: i + 1, label: name }))}
                            />
                        </div>
                        <Button
                            variant="primary"
                            onClick={handleClosePeriod}
                            disabled={processing}
                            loading={processing}
                        >
                            {processing ? 'Procesando...' : 'Cerrar Mes'}
                        </Button>
                    </div>
                </div>

                {/* Annual Closing */}
                <div style={{
                    flex: 1, minWidth: '300px', background: '#1a1a24', borderRadius: '12px',
                    padding: '20px', border: '1px solid #2a2a35',
                }}>
                    <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>
                        <FiLock /> Cierre Anual
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div style={{ minWidth: '100px' }}>
                            <FormField
                                label="Ano"
                                name="annualYear"
                                type="select"
                                value={annualYear}
                                onChange={(e) => setAnnualYear(Number(e.target.value))}
                                options={yearOptions.map(y => ({ value: y, label: String(y) }))}
                            />
                        </div>
                        <Button
                            variant="destructive"
                            onClick={handleAnnualClose}
                            disabled={processing}
                            loading={processing}
                        >
                            {processing ? 'Procesando...' : 'Cierre Anual'}
                        </Button>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6b6b7b', marginTop: '8px', marginBottom: 0 }}>
                        Cierra todos los meses pendientes y traslada la utilidad/perdida a Resultados de Ejercicios Anteriores.
                    </p>
                </div>
            </div>

            {/* Table */}
            <div style={{
                background: '#1a1a24', borderRadius: '12px', overflow: 'hidden',
                border: '1px solid #2a2a35',
            }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a2a35' }}>
                    <h3 style={{ margin: 0, color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>Cierres Realizados</h3>
                </div>

                {loading ? (
                    <div style={{ padding: '40px' }}>
                        <LoadingSpinner size="md" text="Cargando..." />
                    </div>
                ) : closings.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#6b6b7b' }}>
                        No se han realizado cierres contables aun.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Periodo</th>
                                    <th style={thStyle}>Tipo</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>Utilidad / Perdida</th>
                                    <th style={{ ...thStyle, textAlign: 'center' }}>Estado</th>
                                    <th style={thStyle}>Cerrado por</th>
                                    <th style={thStyle}>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {closings.map((c: any) => (
                                    <tr key={c.id}>
                                        <td style={tdStyleBase}>
                                            {c.closing_type === 'ANNUAL'
                                                ? `${c.year} (Anual)`
                                                : `${monthNames[c.month] || '-'} ${c.year}`}
                                        </td>
                                        <td style={tdStyleBase}>
                                            <span style={{
                                                display: 'inline-block', padding: '2px 10px', borderRadius: '12px',
                                                fontSize: '12px', fontWeight: 500,
                                                background: c.closing_type === 'ANNUAL' ? '#1a2744' : 'rgba(167, 139, 250, 0.1)',
                                                color: c.closing_type === 'ANNUAL' ? '#60a5fa' : '#a78bfa',
                                            }}>
                                                {c.closing_type === 'ANNUAL' ? 'Anual' : 'Mensual'}
                                            </span>
                                        </td>
                                        <td style={{
                                            ...tdStyleBase, textAlign: 'right', fontWeight: 600,
                                            color: c.profit_loss >= 0 ? '#34d399' : '#f87171',
                                        }}>
                                            {formatCurrency(c.profit_loss)}
                                        </td>
                                        <td style={{ ...tdStyleBase, textAlign: 'center' }}>
                                            {c.status === 'CLOSED' ? (
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    padding: '2px 10px', borderRadius: '12px', fontSize: '12px',
                                                    background: '#0d3b2e', color: '#34d399', fontWeight: 500,
                                                }}>
                                                    <FiCheckCircle size={12} /> Cerrado
                                                </span>
                                            ) : (
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    padding: '2px 10px', borderRadius: '12px', fontSize: '12px',
                                                    background: '#3b1515', color: '#f87171', fontWeight: 500,
                                                }}>
                                                    <FiXCircle size={12} /> Reversado
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ ...tdStyleBase, color: '#a0a0b0' }}>
                                            {c.closed_by || '-'}
                                        </td>
                                        <td style={{ ...tdStyleBase, color: '#a0a0b0' }}>
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
