import React from 'react';
import { ThemeTemplateProps } from '@/types';
import Header from './Header';
import Footer from './Footer';

const Template404: React.FC<ThemeTemplateProps> = ({ 
  posts, 
  post, 
  primaryMenu, 
  sidebarWidgets, 
  header 
}) => {
  return (
    <div className="404-template min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(68, 68, 68)' }}>
      <Header header={header} primaryMenu={primaryMenu} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <p className="text-xl mb-8">Page not found</p>
          <a href="/" className="text-blue-600 hover:underline">Go back home</a>
        </div>
      </main>

      <Footer header={header} />
    </div>
  );
};

export default Template404;