import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  FiHome, FiLayers, FiBarChart2, FiSettings, FiUsers, FiMap, FiTerminal, FiDollarSign,
  FiServer, FiPenTool, FiDroplet, FiImage, FiPackage, FiBox,
  FiShoppingCart, FiTrendingUp, FiSend, FiGift,
  FiMessageSquare,
  FiCalendar, FiCloud, FiArchive, FiTool, FiTag, FiFolder, FiAperture, FiGrid, FiMapPin,
  FiTruck, FiUserCheck, FiUser, FiShield, FiLink, FiMail, FiLock,
  FiBookOpen, FiClipboard, FiCreditCard, FiBriefcase, FiColumns, FiCheckSquare,
  FiActivity, FiList, FiAlignLeft, FiRepeat, FiWatch, FiPercent, FiScissors,
  FiAward, FiTarget, FiPieChart, FiDatabase, FiEye, FiBook,
  FiCompass, FiCode, FiAlertTriangle, FiHeart
} from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import '../styles/HomePage.css';
import AccountingDashboardWidget from './accounting/AccountingDashboardWidget';

const homeSections = [
  {
    title: 'Gestion Ventas', icon: <FiBarChart2 />, permission: 'sales',
    items: [
      { path: '/order', icon: <FiShoppingCart />, title: 'Pedidos', desc: 'Visualizacion y seguimiento de pedidos cliente.', permission: 'sales.orders.view' },
      { path: '/dian-invoices', icon: <FiSend />, title: 'Facturacion DIAN', desc: 'Gestion y emision de facturas electronicas.', permission: 'sales.dian.view' },
      { path: '/reports/sales/general', icon: <FiTrendingUp />, title: 'General Sales', desc: 'Reporte general de ventas del sistema.', permission: 'sales.reports.view' },
      { path: '/reports/pickup-dashboard', icon: <FiGift />, title: 'Retiros en Tienda', desc: 'Tablero para gestion de pedidos a entregar en punto fisico.', permission: 'sales.orders.view' },
    ]
  },
  {
    title: 'Admin Prendas', icon: <FiLayers />, permission: 'inventory',
    items: [
      { path: '/clothing', icon: <FiServer />, title: 'Clothing', desc: 'Gestion de inventario de prendas, tallas y stock.', permission: 'inventory.clothing.view' },
      { path: '/master-design', icon: <FiPenTool />, title: 'Design', desc: 'Creacion y gestion de diseños maestros.', permission: 'inventory.clothing.view' },
      { path: '/clothing-color', icon: <FiDroplet />, title: 'Clothing Color', desc: 'Gestion de variaciones especificas (color/talla).', permission: 'inventory.clothing.view' },
      { path: '/image-clothing', icon: <FiImage />, title: 'Image Clothing', desc: 'Gestion de imagenes para variantes de prendas.', permission: 'inventory.images.manage' },
      { path: '/product', icon: <FiPackage />, title: 'Product', desc: 'Gestion de productos finales para la venta.', permission: 'inventory.products.view' },
      { path: '/stock', icon: <FiBox />, title: 'Stock', desc: 'Gestion de niveles de inventario.', permission: 'inventory.stock.view' },
    ]
  },
  {
    title: 'Atencion Cliente', icon: <FiHeart />, permission: 'sales',
    items: [
      { path: '/pqr', icon: <FiMessageSquare />, title: 'Gestion PQR', desc: 'Administracion de Peticiones, Quejas y Reclamos.', permission: 'sales.customers.view' },
    ]
  },
  {
    title: 'Admin Maestros', icon: <FiSettings />, permission: 'catalog',
    items: [
      { path: '/year-production', icon: <FiCalendar />, title: 'Year Production', desc: 'Definicion de anos productivos.', permission: 'catalog.seasons.view' },
      { path: '/season', icon: <FiCloud />, title: 'Season', desc: 'Gestion de temporadas.', permission: 'catalog.seasons.view' },
      { path: '/collection', icon: <FiArchive />, title: 'Collection', desc: 'Gestion de colecciones de diseño.', permission: 'catalog.collections.view' },
      { path: '/production-type', icon: <FiTool />, title: 'Production type', desc: 'Tipos de produccion disponibles.', permission: 'catalog.categories.view' },
      { path: '/type-clothing', icon: <FiTag />, title: 'Type Clothing', desc: 'Tipologias de prendas registradas.', permission: 'catalog.categories.view' },
      { path: '/category', icon: <FiFolder />, title: 'Category', desc: 'Categorias principales del sistema.', permission: 'catalog.categories.view' },
      { path: '/color', icon: <FiAperture />, title: 'Color', desc: 'Gestion de colores disponibles en produccion.', permission: 'catalog.colors.view' },
      { path: '/size-guide', icon: <FiGrid />, title: 'Guia de Tallas', desc: 'Gestion de guias de tallas para el sitio web.', permission: 'catalog.sizes.view' },
      { path: '/locations', icon: <FiMapPin />, title: 'Ubicaciones', desc: 'Departamentos, ciudades y costos de envio.', permission: 'catalog.categories.view' },
    ]
  },
  {
    title: 'Users / providers', icon: <FiUsers />, permission: 'admin',
    items: [
      { path: '/provider', icon: <FiTruck />, title: 'Provider', desc: 'Gestion de proveedores externos.', permission: 'catalog.providers.view' },
      { path: '/customer', icon: <FiUserCheck />, title: 'Clientes', desc: 'Consulta y edicion de informacion de clientes.', permission: 'sales.customers.view' },
      { path: '/user', icon: <FiUser />, title: 'User', desc: 'Administracion de usuarios del sistema.', permission: 'admin.users.view' },
      { path: '/role', icon: <FiShield />, title: 'Role', desc: 'Gestion de roles de seguridad.', permission: 'admin.roles.view' },
      { path: '/user-role', icon: <FiLink />, title: 'User Roles', desc: 'Asignacion de roles a los usuarios.', permission: 'admin.roles.view' },
      { path: '/subscriber', icon: <FiMail />, title: 'Suscriber', desc: 'Gestion de suscriptores del newsletter.', permission: 'sales.customers.view' },
      { path: '/permissions', icon: <FiLock />, title: 'Gestion de Permisos', desc: 'Asignar permisos por rol a cada pagina.', permission: 'admin.permissions.manage' },
    ]
  },
  {
    title: 'Contabilidad', icon: <FiDollarSign />, permission: 'accounting',
    items: [
      { path: '/accounting/puc', icon: <FiBookOpen />, title: 'PUC', desc: 'Plan Unico de Cuentas colombiano.', permission: 'accounting.puc.view' },
      { path: '/accounting/journal', icon: <FiClipboard />, title: 'Asientos Contables', desc: 'Registro de asientos por partida doble.', permission: 'accounting.journal.view' },
      { path: '/accounting/expenses', icon: <FiCreditCard />, title: 'Gastos / Compras', desc: 'Registro de facturas, servicios y gastos.', permission: 'accounting.expenses.view' },
      { path: '/accounting/payroll', icon: <FiBriefcase />, title: 'Nomina', desc: 'Calculo de nomina con aportes colombianos.', permission: 'accounting.payroll.view' },
      { path: '/accounting/bank-reconciliation', icon: <FiColumns />, title: 'Conciliacion Bancaria', desc: 'Carga de extractos y cruce automatico.', permission: 'accounting.bank.view' },
      { path: '/accounting/closing', icon: <FiCheckSquare />, title: 'Cierre Contable', desc: 'Cierre mensual y anual de periodos.', permission: 'accounting.closing.manage' },
      { path: '/accounting/balance-sheet', icon: <FiBarChart2 />, title: 'Balance General', desc: 'Activos, Pasivos y Patrimonio.', permission: 'accounting.reports.view' },
      { path: '/accounting/income-statement', icon: <FiActivity />, title: 'Estado de Resultados', desc: 'Ingresos, gastos y utilidad del periodo.', permission: 'accounting.reports.view' },
      { path: '/accounting/general-ledger', icon: <FiList />, title: 'Libro Mayor', desc: 'Movimientos por cuenta con saldo corrido.', permission: 'accounting.reports.view' },
      { path: '/accounting/subsidiary-ledger', icon: <FiAlignLeft />, title: 'Libro Auxiliar', desc: 'Detalle por sub-cuentas.', permission: 'accounting.reports.view' },
      { path: '/accounting/reports/cash-flow', icon: <FiRepeat />, title: 'Flujo de Caja', desc: 'Estado de flujo de efectivo.', permission: 'accounting.reports.view' },
      { path: '/accounting/reports/aging', icon: <FiWatch />, title: 'Cartera y Valoracion', desc: 'CxC, CxP por antiguedad e inventario valorizado.', permission: 'accounting.reports.view' },
      { path: '/accounting/tax/iva', icon: <FiPercent />, title: 'Declaracion IVA', desc: 'IVA generado vs descontable (Form. 300).', permission: 'accounting.tax.view' },
      { path: '/accounting/tax/retefuente', icon: <FiScissors />, title: 'Retencion en la Fuente', desc: 'Conceptos de retencion (Form. 350).', permission: 'accounting.tax.view' },
      { path: '/accounting/withholding-certificates', icon: <FiAward />, title: 'Certificados Retencion', desc: 'Generacion de certificados por proveedor.', permission: 'accounting.withholding.view' },
      { path: '/accounting/budget', icon: <FiTarget />, title: 'Presupuesto', desc: 'Presupuesto vs ejecucion por cuenta.', permission: 'accounting.budget.view' },
      { path: '/accounting/assets', icon: <FiHome />, title: 'Activos Fijos', desc: 'Registro y depreciacion de activos.', permission: 'accounting.assets.view' },
      { path: '/accounting/reports/indicators', icon: <FiPieChart />, title: 'Indicadores Financieros', desc: 'Razon corriente, ROE, ROA y mas.', permission: 'accounting.indicators.view' },
      { path: '/accounting/exogena', icon: <FiDatabase />, title: 'Informacion Exogena', desc: 'Medios magneticos DIAN (formatos 1001-1007).', permission: 'accounting.exogena.view' },
      { path: '/accounting/audit-log', icon: <FiEye />, title: 'Auditoria', desc: 'Registro de acciones contables.', permission: 'accounting.audit.view' },
      { path: '/accounting/reports/profitability', icon: <FiTrendingUp />, title: 'Rentabilidad por Diseño', desc: 'Analisis de rentabilidad por diseño.', permission: 'accounting.reports.view' },
      { path: '/accounting/inventory-adjustments', icon: <FiBox />, title: 'Ajustes Inventario', desc: 'Ajustes de inventario contable.', permission: 'accounting.journal.view' },
      { path: '/accounting/tax-config', icon: <FiSettings />, title: 'Configuracion Impuestos', desc: 'Configuracion de impuestos del sistema.', permission: 'accounting.tax.view' },
    ]
  },
  {
    title: 'Integraciones-APIs', icon: <FiCode />, permission: 'sales',
    items: [
      { path: '/google-merchant-feed', icon: <FiGrid />, title: 'Google Merchant Feed', desc: 'Dashboard del feed XML para Google Merchant Center.', permission: 'sales.reports.view' },
    ]
  },
  {
    title: 'Plan Estrategico', icon: <FiMap />, permission: 'sales',
    items: [
      { path: '/plan-estrategico', icon: <FiCompass />, title: 'Ver plan', desc: 'Visualizacion del plan estrategico anual.', permission: 'sales.orders.view' },
    ]
  },
  {
    title: 'Documentación', icon: <FiBook />, permission: 'sales',
    items: [
      { path: '/architecture-docs', icon: <FiServer />, title: 'Doc. Arquitectura', desc: 'Topografía Cloud, DevSecOps y costos de ecosistema.', permission: 'admin.users.view' },
      { path: '/database-docs', icon: <FiDatabase />, title: 'Doc. Base de Datos', desc: 'Diagramas visuales de la arquitectura de datos del sistema.', permission: 'admin.users.view' },
      { path: '/dian-documentation', icon: <FiCode />, title: 'Documentacion DIAN', desc: 'Arquitectura y flujos de Facturacion Electronica DIAN.', permission: 'sales.dian.view' },
      { path: '/manual-contabilidad', icon: <FiBookOpen />, title: 'Manual Contable', desc: 'Manual completo del modulo contable.', permission: 'accounting.reports.view' },
    ]
  },
  {
    title: 'Logs App', icon: <FiTerminal />, permission: 'admin',
    items: [
      { path: '/logs', icon: <FiAlertTriangle />, title: 'Logs', desc: 'Registro de errores y debug del panel.', permission: 'admin.logs.view' },
    ]
  }
];

