/**
 * Creative Agency Theme
 * Bold, artistic theme for creative agencies and design studios
 */

// Export WordPress-like theme functions
export { themeSetup, blockStyles, patternCategories, enqueueAssets, blockBindings } from './functions';

import React from 'react';
import { Menu, X, Instagram, Linkedin, ArrowRight, Mail, Phone, MapPin, Globe, Share2 } from 'lucide-react';
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
  primary: '#ff6b35',
  secondary: '#1a1a2e',
  accent: '#f7c948',
  background: '#0f0f1a',
  surface: '#1a1a2e',
  text: '#ffffff',
  textMuted: '#a0a0b0',
  border: '#2a2a3e',
};

export function SiteNav({ primaryMenu, header }: { primaryMenu?: MenuType; header?: HeaderSettings }) {
  const menuItems: MenuItem[] = primaryMenu?.items || [
    { id: '1', label: 'Home', url: '/', order: 0, target: '_self' },
    { id: '2', label: 'Work', url: '/work', order: 1, target: '_self' },
    { id: '3', label: 'About', url: '/about', order: 2, target: '_self' },
    { id: '4', label: 'Blog', url: '/blog', order: 3, target: '_self' },
    { id: '5', label: 'Contact', url: '/contact', order: 4, target: '_self' },
  ];
  
  const siteTitle = header?.siteTitle || 'Creative';
  const logo = header?.logo;
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
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
        background: scrolled ? 'rgba(15, 15, 26, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        transition: 'all 0.3s ease',
        borderBottom: scrolled ? `1px solid ${colors.border}` : 'none',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.25rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            {logo ? (
              <img src={logo} alt={siteTitle} style={{ height: '40px' }} />
            ) : (
              <span style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: colors.text,
                fontFamily: 'Space Grotesk, sans-serif',
                letterSpacing: '-0.02em',
              }}>
                {siteTitle.split(' ')[0]}
                <span style={{ color: colors.primary }}>.</span>
              </span>
            )}
          </a>

          {/* Desktop Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            <ul style={{
              display: 'flex',
              gap: '2rem',
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}>
              {menuItems.slice(0, 5).map((item) => (
                <li key={item.id}>
                  <a
                    href={item.url}
                    style={{
                      color: colors.textMuted,
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                    onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <a
              href="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: colors.primary,
                color: colors.text,
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.accent;
                e.currentTarget.style.color = colors.background;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.primary;
                e.currentTarget.style.color = colors.text;
              }}
            >
              Let's Talk <ArrowRight size={16} />
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: colors.text,
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
          padding: '6rem 2rem',
        }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {menuItems.map((item, index) => (
              <li key={item.id} style={{ marginBottom: '1.5rem' }}>
                <a
                  href={item.url}
                  style={{
                    color: colors.text,
                    textDecoration: 'none',
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <span style={{ color: colors.primary, fontSize: '1rem' }}>0{index + 1}</span>
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
  const siteTitle = header?.siteTitle || 'Creative';
  const footerText = header?.footerText;
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ background: colors.background, color: colors.text, borderTop: `1px solid ${colors.border}` }}>
      {/* Main Footer */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4rem' }}>
          {/* Brand Column */}
          <div style={{ gridColumn: 'span 1' }}>
            <h3 style={{
              fontSize: '2rem',
              fontWeight: 800,
              marginBottom: '1.5rem',
              fontFamily: 'Space Grotesk, sans-serif',
            }}>
              {siteTitle.split(' ')[0]}<span style={{ color: colors.primary }}>.</span>
            </h3>
            <p style={{ color: colors.textMuted, lineHeight: 1.8, marginBottom: '2rem' }}>
              We craft digital experiences that inspire and transform brands into unforgettable stories.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {[Instagram, Globe, Share2, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  style={{
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${colors.border}`,
                    color: colors.textMuted,
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                    e.currentTarget.style.color = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.color = colors.textMuted;
                  }}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '1.5rem',
              color: colors.textMuted,
            }}>
              Services
            </h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {['Brand Strategy', 'UI/UX Design', 'Web Development', 'Motion Graphics', 'Content Creation'].map((link) => (
                <li key={link} style={{ marginBottom: '0.75rem' }}>
                  <a
                    href="#"
                    style={{
                      color: colors.text,
                      textDecoration: 'none',
                      fontSize: '0.95rem',
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                    onMouseLeave={(e) => e.currentTarget.style.color = colors.text}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '1.5rem',
              color: colors.textMuted,
            }}>
              Company
            </h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {['About Us', 'Our Work', 'Careers', 'Blog', 'Contact'].map((link) => (
                <li key={link} style={{ marginBottom: '0.75rem' }}>
                  <a
                    href="#"
                    style={{
                      color: colors.text,
                      textDecoration: 'none',
                      fontSize: '0.95rem',
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                    onMouseLeave={(e) => e.currentTarget.style.color = colors.text}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '1.5rem',
              color: colors.textMuted,
            }}>
              Get in Touch
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <a href="mailto:hello@creative.studio" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: colors.text, textDecoration: 'none' }}>
                <Mail size={18} style={{ color: colors.primary }} />
                hello@creative.studio
              </a>
              <a href="tel:+1234567890" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: colors.text, textDecoration: 'none' }}>
                <Phone size={18} style={{ color: colors.primary }} />
                +1 (234) 567-890
              </a>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: colors.text }}>
                <MapPin size={18} style={{ color: colors.primary, flexShrink: 0, marginTop: '0.2rem' }} />
                <span>123 Creative Blvd<br />San Francisco, CA 94102</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div style={{
        borderTop: `1px solid ${colors.border}`,
        padding: '1.5rem 2rem',
        textAlign: 'center',
      }}>
        <p style={{ color: colors.textMuted, fontSize: '0.85rem', margin: 0 }}>
          {footerText || `© ${currentYear} ${siteTitle}. All rights reserved. Crafted with passion.`}
        </p>
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
  name: 'Creative Agency',
  version: '1.0.0',
  author: 'NestPress Team'
};

// Default export
export default { SiteNav, SiteFooter };
