import React, { useState } from 'react';
import { 
    FiBook, FiShoppingCart, FiServer, FiActivity, FiLayers, FiPackage, FiBox, 
    FiCheckCircle, FiAlertCircle, FiImage, FiTrendingUp, FiGift, FiDroplet, 
    FiPenTool, FiUploadCloud, FiSearch, FiSave, FiCheck, FiGlobe, FiMessageSquare, 
    FiUserCheck, FiClock, FiFileText, FiCalendar, FiArchive, FiAperture, FiGrid, 
    FiMapPin, FiUsers, FiTruck, FiShield, FiLink, FiPaperclip, FiMail, FiRss, 
    FiExternalLink, FiCopy, FiDollarSign, FiBriefcase, FiBarChart2, FiShieldOff, FiSearch as FiZoomIn,
    FiHome
} from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import './UserManualPage.css';

const UserManualPage = () => {
    const [activeSection, setActiveTab] = useState('introduccion');

    const sections = [
        { id: 'introduccion', title: 'Introducción', icon: <FiBook /> },
        { id: 'gestion-ventas', title: 'Gestión Ventas', icon: <FiShoppingCart /> },
        { id: 'admin-prendas', title: 'Admin Prendas', icon: <FiServer /> },
        { id: 'contabilidad', title: 'Contabilidad', icon: <FiDollarSign /> },
        { id: 'consignaciones', title: 'Consignaciones', icon: <FiTruck /> },
        { id: 'atencion-cliente', title: 'Atención Cliente', icon: <FiUserCheck /> },
        { id: 'campanas-cupones', title: 'Campañas & Cupones', icon: <FiGift /> },
        { id: 'admin-maestros', title: 'Admin Maestros', icon: <FiGrid /> },
        { id: 'users-providers', title: 'Users / Providers', icon: <FiUsers /> },
        { id: 'integraciones-apis', title: 'Integraciones-APIs', icon: <FiRss /> },
        { id: 'reportes-auditoria', title: 'Reportes & Auditoría', icon: <FiBarChart2 /> },
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
                            <p>Ubicación: <code>Gestión Ventas &gt; Pedidos</code></p>
                            <div className="feature-card">
                                <h4>Guía de Operación:</h4>
                                <ol className="manual-steps">
                                    <li><strong>Localización:</strong> Utiliza la barra de búsqueda para filtrar por referencia o nombre. Identifica órdenes críticas (Pendientes).</li>
                                    <li><strong>Validación de Pago:</strong> Para transferencias, verifica en bancos y marca como <strong>Pagado</strong>. Esto genera el asiento contable de ingreso.</li>
                                    <li><strong>Logística:</strong> En pedidos pagados, genera la guía de transporte para activar la salida de inventario.</li>
                                </ol>
                            </div>

                            <h3 className="subsection-title"><FiActivity /> 1.2 Facturación DIAN</h3>
                            <p>Ubicación: <code>Gestión Ventas &gt; Facturación DIAN</code></p>
                            <div className="feature-card">
                                <ul>
                                    <li><strong>Monitoreo:</strong> Verifica que el estado sea <em>AUTHORIZED</em>. Si hay error, revisa las reglas DIAN para corregir datos.</li>
                                    <li><strong>Notas Crédito:</strong> Genera notas para devoluciones; es vital para anular el impacto contable del IVA.</li>
                                </ul>
                            </div>

                            <h3 className="subsection-title"><FiTruck /> 1.3 Pickup Dashboard (Logística)</h3>
                            <p>Ubicación: <code>Gestión Ventas &gt; Pickup Dashboard</code></p>
                            <div className="feature-card">
                                <p>Herramienta central para el control de entregas y recogidas de mercancía. Permite visualizar en tiempo real el estado de los despachos locales y nacionales, asegurando que cada cliente reciba su pedido a tiempo.</p>
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

                            <h3 className="subsection-title"><FiLayers /> 2.2 Organización (Categorías, Tipos y Tags)</h3>
                            <p>Ubicación: <code>Admin Prendas &gt; Categoría / Tipos / Tags</code></p>
                            <div className="feature-card">
                                <p>Define la estructura de navegación de la tienda. Los <strong>Tags</strong> son vitales para las agrupaciones especiales (ej: "New Arrival", "Summer Sale") que impulsan las ventas estacionales.</p>
                            </div>

                            <h3 className="subsection-title"><FiPenTool /> 2.3 Design (Ingeniería y Costos)</h3>
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

                            <h3 className="subsection-title"><FiDroplet /> 2.4 Clothing Color (Identidad Digital y SEO)</h3>
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

                            <h3 className="subsection-title"><FiImage /> 2.5 Galería de Imágenes</h3>
                            <p>Ubicación: <code>Admin Prendas &gt; Imágenes</code></p>
                            <div className="feature-card">
                                <p>Gestiona el carrusel de fotos para cada combinación de color. Recuerda que la primera imagen siempre será la portada en la tienda web. Una buena galería visual reduce la tasa de abandono del carrito.</p>
                            </div>

                            <h3 className="subsection-title"><FiPackage /> 2.6 Product (La Oferta Comercial)</h3>
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

                            <h3 className="subsection-title"><FiBox /> 2.7 Stock (Guardianía de Existencias)</h3>
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

                    {activeSection === 'contabilidad' && (
                        <section className="manual-section fade-in">
                            <h2 className="section-title">Capítulo 3: Ecosistema Contable y Financiero</h2>
                            <p className="intro-text">
                                El módulo de contabilidad automatiza el registro de cada movimiento económico de <strong>Two Six</strong>, garantizando transparencia, control de gastos y cumplimiento legal.
                            </p>

                            <h3 className="subsection-title"><FiBriefcase /> 3.1 Gestión de Nómina</h3>
                            <p>Ubicación: <code>Contabilidad &gt; Nómina</code></p>
                            <div className="feature-card">
                                <h4>Flujo de Liquidación:</h4>
                                <ol className="manual-steps">
                                    <li><strong>Ficha del Empleado:</strong> Es vital configurar correctamente el <em>Salario Base</em> y el <em>Nivel de Riesgo ARL</em>. Marcar <strong>Exonerado (Ley 1607)</strong> si aplica para el ahorro de aportes patronales.</li>
                                    <li><strong>Apertura de Período:</strong> Crea el mes y la quincena (1ra o 2da) a liquidar.</li>
                                    <li><strong>Liquidar:</strong> El sistema calcula automáticamente salud, pensión, provisiones de prestaciones sociales y parafiscales.</li>
                                    <li><strong>Aprobar y Contabilizar:</strong> Al aprobar, el sistema genera los asientos contables de gasto en el Libro Diario automáticamente, manteniendo el balance siempre al día.</li>
                                </ol>
                            </div>

                            <h3 className="subsection-title"><FiFileText /> 3.2 Libro Diario y Gastos</h3>
                            <p>Ubicación: <code>Contabilidad &gt; Libro Diario / Gastos</code></p>
                            <div className="feature-card">
                                <p>Registro cronológico de todas las operaciones. Los <strong>Gastos</strong> deben clasificarse por centro de costo y tipo de gasto para un análisis de rentabilidad preciso y para la generación de la información exógena.</p>
                            </div>

                            <h3 className="subsection-title"><FiActivity /> 3.3 Estados Financieros</h3>
                            <p>Ubicación: <code>Contabilidad &gt; Balance / Estado de Resultados</code></p>
                            <div className="feature-card">
                                <p>Genera en tiempo real los reportes de salud de la empresa. El <strong>Estado de Resultados</strong> te mostrará la utilidad neta restando costos de producción y gastos operativos de las ventas brutas, permitiendo tomar decisiones informadas.</p>
                            </div>
                        </section>
                    )}

                    {activeSection === 'consignaciones' && (
                        <section className="manual-section fade-in">
                            <h2 className="section-title">Capítulo 4: Gestión de Inventario en Consignación</h2>
                            <p className="intro-text">
                                Este módulo gestiona la mercancía entregada a aliados comerciales. El sistema mantiene el control de la propiedad de Two Six mientras el aliado realiza la venta en sus propios establecimientos.
                            </p>

                            <h3 className="subsection-title"><FiHome /> 4.1 Bodegas de Aliados</h3>
                            <p>Ubicación: <code>Consignaciones &gt; Bodegas</code></p>
                            <div className="feature-card">
                                <h4>Configuración:</h4>
                                <ol className="manual-steps">
                                    <li>Vincula la bodega a un <strong>Cliente Aliado</strong> (previamente marcado como aliado en Gestión de Clientes).</li>
                                    <li>Esta bodega actuará como un inventario externo pero controlado, permitiendo ver el stock disponible en cada punto de venta aliado.</li>
                                </ol>
                            </div>

                            <h3 className="subsection-title"><FiTruck /> 4.2 Despachos y Sell-out</h3>
                            <p>Ubicación: <code>Consignaciones &gt; Despachos / Reporte Ventas</code></p>
                            <div className="feature-card">
                                <h4>Ciclo de Mercancía:</h4>
                                <ul>
                                    <li><strong>Despacho:</strong> Envía mercancía a la bodega del aliado. Esto disminuye el stock central y aumenta el stock en consignación del punto de venta.</li>
                                    <li><strong>Sell-out:</strong> Cuando el aliado vende, debes reportar la venta para legalizar el ingreso, generar la factura correspondiente y descargar el stock del aliado.</li>
                                </ul>
                            </div>
                        </section>
                    )}

                    {activeSection === 'atencion-cliente' && (
                        <section className="manual-section fade-in">
                            <h2 className="section-title">Capítulo 5: Atención al Cliente y Resolución de Casos</h2>
                            <p className="intro-text">
                                En <strong>Two Six</strong>, la lealtad de nuestros clientes se construye resolviendo sus inquietudes con agilidad y empatía. Este módulo es tu herramienta para convertir una inconformidad en una experiencia positiva.
                            </p>

                            <h3 className="subsection-title"><FiMessageSquare /> 5.1 Gestión de PQRs</h3>
                            <p>Ubicación: <code>Atencion Cliente &gt; Gestión PQR</code></p>
                            
                            <div className="feature-card">
                                <h4>Protocolo de Gestión de Casos:</h4>
                                <ol className="manual-steps">
                                    <li><strong>Monitoreo de Radicados:</strong> Los casos se visualizan en tarjetas codificadas por colores según su estado de cumplimiento (SLA).</li>
                                    <li><strong>Análisis de Evidencia:</strong> Al abrir un caso, revisa las fotos cargadas por el cliente al Object Storage, vitales para validar reclamos de calidad o errores en el envío.</li>
                                    <li><strong>Actualización de Gestión:</strong> Usa el campo "Observaciones" para dejar trazabilidad de la solución y los acuerdos llegados con el cliente.</li>
                                </ol>
                            </div>
                        </section>
                    )}

                    {activeSection === 'campanas-cupones' && (
                        <section className="manual-section fade-in">
                            <h2 className="section-title">Capítulo 6: Campañas y Cupones de Fidelización</h2>
                            <p className="intro-text">
                                La estrategia de marketing digital de <strong>Two Six</strong> cobra vida en este módulo. Aquí podrás crear incentivos para atraer nuevos clientes y premiar a los más leales mediante cupones inteligentes.
                            </p>

                            <h3 className="subsection-title"><FiGift /> 6.1 Gestión de Cupones</h3>
                            <p>Ubicación: <code>Campañas &amp; Cupones &gt; Gestión de Cupones</code></p>
                            
                            <div className="feature-card">
                                <h4>Pasos para Crear una Campaña de Descuento:</h4>
                                <ol className="manual-steps">
                                    <li><strong>Código Promocional:</strong> Define el código que el cliente ingresará (ej: <code>BIENVENIDO10</code>). El sistema lo convertirá automáticamente a mayúsculas para evitar errores tipográficos.</li>
                                    <li><strong>Incentivo:</strong> Define el <strong>Porcentaje de Descuento</strong> y si la campaña incluye <strong>Envío Gratis</strong> forzado.</li>
                                    <li><strong>Vigencia:</strong> Selecciona las fechas y horas exactas de inicio y fin. El cupón dejará de funcionar automáticamente al segundo exacto de la fecha de fin.</li>
                                    <li><strong>Reglas de Aplicación:</strong>
                                        <ul>
                                            <li><em>Un Solo Uso por Cliente:</em> Bloquea el cupón para que cada email registrado solo pueda usarlo una vez.</li>
                                            <li><em>Límites de Uso Global:</em> Define cuántas veces se puede usar el cupón en total antes de que caduque.</li>
                                            <li><em>Compra Mínima ($):</em> El cupón solo se activará si el carrito supera este valor.</li>
                                        </ul>
                                    </li>
                                </ol>
                                <p className="importance-note"><strong>Integridad Contable:</strong> Una vez que un cupón ha sido utilizado al menos una vez, el código y el porcentaje se bloquean para evitar alteraciones en los históricos de ventas.</p>
                            </div>
                        </section>
                    )}

                    {activeSection === 'admin-maestros' && (
                        <section className="manual-section fade-in">
                            <h2 className="section-title">Capítulo 7: Administración de Tablas Maestras (Estructura)</h2>
                            <p className="intro-text">
                                Los "Maestros" son los cimientos sobre los cuales se construye toda la lógica del CMS. Tu precisión aquí garantiza que el catálogo sea coherente y navegable para el cliente final.
                            </p>

                            <h3 className="subsection-title"><FiCalendar /> 7.1 Temporalidad (Year & Season)</h3>
                            <p>Ubicación: <code>Admin Maestros &gt; Year Production / Season</code></p>
                            <div className="feature-card">
                                <p>Define los ciclos de tiempo de la marca. Cada prenda debe pertenecer a un año y una temporada para facilitar reportes históricos de desempeño de colecciones.</p>
                            </div>

                            <h3 className="subsection-title"><FiArchive /> 7.2 Colecciones (Collections)</h3>
                            <p>Ubicación: <code>Admin Maestros &gt; Collection</code></p>
                            <div className="feature-card">
                                <p>Agrupa diseños bajo un concepto creativo único. Las colecciones ayudan a contar la historia detrás de las prendas en la tienda web.</p>
                            </div>

                            <h3 className="subsection-title"><FiAperture /> 7.3 Gestión Cromática (Colors)</h3>
                            <p>Ubicación: <code>Admin Maestros &gt; Color</code></p>
                            <div className="feature-card">
                                <p>Control de la paleta de colores oficial. Usa el código Hexadecimal para asegurar la coincidencia visual entre la pantalla y la tela física.</p>
                            </div>

                            <h3 className="subsection-title"><FiGrid /> 7.4 Guía de Tallas (Size Guide)</h3>
                            <p>Ubicación: <code>Admin Maestros &gt; Guía de Tallas</code></p>
                            <div className="feature-card">
                                <p>La herramienta definitiva para reducir devoluciones. Ingresa las medidas exactas por cada talla; esto aparecerá como un modal de ayuda para el cliente.</p>
                            </div>

                            <h3 className="subsection-title"><FiMapPin /> 7.5 Ubicaciones (Locations)</h3>
                            <p>Ubicación: <code>Admin Maestros &gt; Ubicaciones</code></p>
                            <div className="feature-card">
                                <p>Define los puntos físicos donde puede existir inventario (Bodega Central, Tiendas Propias, etc.), vital para el control de stock multicanal.</p>
                            </div>
                        </section>
                    )}

                    {activeSection === 'users-providers' && (
                        <section className="manual-section fade-in">
                            <h2 className="section-title">Capítulo 8: Aliados y Control de Acceso</h2>
                            <p className="intro-text">
                                Este módulo gestiona el capital humano y los aliados estratégicos de <strong>Two Six</strong>. Aquí controlarás quién tiene acceso al sistema y la legalidad de nuestros proveedores.
                            </p>

                            <h3 className="subsection-title"><FiTruck /> 8.1 Gestión de Proveedores</h3>
                            <p>Ubicación: <code>Users / providers &gt; Provider</code></p>
                            <div className="feature-card">
                                <h4>Registro y Legalización de Aliados:</h4>
                                <ol className="manual-steps">
                                    <li><strong>Datos Básicos:</strong> Ingresa el NIT, nombre de la empresa y datos bancarios para el pago de facturas.</li>
                                    <li><strong>Carga de Documentación Legal (DigitalOcean):</strong> Haz clic en el botón <strong>"Docs"</strong>.
                                        <ul>
                                            <li>Es <strong>obligatorio</strong> subir el RUT, Cámara de Comercio y Cédula del Representante Legal.</li>
                                            <li>Los archivos se alojan de forma segura en la nube para auditorías rápidas.</li>
                                        </ul>
                                    </li>
                                </ol>
                                <p className="importance-note"><strong>Importancia:</strong> Un proveedor con registro "Incompleto" no podrá recibir pagos del departamento de contabilidad por seguridad tributaria.</p>
                            </div>

                            <h3 className="subsection-title"><FiUserCheck /> 8.2 CRM de Clientes</h3>
                            <p>Ubicación: <code>Users / providers &gt; Clientes</code></p>
                            <div className="feature-card">
                                <p>Administra la base de datos de nuestros compradores. Un campo crítico es marcar a los <strong>Aliados de Consignación</strong> para habilitar su gestión en el módulo especializado.</p>
                            </div>

                            <h3 className="subsection-title"><FiShield /> 8.3 Seguridad y Roles</h3>
                            <p>Ubicación: <code>Users / providers &gt; User / Role</code></p>
                            <div className="feature-card">
                                <h4>Gestión de Identidades:</h4>
                                <ul>
                                    <li><strong>Usuarios:</strong> Crea las cuentas de acceso para nuevos empleados. Recuerda que el acceso es personal e intransferible.</li>
                                    <li><strong>Roles:</strong> Define perfiles con permisos granulares (Lectura, Escritura, Edición) según el cargo del empleado.</li>
                                </ul>
                            </div>
                        </section>
                    )}

                    {activeSection === 'integraciones-apis' && (
                        <section className="manual-section fade-in">
                            <h2 className="section-title">Capítulo 9: Integraciones y Canales Digitales</h2>
                            <p className="intro-text">
                                En este capítulo, aprenderás a gestionar las conexiones entre el CMS y plataformas externas permitiendo que nuestro catálogo se venda automáticamente en todo el mundo.
                            </p>

                            <h3 className="subsection-title"><FiGlobe /> 9.1 Google Merchant Feed</h3>
                            <p>Ubicación: <code>Integraciones-APIs &gt; Google Merchant Feed</code></p>
                            <div className="feature-card">
                                <p>Sincroniza el catálogo con Google Shopping. Es vital revisar las advertencias de <em>g:tags</em> para mejorar el posicionamiento SEO en búsquedas de Google.</p>
                            </div>

                            <h3 className="subsection-title"><FiGlobe /> 9.2 Facebook / Meta Feed</h3>
                            <p>Ubicación: <code>Integraciones-APIs &gt; Facebook Feed</code></p>
                            <div className="feature-card">
                                <h4>Gestión de Catálogo en Redes Sociales:</h4>
                                <ol className="manual-steps">
                                    <li><strong>Feed URL:</strong> Copia la URL de producción mediante el botón <strong>"Copiar"</strong> para pegarla en el Commerce Manager de Meta (Facebook/Instagram).</li>
                                    <li><strong>Validación:</strong> El tablero muestra productos "Listos para Meta". Revisa errores de SKU, Precio o Imagen que impiden la publicación en Instagram Shop.</li>
                                </ol>
                                <p className="importance-note"><strong>Importancia:</strong> Un feed limpio garantiza que nuestros anuncios siempre muestren el precio correcto y solo productos con stock.</p>
                            </div>
                        </section>
                    )}

                    {activeSection === 'reportes-auditoria' && (
                        <section className="manual-section fade-in">
                            <h2 className="section-title">Capítulo 10: Inteligencia de Datos y Control Maestro</h2>
                            <p className="intro-text">
                                El conocimiento es poder. Este módulo centraliza los reportes estratégicos para la gerencia y la auditoría de seguridad para la integridad del sistema.
                            </p>

                            <h3 className="subsection-title"><FiTrendingUp /> 10.1 Reportes Estratégicos</h3>
                            <p>Ubicación: <code>Reportes &gt; Ventas Generales / Reporte Stock</code></p>
                            <div className="feature-card">
                                <p>Visualiza el rendimiento financiero de la marca. El <strong>Reporte de Stock</strong> te permite prever agotados y gestionar reposiciones con tiempo, evitando pérdidas por falta de inventario.</p>
                            </div>

                            <h3 className="subsection-title"><FiShield /> 10.2 Auditoría del Sistema</h3>
                            <p>Ubicación: <code>Reportes &gt; Log de Auditoría</code></p>
                            <div className="feature-card">
                                <p>Control total sobre las acciones realizadas en el CMS. El sistema registra qué usuario, en qué fecha y qué dato exacto se modificó. Esto es vital para resolver discrepancias en inventarios o contabilidad, garantizando que <strong>Two Six</strong> opere siempre bajo estándares de máxima seguridad.</p>
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
};

export default UserManualPage;
