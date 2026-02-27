import React from 'react';
import './Header.css';

const Header = ({ toggleMenu }) => {
  return (
    <header className="app-header">
      <div className="header-container">
        <button className="menu-toggle-header" onClick={toggleMenu}>
          ☰
        </button>
        <h1 className="header-title">Two Six Cms</h1>
      </div>
    </header>
  );
};

export default Header;