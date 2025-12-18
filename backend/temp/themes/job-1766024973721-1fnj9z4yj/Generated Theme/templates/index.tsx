import React from 'react';
import { ThemeTemplateProps } from '@/types';
import Header from './Header';
import Footer from './Footer';

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
          <article className="single-post mb-12">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            {post.featuredImage && (
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="w-full h-auto mb-6 rounded-lg"
              />
            )}
            <div className="post-meta text-sm text-gray-500 mb-6">
              <span className="mr-4">By {post.author}</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content || '' }} 
            />
          </article>
        )}

        {/* Index/Archive View (only renders if no specific single post is selected) */}
        {!post && (
          <div className="posts-grid">
            {posts.filter(p => p.status === 'PUBLISHED').map((post) => (
              <article key={post.id} className="post-card mb-8 p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
                {post.featuredImage && (
                  <img 
                    src={post.featuredImage} 
                    alt={post.title} 
                    className="w-full h-64 object-cover mb-4 rounded"
                  />
                )}
                <h2 className="text-2xl font-bold mb-2">
                  <a href={`/${post.slug}`} className="hover:text-blue-600 transition-colors">
                    {post.title}
                  </a>
                </h2>
                <div className="text-sm text-gray-500 mb-2">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
                <p className="mb-4 line-clamp-3">{post.excerpt}</p>
                <a href={`/${post.slug}`} className="text-blue-600 hover:underline font-medium">
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