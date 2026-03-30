import React, { useState, useEffect } from 'react';
import { FiFileText, FiRefreshCcw, FiSend, FiDownload, FiEye, FiSearch } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Button, StatusBadge, LoadingSpinner, Modal, ConfirmDialog } from '../components/ui';
import * as dianApi from '../services/dianApi';
import { logError } from '../services/errorApi';

const DianInvoicePage = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusModal, setStatusModal] = useState<any>(null);
    const [statusLoading, setStatusLoading] = useState(false);
    const [downloadingPdfId, setDownloadingPdfId] = useState<number | null>(null);
    const [confirmTestInvoice, setConfirmTestInvoice] = useState(false);

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
            await dianApi.createDianInvoice({});
            alert("Factura generada y enviada al Motor DIAN con éxito.");
            fetchInvoices();
        } catch (err: any) {
            alert('Error generando factura: ' + (err.error || err.message || err));
        } finally {
            setConfirmTestInvoice(false);
        }
    };

    const handleCheckStatus = async (inv: any) => {
        try {
            setStatusLoading(true);

            if (inv.status === 'AUTHORIZED') {
                setStatusModal({
                    documentNumber: inv.document_number,
                    statusCode: '00',
                    statusDescription: 'Documento validado y autorizado por la DIAN.',
                    isValid: 'true',
                    validationMessages: [],
                });
                setStatusLoading(false);
                return;
            }
            if (inv.status === 'REJECTED') {
                setStatusModal({
                    documentNumber: inv.document_number,
                    statusCode: 'REJECTED',
                    statusDescription: 'Documento rechazado por la DIAN.',
                    isValid: 'false',
                    validationMessages: [],
                });
                setStatusLoading(false);
                return;
            }

            const zipKeyMatch = inv.dian_response?.match(/<b:ZipKey>(.*?)<\/b:ZipKey>/);
            if (!zipKeyMatch) throw new Error('No se encontró ZipKey. El estado actual es: ' + inv.status);
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

    const columns = [
        {
            key: 'document_number',
            header: 'Factura #',
            render: (val: any) => <strong>{val}</strong>,
        },
        {
            key: 'issue_date',
            header: 'Fecha Emisión',
            render: (val: any) => new Date(val).toLocaleDateString(),
        },
        {
            key: 'cufe_code',
            header: 'CUFE',
            render: (val: any) => (
                <span title={val} style={{ fontSize: '11px' }}>
                    {val?.substring(0, 20) || 'N/A'}...
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Estado',
            render: (val: any) => {
                const variant = (val === 'OK' || val === 'SENT' || val === 'AUTHORIZED') ? 'success' :
                    val === 'REJECTED' ? 'error' : 'warning';
                return <StatusBadge status={val} variant={variant} size="sm" />;
            },
        },
        {
            key: 'environment',
            header: 'Ambiente',
            render: (val: any) => <span style={{ fontSize: '11px' }}>{val}</span>,
        },
        {
            key: 'order',
            header: 'Pedido',
            render: (_val: any, row: any) => row.order?.order_reference || 'API',
        },
    ];

    return (
        <div className="page-container">
            <PageHeader title="Facturación DIAN - Historial" icon={<FiFileText />} />

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                <Button variant="primary" icon={<FiRefreshCcw />} onClick={fetchInvoices}>
                    Actualizar
                </Button>
                <Button variant="secondary" icon={<FiSend />} onClick={() => setConfirmTestInvoice(true)}>
                    Generar Factura de Prueba
                </Button>
            </div>

            {error && <p className="error-message">{error}</p>}

            <DataTable
                columns={columns}
                data={invoices}
                loading={loading}
                emptyMessage="No hay facturas emitidas"
                actions={(inv: any) => (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={<FiSearch />}
                            onClick={() => handleCheckStatus(inv)}
                        >
                            Estado
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={<FiDownload />}
                            onClick={() => dianApi.downloadInvoiceXml(inv.id, inv.document_number)}
                        >
                            XML
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={downloadingPdfId === inv.id ? <FiRefreshCcw /> : <FiEye />}
                            loading={downloadingPdfId === inv.id}
                            onClick={async () => {
                                try {
                                    setDownloadingPdfId(inv.id);
                                    await dianApi.downloadInvoicePdf(inv.id, inv.document_number);
                                } finally {
                                    setDownloadingPdfId(null);
                                }
                            }}
                        >
                            PDF
                        </Button>
                    </>
                )}
            />

            {/* Status Modal */}
            <Modal
                isOpen={statusLoading || !!statusModal}
                onClose={() => { if (!statusLoading) setStatusModal(null); }}
                title={statusModal ? `Estado DIAN - ${statusModal.documentNumber}` : 'Consultando estado...'}
                size="md"
            >
                {statusLoading ? (
                    <LoadingSpinner text="Consultando estado en la DIAN..." />
                ) : statusModal && (
                    <>
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
            </Modal>

            {/* Confirm Test Invoice Dialog */}
            <ConfirmDialog
                isOpen={confirmTestInvoice}
                onConfirm={handleTestInvoice}
                onCancel={() => setConfirmTestInvoice(false)}
                title="Factura de Prueba"
                message="¿Seguro que deseas enviar una factura de prueba a la DIAN?"
                confirmText="Sí, enviar"
                cancelText="Cancelar"
                variant="warning"
            />
        </div>
    );
};

export default DianInvoicePage;
