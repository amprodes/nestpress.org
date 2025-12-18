/**
 * Business Pro Theme
 * Professional corporate theme inspired by Pearl Business
 */

import React from 'react';
import { Post, Menu, MenuItem, Widget, HeaderSettings } from '../../types';

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
  menus?: Menu[];
  widgets?: Widget[];
  header?: HeaderSettings;
  primaryMenu?: Menu;
  footerMenu?: Menu;
  sidebarWidgets?: Widget[];
  footerWidgets?: Widget[];
  headerWidgets?: Widget[];
}

const colors = {
  primary: '#1e3a5f',
  secondary: '#f4a261',
  accent: '#2ec4b6',
  background: '#ffffff',
  surface: '#f8f9fa',
  text: '#1a1a2e',
  textSecondary: '#6c757d',
};

// Business Navigation
export function SiteNav({ primaryMenu, header }: { primaryMenu?: Menu; header?: HeaderSettings }) {
  const menuItems: MenuItem[] = primaryMenu?.items || [
    { id: '1', label: 'Home', url: '/', order: 0, target: '_self' },
    { id: '2', label: 'Services', url: '/services', order: 1, target: '_self' },
    { id: '3', label: 'About', url: '/about', order: 2, target: '_self' },
    { id: '4', label: 'Blog', url: '/blog', order: 3, target: '_self' },
    { id: '5', label: 'Contact', url: '/contact', order: 4, target: '_self' },
  ];

  return (
    <nav style={{
      background: header?.backgroundColor || colors.primary,
      padding: '0',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <a href="/" style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#fff',
          textDecoration: 'none',
          fontFamily: 'Poppins, sans-serif',
        }}>
          {header?.logoText || 'BusinessPro'}
        </a>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {menuItems.sort((a, b) => (a.order || 0) - (b.order || 0)).map(item => (
            <a
              key={item.id}
              href={item.url}
              style={{
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
                opacity: 0.9,
                transition: 'opacity 0.2s',
              }}
            >{item.label}</a>
          ))}
          <a href="/contact" style={{
            background: colors.secondary,
            color: '#fff',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 600,
          }}>Get Started</a>
        </div>
      </div>
    </nav>
  );
}

// Business Footer
export function SiteFooter({ footerMenu, header }: { footerMenu?: Menu; header?: HeaderSettings }) {
  return (
    <footer style={{
      background: colors.primary,
      color: '#fff',
      padding: '4rem 2rem 2rem',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '3rem',
      }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            {header?.logoText || 'BusinessPro'}
          </h3>
          <p style={{ opacity: 0.8, lineHeight: 1.8 }}>
            Empowering businesses with innovative solutions and strategic consulting services.
          </p>
        </div>
        <div>
          <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: colors.secondary }}>Services</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {['Strategy Consulting', 'Digital Marketing', 'Business Analytics', 'Growth Planning'].map(item => (
              <li key={item} style={{ marginBottom: '0.5rem' }}>
                <a href="#" style={{ color: '#fff', opacity: 0.8, textDecoration: 'none' }}>{item}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: colors.secondary }}>Company</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {['About Us', 'Our Team', 'Careers', 'Press'].map(item => (
              <li key={item} style={{ marginBottom: '0.5rem' }}>
                <a href="#" style={{ color: '#fff', opacity: 0.8, textDecoration: 'none' }}>{item}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: colors.secondary }}>Contact</h4>
          <p style={{ opacity: 0.8, marginBottom: '0.5rem' }}>📧 info@businesspro.com</p>
          <p style={{ opacity: 0.8, marginBottom: '0.5rem' }}>📞 +1 (555) 123-4567</p>
          <p style={{ opacity: 0.8 }}>📍 123 Business Ave, NYC</p>
        </div>
      </div>
      <div style={{
        maxWidth: '1200px',
        margin: '3rem auto 0',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center',
        opacity: 0.7,
      }}>
        © {new Date().getFullYear()} BusinessPro. All rights reserved.
      </div>
    </footer>
  );
}

export { default as IndexTemplate } from './templates/index';
export { default as SingleTemplate } from './templates/single';
export { default as PageTemplate } from './templates/page';
export { default as ArchiveTemplate } from './templates/archive';
export { default as CategoryTemplate } from './templates/category';
export { default as SearchTemplate } from './templates/search';
export { default as NotFoundTemplate } from './templates/404';

export const theme = {
  name: 'Business Pro',
  version: '1.0.0',
  author: 'NestPress Team'
};