const HomePage = () => {
  const { hasPermission, hasGroupPermission, userPermissions } = useContext(AuthContext);

  const filteredSections = homeSections
    .filter(section => {
      if (!userPermissions || userPermissions.length === 0) return true;
      if (!section.permission) return true;
      return hasGroupPermission(section.permission);
    })
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (!userPermissions || userPermissions.length === 0) return true;
        if (!item.permission) return true;
        return hasPermission(item.permission);
      })
    }))
    .filter(section => section.items.length > 0);

  return (
    <div className="home-container page-container">
      <PageHeader title="Dashboard" icon={<FiHome />} />

      <section className="home-section">
        <h2 className="home-section-title">
          <FiDollarSign />
          Dashboard Financiero
        </h2>
        <AccountingDashboardWidget />
      </section>

      {filteredSections.map((section, idx) => (
        <section key={idx} className="home-section">
          <h2 className="home-section-title">
            {section.icon}
            {section.title}
          </h2>
          <div className="home-cards">
            {section.items.map((item, itemIdx) => (
              <Link to={item.path} className="home-card" key={itemIdx}>
                <div className="card-watermark">{item.icon}</div>
                <div className="card-icon-container">{item.icon}</div>
                <h2>{item.title}</h2>
                <p>{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default HomePage;
