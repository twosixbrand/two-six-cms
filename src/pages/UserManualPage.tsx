import React, { useState } from 'react';
import { FiBook, FiShoppingCart, FiServer, FiActivity, FiLayers, FiPackage, FiBox, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import './UserManualPage.css';

const UserManualPage = () => {
    const [activeSection, setActiveTab] = useState('introduccion');

    const sections = [
        { id: 'introduccion', title: 'Introducción', icon: <FiBook /> },
        { id: 'gestion-ventas', title: 'Gestión y Ventas', icon: <FiShoppingCart /> },
        { id: 'admin-prendas', title: 'Administración de Prendas', icon: <FiServer /> },
    ];

    return (
        <div className="manual-container">
            <PageHeader title="Manual de Usuario CMS" icon={<FiBook />} />

            <div className="manual-layout">
                {/* Sidebar Navigation */}
                <aside className="manual-sidebar">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            className={`manual-nav-item ${activeSection === section.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(section.id)}
                        >
                            {section.icon}
                            <span>{section.title}</span>
                        </button>
                    ))}
                </aside>

                {/* Content Area */}
                <main className="manual-content">
                    {activeSection === 'introduccion' && (
                        <section className="manual-section fade-in">
                            <h2 className="section-title">Bienvenido al CMS de Two Six</h2>
                            <p>
                                Este manual tiene como objetivo guiar a los administradores y operarios en el uso correcto de la plataforma. 
                                El sistema integra la gestión comercial, logística y contable de la marca en un solo ecosistema blindado.
                            </p>
                            <div className="callout-info">
                                <FiCheckCircle className="callout-icon" />
                                <div>
                                    <strong>Integración Total:</strong> Cada acción realizada en este CMS tiene un impacto en tiempo real en la tienda web y en los libros contables.
                                </div>
                            </div>
                        </section>
                    )}

                    {activeSection === 'gestion-ventas' && (
                        <section className="manual-section fade-in">
                            <h2 className="section-title">Módulo de Gestión y Ventas</h2>
                            <p>Este módulo centraliza el flujo de ingresos de la marca, desde que un cliente realiza un pedido hasta que se legaliza ante la DIAN.</p>

                            <h3 className="subsection-title"><FiPackage /> 1. Gestión de Pedidos</h3>
                            <p>Ubicación: <code>Gestion Ventas &gt; Pedidos</code></p>
                            <div className="feature-card">
                                <h4>Flujo de Trabajo y Estados</h4>
                                <ul>
                                    <li><strong>Pendiente:</strong> Pedido registrado. Si es Wompi, espera el webhook de confirmación. Si es Transferencia, requiere validación manual.</li>
                                    <li><strong>Pagado:</strong> El recaudo está confirmado. 
                                        <span className="batch-process">Trigger Contable: Genera asiento automático de ingreso (4135) y comisión de pasarela (5295).</span>
                                    </li>
                                    <li><strong>Enviado:</strong> El pedido tiene guía de transportadora asignada.
                                        <span className="batch-process">Trigger Inventario: Se registra la salida física del stock.</span>
                                    </li>
                                    <li><strong>Entregado:</strong> El ciclo de venta finaliza satisfactoriamente.</li>
                                </ul>
                            </div>

                            <h3 className="subsection-title"><FiActivity /> 2. Facturación Electrónica (DIAN)</h3>
                            <p>Ubicación: <code>Gestion Ventas &gt; Facturación DIAN</code></p>
                            <p>Interfaz para el control de la emisión legal de facturas.</p>
                            <ul>
                                <li><strong>Validación Previa:</strong> El sistema verifica que el cliente tenga NIT/Cédula y correo válido antes de intentar el envío.</li>
                                <li><strong>Notas Crédito:</strong> Deben generarse ante devoluciones físicas para anular el impacto contable del ingreso y el IVA.</li>
                                <li><strong>Sincronización:</strong> Proceso batch que consulta cada hora el estado de facturas "Enviadas" para confirmar su autorización (CUFE).</li>
                            </ul>

                            <h3 className="subsection-title"><FiShoppingCart /> 3. Reporte de Ventas General</h3>
                            <p>Ubicación: <code>Gestion Ventas &gt; General Sales</code></p>
                            <p>Vista analítica para gerencia que consolida las ventas brutas, devoluciones y descuentos aplicados por periodo.</p>

                            <h3 className="subsection-title"><FiLayers /> 4. Retiros en Tienda (Pickup)</h3>
                            <p>Ubicación: <code>Gestion Ventas &gt; Retiros en Tienda</code></p>
                            <p>Dashboard especializado para el control de la logística inversa y entregas físicas en punto.</p>
                            <div className="process-flow">
                                <span>Alistar Pedido</span> &rarr; <span>Notificar Cliente</span> &rarr; <span>Entregar con PIN</span>
                            </div>
                        </section>
                    )}

                    {activeSection === 'admin-prendas' && (
                        <section className="manual-section fade-in">
                            <h2 className="section-title">Módulo de Administración de Prendas</h2>
                            <p>Configuración del catálogo maestro y control de costos de producción.</p>

                            <h3 className="subsection-title"><FiServer /> 1. Jerarquía de Producto</h3>
                            <p>Es vital seguir el orden lógico para asegurar la integridad de los datos:</p>
                            <ol className="manual-steps">
                                <li><strong>Prendas (Clothing):</strong> El concepto base (ej: "Buzo Hoodie"). Aquí se define el género y la categoría.</li>
                                <li><strong>Diseños (Master Design):</strong> La versión específica de la prenda. 
                                    <span className="batch-process">Importante: Aquí se define el COSTO DE MANUFACTURA, base para el cálculo de rentabilidad real de la marca.</span>
                                </li>
                                <li><strong>Colores (Clothing Color):</strong> Se asignan los colores disponibles al diseño y se carga la galería de imágenes.</li>
                                <li><strong>Variantes (Clothing Size):</strong> Se crean las combinaciones de Talla/Color que tendrán stock físico.</li>
                                <li><strong>Productos (Product):</strong> Es el ítem final que ve el cliente. Se le asigna el <strong>Precio de Venta</strong> y el estado <strong>Outlet</strong>.</li>
                            </ol>

                            <h3 className="subsection-title"><FiBox /> 2. Gestión de Stock</h3>
                            <p>Ubicación: <code>Admin Prendas &gt; Stock</code></p>
                            <div className="feature-card">
                                <h4>Métricas de Inventario</h4>
                                <ul>
                                    <li><strong>Producidos:</strong> Cantidad total histórica fabricada.</li>
                                    <li><strong>Disponibles:</strong> Cantidad neta para venta. El sistema bloquea compras si este valor llega a 0.</li>
                                    <li><strong>Mínimo de Alerta:</strong> Configuración por talla para recibir avisos de reposición.</li>
                                </ul>
                            </div>

                            <div className="callout-warning">
                                <FiAlertCircle className="callout-icon" />
                                <div>
                                    <strong>Impacto Contable:</strong> Cualquier ajuste manual en el stock (Ajustes de Inventario) dispara un asiento automático de Gasto (Merma) o Costo, manteniendo el balance de activos (1435) actualizado.
                                </div>
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
};

export default UserManualPage;
