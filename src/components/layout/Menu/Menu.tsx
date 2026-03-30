import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

import './Menu.css';
import SubMenu from './SubMenu';

const menuData = [
  {
    title: 'Admin Prendas',
    path: '#',
    permission: 'inventory',
    subNav: [
      { title: 'Clothing', path: '/clothing', permission: 'inventory.clothing.view' },
      { title: 'Design', path: '/master-design', permission: 'inventory.clothing.view' },
      { title: 'Clothing Color', path: '/clothing-color', permission: 'inventory.clothing.view' },
      { title: 'Image Clothing', path: '/image-clothing', permission: 'inventory.images.manage' },
      { title: 'Product', path: '/product', permission: 'inventory.products.view' },
      { title: 'Stock', path: '/stock', permission: 'inventory.stock.view' },
    ],
  },
  {
    title: 'Reports',
    path: '#',
    permission: 'sales.reports.view',
    subNav: [
      { title: 'Pedidos', path: '/order', permission: 'sales.orders.view' },
      { title: 'General Sales', path: '/reports/sales/general', permission: 'sales.reports.view' },
      { title: 'Facturacion DIAN', path: '/dian-invoices', permission: 'sales.dian.view' },
      { title: 'Retiros en Tienda', path: '/reports/pickup-dashboard', permission: 'sales.orders.view' },
    ],
  },
  {
    title: 'Atencion Cliente',
    path: '#',
    permission: 'sales.customers.view',
    subNav: [
      { title: 'Gestion PQR', path: '/pqr', permission: 'sales.customers.view' },
    ],
  },
  {
    title: 'Admin Maestros',
    path: '#',
    permission: 'catalog',
    subNav: [
      { title: 'Year Production', path: '/year-production', permission: 'catalog.seasons.view' },
      { title: 'Season', path: '/season', permission: 'catalog.seasons.view' },
      { title: 'Collection', path: '/collection', permission: 'catalog.collections.view' },
      { title: 'Production type', path: '/production-type', permission: 'catalog.categories.view' },
      { title: 'Type Clothing', path: '/type-clothing', permission: 'catalog.categories.view' },
      { title: 'Category', path: '/category', permission: 'catalog.categories.view' },
      { title: 'Color', path: '/color', permission: 'catalog.colors.view' },
      { title: 'Guia de Tallas', path: '/size-guide', permission: 'catalog.sizes.view' },
      { title: 'Ubicaciones', path: '/locations', permission: 'catalog.categories.view' },
    ],
  },
  {
    title: 'Users / providers',
    path: '#',
    permission: 'admin',
    subNav: [
      { title: 'Provider', path: '/provider', permission: 'catalog.providers.view' },
      { title: 'Clientes', path: '/customer', permission: 'sales.customers.view' },
      { title: 'User', path: '/user', permission: 'admin.users.view' },
      { title: 'Role', path: '/role', permission: 'admin.roles.view' },
      { title: 'User Roles', path: '/user-role', permission: 'admin.roles.view' },
      { title: 'Gestion de Permisos', path: '/permissions', permission: 'admin.permissions.manage' },
      { title: 'Suscriber', path: '/subscriber', permission: 'sales.customers.view' },
    ],
  },
  {
    title: 'Plan Estrategico',
    path: '#',
    permission: 'sales.orders.view',
    subNav: [
      { title: 'Ver plan', path: '/plan-estrategico', permission: 'sales.orders.view' },
      { title: 'Documentacion DIAN', path: '/dian-documentation', permission: 'sales.dian.view' },
    ],
  },
  {
    title: 'Contabilidad',
    path: '#',
    permission: 'accounting',
    subNav: [
      { title: 'PUC (Plan de Cuentas)', path: '/accounting/puc', permission: 'accounting.puc.view' },
      { title: 'Asientos Contables', path: '/accounting/journal', permission: 'accounting.journal.view' },
      { title: 'Gastos / Compras', path: '/accounting/expenses', permission: 'accounting.expenses.view' },
      { title: 'Balance General', path: '/accounting/balance-sheet', permission: 'accounting.reports.view' },
      { title: 'Estado de Resultados', path: '/accounting/income-statement', permission: 'accounting.reports.view' },
      { title: 'Libro Mayor', path: '/accounting/general-ledger', permission: 'accounting.reports.view' },
      { title: 'Libro Auxiliar', path: '/accounting/subsidiary-ledger', permission: 'accounting.reports.view' },
      { title: 'Conciliacion Bancaria', path: '/accounting/bank-reconciliation', permission: 'accounting.bank.view' },
      { title: 'Certificados Retencion', path: '/accounting/withholding-certificates', permission: 'accounting.withholding.view' },
      { title: 'Auditoria', path: '/accounting/audit-log', permission: 'accounting.audit.view' },
      { title: 'Cierre Contable', path: '/accounting/closing', permission: 'accounting.closing.manage' },
      { title: 'Nomina', path: '/accounting/payroll', permission: 'accounting.payroll.view' },
      { title: 'Declaracion IVA', path: '/accounting/tax/iva', permission: 'accounting.tax.view' },
      { title: 'Retencion en la Fuente', path: '/accounting/tax/retefuente', permission: 'accounting.tax.view' },
      { title: 'Flujo de Caja', path: '/accounting/reports/cash-flow', permission: 'accounting.reports.view' },
      { title: 'Cartera por Edades', path: '/accounting/reports/aging', permission: 'accounting.reports.view' },
      { title: 'Presupuesto', path: '/accounting/budget', permission: 'accounting.budget.view' },
      { title: 'Activos Fijos', path: '/accounting/assets', permission: 'accounting.assets.view' },
      { title: 'Indicadores Financieros', path: '/accounting/reports/indicators', permission: 'accounting.indicators.view' },
      { title: 'Informacion Exogena', path: '/accounting/exogena', permission: 'accounting.exogena.view' },
      { title: 'Manual Contable', path: '/manual-contabilidad', permission: 'accounting.reports.view' },
    ],
  },
  {
    title: 'Logs App',
    path: '#',
    permission: 'admin.logs.view',
    subNav: [
      { title: 'Logs', path: '/logs', permission: 'admin.logs.view' },
    ],
  },
];

