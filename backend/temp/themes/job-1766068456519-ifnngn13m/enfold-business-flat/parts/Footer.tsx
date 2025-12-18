import React from 'react';
import type { Menu, Widget, SiteSettings } from '@/types';

interface FooterProps {
  footerMenu?: Menu;
  footerWidgets?: Widget[];
  header?: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ footerMenu, footerWidgets = [], header }) => {
  const menuItems = footerMenu?.items?.sort((a, b) => a.order - b.order) || [];
  const siteName = header?.general?.siteTitle || 'Site Name';
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="site-footer">
      <div className="footer-content">
        {footerWidgets.length > 0 && (
          <div className="footer-widgets">
            {footerWidgets.map((widget) => (
              <div key={widget.id} className="footer-widget">
                <h4 className="widget-title">{widget.title}</h4>
                <div 
                  className="widget-content"
                  dangerouslySetInnerHTML={{ __html: widget.content }}
                />
              </div>
            ))}
          </div>
        )}
        
        {menuItems.length > 0 && (
          <nav className="footer-navigation">
            {menuItems.map((item) => (
              <a 
                key={item.id} 
                href={item.url}
                target={item.target || '_self'}
                className="footer-link"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
        
        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} {siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
