import React from 'react';
import { ThemeTemplateProps, SiteNav, SiteFooter, getPostPermalink } from '../index';

/**
 * Category Template
 * WordPress equivalent: category.php
 */
const CategoryTemplate: React.FC<ThemeTemplateProps> = ({ 
  posts = [], 
  data,
  primaryMenu,
  footerMenu,
  footerWidgets,
  header,
}) => {
  const categoryName = data?.category || 'Category';

  return (
    <div className="category-template">
      <SiteNav primaryMenu={primaryMenu} header={header} />
      
      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>
            Category: {categoryName}
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </p>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '2rem'
        }}>
          {posts.map(post => (
            <article key={post.id} style={{
              background: '#fff',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              {post.featuredImage && (
                <img 
                  src={post.featuredImage}
                  alt={post.title}
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
              )}
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                  <a href={getPostPermalink(post)} style={{ color: '#1e293b', textDecoration: 'none' }}>
                    {post.title}
                  </a>
                </h3>
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                  {post.excerpt}
                </p>
                <a href={getPostPermalink(post)} style={{
                  color: '#2563eb',
                  textDecoration: 'none',
                  fontWeight: 500
                }}>
                  Read More →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>

      <SiteFooter footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
};

export default CategoryTemplate;
