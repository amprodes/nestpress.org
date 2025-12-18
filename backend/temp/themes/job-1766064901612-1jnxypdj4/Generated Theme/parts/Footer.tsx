import React from 'react';
import type { Menu, Widget, HeaderSettings } from '@/types';

interface FooterProps {
  footerMenu?: Menu;
  footerWidgets?: Widget[];
  header?: HeaderSettings;
}

export const Footer: React.FC<FooterProps> = ({ 
  footerMenu, 
  footerWidgets = [], 
  header 
}) => {
  const menuItems = footerMenu?.items || [];
  const siteName = header?.general?.siteTitle || '';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t mt-12" style={{ borderColor: '#64748b' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8 mb-8">
          {footerWidgets && footerWidgets.map((widget) => (
            <div key={widget.id}>
              <h3 className="font-bold mb-4">{widget.title}</h3>
              <div dangerouslySetInnerHTML={{ __html: widget.content }} />
            </div>
          ))}
        </div>
        <div className="border-t pt-6" style={{ borderColor: '#64748b' }}>
          {menuItems.length > 0 && (
            <nav className="mb-4 flex gap-4">
              {menuItems.map((item) => (
                <a key={item.id} href={item.url}>
                  {item.label}
                </a>
              ))}
            </nav>
          )}
          <p>&copy; {currentYear} {siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};