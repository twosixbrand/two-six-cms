import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

import './Menu.css';
import SubMenu from './SubMenu';

const menuData = [
  {
    title: 'Admin Prendas',
    path: '#',
    subNav: [
      { title: 'Clothing', path: '/clothing' },
      { title: 'Design', path: '/master-design' },
      { title: 'Clothing Color', path: '/clothing-color' },
      { title: 'Image Clothing', path: '/image-clothing' },
      { title: 'Product', path: '/product' },
      { title: 'Stock', path: '/stock' },





    ],
  },
  {
    title: 'Reports',
    path: '#',
    subNav: [
      { title: 'Pedidos', path: '/order' },
      { title: 'General Sales', path: '/reports/sales/general' },
      { title: 'Facturación DIAN', path: '/dian-invoices' },
      { title: 'Retiros en Tienda', path: '/reports/pickup-dashboard' },
    ],
  },
  {
    title: 'Atención Cliente',
    path: '#',
    subNav: [
      { title: 'Gestión PQR', path: '/pqr' },
    ],
  },
  {
    title: 'Admin Maestros',
    path: '#',
    subNav: [
      { title: 'Year Production', path: '/year-production' },
      { title: 'Season', path: '/season' },
      { title: 'Collection', path: '/collection' },
      { title: 'Production type', path: '/production-type' },
      { title: 'Type Clothing', path: '/type-clothing' },
      { title: 'Category', path: '/category' },
      { title: 'Color', path: '/color' },
      { title: 'Guía de Tallas', path: '/size-guide' },
      { title: 'Ubicaciones', path: '/locations' },
    ],
  },
  {
    title: 'Users / providers',
    path: '#',
    subNav: [
      { title: 'Provider', path: '/provider' },
      { title: 'Clientes', path: '/customer' },
      { title: 'User', path: '/user' },
      { title: 'Role', path: '/role' },
      { title: 'User Roles', path: '/user-role' },
      { title: 'Suscriber', path: '/subscriber' },
    ],
  },
  {
    title: 'Plan Estrategico',
    path: '#',
    subNav: [
      { title: 'Ver plan', path: '/plan-estrategico' },
      { title: 'Documentación DIAN', path: '/dian-documentation' },
    ],
  },
  {
    title: 'Contabilidad',
    path: '#',
    subNav: [
      { title: 'PUC (Plan de Cuentas)', path: '/accounting/puc' },
      { title: 'Asientos Contables', path: '/accounting/journal' },
      { title: 'Gastos / Compras', path: '/accounting/expenses' },
      { title: 'Balance General', path: '/accounting/balance-sheet' },
      { title: 'Estado de Resultados', path: '/accounting/income-statement' },
      { title: 'Libro Mayor', path: '/accounting/general-ledger' },
      { title: 'Libro Auxiliar', path: '/accounting/subsidiary-ledger' },
      { title: 'Conciliación Bancaria', path: '/accounting/bank-reconciliation' },
      { title: 'Certificados Retención', path: '/accounting/withholding-certificates' },
      { title: 'Auditoría', path: '/accounting/audit-log' },
      { title: 'Cierre Contable', path: '/accounting/closing' },
      { title: 'Nómina', path: '/accounting/payroll' },
      { title: 'Declaración IVA', path: '/accounting/tax/iva' },
      { title: 'Retención en la Fuente', path: '/accounting/tax/retefuente' },
      { title: 'Flujo de Caja', path: '/accounting/reports/cash-flow' },
      { title: 'Cartera por Edades', path: '/accounting/reports/aging' },
      { title: 'Presupuesto', path: '/accounting/budget' },
      { title: 'Activos Fijos', path: '/accounting/assets' },
      { title: 'Indicadores Financieros', path: '/accounting/reports/indicators' },
      { title: 'Información Exógena', path: '/accounting/exogena' },
      { title: '📖 Manual Contable', path: '/manual-contabilidad' },
    ],
  },
  {
    title: 'Logs App',
    path: '#',
    subNav: [
      { title: 'Logs', path: '/logs' },
    ],
  },
];

const Menu = ({ isMenuOpen, toggleMenu }) => {
  const { isAuthenticated, logout } = useContext(AuthContext);

  const closeMenu = () => {
    // Esta función ahora solo se usa para cerrar el menú en móvil al hacer clic en un enlace
    if (window.innerWidth < 960) {
      toggleMenu();
    }
  }

  return (
    <nav className={`navbar ${isMenuOpen ? '' : 'closed'}`}>
      <div className="navbar-container">
        {isAuthenticated && (
          <ul className="nav-menu">
            {menuData.map((item, index) => (
              <SubMenu item={item} key={index} closeMenu={closeMenu} isMenuOpen={isMenuOpen} />
            ))}
          </ul>
        )}
        <div className="menu-footer">
          <button onClick={logout} className="nav-links-button">Cerrar Sesión</button>
        </div>
      </div>
    </nav>
  );
};

export default Menu;
