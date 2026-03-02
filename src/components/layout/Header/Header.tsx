import React, { useState, useEffect, useContext, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import './Header.css';
import logoUrl from '../../../assets/logo.png';

/**
 * Extrae las iniciales de un email.
 * Ej: "jmanrique@gmail.com" → "JM" (primera letra + primera consonante/letra del local part)
 *     "admin@test.com"      → "AD"
 */
const getInitials = (email) => {
  if (!email) return '??';
  const localPart = email.split('@')[0]; // "jmanrique"
  if (localPart.length === 0) return '??';
  if (localPart.length === 1) return localPart.toUpperCase();
  return (localPart[0] + localPart[1]).toUpperCase();
};

/**
 * Formatea la fecha y hora actual en formato compacto.
 * Ej: "Mar 01, 2026 | 10:43 PM"
 */
const formatDateTime = (date) => {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const month = months[date.getMonth()];
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${month} ${day}, ${year} | ${hours}:${minutes} ${ampm}`;
};

const Header = ({ toggleMenu }) => {
  const { userEmail } = useContext(AuthContext);
  const [dateTime, setDateTime] = useState(formatDateTime(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(formatDateTime(new Date()));
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(timer);
  }, []);

  const initials = useMemo(() => getInitials(userEmail), [userEmail]);

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Left Section: Hamburger + Date/Time */}
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

          {/* Date/Time - right after hamburger */}
          <div className="header-datetime">
            <svg className="datetime-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="datetime-text">{dateTime}</span>
          </div>
        </div>

        {/* Title - Center */}
        <NavLink to="/" className="header-title-link">
          <h1 className="header-title">Two Six Cms</h1>
        </NavLink>

        {/* Right Section: User + Logo */}
        <div className="header-right">
          {/* User Info */}
          <div className="header-user">
            <div className="user-avatar">
              <span className="user-initials">{initials}</span>
            </div>
            <span className="user-email">{userEmail || 'usuario'}</span>
          </div>

          {/* Logo - with light background gradient zone */}
          <NavLink to="/" className="header-logo-link">
            <img src={logoUrl} alt="Logo" className="header-logo-image" />
          </NavLink>
        </div>
      </div>
    </header>
  );
};

export default Header;