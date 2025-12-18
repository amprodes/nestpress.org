import React from 'react';
import { ThemeTemplateProps } from './types';
import Header from './Header';
import Footer from './Footer';

const ArchiveTemplate: React.FC<ThemeTemplateProps> = (props) => {
  const { posts } = props;

  return (
    <div className="archive-template min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(68, 68, 68)' }}>
      <Header {...props} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Blog Archive</h1>
        
        {posts && (
          <div className="posts-grid">
            {posts.filter(p => p.status === 'PUBLISHED').map((post) => (
              <article key={post.id} className="mb-6 post-card">
                <h2 className="text-xl font-bold">{post.title}</h2>
                <p>{post.excerpt}</p>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer {...props} />
    </div>
  );
};

export default ArchiveTemplate;