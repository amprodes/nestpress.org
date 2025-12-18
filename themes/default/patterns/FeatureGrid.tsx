/**
 * Feature Grid Pattern
 * WordPress equivalent: patterns/text-feature-grid-3-col.php
 * Grid of features with icons
 */

import React from 'react';

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface FeatureGridProps {
  features: Feature[];
  columns?: 2 | 3 | 4;
  heading?: string;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({
  features,
  columns = 3,
  heading
}) => {
  const getColumnClass = () => {
    const minWidth = columns === 2 ? '350px' : columns === 3 ? '300px' : '250px';
    return `repeat(auto-fit, minmax(${minWidth}, 1fr))`;
  };

  return (
    <section 
      className="pattern-feature-grid"
      style={{
        padding: 'var(--spacing-60, 4rem) 0'
      }}
    >
      {heading && (
        <h2 style={{ 
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', 
          marginBottom: 'var(--spacing-50, 3rem)',
          fontWeight: 700,
          textAlign: 'center',
          color: '#1e293b'
        }}>
          {heading}
        </h2>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: getColumnClass(),
        gap: 'var(--spacing-50, 2rem)'
      }}>
        {features.map((feature, index) => (
          <div 
            key={index}
            className="feature-card"
            style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: '1rem',
              lineHeight: 1
            }}>
              {feature.icon}
            </div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              marginBottom: '0.75rem', 
              fontWeight: 600,
              color: '#1e293b'
            }}>
              {feature.title}
            </h3>
            <p style={{ 
              color: '#64748b',
              lineHeight: 1.6,
              fontSize: '0.9375rem'
            }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureGrid;
