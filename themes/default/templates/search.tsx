import React from 'react';
import { ThemeTemplateProps, Header, Footer, getPostPermalink } from '../index';

/**
 * Search Results Template
 * WordPress equivalent: search.php
 */
const SearchTemplate: React.FC<ThemeTemplateProps> = ({ 
  posts = [], 
  data,
  primaryMenu,
  footerMenu,
  footerWidgets,
  header,
}) => {
  const searchQuery = data?.query || '';

  return (
    <div className="search-template">
      <Header primaryMenu={primaryMenu} header={header} />
      
      <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 2rem' }}>
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>
            Search Results for: "{searchQuery}"
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
            {posts.length} {posts.length === 1 ? 'result' : 'results'} found
          </p>
        </header>

        {posts.length > 0 ? (
          <div style={{ display: 'grid', gap: '2rem' }}>
            {posts.map(post => (
              <article key={post.id} style={{
                background: '#fff',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                  <a href={getPostPermalink(post)} style={{ color: '#1e293b', textDecoration: 'none' }}>
                    {post.title}
                  </a>
                </h2>
                <p style={{ color: '#475569', marginBottom: '1rem' }}>
                  {post.excerpt}
                </p>
                <a href={getPostPermalink(post)} style={{
                  color: '#2563eb',
                  textDecoration: 'none',
                  fontWeight: 500
                }}>
                  Read More →
                </a>
              </article>
            ))}
          </div>
        ) : (
          <div style={{
            background: '#f9fafb',
            padding: '3rem',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '1.1rem', color: '#64748b' }}>
              No results found for your search query. Please try different keywords.
            </p>
          </div>
        )}
      </div>

      <SiteFooter footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
};

export default SearchTemplate;
