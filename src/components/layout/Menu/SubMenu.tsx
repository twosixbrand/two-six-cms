import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const SubMenu = ({ item, closeMenu, isMenuOpen }) => {
  const [subnav, setSubnav] = useState(false);

  const showSubnav = () => setSubnav(!subnav);

  return (
    <li className="nav-item">
      <div className="menu-title" onClick={item.subNav && showSubnav}>
        {/* Aquí podrías añadir un icono en el futuro */}
        <span className="menu-title-text">{item.title}</span>
        <div className={`subnav-arrow ${subnav ? 'open' : ''}`}>
          {item.subNav && (subnav ? '▲' : '▼')}
        </div>
      </div>
      
      {item.subNav && isMenuOpen && (
        <ul className={`submenu ${subnav ? 'active' : ''}`}>
          {item.subNav.map((subItem, index) => (
            <li key={index}>
              <NavLink to={subItem.path} className="dropdown-link" onClick={closeMenu}>
                <span className="dropdown-icon" style={{ visibility: 'hidden' }}>
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