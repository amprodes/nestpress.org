import * as React from 'react';
import type { Menu, SiteSettings } from '@/types';

interface HeaderProps {
  primaryMenu?: Menu;
  header?: SiteSettings;
}

export function Header({ primaryMenu, header }: HeaderProps) {
  const colors = {
    secondary: '#64748b',
    primary: '#2563eb'
  };

  const menuItems = [...(primaryMenu?.items || [])].sort((a, b) => a.order - b.order);
  const siteName = header?.general?.siteTitle || 'Site Title';

  return (
    <header className="border-b" style={{ borderColor: colors.secondary }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 style={{ color: colors.primary }}>
          {siteName}
        </h1>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <a key={item.id} href={item.url} className="mr-6 hover:opacity-80">
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}