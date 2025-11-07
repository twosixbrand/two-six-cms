import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const SubMenu = ({ item, closeMenu }) => {
  const [subnav, setSubnav] = useState(false);

  const showSubnav = () => setSubnav(!subnav);

  return (
    <li className="nav-item"> {/* Cambiado de fragmento a li */}
      <div className="nav-links" onClick={item.subNav && showSubnav}>
        <span>{item.title}</span>
        <span className="subnav-arrow">
          {item.subNav && (subnav ? '▲' : '▼')}
        </span>
      </div>
      {subnav && (
        <ul className="dropdown-menu"> {/* ul anidado para los sub-elementos */}
          {item.subNav.map((subItem, index) => (
            <li key={index}> {/* Envuelve cada sub-elemento NavLink en un li */}
              <NavLink to={subItem.path} className="dropdown-link" onClick={closeMenu}>
                {subItem.title}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default SubMenu;