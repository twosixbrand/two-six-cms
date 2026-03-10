import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiLayers, FiBarChart2, FiSettings, FiUsers, FiMap, FiTerminal } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import {
  FaTshirt, FaPaintBrush, FaPalette, FaImage, FaBoxOpen, FaWarehouse,
  FaShoppingCart, FaChartLine,
  FaCalendarAlt, FaCloud, FaArchive, FaIndustry, FaTags, FaFolder, FaEyeDropper,
  FaTruck, FaUsers as FaUsersIcon, FaShieldAlt, FaUserTag, FaEnvelope,
  FaMapSigns,
  FaExclamationTriangle, FaRulerCombined, FaMapMarkerAlt
} from 'react-icons/fa';
import '../styles/HomePage.css';

const homeSections = [
  {
    title: 'Admin Prendas',
    icon: <FiLayers />,
    items: [
      { path: '/clothing', icon: <FaTshirt />, title: 'Clothing', desc: 'Gestión de inventario de prendas, tallas y stock.' },
      { path: '/master-design', icon: <FaPaintBrush />, title: 'Design', desc: 'Creación y gestión de diseños maestros.' },
      { path: '/clothing-color', icon: <FaPalette />, title: 'Clothing Color', desc: 'Gestión de variaciones específicas (color/talla).' },
      { path: '/image-clothing', icon: <FaImage />, title: 'Image Clothing', desc: 'Gestión de imágenes para variantes de prendas.' },
      { path: '/product', icon: <FaBoxOpen />, title: 'Product', desc: 'Gestión de productos finales para la venta.' },
      { path: '/stock', icon: <FaWarehouse />, title: 'Stock', desc: 'Gestión de niveles de inventario.' },
    ]
  },
  {
    title: 'Reports',
    icon: <FiBarChart2 />,
    items: [
      { path: '/order', icon: <FaShoppingCart />, title: 'Pedidos', desc: 'Visualización y seguimiento de pedidos cliente.' },
      { path: '/reports/sales/general', icon: <FaChartLine />, title: 'General Sales', desc: 'Reporte general de ventas del sistema.' },
    ]
  },
  {
    title: 'Atención Cliente',
    icon: <FiUsers />,
    items: [
      { path: '/pqr', icon: <FaEnvelope />, title: 'Gestión PQR', desc: 'Administración de Peticiones, Quejas y Reclamos.' },
    ]
  },
  {
    title: 'Admin Maestros',
    icon: <FiSettings />,
    items: [
      { path: '/year-production', icon: <FaCalendarAlt />, title: 'Year Production', desc: 'Definición de años productivos.' },
      { path: '/season', icon: <FaCloud />, title: 'Season', desc: 'Gestión de temporadas.' },
      { path: '/collection', icon: <FaArchive />, title: 'Collection', desc: 'Gestión de colecciones de diseño.' },
      { path: '/production-type', icon: <FaIndustry />, title: 'Production type', desc: 'Tipos de producción disponibles.' },
      { path: '/type-clothing', icon: <FaTags />, title: 'Type Clothing', desc: 'Tipologías de prendas registradas.' },
      { path: '/category', icon: <FaFolder />, title: 'Category', desc: 'Categorías principales del sistema.' },
      { path: '/color', icon: <FaEyeDropper />, title: 'Color', desc: 'Gestión de colores disponibles en producción.' },
      { path: '/size-guide', icon: <FaRulerCombined />, title: 'Guía de Tallas', desc: 'Gestión de guías de tallas para el sitio web.' },
      { path: '/locations', icon: <FaMapMarkerAlt />, title: 'Ubicaciones', desc: 'Departamentos, ciudades y costos de envío.' },
    ]
  },
  {
    title: 'Users / providers',
    icon: <FiUsers />,
    items: [
      { path: '/provider', icon: <FaTruck />, title: 'Provider', desc: 'Gestión de proveedores externos.' },
      { path: '/user', icon: <FaUsersIcon />, title: 'User', desc: 'Administración de usuarios del sistema.' },
      { path: '/role', icon: <FaShieldAlt />, title: 'Role', desc: 'Gestión de roles de seguridad.' },
      { path: '/user-role', icon: <FaUserTag />, title: 'User Roles', desc: 'Asignación de roles a los usuarios.' },
      { path: '/subscriber', icon: <FaEnvelope />, title: 'Suscriber', desc: 'Gestión de suscriptores del newsletter.' },
    ]
  },
  {
    title: 'Plan Estrategico',
    icon: <FiMap />,
    items: [
      { path: '/plan-estrategico', icon: <FaMapSigns />, title: 'Ver plan', desc: 'Visualización del plan estratégico anual.' },
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
      <PageHeader title="Páginas Principales" icon={<FiHome />} />

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