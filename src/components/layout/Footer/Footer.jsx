import React from 'react';
import './Footer.css';

import InstagramIcon from '../../../assets/icons/instagram.svg';
import FacebookIcon from '../../../assets/icons/facebook.svg';
import YoutubeIcon from '../../../assets/icons/youtube.svg';
import TiktokIcon from '../../../assets/icons/tiktok.svg';
import PinterestIcon from '../../../assets/icons/pinterest.svg';
import XIcon from '../../../assets/icons/x.svg';

const socialLinks = [
  { name: 'Instagram', url: 'https://instagram.com/twosix.brand/', icon: InstagramIcon },
  { name: 'Facebook', url: 'https://www.facebook.com/share/17Xesk5dkT/?mibextid=wwXIfr', icon: FacebookIcon },
  { name: 'YouTube', url: 'https://www.youtube.com/@twosix-brand', icon: YoutubeIcon },
  { name: 'TikTok', url: 'https://www.tiktok.com/@twosix_brand', icon: TiktokIcon },
  { name: 'Pinterest', url: 'https://www.tiktok.com/@twosix_brand', icon: PinterestIcon },
  { name: 'X', url: 'https://x.com/twosix_brand', icon: XIcon },
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
              <img src={social.icon} alt={social.name} className="social-icon" />
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