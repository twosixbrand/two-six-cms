import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

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
    ],
  },
  {
    title: 'Admin Usuarios',
    path: '#',
    subNav: [
      { title: 'Role', path: '/role' },
      { title: 'User', path: '/user' },
    ],
  },
  {
    title: 'Admin Maestros',
    path: '#',
    subNav: [
      { title: 'Master Design', path: '/master-design' },
      { title: 'Logs', path: '/logs' },
    ],
  },
];

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="menu-icon" onClick={toggleMenu}>
          {isOpen ? '✕' : '☰'}
        </div>
        <ul className={isOpen ? 'nav-menu active' : 'nav-menu'}>
          {menuData.map((item, index) => (
            <SubMenu item={item} key={index} closeMenu={closeMenu} />
          ))}
        </ul>
        <NavLink to="/" className="logo-text" onClick={closeMenu}>
          <span className="logo-text"><h1>Two Six CMS</h1></span>
        </NavLink>
          <NavLink to="/" className="navbar-logo" onClick={closeMenu}>
            <img src="/src/assets/logo.png" alt="Logo" className="logo-image" />
          </NavLink>
      </div>
    </nav>
  );
};

export default Menu;