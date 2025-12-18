import React from 'react';
import { Menu, HeaderSettings } from '../../../types';

export interface HeaderProps {
  primaryMenu?: Menu;
  header?: HeaderSettings;
}

export const Header: React.FC<HeaderProps> = ({ primaryMenu, header }) => {
  const menuItems = primaryMenu?.items || [];
  const siteName = header?.siteName || 'Site Name';
  const tagline = header?.tagline || '';

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #64748b20',
      position: 'sticky', top: 0, zIndex: 1000,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo/Brand */}
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
            {siteName}
          </h1>
          {tagline && <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>{tagline}</p>}
        </div>

        {/* Navigation */}
        <nav>
          <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}>
            {menuItems.sort((a, b) => a.order - b.order).map((item) => (
              <li key={item.id}>
                <a
                  href={item.url}
                  target={item.target}
                  style={{
                    color: '#1e293b',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'color 0.2s',
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};
