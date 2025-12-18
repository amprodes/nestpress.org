import React from 'react';
import { ThemeTemplateProps, Header, Footer } from '../index';

/**
 * Single Post Template
 * WordPress equivalent: single.php
 */
const SingleTemplate: React.FC<ThemeTemplateProps> = ({ 
  post,
  primaryMenu,
  footerMenu,
  footerWidgets,
  header,
}) => {
  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="single-template">
      <Header primaryMenu={primaryMenu} header={header} />
      
      <article style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 2rem' }}>
        {/* Featured Image */}
        {post.featuredImage && (
          <img 
            src={post.featuredImage}
            alt={post.title}
            style={{
              width: '100%',
              maxHeight: '400px',
              objectFit: 'cover',
              borderRadius: '0.5rem',
              marginBottom: '2rem'
            }}
          />
        )}

        {/* Post Header */}
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
            {post.title}
          </h1>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            color: '#64748b',
            fontSize: '0.9rem',
            flexWrap: 'wrap'
          }}>
            <span>By {post.author}</span>
            <span>•</span>
            <span>{new Date(post.date).toLocaleDateString()}</span>
            {post.categories && post.categories.length > 0 && (
              <>
                <span>•</span>
                <span>
                  {post.categories.map((cat, i) => (
                    <span key={i} style={{
                      background: '#e0e7ff',
                      color: '#4338ca',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      marginRight: '0.5rem',
                      fontSize: '0.85rem'
                    }}>
                      {cat}
                    </span>
                  ))}
                </span>
              </>
            )}
          </div>
        </header>

        {/* Post Content */}
        <div 
          style={{ 
            lineHeight: 1.8,
            fontSize: '1.1rem',
            color: '#334155'
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <footer style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {post.tags.map((tag, i) => (
                <span key={i} style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.9rem'
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          </footer>
        )}
      </article>

      <SiteFooter footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
};

export default SingleTemplate;
