import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

const Header = ({ toggleMenu }) => {
  return (
    <header className="app-header">
      <div className="header-container">
        <button className="menu-toggle-header" onClick={toggleMenu}>☰</button>
        
        <NavLink to="/" className="header-logo-link">
          <img src="/src/assets/logo.png" alt="Logo" className="header-logo-image" />
          <h1 className="header-title">Two Six Cms</h1>
        </NavLink>
      </div>
    </header>
  );
};

export default Header;