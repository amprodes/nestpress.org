import React from 'react';
import { ThemeTemplateProps } from '@/types';
import Header from './Header';
import Footer from './Footer';

const ArchiveTemplate: React.FC<ThemeTemplateProps> = ({ 
  posts = [], 
  post, 
  primaryMenu, 
  header 
}) => {
  return (
    <div className="archive-template min-h-screen bg-transparent text-[#444444]">
      <Header menu={primaryMenu} settings={header} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Single Post View */}
        {post && (
          <article className="single-post">
            <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
            
            {post.featuredImage && (
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="w-full h-auto mb-8 rounded-lg shadow-md"
              />
            )}
            
            <div className="post-meta mb-8 text-gray-500 flex gap-4 text-sm border-b pb-4">
              {post.author && <span>By {post.author}</span>}
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
          <div className="archive-index">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Blog Archive</h1>
            
            <div className="posts-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.filter(p => p.status === 'PUBLISHED').map((post) => (
                <article key={post.id} className="post-card border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all bg-white">
                  {post.featuredImage && (
                    <img 
                      src={post.featuredImage} 
                      alt={post.title} 
                      className="w-full h-48 object-cover"
                    />
                  )}
                  
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-3 text-blue-600">
                      <a href={`/blog/${post.slug}`} className="hover:underline">
                        {post.title}
                      </a>
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    <a href={`/blog/${post.slug}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                      Read More &rarr;
                    </a>
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