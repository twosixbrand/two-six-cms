import React, { useState } from 'react';
import { FiBook, FiShoppingCart, FiServer, FiActivity, FiLayers, FiPackage, FiBox, FiCheckCircle, FiAlertCircle, FiImage, FiTrendingUp, FiGift, FiDroplet, FiPenTool, FiUploadCloud, FiSearch, FiSave, FiCheck } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import './UserManualPage.css';

const UserManualPage = () => {
    const [activeSection, setActiveTab] = useState('introduccion');

    const sections = [
        { id: 'introduccion', title: 'Introducción', icon: <FiBook /> },
        { id: 'gestion-ventas', title: 'Gestion Ventas', icon: <FiShoppingCart /> },
        { id: 'admin-prendas', title: 'Admin Prendas', icon: <FiServer /> },
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
                            <h2 className="section-title">Bienvenido al Ecosistema Two Six</h2>
                            <p className="intro-text">
                                Como parte del equipo administrativo, tu rol es fundamental para garantizar que la promesa de valor de <strong>Two Six</strong> se cumpla en cada transacción. 
                                Este manual ha sido diseñado para empoderarte con el conocimiento técnico necesario para gestionar la operación diaria con precisión y excelencia.
                            </p>
                            <div className="callout-info">
                                <FiCheckCircle className="callout-icon" />
                                <div>
                                    <strong>Excelencia Operativa:</strong> Cada registro que gestionas alimenta en tiempo real nuestra contabilidad, inventario y la experiencia del cliente final.
                                </div>
                            </div>
                        </section>
                    )}

                    {activeSection === 'gestion-ventas' && (
                        <section className="manual-section fade-in">
                            <h2 className="section-title">Capítulo 1: Gestión Estratégica de Ventas</h2>
                            <p>Este capítulo detalla el ciclo de vida de los ingresos, desde la supervisión de pedidos hasta la legalización tributaria.</p>

                            <h3 className="subsection-title"><FiPackage /> 1.1 Control Maestro de Pedidos</h3>
                            <p>El módulo de <strong>Pedidos</strong> es el corazón de la operación comercial. Aquí supervisarás el cumplimiento de las órdenes generadas en la plataforma.</p>
                            
                            <div className="feature-card">
                                <h4>Guía de Operación:</h4>
                                <ol className="manual-steps">
                                    <li><strong>Localización:</strong> Utiliza la barra de búsqueda para filtrar por referencia de pedido o nombre del cliente. Es vital identificar rápidamente las órdenes con estados críticos como <em>Pendiente</em> o <em>Error de Pago</em>.</li>
                                    <li><strong>Validación de Pago:</strong> Para pedidos vía transferencia, deberás verificar el ingreso en bancos y actualizar el estado a <strong>Pagado</strong>. Este paso dispara automáticamente el asiento contable de ingreso.</li>
                                    <li><strong>Logística de Envío:</strong> En pedidos pagados, accede al detalle para generar la guía de transporte. Una vez generada, el sistema descontará físicamente las unidades del inventario global.</li>
                                </ol>
                            </div>

                            <h3 className="subsection-title"><FiActivity /> 1.2 Facturación Electrónica DIAN</h3>
                            <p>Two Six cumple con los más altos estándares legales. La gestión de facturación asegura la transparencia fiscal de la marca.</p>
                            <div className="feature-card">
                                <ul>
                                    <li><strong>Emisión Automática:</strong> Al marcar un pedido como pagado, el sistema habilita la opción de generar la Factura Electrónica.</li>
                                    <li><strong>Monitoreo de Autorización:</strong> Verifica que el estado cambie a <em>AUTHORIZED</em>. Si aparece como <em>REJECTED</em>, el sistema te permitirá visualizar el error técnico (reglas de la DIAN) para corregir los datos del cliente y reintentar.</li>
                                    <li><strong>Notas Crédito:</strong> Ante devoluciones, es <strong>obligatorio</strong> generar una Nota Crédito para anular el impacto contable del IVA y el ingreso original.</li>
                                </ul>
                            </div>

                            <h3 className="subsection-title"><FiTrendingUp /> 1.3 Analítica de Negocio (General Sales)</h3>
                            <p>Como administrador, tienes acceso a la visión macro del negocio. Usa esta herramienta para reportar el rendimiento a gerencia.</p>
                            <div className="feature-card">
                                <p>Monitorea diariamente los <strong>KPIs de Ingresos</strong> y el <strong>Top de Productos</strong>. Esta información es crucial para decidir qué productos requieren reposición inmediata o cuáles deben entrar en promoción.</p>
                            </div>

                            <h3 className="subsection-title"><FiGift /> 1.4 Dashboard de Retiros en Tienda (Pickup)</h3>
                            <p>La modalidad Pickup requiere una logística ágil. Este tablero es tu herramienta para gestionar entregas físicas.</p>
                            <div className="process-flow">
                                <span>1. Recibir Pedido</span> &rarr; <span>2. Alistar (Empaque)</span> &rarr; <span>3. Notificar Listo</span> &rarr; <span>4. Entrega con PIN</span>
                            </div>
                            <p className="tip-text"><strong>Tip de Seguridad:</strong> Nunca entregues un pedido sin validar el PIN único que el cliente recibió en su correo. Esto blinda la operación contra fraudes.</p>
                        </section>
                    )}

                    {activeSection === 'admin-prendas' && (
                        <section className="manual-section fade-in">
                            <h2 className="section-title">Capítulo 2: Administración del Ciclo de Producto</h2>
                            <p>En esta sección aprenderás a crear nuevos activos en el sistema y gestionar la carga de imágenes a la nube de DigitalOcean.</p>

                            <h3 className="subsection-title"><FiPenTool /> 2.1 Creación de Registro de Diseño (Master Design)</h3>
                            <p>Antes de vender, debemos definir la estructura del producto. Sigue estos pasos para un registro exitoso:</p>
                            
                            <div className="feature-card">
                                <h4>Paso a Paso para un Nuevo Diseño:</h4>
                                <ol className="manual-steps">
                                    <li><strong>Selección de Prenda:</strong> Vincula el diseño a una categoría base (ej. Hoodie).</li>
                                    <li><strong>Ingreso de Costos:</strong> Campo <strong>Manufactured Cost</strong>. Es el campo más importante para la salud financiera del negocio. Debe incluir el costo real de tela y confección.</li>
                                    <li><strong>Carga de Activo Digital (DigitalOcean):</strong> 
                                        <ul>
                                            <li>En la sección "Imagen Representativa", selecciona el archivo de alta resolución.</li>
                                            <li>Al hacer clic en <strong>Crear</strong>, el sistema procesa la imagen y la aloja en nuestro Object Storage de DigitalOcean de forma segura.</li>
                                        </ul>
                                    </li>
                                </ol>
                            </div>

                            <h3 className="subsection-title"><FiImage /> 2.2 Studio Media Center: Gestión de Galería</h3>
                            <p>Una vez creado el diseño y asignado su color (en <em>Clothing Color</em>), entra al Studio para cargar la galería completa.</p>
                            
                            <div className="feature-card">
                                <h4>Carga de Imágenes a la Nube:</h4>
                                <ol className="manual-steps">
                                    <li><strong>Interfaz Drag & Drop:</strong> Arrastra las fotos del producto desde tu carpeta local al área de carga.</li>
                                    <li><strong>Procesamiento en la Nube:</strong> El sistema sube automáticamente los archivos a DigitalOcean. No cierres la pestaña hasta que el contador llegue al 100%.</li>
                                    <li><strong>Orden Estratégico:</strong> La imagen en la <strong>Posición 01</strong> será la portada en la tienda online. Arrastra las tarjetas para reordenarlas según la estética de la marca.</li>
                                </ol>
                            </div>

                            <div className="callout-warning">
                                <FiAlertCircle className="callout-icon" />
                                <div>
                                    <strong>Calidad Visual:</strong> Asegúrate de que las imágenes no superen los 2MB para mantener la velocidad de carga de la web, pero mantengan la nitidez que representa a Two Six.
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
