import React from 'react';
import type { Menu, SiteSettings } from '@/types';

interface HeaderProps {
  primaryMenu?: Menu;
  header?: SiteSettings;
}

export function Header({ primaryMenu, header }: HeaderProps) {
  return (
    <header className="border-b" style={{ borderColor: '#64748b' }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 style={{ color: '#2563eb' }}>
          {header?.general.siteTitle || 'Site Title'}
        </h1>
        <nav className="mt-4">
          {primaryMenu?.items.map(item => (
            <a key={item.id} href={item.url} className="mr-6 hover:opacity-80">
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
