import React from 'react';
import { ThemeTemplateProps, Header, Footer } from '../index';

/**
 * 404 Not Found Template
 * WordPress equivalent: 404.php
 */
const NotFoundTemplate: React.FC<ThemeTemplateProps> = ({
  primaryMenu,
  footerMenu,
  footerWidgets,
  header,
}) => {
  return (
    <div className="error-404-template">
      <Header primaryMenu={primaryMenu} header={header} />
      
      <div style={{
        maxWidth: '600px',
        margin: '4rem auto',
        padding: '0 2rem',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '8rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem'
        }}>
          404
        </h1>
        <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>
          Page Not Found
        </h2>
        <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2rem' }}>
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <a href="/" style={{
          display: 'inline-block',
          padding: '1rem 2rem',
          background: '#2563eb',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '0.5rem',
          fontWeight: 600
        }}>
          Go Back Home
        </a>
      </div>

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
};

export default NotFoundTemplate;
