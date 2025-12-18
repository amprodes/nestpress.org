import * as React from 'react';
import type { Menu, SiteSettings } from '@/types';

interface FooterProps {
  footerMenu?: Menu;
  footerWidgets?: any[];
  header?: SiteSettings;
}

export function Footer({ footerMenu, footerWidgets, header }: FooterProps) {
  const menuItems = footerMenu?.items || [];
  const siteName = header?.general.siteTitle;
  const currentYear = new Date().getFullYear();
  const colors = {
    secondary: '#64748b'
  };

  return (
    <footer className="border-t mt-12" style={{ borderColor: colors.secondary }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8 mb-8">
          {footerWidgets?.map((widget) => (
            <div key={widget.id}>
              <h3 className="font-bold mb-4">{widget.title}</h3>
              <div>{widget.content}</div>
            </div>
          ))}
        </div>
        <div className="border-t pt-6" style={{ borderColor: colors.secondary }}>
          {menuItems.length > 0 ? (
            <nav className="mb-4 flex flex-wrap gap-4">
              {menuItems.map((item) => (
                <a key={item.id} href={item.url} className="hover:underline">
                  {item.label}
                </a>
              ))}
            </nav>
          ) : null}
          <p>&copy; {currentYear} {siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}