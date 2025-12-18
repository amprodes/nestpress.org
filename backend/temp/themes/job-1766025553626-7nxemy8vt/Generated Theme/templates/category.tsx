import React from 'react';
import { ThemeTemplateProps } from '@/types';
import Header from './Header';
import Footer from './Footer';

const CategoryTemplate: React.FC<ThemeTemplateProps> = ({ 
  posts = [], 
  post, 
  primaryMenu, 
  sidebarWidgets, 
  header 
}) => {
  return (
    <div className="category-template min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(68, 68, 68)' }}>
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Single Post View */}
        {post && (
          <article className="single-post mb-12">
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            {post.featuredImage && (
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="w-full h-auto mb-6 rounded-lg" 
              />
            )}
            <div className="post-meta mb-4 text-sm text-gray-500">
              {post.author && <span className="mr-4">By {post.author}</span>}
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
        )}

        {/* Archive/Index View */}
        {!post && (
          <div className="posts-archive">
            <h1 className="text-3xl font-bold mb-8">Blog Archive</h1>
            <div className="posts-grid">
              {posts.filter(p => p.status === 'PUBLISHED').map((item) => (
                <article key={item.id} className="post-card mb-6 border-b pb-6" style={{ borderColor: '#e5e7eb' }}>
                  <h2 className="text-xl font-bold mb-2">
                    <a href={`/blog/${item.slug}`} className="hover:text-blue-600 transition-colors">
                      {item.title}
                    </a>
                  </h2>
                  {item.featuredImage && (
                    <img 
                      src={item.featuredImage} 
                      alt={item.title} 
                      className="mb-4 rounded"
                    />
                  )}
                  <p className="mb-4">{item.excerpt}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer header={header} />
    </div>
  );
};

export default CategoryTemplate;