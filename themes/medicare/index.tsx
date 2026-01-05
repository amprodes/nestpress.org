/**
 * MediCare Theme
 * Professional healthcare theme inspired by Pearl Medical
 */

// Export WordPress-like theme functions
export { themeSetup, blockStyles, patternCategories, enqueueAssets, blockBindings } from './functions';

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
  primary: '#00a8e8',
  secondary: '#007ea7',
  accent: '#00d4aa',
  background: '#ffffff',
  surface: '#f0f9ff',
  text: '#1a1a2e',
  textSecondary: '#5a6a7a',
};

// Medical Navigation with top bar
export function SiteNav({ primaryMenu, header }: { primaryMenu?: Menu; header?: HeaderSettings }) {
  const menuItems: MenuItem[] = primaryMenu?.items || [
    { id: '1', label: 'Home', url: '/', order: 0, target: '_self' },
    { id: '2', label: 'About', url: '/about', order: 1, target: '_self' },
    { id: '3', label: 'Services', url: '/services', order: 2, target: '_self' },
    { id: '4', label: 'Doctors', url: '/doctors', order: 3, target: '_self' },
    { id: '5', label: 'Blog', url: '/blog', order: 4, target: '_self' },
    { id: '6', label: 'Contact', url: '/contact', order: 5, target: '_self' },
  ];

  return (
    <>
      {/* Top Bar */}
      <div style={{
        background: colors.primary,
        color: '#fff',
        padding: '0.5rem 2rem',
        fontSize: '0.875rem',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <span>📞 Emergency: +1 (555) 911-1234</span>
            <span>📧 info@medicare.com</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>Mon-Fri: 8am-8pm</span>
            <span>|</span>
            <span>Sat: 9am-5pm</span>
          </div>
        </div>
      </div>
      {/* Main Nav */}
      <nav style={{
        background: '#fff',
        padding: '0',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
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
            fontSize: '1.75rem',
            fontWeight: 700,
            color: colors.primary,
            textDecoration: 'none',
            fontFamily: 'Nunito, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span style={{ fontSize: '2rem' }}>🏥</span>
            {header?.logoText || 'MediCare'}
          </a>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {menuItems.sort((a, b) => (a.order || 0) - (b.order || 0)).map(item => (
              <a
                key={item.id}
                href={item.url}
                style={{
                  color: colors.text,
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                }}
              >{item.label}</a>
            ))}
            <a href="/appointment" style={{
              background: colors.accent,
              color: '#fff',
              padding: '0.75rem 1.5rem',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: 600,
            }}>Book Appointment</a>
          </div>
        </div>
      </nav>
    </>
  );
}

// Medical Footer
export function SiteFooter({ footerMenu, header }: { footerMenu?: Menu; header?: HeaderSettings }) {
  return (
    <footer style={{
      background: colors.secondary,
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
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🏥</span> {header?.logoText || 'MediCare'}
          </h3>
          <p style={{ opacity: 0.9, lineHeight: 1.8 }}>
            Providing exceptional healthcare services with compassion and cutting-edge technology.
          </p>
        </div>
        <div>
          <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: colors.accent }}>Departments</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics'].map(item => (
              <li key={item} style={{ marginBottom: '0.5rem' }}>
                <a href="#" style={{ color: '#fff', opacity: 0.8, textDecoration: 'none' }}>{item}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: colors.accent }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {['Find a Doctor', 'Appointments', 'Patient Portal', 'Insurance'].map(item => (
              <li key={item} style={{ marginBottom: '0.5rem' }}>
                <a href="#" style={{ color: '#fff', opacity: 0.8, textDecoration: 'none' }}>{item}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: colors.accent }}>Emergency</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>+1 (555) 911-1234</p>
          <p style={{ opacity: 0.8 }}>📍 123 Medical Center Dr<br />New York, NY 10001</p>
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
        © {new Date().getFullYear()} MediCare. Your Health, Our Priority.
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
  name: 'MediCare',
  version: '1.0.0',
  author: 'NestPress Team'
};
