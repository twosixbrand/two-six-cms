import React, { useState } from 'react';
import { FiBook, FiShoppingCart, FiServer, FiActivity, FiLayers, FiPackage, FiBox, FiCheckCircle, FiAlertCircle, FiImage, FiTrendingUp, FiGift, FiDroplet, FiPenTool, FiUploadCloud, FiSearch, FiSave, FiCheck, FiGlobe, FiMessageSquare, FiUserCheck, FiClock, FiFileText, FiCalendar, FiArchive, FiAperture, FiGrid, FiMapPin, FiUsers, FiTruck, FiShield, FiLink, FiPaperclip, FiMail, FiRss, FiExternalLink, FiCopy } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import './UserManualPage.css';

const UserManualPage = () => {
    const [activeSection, setActiveTab] = useState('introduccion');

    const sections = [
        { id: 'introduccion', title: 'Introducción', icon: <FiBook /> },
        { id: 'gestion-ventas', title: 'Gestion Ventas', icon: <FiShoppingCart /> },
        { id: 'admin-prendas', title: 'Admin Prendas', icon: <FiServer /> },
        { id: 'atencion-cliente', title: 'Atencion Cliente', icon: <FiUserCheck /> },
        { id: 'admin-maestros', title: 'Admin Maestros', icon: <FiGrid /> },
        { id: 'users-providers', title: 'Users / Providers', icon: <FiUsers /> },
        { id: 'integraciones-apis', title: 'Integraciones-APIs', icon: <FiRss /> },
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

                            <h3 className="subsection-title"><FiPackage /> 1.1 Pedidos</h3>
                            <p>Ubicación: <code>Gestion Ventas &gt; Pedidos</code></p>
                            <div className="feature-card">
                                <h4>Guía de Operación:</h4>
                                <ol className="manual-steps">
                                    <li><strong>Localización:</strong> Utiliza la barra de búsqueda para filtrar por referencia o nombre. Identifica órdenes críticas (Pendientes).</li>
                                    <li><strong>Validación de Pago:</strong> Para transferencias, verifica en bancos y marca como <strong>Pagado</strong>. Esto genera el asiento contable de ingreso.</li>
                                    <li><strong>Logística:</strong> En pedidos pagados, genera la guía de transporte para activar la salida de inventario.</li>
                                </ol>
                            </div>

                            <h3 className="subsection-title"><FiActivity /> 1.2 Facturacion DIAN</h3>
                            <p>Ubicación: <code>Gestion Ventas &gt; Facturacion DIAN</code></p>
                            <div className="feature-card">
                                <ul>
                                    <li><strong>Monitoreo:</strong> Verifica que el estado sea <em>AUTHORIZED</em>. Si hay error, revisa las reglas DIAN para corregir datos.</li>
                                    <li><strong>Notas Crédito:</strong> Genera notas para devoluciones; es vital para anular el impacto contable del IVA.</li>
                                </ul>
                            </div>
                        </section>
                    )}

                    {activeSection === 'admin-prendas' && (
                        <section className="manual-section fade-in">
                            <h2 className="section-title">Capítulo 2: Arquitectura y Administración de Prendas</h2>
                            <p className="intro-text">
                                Bienvenido al corazón operativo de <strong>Two Six</strong>. En este módulo, tienes la responsabilidad de transformar conceptos de moda en activos digitales y físicos con precisión quirúrgica.
                            </p>

                            <h3 className="subsection-title"><FiServer /> 2.1 Clothing (El ADN del Producto)</h3>
                            <p>Ubicación: <code>Admin Prendas &gt; Clothing</code></p>
                            <div className="feature-card">
                                <h4>Proceso de Creación:</h4>
                                <ol className="manual-steps">
                                    <li>Haz clic en <strong>"Crear Prenda"</strong>.</li>
                                    <li><strong>Nombre:</strong> Usa nombres descriptivos (ej: "Camiseta Oversize Premium").</li>
                                    <li><strong>Categorización:</strong> Selecciona el Género, Tipo y Categoría. Una clasificación correcta garantiza que el cliente encuentre el producto mediante filtros en la web.</li>
                                </ol>
                                <p className="importance-note"><strong>Importancia:</strong> Este es el nivel base. Errores aquí se propagan a todos los diseños y productos relacionados.</p>
                            </div>

                            <h3 className="subsection-title"><FiPenTool /> 2.2 Design (Ingeniería y Costos)</h3>
                            <p>Ubicación: <code>Admin Prendas &gt; Design</code></p>
                            <div className="feature-card">
                                <h4>Configuración Maestra:</h4>
                                <ol className="manual-steps">
                                    <li>Vincula el diseño a una <strong>Clothing</strong> base y a una <strong>Colección</strong>.</li>
                                    <li><strong>Manufactured Cost:</strong> Campo crítico. Ingresa el costo real de producción para que el sistema calcule la rentabilidad exacta.</li>
                                    <li><strong>Carga a DigitalOcean (Object Storage):</strong> 
                                        <ul>
                                            <li>En "Imagen Representativa", selecciona el archivo.</li>
                                            <li>Al guardar, el sistema sube el archivo a nuestra infraestructura en la nube, garantizando velocidad de carga global.</li>
                                        </ul>
                                    </li>
                                </ol>
                            </div>

                            <h3 className="subsection-title"><FiDroplet /> 2.3 Clothing Color (Identidad Digital y SEO)</h3>
                            <p>Ubicación: <code>Admin Prendas &gt; Clothing Color</code></p>
                            <div className="feature-card">
                                <h4>Optimización para el Mundo:</h4>
                                <ol className="manual-steps">
                                    <li><strong>Creación Contextual:</strong> Define el color y selecciona las tallas que entrarán en producción en un solo paso.</li>
                                    <li><strong>Slug URL:</strong> Revisa que la dirección web sea limpia (ej: <code>buzo-logo-negro</code>).</li>
                                    <li><strong>Maestría SEO:</strong> 
                                        <ul>
                                            <li><strong>H1/Título:</strong> Define cómo te encuentra Google.</li>
                                            <li><strong>Texto Alt:</strong> Describe la imagen para accesibilidad y algoritmos.</li>
                                        </ul>
                                    </li>
                                </ol>
                            </div>

                            <h3 className="subsection-title"><FiPackage /> 2.4 Product (La Oferta Comercial)</h3>
                            <p>Ubicación: <code>Admin Prendas &gt; Product</code></p>
                            <div className="feature-card">
                                <h4>Activación de Venta:</h4>
                                <ol className="manual-steps">
                                    <li><strong>Precio Base:</strong> Establece el valor comercial.</li>
                                    <li><strong>Gestión de Ofertas:</strong> Aplica porcentajes de descuento que se resaltarán automáticamente en la tienda.</li>
                                    <li><strong>Outlet/Activo:</strong> Controla la visibilidad. Usa "Outlet" para liquidar inventario de temporadas pasadas.</li>
                                </ol>
                                <p className="importance-note"><strong>Importancia:</strong> Un producto sin marcar como "Activo" no será visible para los clientes.</p>
                            </div>

                            <h3 className="subsection-title"><FiBox /> 2.5 Stock (Guardianía de Existencias)</h3>
                            <p>Ubicación: <code>Admin Prendas &gt; Stock</code></p>
                            <div className="feature-card">
                                <h4>Control de Inventario Real:</h4>
                                <ol className="manual-steps">
                                    <li><strong>Cantidades:</strong> Monitorea <em>Producidos</em> vs <em>Disponibles</em>.</li>
                                    <li><strong>Alerta de Mínimos:</strong> Configura umbrales de alerta. El sistema resaltará en rojo cuando el stock sea crítico, indicando que es momento de reposición.</li>
                                    <li><strong>Garantías:</strong> Registra unidades apartadas para asegurar que el balance físico siempre coincida con el digital.</li>
                                </ol>
                            </div>
                        </section>
                    )}

                    {activeSection === 'atencion-cliente' && (
                        <section className="manual-section fade-in">
                            <h2 className="section-title">Capítulo 3: Atención al Cliente y Resolución de Casos</h2>
                            <p className="intro-text">
                                En <strong>Two Six</strong>, la lealtad de nuestros clientes se construye resolviendo sus inquietudes con agilidad y empatía. Este módulo es tu herramienta para convertir una inconformidad en una experiencia positiva.
                            </p>

                            <h3 className="subsection-title"><FiMessageSquare /> 3.1 Gestión de PQRs (Peticiones, Quejas y Reclamos)</h3>
                            <p>Ubicación: <code>Atencion Cliente &gt; Gestion PQR</code></p>
                            
                            <div className="feature-card">
                                <h4>Protocolo de Gestión de Casos:</h4>
                                <ol className="manual-steps">
                                    <li><strong>Monitoreo de Radicados:</strong> Los casos se visualizan en tarjetas codificadas por colores según su estado de cumplimiento (SLA).</li>
                                    <li><strong>Análisis de Evidencia:</strong> Al abrir un caso, revisa las fotos cargadas por el cliente al Object Storage, vitales para validar reclamos de calidad.</li>
                                    <li><strong>Actualización de Gestión:</strong> Usa el campo "Observaciones" para dejar trazabilidad de la solución.</li>
                                </ol>
                            </div>
                        </section>
                    )}

                    {activeSection === 'admin-maestros' && (
                        <section className="manual-section fade-in">
                            <h2 className="section-title">Capítulo 4: Administración de Tablas Maestras (Estructura)</h2>
                            <p className="intro-text">
                                Los "Maestros" son los cimientos sobre los cuales se construye toda la lógica del CMS. Tu precisión aquí garantiza que el catálogo sea coherente y navegable.
                            </p>

                            <h3 className="subsection-title"><FiCalendar /> 4.1 Temporalidad (Year & Season)</h3>
                            <p>Ubicación: <code>Admin Maestros &gt; Year Production / Season</code></p>
                            <div className="feature-card">
                                <p>Define los ciclos de tiempo de la marca. Cada prenda debe pertenecer a un año y una temporada para facilitar reportes históricos.</p>
                            </div>

                            <h3 className="subsection-title"><FiArchive /> 4.2 Colecciones (Collections)</h3>
                            <p>Ubicación: <code>Admin Maestros &gt; Collection</code></p>
                            <div className="feature-card">
                                <p>Agrupa diseños bajo un concepto creativo único.</p>
                            </div>

                            <h3 className="subsection-title"><FiAperture /> 4.3 Gestión Cromática (Colors)</h3>
                            <p>Ubicación: <code>Admin Maestros &gt; Color</code></p>
                            <div className="feature-card">
                                <p>Control de la paleta de colores oficial. Usa el código Hexadecimal para asegurar la coincidencia visual con la tela física.</p>
                            </div>
                        </section>
                    )}

                    {activeSection === 'users-providers' && (
                        <section className="manual-section fade-in">
                            <h2 className="section-title">Capítulo 5: Aliados y Control de Acceso</h2>
                            <p className="intro-text">
                                Este módulo gestiona el capital humano y los aliados estratégicos de <strong>Two Six</strong>. Aquí controlarás quién tiene acceso al sistema y con qué proveedores trabajamos.
                            </p>

                            <h3 className="subsection-title"><FiTruck /> 5.1 Gestión de Proveedores (Providers)</h3>
                            <p>Ubicación: <code>Users / providers &gt; Provider</code></p>
                            <div className="feature-card">
                                <h4>Registro y Legalización de Aliados:</h4>
                                <ol className="manual-steps">
                                    <li><strong>Datos Básicos:</strong> Ingresa el NIT, nombre de la empresa y datos bancarios para el pago de facturas.</li>
                                    <li><strong>Carga de Documentación Legal (DigitalOcean):</strong> Haz clic en el botón <strong>"Docs"</strong>.
                                        <ul>
                                            <li>Es <strong>obligatorio</strong> subir el RUT, Cámara de Comercio y Cédula del Representante Legal.</li>
                                            <li>Los archivos se alojan en nuestro Object Storage de DigitalOcean, permitiendo auditorías rápidas y seguras.</li>
                                        </ul>
                                    </li>
                                </ol>
                                <p className="importance-note"><strong>Importancia:</strong> Un proveedor con registro "Incompleto" no podrá recibir pagos del departamento de contabilidad.</p>
                            </div>

                            <h3 className="subsection-title"><FiUserCheck /> 5.2 CRM de Clientes (Customer)</h3>
                            <p>Ubicación: <code>Users / providers &gt; Clientes</code></p>
                            <div className="feature-card">
                                <p>Administra la base de datos de nuestros compradores. Aunque la mayoría se registra automáticamente en la tienda web, puedes actualizar datos de envío o contacto para corregir problemas de entrega.</p>
                            </div>

                            <h3 className="subsection-title"><FiMail /> 5.3 Suscriptores y Newsletter (Subscriber)</h3>
                            <p>Ubicación: <code>Users / providers &gt; Suscriber</code></p>
                            <div className="feature-card">
                                <h4>Gestión de Audiencias:</h4>
                                <ol className="manual-steps">
                                    <li><strong>Monitoreo de Registro:</strong> Visualiza la lista de correos que se han suscrito para recibir novedades.</li>
                                    <li><strong>Códigos de Descuento:</strong> Haz clic en <strong>"Ver Códigos"</strong> para verificar si el suscriptor ya utilizó su cupón de bienvenida (10%) o si aún está disponible.</li>
                                    <li><strong>Estado de Suscripción:</strong> Gestiona la baja de usuarios si solicitan dejar de recibir correos comerciales.</li>
                                </ol>
                            </div>

                            <h3 className="subsection-title"><FiShield /> 5.4 Seguridad y Roles (User & Role)</h3>
                            <p>Ubicación: <code>Users / providers &gt; User / Role</code></p>
                            <div className="feature-card">
                                <h4>Gestión de Identidades:</h4>
                                <ul>
                                    <li><strong>Usuarios:</strong> Crea las cuentas de acceso para nuevos empleados. Recuerda que el login es único.</li>
                                    <li><strong>Roles:</strong> Define perfiles como "Vendedor", "Almacenista" o "Contador" con descripciones claras de sus responsabilidades.</li>
                                </ul>
                            </div>

                            <h3 className="subsection-title"><FiLink /> 5.5 Asignación de Roles y Permisos</h3>
                            <p>Ubicación: <code>Users / providers &gt; User Roles / Gestion de Permisos</code></p>
                            <div className="feature-card">
                                <h4>Control Maestro de Acceso:</h4>
                                <ol className="manual-steps">
                                    <li><strong>Asignación:</strong> Vincula a un usuario específico con uno o varios roles según su cargo.</li>
                                    <li><strong>Matriz de Permisos:</strong> Selecciona el Rol y activa/desactiva las casillas de acceso. Esto define qué páginas y acciones (botones) puede ver el equipo en el menú lateral.</li>
                                </ol>
                                <p className="importance-note"><strong>Seguridad:</strong> El acceso a "Contabilidad" y "User Roles" debe estar restringido exclusivamente a cargos de alta confianza.</p>
                            </div>
                        </section>
                    )}

                    {activeSection === 'integraciones-apis' && (
                        <section className="manual-section fade-in">
                            <h2 className="section-title">Capítulo 6: Integraciones y Canales Digitales</h2>
                            <p className="intro-text">
                                En este capítulo, aprenderás a gestionar las conexiones entre el CMS y plataformas externas como Google, permitiendo que nuestros productos lleguen a millones de personas.
                            </p>

                            <h3 className="subsection-title"><FiRss /> 6.1 Google Merchant Feed (Catálogo Dinámico)</h3>
                            <p>Ubicación: <code>Integraciones-APIs &gt; Google Merchant Feed</code></p>
                            
                            <div className="feature-card">
                                <h4>Monitoreo y Sincronización:</h4>
                                <ol className="manual-steps">
                                    <li><strong>Feed URL:</strong> Copia la URL de producción mediante el botón <strong>"Copiar"</strong>. Esta es la dirección que se debe configurar en el Merchant Center de Google para que la publicidad se actualice automáticamente.</li>
                                    <li><strong>Validación de Catálogo:</strong> El tablero muestra en tiempo real cuántos productos están "Listos para Google". 
                                        <ul>
                                            <li><span style={{color: '#f87171', fontWeight: 700}}>Errores:</span> Impiden que el producto se muestre. Generalmente por falta de SKU, Título o Imagen Principal.</li>
                                            <li><span style={{color: '#fbbf24', fontWeight: 700}}>Advertencias:</span> Sugerencias de mejora para el posicionamiento, como descripciones más largas o mapeo de categorías.</li>
                                        </ul>
                                    </li>
                                    <li><strong>Detalle de g:Tags:</strong> Haz clic en cualquier fila para inspeccionar exactamente qué datos está enviando el sistema a Google (SKU, Precio, Link de Imagen, Categoría de Producto Google, etc.).</li>
                                </ol>
                                <p className="importance-note"><strong>Importancia:</strong> Una gestión impecable del feed garantiza que nuestras campañas de Google Ads tengan el mejor rendimiento posible y que nunca anunciemos productos sin stock.</p>
                            </div>

                            <div className="callout-info">
                                <FiGlobe className="callout-icon" />
                                <div>
                                    <strong>Expansión Global:</strong> El sistema mapea automáticamente nuestras categorías internas (ej: "Buso") a las categorías estandarizadas de Google (ej: "Sweaters / Hoodies - 5388"), asegurando que el producto aparezca en la sección correcta de Google Shopping.
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
