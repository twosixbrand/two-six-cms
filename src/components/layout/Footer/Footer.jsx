import React from 'react';
import './Footer.css';

import { TikTokIcon, PinterestIcon } from '../../common/Icons';
import instagramIconUrl from '../../../assets/icons/instagram.svg';
import facebookIconUrl from '../../../assets/icons/facebook.svg';
import youtubeIconUrl from '../../../assets/icons/youtube.svg';
import xIconUrl from '../../../assets/icons/x.svg';
import brandLogoUrl from '../../../assets/logo.png';

const socialLinks = [
  { name: 'Instagram', url: 'https://instagram.com/twosix.brand/', iconUrl: instagramIconUrl },
  { name: 'Facebook', url: 'https://www.facebook.com/share/17Xesk5dkT/?mibextid=wwXIfr', iconUrl: facebookIconUrl },
  { name: 'YouTube', url: 'https://www.youtube.com/@twosix-brand', iconUrl: youtubeIconUrl },
  { name: 'TikTok', url: 'https://www.tiktok.com/@twosix_brand', IconComponent: () => <TikTokIcon className="social-icon" /> },
  { name: 'Pinterest', url: 'https://pinterest.com/twosix_brand', IconComponent: () => <PinterestIcon className="social-icon" /> },
  { name: 'X', url: 'https://x.com/twosix_brand', iconUrl: xIconUrl },
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
              {social.IconComponent ? (
                <social.IconComponent />
              ) : (
                <img src={social.iconUrl} alt={social.name} className="social-icon" />
              )}
            </a>
          ))}
        </div>
        <div className="brand-logo-container">
          {/* El logo se importa para que Vite gestione la ruta */}
          <img src={brandLogoUrl} alt="Two Six Brand" className="brand-logo" />
        </div>
        <div className="footer-bottom-text">
          © {new Date().getFullYear()} Two Six S.A.S. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;