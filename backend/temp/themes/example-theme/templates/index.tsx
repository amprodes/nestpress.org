import React from 'react';
import { ThemeTemplateProps, Header, Footer } from '../index';

const IndexTemplate: React.FC<ThemeTemplateProps> = ({
  posts = [],
  primaryMenu,
  footerMenu,
  footerWidgets,
  header,
}) => {
  return (
    <div className="index-template">
      <Header primaryMenu={primaryMenu} header={header} />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem' }}>
          Latest Posts
        </h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {posts.filter(p => p.status === 'PUBLISHED').map((post) => (
            <article key={post.id} style={{
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              overflow: 'hidden',
            }}>
              {post.featuredImage && (
                <img src={post.featuredImage} alt={post.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              )}
              <div style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  <a href={`/blog/${post.slug}`} style={{ color: '#1e293b', textDecoration: 'none' }}>
                    {post.title}
                  </a>
                </h2>
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>{post.excerpt}</p>
                <a href={`/blog/${post.slug}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
                  Read More →
                </a>
              </div>
            </article>
          ))}
        </div>
      </main>

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
};

export default IndexTemplate;
