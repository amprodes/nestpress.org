/**
 * Hero Banner Pattern
 * WordPress equivalent: patterns/banner-hero.php
 * Full-width hero section with CTA
 */

import React from 'react';

export interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  textColor?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  title = 'Welcome to NestPress',
  subtitle = 'A modern CMS with WordPress-like features',
  ctaText = 'Get Started',
  ctaUrl = '/blog',
  backgroundImage,
  backgroundColor = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  textColor = '#ffffff'
}) => {
  return (
    <section 
      className="pattern-hero-banner"
      style={{
        background: backgroundImage ? `url(${backgroundImage}) center/cover` : backgroundColor,
        color: textColor,
        padding: 'clamp(50px, 7vw, 90px) var(--spacing-50, 2rem)',
        textAlign: 'center',
        position: 'relative'
      }}
    >
      {backgroundImage && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 0
        }} />
      )}
      
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <h1 style={{ 
          fontSize: 'clamp(2.15rem, 5vw, 3rem)', 
          marginBottom: '1rem', 
          fontWeight: 700,
          lineHeight: 1.2
        }}>
          {title}
        </h1>
        <p style={{ 
          fontSize: 'clamp(1rem, 3vw, 1.375rem)', 
          opacity: 0.95,
          marginBottom: '2rem',
          lineHeight: 1.6
        }}>
          {subtitle}
        </p>
        {ctaText && ctaUrl && (
          <a href={ctaUrl} style={{
            display: 'inline-block',
            padding: '1rem 2.5rem',
            background: '#fff',
            color: '#667eea',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontWeight: 600,
            fontSize: '1.1rem',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            {ctaText} →
          </a>
        )}
      </div>
    </section>
  );
};

export default HeroBanner;
