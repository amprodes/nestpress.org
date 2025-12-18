import React from 'react';
import { ThemeTemplateProps } from '@/types';
import Header from './Header';
import Footer from './Footer';

const PageTemplate: React.FC<ThemeTemplateProps> = ({ 
  posts = [], 
  post,
  primaryMenu,
  sidebarWidgets,
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
                className="w-full h-auto mb-6 rounded-lg"
              />
            )}
            <div className="post-meta mb-6 text-gray-500">
              {post.author && <span className="mr-4">By {post.author}</span>}
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
        )}

        {/* Index/Archive View */}
        {!post && (
          <div className="posts-grid grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.filter(p => p.status === 'PUBLISHED').map((post) => (
              <article key={post.id} className="post-card border rounded-lg p-6 hover:shadow-lg transition-shadow">
                {post.featuredImage && (
                  <img 
                    src={post.featuredImage} 
                    alt={post.title} 
                    className="w-full h-48 object-cover mb-4 rounded"
                  />
                )}
                <h2 className="text-2xl font-bold mb-2">
                  <a href={`/blog/${post.slug}`} className="hover:text-blue-600">
                    {post.title}
                  </a>
                </h2>
                <div className="text-sm text-gray-500 mb-2">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
                <p className="text-gray-700">{post.excerpt}</p>
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