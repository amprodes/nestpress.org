import React from 'react';
import { ThemeTemplateProps } from '@/types';
import Header from './Header';
import Footer from './Footer';

const CategoryTemplate: React.FC<ThemeTemplateProps> = (props) => {
  const { posts = [], post } = props;

  return (
    <div className="category-template min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(68, 68, 68)' }}>
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
                className="w-full h-auto mb-6 rounded-lg" 
              />
            )}
            <div className="post-meta mb-8 text-sm opacity-80 border-b pb-4" style={{ borderColor: '#e5e7eb' }}>
              <span>By {post.author}</span>
              <span className="mx-2">|</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div dangerouslySetInnerHTML={{ __html: post.content }} className="prose max-w-none" />
          </article>
        )}

        {/* Archive/Index View */}
        {!post && (
          <div className="archive-view">
            <h1 className="text-3xl font-bold mb-8">Blog Archive</h1>
            <div className="posts-grid">
              {posts.filter(p => p.status === 'PUBLISHED').map((item) => (
                <article key={item.id} className="post-card mb-8 border-b pb-8" style={{ borderColor: '#e5e7eb' }}>
                  {item.featuredImage && (
                    <img 
                      src={item.featuredImage} 
                      alt={item.title} 
                      className="w-full h-64 object-cover mb-4 rounded" 
                    />
                  )}
                  <h2 className="text-2xl font-bold mb-2">
                    <a href={`/blog/${item.slug}`} className="hover:opacity-80">
                      {item.title}
                    </a>
                  </h2>
                  <p className="mb-4">{item.excerpt}</p>
                  <a href={`/blog/${item.slug}`} className="font-medium hover:underline" style={{ color: '#2563eb' }}>
                    Read more &rarr;
                  </a>
                </article>
              ))}
            </div>
            {posts.filter(p => p.status === 'PUBLISHED').length === 0 && (
              <p className="text-center py-10 opacity-70">No posts found.</p>
            )}
          </div>
        )}
      </main>

      <Footer {...props} />
    </div>
  );
};

export default CategoryTemplate;