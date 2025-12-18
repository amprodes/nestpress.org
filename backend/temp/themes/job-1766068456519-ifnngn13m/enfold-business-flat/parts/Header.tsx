import React from 'react';
import type { Menu, SiteSettings } from '@/types';

interface HeaderProps {
  primaryMenu?: Menu;
  header?: SiteSettings;
}

export const Header: React.FC<HeaderProps> = ({ primaryMenu, header }) => {
  const menuItems = primaryMenu?.items?.sort((a, b) => a.order - b.order) || [];
  const siteName = header?.general?.siteTitle || 'Site Name';
  
  return (
    <header className="site-header">
      <div className="header-container">
        <div className="site-branding">
          <h1 className="site-title">{siteName}</h1>
          {header?.general?.tagline && (
            <p className="site-tagline">{header.general.tagline}</p>
          )}
        </div>
        
        <nav className="main-navigation">
          {menuItems.map((item) => (
            <a 
              key={item.id} 
              href={item.url}
              target={item.target || '_self'}
              className="nav-link"
            >
              {item.icon && <span className="nav-icon">{item.icon}</span>}
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};
