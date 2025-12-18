/**
 * StartIt Product Theme
 * Modern SaaS and product landing page theme
 */

import React from 'react';
import { Menu, X, Share2, Github, Linkedin, PlayCircle, ArrowRight, ChevronRight, Mail, MapPin, Phone } from 'lucide-react';
import { Post, Menu as MenuType, MenuItem, Widget, HeaderSettings } from '../../types';

/**
 * Helper function to get post permalink (slug or ID)
 * WordPress equivalent: get_permalink()
 */
export function getPostPermalink(post: Post): string {
  return `/blog/${post.slug || post.id}`;
}

export interface ThemeTemplateProps {
  data?: any;
  posts?: Post[];
  post?: Post;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  menus?: MenuType[];
  widgets?: Widget[];
  header?: HeaderSettings;
  primaryMenu?: MenuType;
  footerMenu?: MenuType;
  sidebarWidgets?: Widget[];
  footerWidgets?: Widget[];
  headerWidgets?: Widget[];
}

// Theme colors
const colors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#06b6d4',
  background: '#ffffff',
  surface: '#f8fafc',
  dark: '#0f172a',
  text: '#1e293b',
  textMuted: '#64748b',
  border: '#e2e8f0',
};

export function SiteNav({ primaryMenu, header }: { primaryMenu?: MenuType; header?: HeaderSettings }) {
  const menuItems: MenuItem[] = primaryMenu?.items || [
    { id: '1', label: 'Home', url: '/', order: 0, target: '_self' },
    { id: '2', label: 'Features', url: '/features', order: 1, target: '_self' },
    { id: '3', label: 'Pricing', url: '/pricing', order: 2, target: '_self' },
    { id: '4', label: 'About', url: '/about', order: 3, target: '_self' },
    { id: '5', label: 'Contact', url: '/contact', order: 4, target: '_self' },
  ];
  
  const siteTitle = header?.siteTitle || 'StartIt';
  const logo = header?.logo;
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled ? 'rgba(255,255,255,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        transition: 'all 0.3s ease',
        borderBottom: scrolled ? `1px solid ${colors.border}` : 'none',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            {logo ? (
              <img src={logo} alt={siteTitle} style={{ height: '36px' }} />
            ) : (
              <>
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem' }}>S</span>
                </div>
                <span style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: colors.dark,
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}>
                  {siteTitle}
                </span>
              </>
            )}
          </a>

          {/* Desktop Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <ul style={{
              display: 'flex',
              gap: '1.75rem',
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}>
              {menuItems.slice(0, 5).map((item) => (
                <li key={item.id}>
                  <a
                    href={item.url}
                    style={{
                      color: colors.text,
                      textDecoration: 'none',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                    onMouseLeave={(e) => e.currentTarget.style.color = colors.text}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <a
                href="/login"
                style={{
                  color: colors.text,
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              >
                Log in
              </a>
              <a
                href="/signup"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.25rem',
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.4)';
                }}
              >
                Get Started <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: colors.dark,
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: colors.background,
          zIndex: 999,
          padding: '6rem 2rem 2rem',
        }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {menuItems.map((item) => (
              <li key={item.id} style={{ marginBottom: '1rem' }}>
                <a
                  href={item.url}
                  style={{
                    color: colors.dark,
                    textDecoration: 'none',
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    display: 'block',
                    padding: '0.75rem 0',
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export function SiteFooter({ footerMenu, header }: { footerMenu?: MenuType; header?: HeaderSettings }) {
  const siteTitle = header?.siteTitle || 'StartIt';
  const footerText = header?.footerText;
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: ['Features', 'Pricing', 'Integrations', 'Changelog', 'Roadmap'],
    company: ['About Us', 'Careers', 'Blog', 'Press Kit', 'Partners'],
    resources: ['Documentation', 'Help Center', 'Community', 'Templates', 'API'],
    legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
  };

  return (
    <footer style={{ background: colors.dark, color: '#fff' }}>
      {/* Newsletter Section */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Stay in the loop
            </h3>
            <p style={{ color: colors.textMuted }}>Get the latest updates and news delivered to your inbox.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                padding: '0.875rem 1.25rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff',
                width: '280px',
                fontSize: '0.95rem',
              }}
            />
            <button
              style={{
                padding: '0.875rem 1.5rem',
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              Subscribe <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(4, 1fr)', gap: '3rem' }}>
          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem' }}>S</span>
              </div>
              <span style={{ fontSize: '1.35rem', fontWeight: 700 }}>{siteTitle}</span>
            </div>
            <p style={{ color: colors.textMuted, lineHeight: 1.7, marginBottom: '2rem' }}>
              Building the future of digital products. Simple, powerful, and designed for teams.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[Share2, Github, Linkedin, PlayCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: colors.textMuted,
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.primary;
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = colors.textMuted;
                  }}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '1.5rem',
                color: 'rgba(255,255,255,0.5)',
              }}>
                {title}
              </h4>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {links.map((link) => (
                  <li key={link} style={{ marginBottom: '0.75rem' }}>
                    <a
                      href="#"
                      style={{
                        color: colors.textMuted,
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        transition: 'color 0.3s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Copyright Bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '1.5rem 2rem',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: colors.textMuted, fontSize: '0.9rem', margin: 0 }}>
            {footerText || `© ${currentYear} ${siteTitle}. All rights reserved.`}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: colors.textMuted, fontSize: '0.9rem' }}>
            <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }} />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
};

// Export all template components for WordPress-like template hierarchy
export { default as IndexTemplate } from './templates/index';
export { default as SingleTemplate } from './templates/single';
export { default as PageTemplate } from './templates/page';
export { default as ArchiveTemplate } from './templates/archive';
export { default as CategoryTemplate } from './templates/category';
export { default as SearchTemplate } from './templates/search';
export { default as NotFoundTemplate } from './templates/404';

// Theme metadata
export const theme = {
  name: 'StartIt Product',
  version: '1.0.0',
  author: 'NestPress Team'
};

// Default export
export default { SiteNav, SiteFooter };
