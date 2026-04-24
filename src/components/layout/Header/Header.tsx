import React, { useState, useEffect, useContext, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { formatDateTime } from '../../../utils/dateFormat';
import './Header.css';
import logoUrl from '../../../assets/logo-gorilla.png';

const getInitials = (email) => {
  if (!email) return '??';
  const localPart = email.split('@')[0];
  if (localPart.length === 0) return '??';
  if (localPart.length === 1) return localPart.toUpperCase();
  return (localPart[0] + localPart[1]).toUpperCase();
};



const Header = ({ toggleMenu }) => {
  const { userEmail } = useContext(AuthContext);
  const [dateTime, setDateTime] = useState(formatDateTime(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(formatDateTime(new Date()));
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  const initials = useMemo(() => getInitials(userEmail), [userEmail]);

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Left: Hamburger + Date */}
        <div className="header-left">
          <button
            className="menu-toggle-header"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className="hamburger-icon">
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </span>
          </button>

          <div className="header-datetime">
            <svg className="datetime-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="datetime-text">{dateTime}</span>
          </div>
        </div>

        {/* Center: Title */}
        <NavLink to="/" className="header-title-link">
          <h1 className="header-title">Two Six CMS</h1>
        </NavLink>

        {/* Right: User + Logo */}
        <div className="header-right">
          <div className="header-user">
            <div className="user-avatar">
              <span className="user-initials">{initials}</span>
            </div>
            <span className="user-email">{userEmail || 'usuario'}</span>
          </div>

          <NavLink to="/" className="header-logo-link">
            <img src={logoUrl} alt="Logo" className="header-logo-image" />
          </NavLink>
        </div>
      </div>
    </header>
  );
};

export default Header;
