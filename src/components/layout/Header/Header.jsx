import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';
import logoUrl from '../../../assets/logo.png'; // Importar el logo

const Header = ({ toggleMenu }) => {
  return (
    <header className="app-header">
      <div className="header-container">
        <button className="menu-toggle-header" onClick={toggleMenu}>☰</button>
        
        <NavLink to="/" className="header-logo-link">
          <h1 className="header-title">Two Six Cms</h1>
          <img src={logoUrl} alt="Logo" className="header-logo-image" />
        </NavLink>
      </div>
    </header>
  );
};

export default Header;