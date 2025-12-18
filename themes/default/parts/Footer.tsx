/**
 * Footer Part Component
 * WordPress equivalent: parts/footer.html
 * Reusable footer component with widgets and navigation
 */

import React from 'react';
import { Menu, MenuItem, Widget, HeaderSettings } from '../../../types';

export interface FooterProps {
  footerMenu?: Menu;
  footerWidgets?: Widget[];
  header?: HeaderSettings;
  siteName?: string;
  tagline?: string;
}

export const Footer: React.FC<FooterProps> = ({ 
  footerMenu, 
  footerWidgets,
  header,
  siteName = 'NestPress',
  tagline = 'Modern Headless CMS'
}) => {
  const textColor = '#ffffff';
  const bgColor = '#1e293b';
  
  const menuItems: MenuItem[] = footerMenu?.items || [
    { id: '1', label: 'Privacy Policy', url: '/privacy', order: 0, target: '_self' },
    { id: '2', label: 'Terms of Service', url: '/terms', order: 1, target: '_self' },
    { id: '3', label: 'Contact', url: '/contact', order: 2, target: '_self' },
  ];

  return (
    <footer 
      className="site-footer"
      style={{
        background: bgColor,
        color: textColor,
        padding: 'var(--spacing-60, 4rem) 0 var(--spacing-50, 3rem)',
        marginTop: 'auto'
      }}
    >
      <div style={{
        maxWidth: '1340px',
        margin: '0 auto',
        padding: '0 var(--spacing-50, 2rem)',
      }}>
        {/* Footer Widgets Area */}
        {footerWidgets && footerWidgets.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '3rem',
            marginBottom: '3rem',
            paddingBottom: '3rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            {footerWidgets.map(widget => (
              <div key={widget.id} className="footer-widget">
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: 600, 
                  marginBottom: '1rem',
                  color: textColor
                }}>
                  {widget.title}
                </h3>
                <div style={{ opacity: 0.8 }}>
                  {widget.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem'
        }}>
          {/* Site Info Column */}
          <div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              marginBottom: '0.5rem',
              color: textColor
            }}>
              {header?.logoText || siteName}
            </h3>
            <p style={{ opacity: 0.8, marginBottom: '1rem' }}>
              {header?.tagline || tagline}
            </p>
            <p style={{ opacity: 0.7, fontSize: '0.875rem' }}>
              Built with NestPress CMS - A modern headless CMS combining WordPress-like 
              content management with e-commerce capabilities.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 style={{ 
              fontSize: '1.125rem', 
              fontWeight: 600, 
              marginBottom: '1rem',
              color: textColor
            }}>
              Quick Links
            </h4>
            <nav aria-label="Footer">
              <ul style={{ 
                listStyle: 'none', 
                padding: 0, 
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
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
                          opacity: 0.8,
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
              </ul>
            </nav>
          </div>

          {/* Connect Column */}
          <div>
            <h4 style={{ 
              fontSize: '1.125rem', 
              fontWeight: 600, 
              marginBottom: '1rem',
              color: textColor
            }}>
              Connect
            </h4>
            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              fontSize: '1.5rem'
            }}>
              <a href="#" style={{ color: textColor, opacity: 0.8 }} aria-label="Twitter">
                𝕏
              </a>
              <a href="#" style={{ color: textColor, opacity: 0.8 }} aria-label="GitHub">
                ⚙
              </a>
              <a href="#" style={{ color: textColor, opacity: 0.8 }} aria-label="LinkedIn">
                in
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div style={{
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <p style={{ opacity: 0.7, margin: 0, fontSize: '0.875rem' }}>
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <p style={{ opacity: 0.7, margin: 0, fontSize: '0.875rem' }}>
            Powered by <a href="https://nestpress.dev" style={{ color: textColor, textDecoration: 'underline' }}>NestPress</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
