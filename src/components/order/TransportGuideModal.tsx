import React from 'react';
import { FiPrinter } from 'react-icons/fi';
import logoImg from '../../assets/logo.png';
import './TransportGuideModal.css';

const TransportGuideModal = ({ order, onClose }) => {
    if (!order) return null;

    const totalItems = order.orderItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;
    const guideNumber = `TS-${String(order.id).padStart(6, '0')}`;
    const today = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const handlePrint = () => {
        const guideEl = document.getElementById('transport-guide-print');
        if (!guideEl) return;

        const printWindow = window.open('', '_blank', 'width=600,height=800');
        if (!printWindow) {
            alert('Por favor permite las ventanas emergentes para imprimir la guía.');
            return;
        }

        // Clone all stylesheets from the parent document
        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map(el => el.outerHTML)
            .join('\n');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Guia_${guideNumber}</title>
                ${styles}
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        background: #fff;
                        font-family: 'Segoe UI', 'Arial', sans-serif;
                    }
                    .tg-guide {
                        max-width: 400px;
                        margin: 0 auto;
                    }
                    @media print {
                        @page {
                            size: 5.5in 8.5in;
                            margin: 4mm;
                        }
                    }
                </style>
            </head>
            <body>
                ${guideEl.outerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();

        // Wait for images to load before printing
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };

    return (
        <div className="tg-overlay" onClick={onClose}>
            <div className="tg-modal" onClick={(e) => e.stopPropagation()}>

                {/* Modal Header (hidden on print) */}
                <div className="tg-modal-header">
                    <h3>Guía de Transporte — Pedido #{order.id}</h3>
                    <button className="tg-close-btn" onClick={onClose}>&times;</button>
                </div>

                {/* ===== PRINTABLE GUIDE ===== */}
                <div className="tg-guide" id="transport-guide-print">

                    {/* Brand Header */}
                    <div className="tg-brand-header">
                        <div className="tg-brand-left">
                            <img src={logoImg} alt="Two Six" className="tg-brand-logo" />
                            <div>
                                <div className="tg-brand-name">TWO SIX</div>
                                <div className="tg-brand-tagline">Crafted for real ones</div>
                            </div>
                        </div>
                        <div className="tg-brand-right">
                            <div className="tg-carrier-name">SERVIENTREGA</div>
                            <div className="tg-guide-date">{today}</div>
                        </div>
                    </div>

                    {/* Order ID Banner */}
                    <div className="tg-order-banner">
                        PEDIDO #{String(order.id).padStart(6, '0')}
                    </div>

                    <div className="tg-sections">

                        {/* Remitente */}
                        <div className="tg-section">
                            <div className="tg-section-title">Remitente</div>
                            <div className="tg-section-body">
                                <div className="tg-row">
                                    <span className="tg-label">Nombre:</span>
                                    <span className="tg-value">TWO SIX S.A.S</span>
                                </div>
                                <div className="tg-row">
                                    <span className="tg-label">Teléfono:</span>
                                    <span className="tg-value">310 877 7629</span>
                                </div>
                                <div className="tg-row">
                                    <span className="tg-label">Ciudad:</span>
                                    <span className="tg-value">Itagüí, Antioquia</span>
                                </div>
                                <div className="tg-row">
                                    <span className="tg-label">Dirección:</span>
                                    <span className="tg-value address">CR 50 A # 24 - 51</span>
                                </div>
                            </div>
                        </div>

                        {/* Destinatario */}
                        <div className="tg-section">
                            <div className="tg-section-title">Destinatario</div>
                            <div className="tg-section-body">
                                <div className="tg-row">
                                    <span className="tg-label">Nombre:</span>
                                    <span className="tg-value">{order.customer?.name || 'N/A'}</span>
                                </div>
                                <div className="tg-row">
                                    <span className="tg-label">Teléfono:</span>
                                    <span className="tg-value">{order.customer?.current_phone_number || 'N/A'}</span>
                                </div>
                                <div className="tg-row">
                                    <span className="tg-label">Ciudad:</span>
                                    <span className="tg-value">{order.customer?.city || 'N/A'}, {order.customer?.state || ''}</span>
                                </div>
                                <div className="tg-row">
                                    <span className="tg-label">Dirección:</span>
                                    <span className="tg-value address">{order.shipping_address || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Contenido del Envío */}
                        <div className="tg-section">
                            <div className="tg-section-title">Contenido del Envío</div>
                            <div className="tg-section-body" style={{ padding: 0 }}>
                                <table className="tg-items-table">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Talla</th>
                                            <th>Color</th>
                                            <th style={{ textAlign: 'center' }}>Cant.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.orderItems?.map((item, idx) => (
                                            <tr key={item.id || idx}>
                                                <td>{item.product_name}</td>
                                                <td>{item.size}</td>
                                                <td>{item.color}</td>
                                                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="tg-total-row">
                                <span>Total Artículos: {totalItems}</span>
                                <span>Valor Declarado: ${((order.total_payment || 0) - (order.shipping_cost || 0)).toLocaleString()}</span>
                            </div>
                        </div>

                        {order.payment_method === 'WOMPI_COD' && (
                            <div className="tg-section tg-cod-alert">
                                <div className="tg-section-title" style={{ background: '#fef3c7', color: '#b45309', borderBottomColor: '#fde68a' }}>⚠️ RECAUDO CONTRA ENTREGA (PCE)</div>
                                <div className="tg-section-body" style={{ textAlign: 'center', padding: '10px 5px' }}>
                                    <span style={{ fontSize: '0.65rem', color: '#666', display: 'block', marginBottom: '4px' }}>Cobrar al destinatario:</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#b45309' }}>${order.cod_amount?.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Barcode / Guide Number */}
                    <div className="tg-barcode-area">
                        <p>Número de Guía</p>
                        <div className="tg-guide-number">{guideNumber}</div>
                    </div>

                    {/* Footer */}
                    <div className="tg-footer">
                        TWO SIX — DESDE MEDELLÍN PARA EL MUNDO — TWOSIXWEB.COM
                    </div>
                </div>
                {/* ===== END PRINTABLE GUIDE ===== */}

                {/* Actions (hidden on print) */}
                <div className="tg-modal-actions">
                    <button className="tg-print-btn" onClick={handlePrint}>
                        <FiPrinter /> Imprimir Guía
                    </button>
                    <button className="tg-cancel-btn" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default TransportGuideModal;
