import React from 'react';
import { ThemeTemplateProps, Header, Footer } from '../index';

const PageTemplate: React.FC<ThemeTemplateProps> = ({
  post,
  primaryMenu,
  footerMenu,
  footerWidgets,
  header,
}) => {
  if (!post) return <div>Page not found</div>;

  return (
    <div className="page-template">
      <Header primaryMenu={primaryMenu} header={header} />
      
      <article style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 2rem' }}>
        <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700 }}>{post.title}</h1>
        </header>

        <div
          style={{ lineHeight: 1.8, fontSize: '1.1rem', color: '#334155' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
};

export default PageTemplate;
