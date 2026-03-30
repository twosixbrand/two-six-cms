import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-copyright">
          &copy; {currentYear} Two Six S.A.S.
        </span>
        <span className="footer-version">v2.6.0</span>
      </div>
    </footer>
  );
};

export default Footer;
