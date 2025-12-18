import React from 'react';
import Header from './Header';
import Footer from './Footer';
import type { ThemeTemplateProps } from './types';

const HomeTemplate: React.FC<ThemeTemplateProps> = ({ 
  posts = [], 
  post,
  primaryMenu,
  sidebarWidgets = [],
  header 
}) => {
  return (
    <div className="home-template min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(68, 68, 68)' }}>
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Single Post View */}
        {post && (
          <article className="single-post">
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            
            {post.featuredImage && (
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="w-full h-auto mb-6 rounded-lg object-cover"
              />
            )}

            <div className="post-meta text-sm text-gray-500 mb-6 flex gap-4">
              <span>By {post.author}</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>

            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />
          </article>
        )}

        {/* Index/Archive View - Only show if not viewing a single post */}
        {!post && (
          <div className="posts-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.filter(p => p.status === 'PUBLISHED').map((post) => (
              <article key={post.id} className="post-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                {post.featuredImage && (
                  <img 
                    src={post.featuredImage} 
                    alt={post.title} 
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                <h2 className="text-xl font-bold mb-2">
                  <a href={`/${post.slug}`} className="hover:text-blue-600">
                    {post.title}
                  </a>
                </h2>
                <p className="mb-4 text-gray-600 line-clamp-3">{post.excerpt}</p>
                <a href={`/${post.slug}`} className="text-blue-600 hover:underline">
                  Read more
                </a>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer header={header} />
    </div>
  );
};

export default HomeTemplate;