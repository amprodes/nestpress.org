import React from 'react';
import { ThemeTemplateProps } from '@/types';
import Header from './Header';
import Footer from './Footer';

const ArchiveTemplate: React.FC<ThemeTemplateProps> = (props) => {
  const { posts = [], post } = props;

  return (
    <div className="archive-template min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(68, 68, 68)' }}>
      <Header {...props} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Single Post View */}
        {post && (
          <article className="single-post">
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            
            {post.featuredImage && (
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="w-full h-auto mb-6 rounded-lg shadow-sm"
              />
            )}
            
            <div className="post-meta flex gap-4 text-sm text-gray-500 mb-8 pb-4 border-b">
              <span>By {post.author}</span>
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
          <div className="archive-index">
            <h1 className="text-3xl font-bold mb-8">Blog Archive</h1>
            <div className="posts-grid grid gap-8">
              {posts.filter(p => p.status === 'PUBLISHED').map((post) => (
                <article key={post.id} className="post-card border-b pb-8 last:border-0">
                  {post.featuredImage && (
                    <img 
                      src={post.featuredImage} 
                      alt={post.title} 
                      className="w-full h-64 object-cover mb-4 rounded-lg"
                    />
                  )}
                  <h2 className="text-2xl font-bold mb-2">
                    <a href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                      {post.title}
                    </a>
                  </h2>
                  <p className="mb-4 text-lg">{post.excerpt}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer {...props} />
    </div>
  );
};

export default ArchiveTemplate;