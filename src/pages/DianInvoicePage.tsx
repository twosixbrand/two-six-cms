import React, { useState, useEffect } from 'react';
import { FiFileText, FiRefreshCcw, FiSend } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import * as dianApi from '../services/dianApi';
import { logError } from '../services/errorApi';

const DianInvoicePage = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
            if (window.confirm("¿Seguro que deseas simular el envío de una factura de Prueba a la DIAN?")) {
              const randomNum = Math.floor(Math.random() * 5000000) + 990000000;
              await dianApi.createDianInvoice({ number: `SETP${randomNum}` });
                alert("Factura generada y enviada al Motor DIAN con éxito.");
                fetchInvoices();
            }
        } catch (err) {
            alert('Error generando factura: ' + (err.error || err.message || err));
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
                    <FiSend /> Generar Factura de Prueba API
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
                                <th>Nro. Documento</th>
                                <th>Fecha Emisión</th>
                                <th>CUFE</th>
                                <th>Estado</th>
                                <th>Pedido Relacionado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length === 0 ? (
                                <tr><td colSpan={6} style={{textAlign: 'center'}}>No hay facturas emitidas</td></tr>
                            ) : invoices.map((inv: any) => (
                                <tr key={inv.id}>
                                    <td>{inv.document_number}</td>
                                    <td>{inv.document_number}</td>
                                    <td>{new Date(inv.issue_date).toLocaleDateString()}</td>
                                    <td><span title={inv.cufe_code}>{inv.cufe_code?.substring(0, 15) || 'N/A'}...</span></td>
                                    <td><span className={`status-badge ${inv.status === 'OK' ? 'status-active' : 'status-pending'}`}>{inv.status}</span></td>
                                    <td>{inv.order?.order_reference || 'MANUAL API'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DianInvoicePage;
