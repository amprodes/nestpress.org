import React from 'react';
import type { ThemeTemplateProps } from '@/types';
import { Header, Footer } from '@/components';

const ArchiveTemplate: React.FC<ThemeTemplateProps> = ({ 
  posts = [], 
  post, 
  primaryMenu, 
  sidebarWidgets, 
  header 
}) => {
  return (
    <div className="archive-template min-h-screen bg-gray-50 text-gray-800">
      <Header menu={primaryMenu} settings={header} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Single Post View */}
        {post && (
          <article className="single-post bg-white p-8 rounded-lg shadow-sm mb-12">
            <header className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">{post.title}</h1>
              <div className="post-meta flex gap-4 text-sm text-gray-500">
                {post.author && <span>By {post.author}</span>}
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </header>

            {post.featuredImage && (
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="w-full h-auto rounded-lg mb-8 object-cover max-h-[600px]" 
              />
            )}

            <div 
              className="prose prose-lg max-w-none" 
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />
          </article>
        )}

        {/* Archive/Index View */}
        {!post && (
          <div className="posts-grid-container">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Blog Archive</h1>
            
            <div className="posts-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.filter(p => p.status === 'PUBLISHED').map((post) => (
                <article key={post.id} className="post-card bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full">
                  {post.featuredImage && (
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={post.featuredImage} 
                        alt={post.title} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                  )}
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-xl font-bold mb-3 text-gray-900">
                      <a href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                        {post.title}
                      </a>
                    </h2>
                    
                    <p className="text-gray-600 mb-4 flex-grow">
                      {post.excerpt}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                      <span className="text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                      <a href={`/blog/${post.slug}`} className="text-blue-600 font-medium hover:underline">
                        Read more
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer settings={header} />
    </div>
  );
};

export default ArchiveTemplate;