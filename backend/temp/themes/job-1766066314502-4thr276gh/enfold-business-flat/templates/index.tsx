import React from 'react';
import { ThemeTemplateProps } from '@/types';
import Header from './Header';
import Footer from './Footer';

const HomeTemplate: React.FC<ThemeTemplateProps> = ({ 
  posts = [], 
  post, 
  primaryMenu, 
  sidebarWidgets, 
  header 
}) => {
  return (
    <div className="home-template min-h-screen text-gray-800">
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Single Post View */}
        {post && (
          <article className="single-post mb-12">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            
            {post.featuredImage && (
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="w-full h-auto mb-8 rounded-lg shadow-sm"
              />
            )}
            
            <div className="post-meta flex gap-4 text-gray-500 mb-8 pb-4 border-b">
              <span>By {post.author}</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />
          </article>
        )}

        {/* Index/Archive View */}
        {!post && (
          <div className="posts-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.filter(p => p.status === 'PUBLISHED').map((post) => (
              <article key={post.id} className="post-card border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                {post.featuredImage && (
                  <img 
                    src={post.featuredImage} 
                    alt={post.title} 
                    className="w-full h-48 object-cover mb-4 rounded"
                  />
                )}
                <h2 className="text-2xl font-bold mb-2">
                  <a href={`/${post.slug}`} className="hover:text-blue-600 transition-colors">
                    {post.title}
                  </a>
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                <a href={`/${post.slug}`} className="text-blue-600 font-medium hover:underline">
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