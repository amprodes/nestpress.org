import React from 'react';
import type { Post } from '@/types';
import { Header } from '../parts/Header';
import { Footer } from '../parts/Footer';

interface PageTemplateProps {
  page?: Post;
}

export default function PageTemplate({ page }: PageTemplateProps) {
  if (!page) {
    return (
      <div className="page-template">
        <Header />
        <p>Page not found</p>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="page-template">
      <Header />
      <article className="page">
        <header className="page-header">
          <h1 className="page-title">{page.title}</h1>
        </header>
        
        <div 
          className="page-content"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>
      <Footer />
    </div>
  );
}
