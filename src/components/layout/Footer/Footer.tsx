import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiLinkedin, FiExternalLink } from 'react-icons/fi';
import logoUrl from '../../../assets/logo.png';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-brand">
          <NavLink to="/" className="footer-logo-link">
            <img src={logoUrl} alt="Two Six Logo" className="footer-logo" />
          </NavLink>
          <p className="footer-description">
            Plataforma integral de gestión para el ecosistema Two Six.
            Optimización de inventario, ventas y procesos logísticos con tecnología de vanguardia.
          </p>
          <div className="footer-socials">
            <a href="#" className="footer-social-link" aria-label="Instagram"><FiInstagram /></a>
            <a href="#" className="footer-social-link" aria-label="Facebook"><FiFacebook /></a>
            <a href="#" className="footer-social-link" aria-label="Twitter"><FiTwitter /></a>
            <a href="#" className="footer-social-link" aria-label="LinkedIn"><FiLinkedin /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-links-section">
          <h4 className="footer-section-title">Navegación</h4>
          <ul className="footer-links">
            <li><NavLink to="/" className="footer-link">Dashboard</NavLink></li>
            <li><NavLink to="/clothing" className="footer-link">Inventario</NavLink></li>
            <li><NavLink to="/order" className="footer-link">Ventas</NavLink></li>
            <li><NavLink to="/product" className="footer-link">Catálogo</NavLink></li>
          </ul>
        </div>

        {/* Resources */}
        <div className="footer-links-section">
          <h4 className="footer-section-title">Soporte</h4>
          <ul className="footer-links">
            <li><NavLink to="/logs" className="footer-link">Logs de Sistema</NavLink></li>
            <li><a href="#" className="footer-link flex items-center gap-2">Documentación <FiExternalLink className="inline h-3 w-3" /></a></li>
            <li><a href="#" className="footer-link">Reportar Bug</a></li>
            <li><a href="#" className="footer-link">Ayuda Directa</a></li>
          </ul>
        </div>

        {/* Legal / Stats (Optional premium touch) */}
        <div className="footer-links-section">
          <h4 className="footer-section-title">Estatus</h4>
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-bold text-white/60 tracking-wider">twosixmarca@gmail.com</span>
            </div>
            <p className="text-[11px] text-[#94a3b8] leading-relaxed">
              Última actualización: 01 Mar, 2026.
              Conectado a Two Six Cloud v2.4.0
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-copyright">
          &copy; {currentYear} | POWERED BY TWO SIX <span className="hidden sm:inline"> | </span>
          <span className="text-white/80 font-bold ml-1">twosixmarca@gmail.com</span>
        </div>
        <div className="footer-version">
          v2.6.0-PREMIUM
        </div>
      </div>
    </footer>
  );
};

export default Footer;
