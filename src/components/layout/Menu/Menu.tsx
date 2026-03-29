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
      { title: 'Design', path: '/master-design', permission: 'inventory.design.view' },
      { title: 'Clothing Color', path: '/clothing-color', permission: 'inventory.clothing-color.view' },
      { title: 'Image Clothing', path: '/image-clothing', permission: 'inventory.image-clothing.view' },
      { title: 'Product', path: '/product', permission: 'inventory.product.view' },
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
      { title: 'Retiros en Tienda', path: '/reports/pickup-dashboard', permission: 'sales.pickup.view' },
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
      { title: 'Year Production', path: '/year-production', permission: 'catalog.year-production.view' },
      { title: 'Season', path: '/season', permission: 'catalog.season.view' },
      { title: 'Collection', path: '/collection', permission: 'catalog.collection.view' },
      { title: 'Production type', path: '/production-type', permission: 'catalog.production-type.view' },
      { title: 'Type Clothing', path: '/type-clothing', permission: 'catalog.type-clothing.view' },
      { title: 'Category', path: '/category', permission: 'catalog.category.view' },
      { title: 'Color', path: '/color', permission: 'catalog.color.view' },
      { title: 'Guia de Tallas', path: '/size-guide', permission: 'catalog.size-guide.view' },
      { title: 'Ubicaciones', path: '/locations', permission: 'catalog.locations.view' },
    ],
  },
  {
    title: 'Users / providers',
    path: '#',
    permission: 'admin',
    subNav: [
      { title: 'Provider', path: '/provider', permission: 'admin.provider.view' },
      { title: 'Clientes', path: '/customer', permission: 'admin.customer.view' },
      { title: 'User', path: '/user', permission: 'admin.user.view' },
      { title: 'Role', path: '/role', permission: 'admin.role.view' },
      { title: 'User Roles', path: '/user-role', permission: 'admin.user-role.view' },
      { title: 'Gestion de Permisos', path: '/permissions', permission: 'admin.permissions.view' },
      { title: 'Suscriber', path: '/subscriber', permission: 'admin.subscriber.view' },
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
      { title: 'Balance General', path: '/accounting/balance-sheet', permission: 'accounting.balance-sheet.view' },
      { title: 'Estado de Resultados', path: '/accounting/income-statement', permission: 'accounting.income-statement.view' },
      { title: 'Libro Mayor', path: '/accounting/general-ledger', permission: 'accounting.general-ledger.view' },
      { title: 'Libro Auxiliar', path: '/accounting/subsidiary-ledger', permission: 'accounting.subsidiary-ledger.view' },
      { title: 'Conciliacion Bancaria', path: '/accounting/bank-reconciliation', permission: 'accounting.bank-reconciliation.view' },
      { title: 'Certificados Retencion', path: '/accounting/withholding-certificates', permission: 'accounting.withholding-certificates.view' },
      { title: 'Auditoria', path: '/accounting/audit-log', permission: 'accounting.audit-log.view' },
      { title: 'Cierre Contable', path: '/accounting/closing', permission: 'accounting.closing.view' },
      { title: 'Nomina', path: '/accounting/payroll', permission: 'accounting.payroll.view' },
      { title: 'Declaracion IVA', path: '/accounting/tax/iva', permission: 'accounting.tax.iva.view' },
      { title: 'Retencion en la Fuente', path: '/accounting/tax/retefuente', permission: 'accounting.tax.retefuente.view' },
      { title: 'Flujo de Caja', path: '/accounting/reports/cash-flow', permission: 'accounting.reports.cash-flow.view' },
      { title: 'Cartera por Edades', path: '/accounting/reports/aging', permission: 'accounting.reports.aging.view' },
      { title: 'Presupuesto', path: '/accounting/budget', permission: 'accounting.budget.view' },
      { title: 'Activos Fijos', path: '/accounting/assets', permission: 'accounting.assets.view' },
      { title: 'Indicadores Financieros', path: '/accounting/reports/indicators', permission: 'accounting.reports.indicators.view' },
      { title: 'Informacion Exogena', path: '/accounting/exogena', permission: 'accounting.exogena.view' },
      { title: 'Manual Contable', path: '/manual-contabilidad', permission: 'accounting.manual.view' },
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
