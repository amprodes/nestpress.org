import React, { ReactNode } from 'react';

/**
 * DataCard - Unified card component for all admin views
 * WordPress-style white cards with consistent borders, shadows, and spacing
 */

interface DataCardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

interface DataCardHeaderProps {
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

interface DataCardBodyProps {
  children: ReactNode;
  className?: string;
}

interface DataCardFooterProps {
  children: ReactNode;
  className?: string;
}

// Main Card Container
export const DataCard: React.FC<DataCardProps> = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`bg-white border border-gray-300 shadow-sm ${className}`}>
      {children}
    </div>
  );
};

// Card Header with optional actions
export const DataCardHeader: React.FC<DataCardHeaderProps> = ({ children, actions, className = '' }) => {
  return (
    <div className={`border-b border-gray-300 px-5 py-3 flex items-center justify-between ${className}`}>
      <h3 className="text-sm font-semibold text-gray-700">{children}</h3>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
};

// Card Body
export const DataCardBody: React.FC<DataCardBodyProps> = ({ children, className = '' }) => {
  return (
    <div className={`p-5 ${className}`}>
      {children}
    </div>
  );
};

// Card Footer
export const DataCardFooter: React.FC<DataCardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`border-t border-gray-300 px-5 py-3 bg-gray-50 ${className}`}>
      {children}
    </div>
  );
};

// Grid Container for Cards
export const DataCardGrid: React.FC<{ children: ReactNode; cols?: 1 | 2 | 3 | 4 }> = ({ children, cols = 3 }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };
  
  return (
    <div className={`grid ${gridCols[cols]} gap-6`}>
      {children}
    </div>
  );
};

// Hover Card variant (for themes, products, etc.)
export const DataCardHover: React.FC<{ children: ReactNode; onClick?: () => void; className?: string }> = ({ 
  children, 
  onClick, 
  className = '' 
}) => {
  return (
    <div 
      className={`bg-white border border-gray-300 shadow-sm hover:shadow-md transition-shadow cursor-pointer group ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
