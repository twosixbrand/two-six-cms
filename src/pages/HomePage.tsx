import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiLayers, FiBarChart2, FiSettings, FiUsers, FiMap, FiTerminal, FiDollarSign } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import {
  FaTshirt, FaPaintBrush, FaPalette, FaImage, FaBoxOpen, FaWarehouse,
  FaShoppingCart, FaChartLine, FaFileInvoiceDollar,
  FaCalendarAlt, FaCloud, FaArchive, FaIndustry, FaTags, FaFolder, FaEyeDropper,
  FaTruck, FaUsers as FaUsersIcon, FaShieldAlt, FaUserTag, FaEnvelope,
  FaMapSigns, FaAddressBook,
  FaExclamationTriangle, FaRulerCombined, FaMapMarkerAlt
} from 'react-icons/fa';
import '../styles/HomePage.css';
import AccountingDashboardWidget from './accounting/AccountingDashboardWidget';

const homeSections = [
  {
    title: 'Admin Prendas',
    icon: <FiLayers />,
    items: [
      { path: '/clothing', icon: <FaTshirt />, title: 'Clothing', desc: 'Gestion de inventario de prendas, tallas y stock.' },
      { path: '/master-design', icon: <FaPaintBrush />, title: 'Design', desc: 'Creacion y gestion de disenos maestros.' },
      { path: '/clothing-color', icon: <FaPalette />, title: 'Clothing Color', desc: 'Gestion de variaciones especificas (color/talla).' },
      { path: '/image-clothing', icon: <FaImage />, title: 'Image Clothing', desc: 'Gestion de imagenes para variantes de prendas.' },
      { path: '/product', icon: <FaBoxOpen />, title: 'Product', desc: 'Gestion de productos finales para la venta.' },
      { path: '/stock', icon: <FaWarehouse />, title: 'Stock', desc: 'Gestion de niveles de inventario.' },
    ]
  },
  {
    title: 'Reports',
    icon: <FiBarChart2 />,
    items: [
      { path: '/order', icon: <FaShoppingCart />, title: 'Pedidos', desc: 'Visualizacion y seguimiento de pedidos cliente.' },
      { path: '/reports/sales/general', icon: <FaChartLine />, title: 'General Sales', desc: 'Reporte general de ventas del sistema.' },
      { path: '/dian-invoices', icon: <FaFileInvoiceDollar />, title: 'Facturacion DIAN', desc: 'Gestion y emision de facturas electronicas.' },
      { path: '/reports/pickup-dashboard', icon: <FaBoxOpen />, title: 'Retiros en Tienda', desc: 'Tablero para gestion de pedidos a entregar en punto fisico.' },
    ]
  },
  {
    title: 'Atencion Cliente',
    icon: <FiUsers />,
    items: [
      { path: '/pqr', icon: <FaEnvelope />, title: 'Gestion PQR', desc: 'Administracion de Peticiones, Quejas y Reclamos.' },
    ]
  },
  {
    title: 'Admin Maestros',
    icon: <FiSettings />,
    items: [
      { path: '/year-production', icon: <FaCalendarAlt />, title: 'Year Production', desc: 'Definicion de anos productivos.' },
      { path: '/season', icon: <FaCloud />, title: 'Season', desc: 'Gestion de temporadas.' },
      { path: '/collection', icon: <FaArchive />, title: 'Collection', desc: 'Gestion de colecciones de diseno.' },
      { path: '/production-type', icon: <FaIndustry />, title: 'Production type', desc: 'Tipos de produccion disponibles.' },
      { path: '/type-clothing', icon: <FaTags />, title: 'Type Clothing', desc: 'Tipologias de prendas registradas.' },
      { path: '/category', icon: <FaFolder />, title: 'Category', desc: 'Categorias principales del sistema.' },
      { path: '/color', icon: <FaEyeDropper />, title: 'Color', desc: 'Gestion de colores disponibles en produccion.' },
      { path: '/size-guide', icon: <FaRulerCombined />, title: 'Guia de Tallas', desc: 'Gestion de guias de tallas para el sitio web.' },
      { path: '/locations', icon: <FaMapMarkerAlt />, title: 'Ubicaciones', desc: 'Departamentos, ciudades y costos de envio.' },
    ]
  },
  {
    title: 'Users / providers',
    icon: <FiUsers />,
    items: [
      { path: '/provider', icon: <FaTruck />, title: 'Provider', desc: 'Gestion de proveedores externos.' },
      { path: '/customer', icon: <FaAddressBook />, title: 'Clientes', desc: 'Consulta y edicion de informacion de clientes.' },
      { path: '/user', icon: <FaUsersIcon />, title: 'User', desc: 'Administracion de usuarios del sistema.' },
      { path: '/role', icon: <FaShieldAlt />, title: 'Role', desc: 'Gestion de roles de seguridad.' },
      { path: '/user-role', icon: <FaUserTag />, title: 'User Roles', desc: 'Asignacion de roles a los usuarios.' },
      { path: '/subscriber', icon: <FaEnvelope />, title: 'Suscriber', desc: 'Gestion de suscriptores del newsletter.' },
    ]
  },
  {
    title: 'Plan Estrategico',
    icon: <FiMap />,
    items: [
      { path: '/plan-estrategico', icon: <FaMapSigns />, title: 'Ver plan', desc: 'Visualizacion del plan estrategico anual.' },
      { path: '/dian-documentation', icon: <FaFileInvoiceDollar />, title: 'Documentacion DIAN', desc: 'Arquitectura y flujos de Facturacion Electronica DIAN.' },
    ]
  },
  {
    title: 'Logs App',
    icon: <FiTerminal />,
    items: [
      { path: '/logs', icon: <FaExclamationTriangle />, title: 'Logs', desc: 'Registro de errores y debug del panel.' },
    ]
  }
];

const HomePage = () => {
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

      {homeSections.map((section, idx) => (
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
