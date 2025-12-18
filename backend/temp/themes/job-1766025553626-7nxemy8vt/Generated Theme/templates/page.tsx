```javascript
import React from 'react';
import { ThemeTemplateProps } from '@/types';
import Header from './Header';
import Footer from './Footer';

const PageTemplate: React.FC<ThemeTemplateProps> = ({ 
  posts = [], 
  post,
  primaryMenu,
  sidebarWidgets = [],
  header 
}) => {
  return (
    <div className="page-template min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(68, 68, 68)' }}>
      <Header header={header} menu={primaryMenu} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Single Post View */}
        {post && (
          <article className="single-post">
            <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
            {post.featuredImage && (
              <img src={post.featuredImage} alt={post.title} className="w-full h-auto mb-6 rounded-lg" />
            )}
            <div className="post-meta mb-6 text-sm text-gray-500">
              {post.author && <span className="mr-4">By {post.author}</span>}
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
        )}

        {/* Index/Archive View */}
        {!post && posts.length > 0 && (
          <div className="posts-grid grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.filter(p => p.status === 'PUBLISHED').map((item) => (
              <article key={item.id} className="post-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {item.featuredImage && (
                  <img src={item.featuredImage} alt={item.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-2">
                    <a href={`/blog/${item.slug}`} className="hover:text-blue-600">
                      {item.title}
                    </a>
                  </h2>
                  {item.excerpt && <p className="text-gray-600 mb-4">{item.excerpt}</p>}
                  <div className="text-sm text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer header={header} />
    </div>
  );
};

export default PageTemplate;
```