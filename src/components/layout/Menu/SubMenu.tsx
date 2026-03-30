import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';

const SubMenu = ({ item, closeMenu, isMenuOpen }) => {
  const [subnav, setSubnav] = useState(false);

  const showSubnav = () => setSubnav(!subnav);

  return (
    <li className="nav-item">
      <div className="menu-title" onClick={item.subNav && showSubnav}>
        <span className="menu-title-text">{item.title}</span>
        {item.subNav && (
          <span className={`subnav-arrow ${subnav ? 'open' : ''}`}>
            <FiChevronDown size={14} />
          </span>
        )}
      </div>

      {item.subNav && isMenuOpen && (
        <ul className={`submenu ${subnav ? 'active' : ''}`}>
          {item.subNav.map((subItem, index) => (
            <li key={index}>
              <NavLink to={subItem.path} className="dropdown-link" onClick={closeMenu}>
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
