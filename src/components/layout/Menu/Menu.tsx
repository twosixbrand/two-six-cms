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
    ],
  },
  {
    title: 'Users / providers',
    path: '#',
    subNav: [
      { title: 'Provider', path: '/provider' },
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
