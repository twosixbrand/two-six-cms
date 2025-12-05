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
      { title: 'Type Clothing', path: '/type-clothing' },
      { title: 'Category', path: '/category' },
      { title: 'Design', path: '/master-design' },
      { title: 'Design Clothing', path: '/design-clothing' },
      { title: 'Product', path: '/product' },
    ],
  },
  {
    title: 'Ventas',
    path: '#',
    subNav: [
      { title: 'Pedidos', path: '/order' },
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
      { title: 'Color', path: '/color' },
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
  {
    title: 'Configuración',
    path: '#',
    subNav: [
      { title: 'Ubicaciones', path: '/locations' },
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
