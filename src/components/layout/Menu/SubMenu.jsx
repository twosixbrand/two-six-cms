import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const SubMenu = ({ item, closeMenu }) => {
  const [subnav, setSubnav] = useState(false);

  const showSubnav = () => setSubnav(!subnav);

  return (
    <li className="nav-item"> {/* Contenedor principal del elemento del menú */}
      <NavLink to={item.path} className="nav-links" onClick={item.subNav && showSubnav}>
        <span>{item.title}</span>
        <span className="subnav-arrow">
          {item.subNav && (subnav ? '▲' : '▼')}
        </span>
      </NavLink>
      {/* El submenú se renderiza siempre, pero se muestra/oculta con CSS */}
      {item.subNav && (
        <ul className={`dropdown-menu ${subnav ? 'active' : ''}`}>
          {item.subNav.map((subItem, index) => (
            <li key={index}>
              <NavLink to={subItem.path} className="dropdown-link" onClick={closeMenu}>
                <span className="dropdown-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </span>
                <span>{subItem.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default SubMenu;