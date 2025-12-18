import React from 'react';
import { 
  ThemeTemplateProps, 
  Header, 
  Footer, 
  PostsGrid,
  getPostPermalink 
} from '../index';

/**
 * Archive Template (Blog Listing)
 * WordPress equivalent: archive.php
 * Uses PostsGrid pattern for consistent post display
 */
const ArchiveTemplate: React.FC<ThemeTemplateProps> = ({ 
  posts = [],
  primaryMenu,
  footerMenu,
  footerWidgets,
  header,
  data
}) => {
  const archiveTitle = data?.archiveTitle || 'Blog Archive';
  const archiveDescription = data?.archiveDescription || 'Browse all posts';

  return (
    <div className="archive-template">
      {/* Header Part */}
      <Header primaryMenu={primaryMenu} header={header} />
      
      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Blog Archive</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
            Browse all posts
          </p>
        </header>

        <div style={{ display: 'grid', gap: '2rem' }}>
          {posts.map(post => (
            <article key={post.id} style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              display: 'grid',
              gridTemplateColumns: post.featuredImage ? '300px 1fr' : '1fr',
              gap: '2rem'
            }}>
              {post.featuredImage && (
                <img 
                  src={post.featuredImage}
                  alt={post.title}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '0.375rem'
                  }}
                />
              )}
              <div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                  <a href={getPostPermalink(post)} style={{ color: '#1e293b', textDecoration: 'none' }}>
                    {post.title}
                  </a>
                </h2>
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  color: '#64748b',
                  fontSize: '0.9rem',
                  marginBottom: '1rem'
                }}>
                  <span>{post.author}</span>
                  <span>•</span>
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
                <p style={{ color: '#475569', marginBottom: '1rem', lineHeight: 1.6 }}>
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

      {/* Footer Part */}
      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
};

export default ArchiveTemplate;