const Menu = ({ isMenuOpen, toggleMenu }) => {
  const { isAuthenticated, logout, hasPermission, hasGroupPermission, userPermissions } = useContext(AuthContext);

  const closeMenu = () => {
    // Esta funcion ahora solo se usa para cerrar el menu en movil al hacer clic en un enlace
    if (window.innerWidth < 960) {
      toggleMenu();
    }
  }

  // Filtrar menu segun permisos del usuario
  const filteredMenu = menuData
    .filter((item) => {
      if (!userPermissions || userPermissions.length === 0) return true; // sin restricciones (legacy)
      if (!item.permission) return true;
      return hasGroupPermission(item.permission);
    })
    .map((item) => ({
      ...item,
      subNav: item.subNav?.filter((sub) => {
        if (!userPermissions || userPermissions.length === 0) return true;
        if (!sub.permission) return true;
        return hasPermission(sub.permission);
      }),
    }))
    .filter((item) => !item.subNav || item.subNav.length > 0); // Ocultar padres sin hijos visibles

  return (
    <nav className={`navbar ${isMenuOpen ? '' : 'closed'}`}>
      <div className="navbar-container">
        {isAuthenticated && (
          <ul className="nav-menu">
            {filteredMenu.map((item, index) => (
              <SubMenu item={item} key={index} closeMenu={closeMenu} isMenuOpen={isMenuOpen} />
            ))}
          </ul>
        )}
        <div className="menu-footer">
          <button onClick={logout} className="nav-links-button">Cerrar Sesion</button>
        </div>
      </div>
    </nav>
  );
};

export default Menu;
