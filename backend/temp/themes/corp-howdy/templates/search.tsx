import React from 'react';
import { ThemeTemplateProps, Header, Footer } from '../index';

const SearchTemplate: React.FC<ThemeTemplateProps> = ({
  posts = [],
  primaryMenu,
  footerMenu,
  footerWidgets,
  header,
  data,
}) => {
  const archiveTitle = data?.archiveTitle || 'Search Results';

  return (
    <div className="archive-template">
      <Header primaryMenu={primaryMenu} header={header} />
      
      <main style={{ maxWidth: '900px', margin: '3rem auto', padding: '0 2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem' }}>
          {archiveTitle}
        </h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {posts.map((post) => (
            <article key={post.id}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                <a href={`/blog/${post.slug}`} style={{ color: '#1e293b', textDecoration: 'none' }}>
                  {post.title}
                </a>
              </h2>
              <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                <span>{post.author}</span>
                <span>•</span>
                <span>{new Date(post.date).toLocaleDateString()}</span>
              </div>
              <p style={{ color: '#475569', marginBottom: '1rem', lineHeight: 1.6 }}>
                {post.excerpt}
              </p>
              <a href={`/blog/${post.slug}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
                Read More →
              </a>
            </article>
          ))}
        </div>
      </main>

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
};

export default ArchiveTemplate;
