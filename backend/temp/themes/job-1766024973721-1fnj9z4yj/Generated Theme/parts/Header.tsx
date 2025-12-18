import React from 'react';
import type { Menu, HeaderSettings } from '@/types';

interface HeaderProps {
  primaryMenu?: Menu;
  header?: HeaderSettings;
}

export const Header: React.FC<HeaderProps> = ({ primaryMenu, header }) => {
  const menuItems = primaryMenu?.items 
    ? [...primaryMenu.items].sort((a, b) => (a.order || 0) - (b.order || 0)) 
    : [];

  const siteName = header?.siteName || 'Site Title';
  const tagline = header?.tagline;

  return (
    <header className="border-b" style={{ borderColor: '#64748b' }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 style={{ color: '#2563eb' }}>
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
};