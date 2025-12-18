import React from 'react';
import { ThemeTemplateProps, Header, Footer } from '../index';

const SingleTemplate: React.FC<ThemeTemplateProps> = ({
  post,
  primaryMenu,
  footerMenu,
  footerWidgets,
  header,
}) => {
  if (!post) return <div>Post not found</div>;

  return (
    <div className="single-template">
      <Header primaryMenu={primaryMenu} header={header} />
      
      <article style={{ maxWidth: '900px', margin: '3rem auto', padding: '0 2rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem' }}>
            {post.title}
          </h1>
          <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
            <span>{post.author}</span>
            <span>•</span>
            <span>{new Date(post.date).toLocaleDateString()}</span>
          </div>
        </header>

        {post.featuredImage && (
          <img src={post.featuredImage} alt={post.title} style={{
            width: '100%',
            maxHeight: '500px',
            objectFit: 'cover',
            borderRadius: '0.5rem',
            marginBottom: '2rem',
          }} />
        )}

        <div
          style={{ lineHeight: 1.8, fontSize: '1.1rem', color: '#334155' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
};

export default SingleTemplate;
