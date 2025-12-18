import React from 'react';
import { Menu, Widget, HeaderSettings } from '../../../types';

export interface FooterProps {
  footerMenu?: Menu;
  footerWidgets?: Widget[];
  header?: HeaderSettings;
}

export const Footer: React.FC<FooterProps> = ({ footerMenu, footerWidgets, header }) => {
  const menuItems = footerMenu?.items || [];
  const siteName = header?.siteName || 'Site Name';

  return (
    <footer style={{
      background: '#1e293b',
      color: '#ffffff',
      padding: '3rem 0 1.5rem',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        {/* Footer Widgets */}
        {footerWidgets && footerWidgets.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(1, 1fr)',
            gap: '2rem',
            marginBottom: '2rem',
          }}>
            {footerWidgets.map((widget) => (
              <div key={widget.id}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>{widget.title}</h3>
                <div dangerouslySetInnerHTML={{ __html: widget.content }} />
              </div>
            ))}
          </div>
        )}

        {/* Footer Navigation */}
        {menuItems.length > 0 && (
          <nav style={{ marginBottom: '2rem' }}>
            <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}>
              {menuItems.map((item) => (
                <li key={item.id}>
                  <a href={item.url} style={{ color: '#ffffff', textDecoration: 'none' }}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Copyright */}
        <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid #ffffff30' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>
            `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`
          </p>
        </div>
      </div>
    </footer>
  );
};
