/**
 * Header Part Component
 * WordPress equivalent: parts/header.html
 * Reusable header component with navigation
 */

import React from 'react';
import { Menu, MenuItem, HeaderSettings } from '../../../types';

export interface HeaderProps {
  primaryMenu?: Menu;
  header?: HeaderSettings;
  siteName?: string;
  tagline?: string;
  logoUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  primaryMenu, 
  header,
  siteName = 'NestPress',
  tagline = 'Modern Headless CMS',
  logoUrl 
}) => {
  const bgColor = header?.backgroundColor || '#ffffff';
  const textColor = header?.textColor || '#1e293b';
  const height = header?.height || 80;
  const isSticky = header?.sticky !== false;
  const showTagline = header?.showTagline;

  // Get menu items or use defaults
  const menuItems: MenuItem[] = primaryMenu?.items || [
    { id: '1', label: 'Home', url: '/', order: 0, target: '_self' },
    { id: '2', label: 'Blog', url: '/blog', order: 1, target: '_self' },
    { id: '3', label: 'About', url: '/about', order: 2, target: '_self' },
    { id: '4', label: 'Contact', url: '/contact', order: 3, target: '_self' },
  ];

  return (
    <header 
      className="site-header"
      style={{
        background: bgColor,
        borderBottom: '1px solid #e2e8f0',
        position: isSticky ? 'sticky' : 'relative',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{
        maxWidth: '1340px',
        margin: '0 auto',
        padding: '0 var(--spacing-50, 2rem)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: `${height}px`,
      }}>
        {/* Logo & Site Title */}
        <div className="site-branding">
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt={siteName}
                style={{ height: '40px', width: 'auto' }}
              />
            )}
            <div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: textColor,
                lineHeight: 1.2,
              }}>
                {header?.logoText || siteName}
              </div>
              {showTagline && (header?.tagline || tagline) && (
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: textColor, 
                  opacity: 0.7,
                  marginTop: '0.25rem'
                }}>
                  {header?.tagline || tagline}
                </div>
              )}
            </div>
          </a>
        </div>

        {/* Primary Navigation */}
        <nav className="primary-navigation" aria-label="Primary">
          <ul style={{ 
            display: 'flex', 
            gap: '2rem', 
            listStyle: 'none',
            margin: 0,
            padding: 0,
            alignItems: 'center'
          }}>
            {menuItems
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map(item => (
                <li key={item.id}>
                  <a 
                    href={item.url} 
                    target={item.target || '_self'}
                    style={{ 
                      color: textColor, 
                      textDecoration: 'none', 
                      fontWeight: 500,
                      opacity: 0.9,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
                  >
                    {item.icon && <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>}
                    {item.label}
                  </a>
                </li>
              ))}
            
            {/* Admin Link */}
            <li>
              <a href="/admin" style={{
                background: 'var(--color-accent-3, #2563eb)',
                color: '#fff',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontWeight: 500,
                display: 'inline-block',
                transition: 'transform 0.2s',
              }}>
                Admin
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
