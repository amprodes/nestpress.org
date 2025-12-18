import * as React from 'react';
import type { Menu, Widget, SiteSettings } from '@/types';

interface FooterProps {
  footerMenu?: Menu;
  footerWidgets?: Widget[];
  header?: SiteSettings;
}

export function Footer({ footerMenu, footerWidgets = [], header }: FooterProps) {
  return (
    <footer className="border-t mt-12" style={{ borderColor: '#666666' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8 mb-8">
          {footerWidgets.map(widget => (
            <div key={widget.id}>
              <h3 className="font-bold mb-4">{widget.title}</h3>
              <div>{widget.content}</div>
            </div>
          ))}
        </div>
        <div className="border-t pt-6" style={{ borderColor: '#666666' }}>
          <p>&copy; {new Date().getFullYear()} {header?.general.siteTitle}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
