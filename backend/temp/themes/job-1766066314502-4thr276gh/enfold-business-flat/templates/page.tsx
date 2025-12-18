```javascript
import React from 'react';
import { ThemeTemplateProps } from '@/types';
import Header from './Header';
import Footer from './Footer';

const PageTemplate: React.FC<ThemeTemplateProps> = ({ posts = [], post }) => {
  return (
    <div className="page-template">
      <Header />

      <main className="main-content">
        {/* Single Post View */}
        {post && (
          <article className="single-post">
            <h1 className="post-title">{post.title}</h1>
            
            {post.featuredImage && (
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="post-featured-image" 
              />
            )}

            <div className="post-meta">
              <span>By {post.author}</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>

            <div 
              className="post-content" 
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />
          </article>
        )}

        {/* Posts Index/Archive View */}
        {posts.length > 0 && (
          <div className="posts-grid">
            {posts.filter(p => p.status === 'PUBLISHED').map((post) => (
              <article key={post.id} className="post-card">
                {post.featuredImage && (
                  <img 
                    src={post.featuredImage} 
                    alt={post.title} 
                    className="card-image"
                  />
                )}
                <h2 className="card-title">
                  <a href={`/blog/${post.slug}`}>{post.title}</a>
                </h2>
                <p className="card-excerpt">{post.excerpt}</p>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default PageTemplate;
```