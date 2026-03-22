import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

    const handleCreateInvoice = async () => {
        if (!window.confirm('¿Seguro de generar la Factura Electrónica en la DIAN para este pedido?')) return;
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
            alert('Factura enviada a DIAN exitosamente');
            fetchOrder();
        } catch (err: any) {
            alert(`Error al generar factura DIAN: ${err?.message || 'Error desconocido'}`);
        } finally {
            setIsDianGenerating(false);
        }
    };

    const handleCreateNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!order.dianEInvoicing?.id) return;
        if (!window.confirm(`¿Seguro de generar Nota ${noteType === 'CREDIT' ? 'Crédito' : 'Débito'} en la DIAN?`)) return;

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
                alert('Nota Crédito enviada exitosamente a la DIAN');
            } else {
                await dianApi.createDebitNote(order.dianEInvoicing.id, payload);
                alert('Nota Débito enviada exitosamente a la DIAN');
            }
            setNoteType(null);
            fetchOrder();
        } catch (err: any) {
            alert(`Error al generar Nota DIAN: ${err?.message || 'Error desconocido'}`);
        } finally {
            setIsDianGenerating(false);
        }
    };

    const handleSyncNoteStatus = async (noteId: number) => {
        try {
            setIsDianGenerating(true);
            const res = await dianApi.syncNoteStatus(noteId);
            if (res.isValid && res.statusCode === '00') {
                alert('¡Éxito! La Nota ha sido Autorizada por la DIAN.');
            } else if (!res.isValid && res.statusCode === '2') {
                alert(`¡SET DE PRUEBAS FINALIZADO!\nLa DIAN indica: "${res.statusDescription}"\nEsto significa que Two Six ya pasó las pruebas de habilitación en Sandbox y el set de pruebas se cerró. Para seguir enviando, deben pasar a Producción o generar un nuevo Test Set.`);
            } else if (!res.isValid) {
                alert(`Nota Rechazada o con Errores: ${res.statusCode} - ${res.statusDescription}`);
            } else {
                alert(`Estado: ${res.statusCode} - ${res.statusDescription}`);
            }
            fetchOrder();
        } catch (err: any) {
            alert(`Error sincronizando estado: ${err?.message || 'Error desconocido'}`);
        } finally {
            setIsDianGenerating(false);
        }
    };

    const handleRetryInvoice = async () => {
        if (!order) return;
        if (!window.confirm('¿Estás seguro de que deseas generar un NUEVO consecutivo y reintentar el envío a la DIAN para este pedido?')) return;
        
        setIsDianGenerating(true);
        try {
            const res = await dianApi.retryInvoice(order.id, {
                date: new Date().toISOString().split('T')[0],
                time: '12:00:00-05:00',
            });
            if (res.success) {
                alert('¡Factura Reintentada Exitosamente!');
                fetchOrder();
            } else {
                alert(`Error al reintentar: ${res.error || 'Desconocido'}`);
            }
        } catch (error: any) {
            console.error('Error reintentando factura DIAN:', error);
            alert(`Error interno: ${error.message || 'Error en comunicación con DIAN'}`);
        } finally {
            setIsDianGenerating(false);
        }
    };

    const handleCheckInvoiceStatus = async () => {
        if (!order || !order.dianEInvoicing || !order.dianEInvoicing.dian_response) return;
        const zipKeyMatch = order.dianEInvoicing.dian_response.match(/<b:ZipKey>(.*?)<\/b:ZipKey>/);
        if (!zipKeyMatch) {
            alert('No se encontró ZipKey válido para esta factura, no se puede consultar estado.');
            return;
        }
        setIsDianGenerating(true);
        try {
            const res = await dianApi.checkInvoiceStatus(zipKeyMatch[1]);
            if (res.isValid === 'true' && res.statusCode === '00') {
                alert('¡Éxito! La Factura ha sido Autorizada por la DIAN.');
            } else if (res.isValid === 'false' && res.statusCode === '2') {
                alert(`¡SET DE PRUEBAS FINALIZADO!\nLa DIAN indica: "${res.statusDescription}"`);
            } else if (res.isValid === 'false') {
                alert(`Factura Rechazada o con Errores: ${res.statusCode} - ${res.statusDescription}`);
            } else {
                alert(`Estado DIAN: ${res.statusCode} - ${res.statusDescription}`);
            }
            fetchOrder();
        } catch (err: any) {
            alert(`Error sincronizando estado: ${err?.message || 'Error desconocido'}`);
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

                {/* Gestión DIAN */}
                <div className="detail-card full-width">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2em' }}>💼</span> Gestión DIAN
                    </h3>

                    {order.dianEInvoicing ? (
                        <>
                            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                                    <div>
                                        <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#64748b' }}>FACTURA ELECTRÓNICA</p>
                                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{order.dianEInvoicing.document_number}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#64748b' }}>ESTADO</p>
                                        <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                                            {order.dianEInvoicing.status}
                                        </span>
                                    </div>
                                    <div style={{ wordBreak: 'break-all', gridColumn: '1 / -1' }}>
                                        <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#64748b' }}>CUFE</p>
                                        <p style={{ margin: 0, fontSize: '11px', fontFamily: 'monospace' }}>{order.dianEInvoicing.cufe_code || 'No asignado'}</p>
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
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#475569' }}>Historial de Intentos de Envío</h4>
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
                                                            background: inv.status === 'AUTHORIZED' ? '#dcfce7' : (inv.status === 'REJECTED' || inv.status === 'ERROR' ? '#fee2e2' : '#f1f5f9'),
                                                            color: inv.status === 'AUTHORIZED' ? '#166534' : (inv.status === 'REJECTED' || inv.status === 'ERROR' ? '#991b1b' : '#334155')
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
                                                                        alert(`Estado Histórico (${inv.document_number}):\n${res.statusCode} - ${res.statusDescription}`);
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
                                <div style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '15px', borderRadius: '6px', marginBottom: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                    <h4 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                        Generar Nota {noteType === 'CREDIT' ? 'Crédito' : 'Débito'} para {order.dianEInvoicing.document_number}
                                    </h4>
                                    <form onSubmit={handleCreateNote}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '15px' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>Motivo DIAN:</label>
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
                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>Descripción Justificativa:</label>
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
                                                        {note.status === 'PENDING' && <span style={{color: '#64748b'}}>Pendiente</span>}
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
                        <div style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
                            <p style={{ color: '#64748b', marginBottom: '15px' }}>Este pedido aún no cuenta con Factura Electrónica emitida en la DIAN.</p>
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
