import React, { useState, useEffect } from 'react';
import { FiFileText, FiRefreshCcw, FiSend, FiDownload, FiEye, FiSearch, FiX } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import * as dianApi from '../services/dianApi';
import { logError } from '../services/errorApi';

const DianInvoicePage = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusModal, setStatusModal] = useState<any>(null);
    const [statusLoading, setStatusLoading] = useState(false);
    const [downloadingPdfId, setDownloadingPdfId] = useState<number | null>(null);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const data = await dianApi.getDianInvoices();
            setInvoices(data);
        } catch (err) {
            logError(err, '/dian-invoices');
            setError('Error al cargar historial DIAN.');
        } finally {
            setLoading(false);
        }
    };

    const handleTestInvoice = async () => {
        try {
            if (window.confirm("¿Seguro que deseas enviar una factura de prueba a la DIAN?")) {
                await dianApi.createDianInvoice({});
                alert("Factura generada y enviada al Motor DIAN con éxito.");
                fetchInvoices();
            }
        } catch (err: any) {
            alert('Error generando factura: ' + (err.error || err.message || err));
        }
    };

    const handleCheckStatus = async (inv: any) => {
        try {
            setStatusLoading(true);
            const zipKeyMatch = inv.dian_response?.match(/<b:ZipKey>(.*?)<\/b:ZipKey>/);
            if (!zipKeyMatch) throw new Error('No se encontró ZipKey en la respuesta DIAN');
            const result = await dianApi.checkInvoiceStatus(zipKeyMatch[1]);
            setStatusModal({ ...result, documentNumber: inv.document_number });
        } catch (err: any) {
            setStatusModal({
                documentNumber: inv.document_number,
                statusCode: 'ERROR',
                statusDescription: err.message || 'No se pudo consultar el estado',
                isValid: 'false',
                validationMessages: [],
            });
        } finally {
            setStatusLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    return (
        <div className="page-container">
            <PageHeader title="Facturación DIAN - Historial" icon={<FiFileText />} />

            <div style={{ marginBottom: '15px' }}>
                <button onClick={fetchInvoices} className="btn btn-primary" style={{ marginRight: '10px' }}>
                    <FiRefreshCcw /> Actualizar
                </button>
                <button onClick={handleTestInvoice} className="btn btn-secondary">
                    <FiSend /> Generar Factura de Prueba
                </button>
            </div>

            {error && <p className="error-message">{error}</p>}

            {loading ? (
                <p>Cargando facturas desde el motor DIAN...</p>
            ) : (
                <div className="list-card full-width">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Factura #</th>
                                <th>Fecha Emisión</th>
                                <th>CUFE</th>
                                <th>Estado</th>
                                <th>Ambiente</th>
                                <th>Pedido</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length === 0 ? (
                                <tr><td colSpan={7} style={{textAlign: 'center'}}>No hay facturas emitidas</td></tr>
                            ) : invoices.map((inv: any) => (
                                <tr key={inv.id}>
                                    <td><strong>{inv.document_number}</strong></td>
                                    <td>{new Date(inv.issue_date).toLocaleDateString()}</td>
                                    <td><span title={inv.cufe_code} style={{fontSize: '11px'}}>{inv.cufe_code?.substring(0, 20) || 'N/A'}...</span></td>
                                    <td>
                                        <span className={`status-badge ${inv.status === 'OK' || inv.status === 'SENT' ? 'status-active' : 'status-pending'}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td><span style={{fontSize: '11px'}}>{inv.environment}</span></td>
                                    <td>{inv.order?.order_reference || 'API'}</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>
                                        <button
                                            className="btn btn-sm"
                                            title="Consultar estado DIAN"
                                            onClick={() => handleCheckStatus(inv)}
                                            style={{ marginRight: '4px', padding: '4px 8px', fontSize: '12px' }}
                                        >
                                            <FiSearch /> Estado
                                        </button>
                                        <button
                                            className="btn btn-sm"
                                            title="Descargar XML"
                                            onClick={() => dianApi.downloadInvoiceXml(inv.id, inv.document_number)}
                                            style={{ marginRight: '4px', padding: '4px 8px', fontSize: '12px' }}
                                        >
                                            <FiDownload /> XML
                                        </button>
                                        <button
                                            className="btn btn-sm"
                                            title="Ver PDF"
                                            onClick={async () => {
                                                try {
                                                    setDownloadingPdfId(inv.id);
                                                    await dianApi.downloadInvoicePdf(inv.id, inv.document_number);
                                                } finally {
                                                    setDownloadingPdfId(null);
                                                }
                                            }}
                                            disabled={downloadingPdfId === inv.id}
                                            style={{ padding: '4px 8px', fontSize: '12px' }}
                                        >
                                            {downloadingPdfId === inv.id ? <><FiRefreshCcw className="spinner" /> PDF...</> : <><FiEye /> PDF</>}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Estado DIAN */}
            {(statusModal || statusLoading) && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: '#fff', borderRadius: '8px', padding: '24px', maxWidth: '600px', width: '90%',
                        maxHeight: '80vh', overflow: 'auto', position: 'relative'
                    }}>
                        {statusLoading ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <p>Consultando estado en la DIAN...</p>
                            </div>
                        ) : statusModal && (
                            <>
                                <button
                                    onClick={() => setStatusModal(null)}
                                    style={{
                                        position: 'absolute', top: '12px', right: '12px',
                                        background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px'
                                    }}
                                >
                                    <FiX />
                                </button>

                                <h3 style={{ marginTop: 0 }}>Estado DIAN - {statusModal.documentNumber}</h3>

                                <div style={{
                                    padding: '12px', borderRadius: '6px', marginBottom: '16px',
                                    background: statusModal.isValid === 'true' ? '#e8f5e9' : '#fff3e0',
                                    borderLeft: `4px solid ${statusModal.isValid === 'true' ? '#4caf50' : '#ff9800'}`
                                }}>
                                    <p style={{ margin: '4px 0' }}>
                                        <strong>Válido:</strong>{' '}
                                        <span style={{ color: statusModal.isValid === 'true' ? '#2e7d32' : '#e65100' }}>
                                            {statusModal.isValid === 'true' ? 'Sí' : 'No / En proceso'}
                                        </span>
                                    </p>
                                    <p style={{ margin: '4px 0' }}><strong>Código:</strong> {statusModal.statusCode}</p>
                                    <p style={{ margin: '4px 0' }}><strong>Descripción:</strong> {statusModal.statusDescription}</p>
                                </div>

                                {statusModal.validationMessages && statusModal.validationMessages.length > 0 && (
                                    <div>
                                        <h4>Mensajes de validación:</h4>
                                        <ul style={{ paddingLeft: '20px', fontSize: '13px' }}>
                                            {statusModal.validationMessages.map((msg: string, i: number) => (
                                                <li key={i} style={{
                                                    marginBottom: '6px', padding: '6px', background: '#f5f5f5', borderRadius: '4px',
                                                    listStyle: 'none', borderLeft: '3px solid #ff9800'
                                                }}>
                                                    {msg}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {statusModal.statusDescription?.includes('proceso') && (
                                    <p style={{ fontSize: '12px', color: '#888', marginTop: '16px' }}>
                                        La DIAN puede tardar varios minutos en procesar documentos en el ambiente de habilitación.
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DianInvoicePage;
