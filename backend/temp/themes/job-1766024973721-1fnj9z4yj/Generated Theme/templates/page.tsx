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
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Single Post View */}
        {post && (
          <article className="single-post">
            <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
            {post.featuredImage && (
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="w-full h-auto mb-8 rounded-lg object-cover" 
              />
            )}
            <div className="post-meta mb-6 text-gray-500">
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              {post.author && <span className="ml-4">By {post.author}</span>}
            </div>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
        )}

        {/* Index/Archive View */}
        {!post && (
          <div className="posts-grid grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.filter(p => p.status === 'PUBLISHED').map((p) => (
              <article key={p.id} className="post-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {p.featuredImage && (
                  <img 
                    src={p.featuredImage} 
                    alt={p.title} 
                    className="w-full h-48 object-cover" 
                  />
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2">
                    <a href={`/blog/${p.slug}`} className="hover:text-blue-600">
                      {p.title}
                    </a>
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">{p.excerpt}</p>
                  <a href={`/blog/${p.slug}`} className="text-blue-600 font-medium hover:underline">
                    Read Article &rarr;
                  </a>
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