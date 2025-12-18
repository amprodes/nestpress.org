import React from 'react';
import { ThemeTemplateProps } from './types';
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
    <div className="home-template min-h-screen text-gray-800">
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
                className="w-full h-auto mb-6 rounded-lg"
              />
            )}
            
            <div className="post-meta text-sm text-gray-500 mb-6 border-b pb-4">
              <span className="mr-4">By {post.author}</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div 
              className="post-content prose max-w-none" 
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />
          </article>
        )}

        {/* Index/Archive View */}
        {!post && (
          <div className="posts-grid grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.filter(p => p.status === 'PUBLISHED').map((post) => (
              <article key={post.id} className="post-card border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                {post.featuredImage && (
                  <img 
                    src={post.featuredImage} 
                    alt={post.title} 
                    className="w-full h-48 object-cover mb-4 rounded"
                  />
                )}
                
                <h2 className="text-xl font-bold mb-2">
                  <a href={`/${post.slug}`} className="hover:text-blue-600">
                    {post.title}
                  </a>
                </h2>
                
                <p className="mb-4 text-gray-600">{post.excerpt}</p>
                
                <a href={`/${post.slug}`} className="text-blue-600 hover:underline inline-block">
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