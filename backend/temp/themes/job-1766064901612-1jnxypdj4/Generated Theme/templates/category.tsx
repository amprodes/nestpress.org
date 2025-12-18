import React from 'react';
import { ThemeTemplateProps } from '@/types';
import Header from './Header';
import Footer from './Footer';

const CategoryTemplate: React.FC<ThemeTemplateProps> = ({ 
  posts = [], 
  post,
  primaryMenu,
  sidebarWidgets = [],
  header 
}) => {
  return (
    <div className="category-template min-h-screen bg-transparent text-gray-800">
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Blog Archive</h1>
        
        <div className="posts-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.filter(p => p.status === 'PUBLISHED').map((post) => (
            <article key={post.id} className="post-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {post.featuredImage && (
                <img 
                  src={post.featuredImage} 
                  alt={post.title} 
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">
                  <a href={`/blog/${post.slug}`} className="hover:text-blue-600">
                    {post.title}
                  </a>
                </h2>
                <div className="text-sm text-gray-500 mb-4">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <a href={`/blog/${post.slug}`} className="text-blue-600 font-medium hover:underline">
                  Read more
                </a>
              </div>
            </article>
          ))}
        </div>

        {posts.filter(p => p.status === 'PUBLISHED').length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No posts found in this category.</p>
          </div>
        )}
      </main>

      <Footer header={header} />
    </div>
  );
};

export default CategoryTemplate;