/**
 * CTA (Call to Action) Pattern
 * WordPress equivalent: patterns/cta-subscribe-centered.php
 * Centered CTA section with newsletter/action form
 */

import React from 'react';

export interface CTAProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  showEmailForm?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

export const CTA: React.FC<CTAProps> = ({
  title = 'Stay Updated',
  description = 'Subscribe to our newsletter for the latest updates and insights.',
  buttonText = 'Subscribe',
  buttonUrl,
  showEmailForm = true,
  backgroundColor = '#f8fafc',
  textColor = '#1e293b'
}) => {
  return (
    <section 
      className="pattern-cta"
      style={{
        background: backgroundColor,
        color: textColor,
        padding: 'var(--spacing-70, 5rem) var(--spacing-50, 2rem)',
        textAlign: 'center'
      }}
    >
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ 
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', 
          marginBottom: '1rem',
          fontWeight: 700,
          lineHeight: 1.2
        }}>
          {title}
        </h2>
        
        <p style={{ 
          fontSize: '1.125rem',
          color: '#64748b',
          marginBottom: '2rem',
          lineHeight: 1.6
        }}>
          {description}
        </p>

        {showEmailForm ? (
          <form 
            style={{ 
              display: 'flex', 
              gap: '0.75rem',
              maxWidth: '500px',
              margin: '0 auto',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}
          >
            <input 
              type="email"
              placeholder="Enter your email"
              required
              style={{
                flex: '1 1 250px',
                padding: '0.875rem 1.25rem',
                border: '2px solid #e2e8f0',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                minWidth: '200px'
              }}
            />
            <button 
              type="submit"
              style={{
                padding: '0.875rem 2rem',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {buttonText}
            </button>
          </form>
        ) : buttonUrl && (
          <a 
            href={buttonUrl}
            style={{
              display: 'inline-block',
              padding: '0.875rem 2.5rem',
              background: '#2563eb',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'background 0.2s'
            }}
          >
            {buttonText}
          </a>
        )}

        <p style={{ 
          fontSize: '0.875rem',
          color: '#94a3b8',
          marginTop: '1rem'
        }}>
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
};

export default CTA;
