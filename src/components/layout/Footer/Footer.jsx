import React from 'react';
import './Footer.css';

import { TikTokIcon, PinterestIcon } from '../../common/Icons';

const socialLinks = [
  // Para mantener la consistencia, idealmente todos los íconos deberían ser componentes React.
  // Por ahora, solo modificamos TikTok y Pinterest como se solicitó.
  { name: 'Instagram', url: 'https://instagram.com/twosix.brand/', IconComponent: () => <img src="/src/assets/icons/instagram.svg" alt="Instagram" className="social-icon" /> },
  { name: 'Facebook', url: 'https://www.facebook.com/share/17Xesk5dkT/?mibextid=wwXIfr', IconComponent: () => <img src="/src/assets/icons/facebook.svg" alt="Facebook" className="social-icon" /> },
  { name: 'YouTube', url: 'https://www.youtube.com/@twosix-brand', IconComponent: () => <img src="/src/assets/icons/youtube.svg" alt="YouTube" className="social-icon" /> },
  { name: 'TikTok', url: 'https://www.tiktok.com/@twosix_brand', IconComponent: () => <TikTokIcon className="social-icon" /> },
  { name: 'Pinterest', url: 'https://pinterest.com/twosix_brand', IconComponent: () => <PinterestIcon className="social-icon" /> },
  { name: 'X', url: 'https://x.com/twosix_brand', IconComponent: () => <img src="/src/assets/icons/x.svg" alt="X" className="social-icon" /> },
];

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="social-media">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              className="social-icon-link"
            >
              <social.IconComponent />
            </a>
          ))}
        </div>
        <div className="brand-logo-container">
          {/* Asumiendo que el logo está en public/teo-six-logo.png */}
          <img src="/src/assets/two-six-logo.png" alt="Two Six Brand" className="brand-logo" />
        </div>
        <div className="footer-bottom-text">
          © {new Date().getFullYear()} Two Six S.A.S. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;