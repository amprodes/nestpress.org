```javascript
import React from 'react';
import { ThemeTemplateProps } from '@/types';
import Header from './Header';
import Footer from './Footer';

const SingleTemplate: React.FC<ThemeTemplateProps> = ({ 
  posts = [], 
  post, 
  primaryMenu, 
  sidebarWidgets, 
  header 
}) => {
  return (
    <div className="single-template">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Single Post View */}
        {post && (
          <article className="single-post">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            
            {post.featuredImage && (
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="w-full h-auto mb-6"
              />
            )}
            
            <div className="post-meta mb-6 text-gray-600">
              {post.author && <span className="mr-4">By {post.author}</span>}
              {post.createdAt && <span>{new Date(post.createdAt).toLocaleDateString()}</span>}
            </div>

            <div 
              className="prose max-w-none" 
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />
          </article>
        )}

        {/* Index/Archive View (Fallback if no single post provided) */}
        {!post && (
          <div className="posts-grid grid gap-8">
            {posts.filter(p => p.status === 'PUBLISHED').map((p) => (
              <article key={p.id} className="post-card border-b pb-8">
                {p.featuredImage && (
                  <img 
                    src={p.featuredImage} 
                    alt={p.title}
                    className="w-full h-48 object-cover mb-4" 
                  />
                )}
                <h2 className="text-2xl font-bold mb-2">
                  <a href={`/blog/${p.slug}`} className="hover:text-blue-600">
                    {p.title}
                  </a>
                </h2>
                <p className="text-gray-600 mb-4">{p.excerpt}</p>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SingleTemplate;
```