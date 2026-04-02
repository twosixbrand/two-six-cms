import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import * as orderApi from '../services/orderApi';
import * as dianApi from '../services/dianApi';
import { logError } from '../services/errorApi';
import { FaArrowLeft, FaSave, FaFilePdf, FaFileCode, FaUndo, FaMoneyBillWave } from 'react-icons/fa';
import { FiFileText, FiRefreshCw } from 'react-icons/fi';
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
    
    // UI states for DIAN Modals
    const [isDianGenerating, setIsDianGenerating] = useState(false);
    const [noteType, setNoteType] = useState<'CREDIT' | 'DEBIT' | null>(null);
    const [noteReasonCode, setNoteReasonCode] = useState('2');
    const [noteReasonDesc, setNoteReasonDesc] = useState('');
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [isPickupActionLoading, setIsPickupActionLoading] = useState(false);

    const handleMarkAsReadyForPickup = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Seguro de enviar el correo "Listo para recoger" al cliente?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f0b429',
            cancelButtonColor: '#2a2a35',
            confirmButtonText: 'Sí, enviar',
            cancelButtonText: 'Cancelar',
        });
        if (!result.isConfirmed) return;
        try {
            setIsPickupActionLoading(true);
            await orderApi.markAsReadyForPickup(id);
            await Swal.fire({ title: '¡Éxito!', text: 'Correo enviado exitosamente.', icon: 'success', confirmButtonColor: '#f0b429' });
            fetchOrder();
        } catch (err) {
            await Swal.fire({ title: 'Error', text: 'Error al marcar como listo para recoger.', icon: 'error', confirmButtonColor: '#f0b429' });
        } finally {
            setIsPickupActionLoading(false);
        }
    };

    const handleMarkAsPreparing = async () => {
        if (!window.confirm('¿Marcar este pedido como "Preparando"?')) return;
        try {
            setIsPickupActionLoading(true);
            await orderApi.markAsPreparingForPickup(id);
            alert('Pedido marcado como Preparando.');
            fetchOrder();
        } catch (err) {
            alert('Error al marcar como preparando.');
        } finally {
            setIsPickupActionLoading(false);
        }
    };

    const handleMarkAsUnclaimed = async () => {
        if (!window.confirm('¿Seguro de marcar este pedido como NO RECLAMADO? (El cliente no recogió el paquete a tiempo)')) return;
        try {
            setIsPickupActionLoading(true);
            await orderApi.markAsUnclaimedForPickup(id);
            alert('Pedido marcado como No Reclamado.');
            fetchOrder();
        } catch (err) {
            alert('Error al actualizar a no reclamado.');
        } finally {
            setIsPickupActionLoading(false);
        }
    };

    const handleMarkAsCollected = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Seguro de marcar este pedido como entregado en el punto físico?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#f0b429',
            cancelButtonColor: '#2a2a35',
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar',
        });
        if (!result.isConfirmed) return;
        try {
            setIsPickupActionLoading(true);
            await orderApi.markAsCollected(id);
            await Swal.fire({ title: '¡Éxito!', text: 'Pedido marcado como entregado (Recogido).', icon: 'success', confirmButtonColor: '#f0b429' });
            fetchOrder();
        } catch (err) {
            await Swal.fire({ title: 'Error', text: 'Error al actualizar a recogido.', icon: 'error', confirmButtonColor: '#f0b429' });
        } finally {
            setIsPickupActionLoading(false);
        }
    };

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
            await Swal.fire({ title: '¡Éxito!', text: `Estado actualizado exitosamente a ${finalStatus}`, icon: 'success', confirmButtonColor: '#f0b429' });
        } catch (err) {
            console.error('Error updating order status:', err);
            await Swal.fire({ title: 'Error', text: 'Error al actualizar el estado del pedido.', icon: 'error', confirmButtonColor: '#f0b429' });
        } finally {
            setSaving(false);
        }
    };

    const handleCreateInvoice = async () => {
        const confirmResult = await Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Seguro de generar la Factura Electrónica en la DIAN para este pedido?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f0b429',
            cancelButtonColor: '#2a2a35',
            confirmButtonText: 'Sí, generar',
            cancelButtonText: 'Cancelar',
        });
        if (!confirmResult.isConfirmed) return;
        try {
            setIsDianGenerating(true);
            const res = await dianApi.createDianInvoice({
                orderId: order.id,
                date: new Date().toISOString().split('T')[0],
                time: '12:00:00-05:00',
                customerName: order.customer?.name || 'Cliente',
                customerDoc: '222222222222',
                customerDocType: '13',
            });
            await Swal.fire({ title: '¡Éxito!', text: 'Factura enviada a DIAN exitosamente', icon: 'success', confirmButtonColor: '#f0b429' });
            fetchOrder();
        } catch (err: any) {
            await Swal.fire({ title: 'Error', text: err?.message || 'Error al generar factura DIAN', icon: 'error', confirmButtonColor: '#f0b429' });
        } finally {
            setIsDianGenerating(false);
        }
    };

    const handleCreateNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!order.dianEInvoicing?.id) return;
        const noteConfirm = await Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Seguro de generar Nota ${noteType === 'CREDIT' ? 'Crédito' : 'Débito'} en la DIAN?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f0b429',
            cancelButtonColor: '#2a2a35',
            confirmButtonText: 'Sí, generar',
            cancelButtonText: 'Cancelar',
        });
        if (!noteConfirm.isConfirmed) return;

        try {
            setIsDianGenerating(true);
            const payload = {
                reasonCode: noteReasonCode,
                reasonDesc: noteReasonDesc,
                customerDoc: '222222222222',
                customerDocType: '13',
            };

            if (noteType === 'CREDIT') {
                await dianApi.createCreditNote(order.dianEInvoicing.id, payload);
                await Swal.fire({ title: '¡Éxito!', text: 'Nota Crédito enviada exitosamente a la DIAN', icon: 'success', confirmButtonColor: '#f0b429' });
            } else {
                await dianApi.createDebitNote(order.dianEInvoicing.id, payload);
                await Swal.fire({ title: '¡Éxito!', text: 'Nota Débito enviada exitosamente a la DIAN', icon: 'success', confirmButtonColor: '#f0b429' });
            }
            setNoteType(null);
            fetchOrder();
        } catch (err: any) {
            await Swal.fire({ title: 'Error', text: err?.message || 'Error al generar Nota DIAN', icon: 'error', confirmButtonColor: '#f0b429' });
        } finally {
            setIsDianGenerating(false);
        }
    };

    const handleSyncNoteStatus = async (noteId: number) => {
        try {
            setIsDianGenerating(true);
            const res = await dianApi.syncNoteStatus(noteId);
            if (res.isValid && res.statusCode === '00') {
                await Swal.fire({ title: '¡Éxito!', text: 'La Nota ha sido Autorizada por la DIAN.', icon: 'success', confirmButtonColor: '#f0b429' });
            } else if (!res.isValid && res.statusCode === '2') {
                await Swal.fire({ title: 'SET DE PRUEBAS FINALIZADO', text: `La DIAN indica: "${res.statusDescription}". Esto significa que Two Six ya pasó las pruebas de habilitación en Sandbox y el set de pruebas se cerró. Para seguir enviando, deben pasar a Producción o generar un nuevo Test Set.`, icon: 'info', confirmButtonColor: '#f0b429' });
            } else if (!res.isValid) {
                await Swal.fire({ title: 'Nota Rechazada', text: `${res.statusCode} - ${res.statusDescription}`, icon: 'error', confirmButtonColor: '#f0b429' });
            } else {
                await Swal.fire({ title: 'Estado', text: `${res.statusCode} - ${res.statusDescription}`, icon: 'info', confirmButtonColor: '#f0b429' });
            }
            fetchOrder();
        } catch (err: any) {
            await Swal.fire({ title: 'Error', text: err?.message || 'Error sincronizando estado', icon: 'error', confirmButtonColor: '#f0b429' });
        } finally {
            setIsDianGenerating(false);
        }
    };

    const handleRetryInvoice = async () => {
        if (!order) return;
        const retryConfirm = await Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Deseas generar un NUEVO consecutivo y reintentar el envío a la DIAN para este pedido?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f0b429',
            cancelButtonColor: '#2a2a35',
            confirmButtonText: 'Sí, reintentar',
            cancelButtonText: 'Cancelar',
        });
        if (!retryConfirm.isConfirmed) return;

        setIsDianGenerating(true);
        try {
            const res = await dianApi.retryInvoice(order.id, {
                date: new Date().toISOString().split('T')[0],
                time: '12:00:00-05:00',
            });
            if (res.success) {
                await Swal.fire({ title: '¡Éxito!', text: 'Factura Reintentada Exitosamente!', icon: 'success', confirmButtonColor: '#f0b429' });
                fetchOrder();
            } else {
                await Swal.fire({ title: 'Error', text: res.error || 'Error al reintentar', icon: 'error', confirmButtonColor: '#f0b429' });
            }
        } catch (error: any) {
            console.error('Error reintentando factura DIAN:', error);
            await Swal.fire({ title: 'Error', text: error.message || 'Error en comunicación con DIAN', icon: 'error', confirmButtonColor: '#f0b429' });
        } finally {
            setIsDianGenerating(false);
        }
    };

    const handleCheckInvoiceStatus = async () => {
        if (!order || !order.dianEInvoicing || !order.dianEInvoicing.dian_response) return;
        const zipKeyMatch = order.dianEInvoicing.dian_response.match(/<b:ZipKey>(.*?)<\/b:ZipKey>/);
        if (!zipKeyMatch) {
            await Swal.fire({ title: 'Error', text: 'No se encontró ZipKey válido para esta factura, no se puede consultar estado.', icon: 'error', confirmButtonColor: '#f0b429' });
            return;
        }
        setIsDianGenerating(true);
        try {
            const res = await dianApi.checkInvoiceStatus(zipKeyMatch[1]);
            if (res.isValid === 'true' && res.statusCode === '00') {
                await Swal.fire({ title: '¡Éxito!', text: 'La Factura ha sido Autorizada por la DIAN.', icon: 'success', confirmButtonColor: '#f0b429' });
            } else if (res.isValid === 'false' && res.statusCode === '2') {
                await Swal.fire({ title: 'SET DE PRUEBAS FINALIZADO', text: `La DIAN indica: "${res.statusDescription}"`, icon: 'info', confirmButtonColor: '#f0b429' });
            } else if (res.isValid === 'false') {
                await Swal.fire({ title: 'Factura Rechazada', text: `${res.statusCode} - ${res.statusDescription}`, icon: 'error', confirmButtonColor: '#f0b429' });
            } else {
                await Swal.fire({ title: 'Estado DIAN', text: `${res.statusCode} - ${res.statusDescription}`, icon: 'info', confirmButtonColor: '#f0b429' });
            }
            fetchOrder();
        } catch (err: any) {
            await Swal.fire({ title: 'Error', text: err?.message || 'Error sincronizando estado', icon: 'error', confirmButtonColor: '#f0b429' });
        } finally {
            setIsDianGenerating(false);
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
                        <div style={{ marginTop: '10px', background: 'rgba(245, 158, 11, 0.1)', padding: '10px', borderRadius: '4px', borderLeft: '4px solid #f0b429' }}>
                            <p style={{ margin: 0, color: '#f0b429', fontWeight: 'bold' }}>⚠️ PEDIDO PAGO CONTRA ENTREGA</p>
                            <p style={{ margin: '5px 0 0 0', color: '#a0a0b0' }}>Valor Recaudo: <strong>${order.cod_amount?.toLocaleString()}</strong></p>
                        </div>
                    )}

                    {order.payments && order.payments.length > 0 ? (
                        <>
                            <h4 style={{ marginTop: '15px', marginBottom: '10px', borderBottom: '1px solid #2a2a35' }}>Pagos</h4>
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

                {/* Gestión de Recogida */}
                {order.delivery_method === 'PICKUP' && (
                    <div className="detail-card full-width" style={{ border: '2px solid rgba(59, 130, 246, 0.3)', backgroundColor: '#13131a' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                            <div>
                                <h3 style={{ color: '#60a5fa', margin: '0 0 10px 0' }}>📍 Gestión de Recogida en Punto</h3>
                                <p style={{ margin: 0 }}><strong>Estado de Recogida:</strong> {
                                    order.pickup_status === 'UNCLAIMED' ? '🔴 No Reclamado (Abandonado)' :
                                    order.pickup_status === 'READY' ? '🟢 Listo para Recoger (Notificado)' :
                                    order.pickup_status === 'COLLECTED' ? '🔵 Cliente Recogió el Pedido' :
                                    order.pickup_status === 'PREPARING' ? '🟡 Preparando Empaque' :
                                    '⚪ Pendiente de Revisión'
                                }</p>
                            </div>
                            {order.pickup_pin && (
                                <div style={{ background: 'rgba(240, 180, 41, 0.1)', border: '2px dashed #f0b429', padding: '10px 20px', borderRadius: '8px', textAlign: 'center' }}>
                                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#f0b429', fontWeight: 'bold', textTransform: 'uppercase' }}>PIN de Seguridad</p>
                                    <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '4px', color: '#f1f1f3' }}>{order.pickup_pin}</div>
                                </div>
                            )}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                className="action-btn"
                                style={{ background: '#f59e0b', color: 'white', flex: '1 1 auto', padding: '10px', fontWeight: 'bold' }}
                                onClick={handleMarkAsPreparing}
                                disabled={isPickupActionLoading || order.pickup_status === 'PREPARING' || order.pickup_status === 'READY' || order.pickup_status === 'COLLECTED' || order.pickup_status === 'UNCLAIMED'}
                            >
                                {isPickupActionLoading ? '...' : 'Alistar (Preparando)'}
                            </button>
                            <button
                                className="action-btn"
                                style={{ background: '#3b82f6', color: 'white', flex: '1 1 auto', padding: '10px', fontWeight: 'bold' }}
                                onClick={handleMarkAsReadyForPickup}
                                disabled={isPickupActionLoading || order.pickup_status === 'READY' || order.pickup_status === 'COLLECTED' || order.pickup_status === 'UNCLAIMED'}
                            >
                                {isPickupActionLoading ? '...' : 'Notificar: Listo para Recoger'}
                            </button>
                            <button
                                className="action-btn save-btn"
                                style={{ flex: '1 1 auto', padding: '10px', fontWeight: 'bold' }}
                                onClick={handleMarkAsCollected}
                                disabled={isPickupActionLoading || order.pickup_status === 'COLLECTED' || order.pickup_status === 'UNCLAIMED'}
                            >
                                {isPickupActionLoading ? '...' : 'Marcar Entregado (Recogido)'}
                            </button>
                            <button
                                className="action-btn"
                                style={{ background: '#ef4444', color: 'white', flex: '1 1 auto', padding: '10px', fontWeight: 'bold' }}
                                onClick={handleMarkAsUnclaimed}
                                disabled={isPickupActionLoading || order.pickup_status === 'COLLECTED' || order.pickup_status === 'UNCLAIMED'}
                            >
                                {isPickupActionLoading ? '...' : 'Marcar No Reclamado'}
                            </button>
                        </div>
                    </div>
                )}

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
                            {order.payment_method === 'WOMPI_COD' ? (
                                <>
                                    <option value="Aprobado PCE">Aprobado PCE</option>
                                    <option value="Enviado">Enviado</option>
                                    <option value="Entregado y Pagado">Entregado y Pagado</option>
                                    <option value="Devuelto y No pagado">Devuelto y No pagado</option>
                                    <option value="Cancelado">Cancelado</option>
                                </>
                            ) : order.delivery_method === 'PICKUP' ? (
                                <>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Pagado">Pagado</option>
                                    <option value="Preparando Pedido">Preparando Pedido</option>
                                    <option value="Listo para Recoger">Listo para Recoger</option>
                                    <option value="Entregado">Entregado</option>
                                    <option value="No Reclamado">No Reclamado</option>
                                    <option value="Cancelado">Cancelado</option>
                                </>
                            ) : (
                                <>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Pagado">Pagado</option>
                                    <option value="Enviado">Enviado</option>
                                    <option value="Entregado">Entregado</option>
                                    <option value="Cancelado">Cancelado</option>
                                </>
                            )}
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
                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #2a2a35' }}>
                            <p style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#a0a0b0' }}>
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

                {/* Gestión DIAN */}
                <div className="detail-card full-width">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2em' }}>💼</span> Gestión DIAN
                    </h3>

                    {order.dianEInvoicing ? (
                        <>
                            <div style={{ background: '#13131a', padding: '15px', borderRadius: '6px', border: '1px solid #2a2a35', marginBottom: '15px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                                    <div>
                                        <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#a0a0b0' }}>FACTURA ELECTRÓNICA</p>
                                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: '#f1f1f3' }}>{order.dianEInvoicing.document_number}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#a0a0b0' }}>ESTADO</p>
                                        <span style={{ background: '#0d3b2e', color: '#34d399', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                                            {order.dianEInvoicing.status}
                                        </span>
                                    </div>
                                    <div style={{ wordBreak: 'break-all', gridColumn: '1 / -1' }}>
                                        <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#a0a0b0' }}>CUFE</p>
                                        <p style={{ margin: 0, fontSize: '11px', fontFamily: 'monospace', color: '#f1f1f3' }}>{order.dianEInvoicing.cufe_code || 'No asignado'}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <button 
                                        className="action-btn" 
                                        style={{ background: '#3b82f6', color: 'white' }}
                                        onClick={handleCheckInvoiceStatus}
                                        disabled={isDianGenerating}
                                        title="Consultar estado actual en la DIAN"
                                    >
                                        {isDianGenerating ? <><FiRefreshCw className="spinner" /> Consultando...</> : 'Verificar Estado'}
                                    </button>
                                    <button 
                                        className="action-btn" 
                                        style={{ background: '#ef4444', color: 'white' }}
                                        onClick={async () => {
                                            try {
                                                setIsDownloadingPdf(true);
                                                await dianApi.downloadInvoicePdf(order.dianEInvoicing.id, order.dianEInvoicing.document_number);
                                            } finally {
                                                setIsDownloadingPdf(false);
                                            }
                                        }}
                                        disabled={isDownloadingPdf || isDianGenerating}
                                    >
                                        {isDownloadingPdf ? <><FiRefreshCw className="spinner" /> Generando PDF...</> : <><FaFilePdf /> Descargar PDF</>}
                                    </button>
                                    <button 
                                        className="action-btn" 
                                        style={{ background: '#64748b', color: 'white' }}
                                        onClick={() => dianApi.downloadInvoiceXml(order.dianEInvoicing.id, order.dianEInvoicing.document_number)}
                                    >
                                        <FaFileCode /> Descargar UBL (XML)
                                    </button>
                                    <button 
                                        className="action-btn" 
                                        style={{ background: '#f59e0b', color: 'white', marginLeft: 'auto' }}
                                        onClick={() => setNoteType('CREDIT')}
                                        disabled={isDianGenerating}
                                    >
                                        <FaUndo /> Devolución (Nota Crédito)
                                    </button>
                                    {(order.dianEInvoicing.status === 'REJECTED' || order.dianEInvoicing.status === 'ERROR') && (
                                        <button 
                                            className="action-btn" 
                                            style={{ background: '#f43f5e', color: 'white' }}
                                            onClick={handleRetryInvoice}
                                            disabled={isDianGenerating}
                                            title="Reintenta generar la factura electrónica si la anterior falló y no está autorizada"
                                        >
                                            {isDianGenerating ? <><FiRefreshCw className="spinner" /> Reintentando...</> : <><FaUndo /> Reintentar DIAN</>}
                                        </button>
                                    )}
                                    <button 
                                        className="action-btn" 
                                        style={{ background: '#3b82f6', color: 'white' }}
                                        onClick={() => setNoteType('DEBIT')}
                                        disabled={isDianGenerating}
                                    >
                                        <FaMoneyBillWave /> Ajuste (Nota Débito)
                                    </button>
                                </div>
                            </div>

                            {/* Historial de Envíos */}
                            {order.dianEInvoicings && order.dianEInvoicings.length > 1 && (
                                <div style={{ background: '#13131a', padding: '15px', borderRadius: '6px', border: '1px solid #2a2a35', marginBottom: '15px' }}>
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#a0a0b0' }}>Historial de Intentos de Envío</h4>
                                    <table className="data-table" style={{ fontSize: '11px', marginBottom: 0 }}>
                                        <thead>
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Estado</th>
                                                <th>Verificación</th>
                                                <th>Número</th>
                                                <th>CUFE</th>
                                                <th>Respuesta DIAN (Reglas)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.dianEInvoicings.map((inv: any) => (
                                                <tr key={inv.id} style={{ opacity: inv.id === order.dianEInvoicing?.id ? 1 : 0.7 }}>
                                                    <td>{new Date(inv.createdAt).toLocaleString()}</td>
                                                    <td>
                                                        <span style={{ 
                                                            padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold',
                                                            background: inv.status === 'AUTHORIZED' ? '#0d3b2e' : (inv.status === 'REJECTED' || inv.status === 'ERROR' ? '#3b1515' : '#1f1f2a'),
                                                            color: inv.status === 'AUTHORIZED' ? '#34d399' : (inv.status === 'REJECTED' || inv.status === 'ERROR' ? '#f87171' : '#a0a0b0')
                                                        }}>
                                                            {inv.status}
                                                            {inv.id === order.dianEInvoicing?.id && ' (Actual)'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {inv.status !== 'AUTHORIZED' && inv.dian_response?.includes('ZipKey') && (
                                                            <button 
                                                                className="action-btn" 
                                                                style={{ padding: '2px 6px', fontSize: '10px', background: '#3b82f6', color: 'white' }}
                                                                onClick={async () => {
                                                                    const zipKeyMatch = inv.dian_response.match(/<b:ZipKey>(.*?)<\/b:ZipKey>/);
                                                                    if (!zipKeyMatch) return;
                                                                    setIsDianGenerating(true);
                                                                    try {
                                                                        const res = await dianApi.checkInvoiceStatus(zipKeyMatch[1]);
                                                                        await Swal.fire({ title: `Estado Histórico (${inv.document_number})`, text: `${res.statusCode} - ${res.statusDescription}`, icon: 'info', confirmButtonColor: '#f0b429' });
                                                                    } finally { setIsDianGenerating(false); }
                                                                }}
                                                            >Verificar</button>
                                                        )}
                                                        {inv.dian_response?.includes('ZipKey') && (
                                                            <button 
                                                                className="action-btn" 
                                                                style={{ padding: '2px 6px', fontSize: '10px', background: '#eab308', color: 'white', marginLeft: '5px' }}
                                                                onClick={() => {
                                                                    const zipKeyMatch = inv.dian_response.match(/<b:ZipKey>(.*?)<\/b:ZipKey>/);
                                                                    if (zipKeyMatch) {
                                                                        dianApi.downloadInvoiceZip(zipKeyMatch[1], inv.document_number);
                                                                    }
                                                                }}
                                                                title="Descargar ApplicationResponse.zip de la DIAN"
                                                            >Descargar ZIP</button>
                                                        )}
                                                    </td>
                                                    <td>{inv.document_number}</td>
                                                    <td style={{ fontFamily: 'monospace', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={inv.cufe_code}>{inv.cufe_code || '-'}</td>
                                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={inv.dian_response}>
                                                        {inv.dian_response ? (inv.dian_response.includes('<b:StatusDescription>') ? inv.dian_response.match(/<b:StatusDescription>(.*?)<\/b:StatusDescription>/)?.[1] : 'Error de Generación') : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {noteType && (
                                <div style={{ background: '#1a1a24', border: '1px solid #2a2a35', padding: '15px', borderRadius: '6px', marginBottom: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)' }}>
                                    <h4 style={{ marginTop: 0, borderBottom: '1px solid #2a2a35', paddingBottom: '10px', color: '#f1f1f3' }}>
                                        Generar Nota {noteType === 'CREDIT' ? 'Crédito' : 'Débito'} para {order.dianEInvoicing.document_number}
                                    </h4>
                                    <form onSubmit={handleCreateNote}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '15px' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold', color: '#a0a0b0' }}>Motivo DIAN:</label>
                                                <select className="form-input" value={noteReasonCode} onChange={(e) => setNoteReasonCode(e.target.value)} required>
                                                    {noteType === 'CREDIT' ? (
                                                        <>
                                                            <option value="1">1 - Devolución de parte o totalidad (Devolución Real)</option>
                                                            <option value="2">2 - Anulación de factura electrónica (Error administrativo)</option>
                                                            <option value="3">3 - Rebaja o descuento comercial</option>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <option value="1">1 - Intereses</option>
                                                            <option value="2">2 - Gastos por cobrar</option>
                                                            <option value="3">3 - Cambio del valor</option>
                                                            <option value="4">4 - Otros</option>
                                                        </>
                                                    )}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold', color: '#a0a0b0' }}>Descripción Justificativa:</label>
                                                <textarea 
                                                    className="form-input" 
                                                    rows={2} 
                                                    value={noteReasonDesc} 
                                                    onChange={(e) => setNoteReasonDesc(e.target.value)} 
                                                    placeholder="Ej: Devolución de prenda por garantía"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                            <button type="button" className="action-btn" onClick={() => setNoteType(null)} disabled={isDianGenerating}>Cancelar</button>
                                            <button type="submit" className="action-btn save-btn" disabled={isDianGenerating}>
                                                {isDianGenerating ? <><FiRefreshCw className="spinner" /> Procesando DIAN...</> : 'Emitir Nota al DIAN'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {order.dianEInvoicing.dianNotes && order.dianEInvoicing.dianNotes.length > 0 && (
                                <div>
                                    <h4 style={{ margin: '0 0 10px 0' }}>Notas Asociadas</h4>
                                    <table className="data-table" style={{ fontSize: '12px' }}>
                                        <thead>
                                            <tr>
                                                <th>Tipo</th>
                                                <th>Número</th>
                                                <th>Monto</th>
                                                <th>Emisión</th>
                                                <th>Estado DIAN</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.dianEInvoicing.dianNotes.map((note: any) => (
                                                <tr key={note.id}>
                                                    <td>{note.type === 'CREDIT' ? <span style={{color: '#d97706'}}>Nota Crédito</span> : <span style={{color: '#2563eb'}}>Nota Débito</span>}</td>
                                                    <td style={{ fontWeight: 'bold' }}>{note.note_number}</td>
                                                    <td>${note.amount?.toLocaleString()}</td>
                                                    <td>{new Date(note.issue_date).toLocaleDateString()}</td>
                                                    <td>
                                                        {note.status === 'AUTHORIZED' && <span style={{color: '#16a34a', fontWeight: 'bold'}}>Autorizada</span>}
                                                        {note.status === 'REJECTED' && <span style={{color: '#dc2626', fontWeight: 'bold'}}>Rechazada</span>}
                                                        {note.status === 'ERROR' && <span style={{color: '#dc2626', fontWeight: 'bold'}}>Error</span>}
                                                        {note.status === 'PROCESSED' && <span style={{color: '#ca8a04', fontWeight: 'bold'}}>Procesado</span>}
                                                        {note.status === 'PENDING' && <span style={{color: '#a0a0b0'}}>Pendiente</span>}
                                                        {note.status === 'SENT' && <span style={{color: '#2563eb', fontWeight: 'bold'}}>Enviado</span>}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '5px' }}>
                                                            <button 
                                                                onClick={() => handleSyncNoteStatus(note.id)} 
                                                                className="action-btn" 
                                                                style={{ padding: '4px 8px', fontSize: '10px', background: '#3b82f6', color: 'white' }}
                                                                disabled={isDianGenerating}
                                                            >
                                                                Verificar
                                                            </button>
                                                            {(note.status === 'AUTHORIZED' || note.status === 'REJECTED' || note.status === 'PROCESSED') && (
                                                                <a 
                                                                    href={`${import.meta.env.VITE_API_BASE_URL}/v1/dian/status/${note.status_message?.match(/<b:ZipKey>(.*?)<\/b:ZipKey>/)?.[1]}/xml`} 
                                                                    className="action-btn" 
                                                                    style={{ padding: '4px 8px', fontSize: '10px', background: '#eab308', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                                                                    target="_blank" rel="noreferrer"
                                                                >
                                                                    XML
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px', background: '#13131a', border: '1px dashed #2a2a35', borderRadius: '6px' }}>
                            <p style={{ color: '#a0a0b0', marginBottom: '15px' }}>Este pedido aún no cuenta con Factura Electrónica emitida en la DIAN.</p>
                            <button 
                                className="action-btn" 
                                style={{ background: '#10b981', color: 'white' }}
                                onClick={handleCreateInvoice}
                                disabled={isDianGenerating || order.status === 'Cancelado'}
                            >
                                {isDianGenerating ? <><FiRefreshCw className="spinner" /> Generando...</> : 'Generar Factura Electrónica'}
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
