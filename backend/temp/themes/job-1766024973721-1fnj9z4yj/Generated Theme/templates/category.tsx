import React from 'react';
import { ThemeTemplateProps } from '@/types';
import Header from './Header';
import Footer from './Footer';

const CategoryTemplate: React.FC<ThemeTemplateProps> = ({ 
  posts = [], 
  primaryMenu, 
  header 
}) => {
  return (
    <div className="category-template min-h-screen bg-white text-gray-800">
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="archive-header mb-8">
          <h1 className="text-3xl font-bold">Blog Archive</h1>
        </div>

        <div className="posts-grid">
          {posts.filter(p => p.status === 'PUBLISHED').map((post) => (
            <article key={post.id} className="post-card mb-8 border-b pb-8">
              {post.featuredImage && (
                <img 
                  src={post.featuredImage} 
                  alt={post.title} 
                  className="w-full h-64 object-cover mb-4 rounded-lg"
                />
              )}
              <h2 className="text-2xl font-bold mb-2">
                <a href={`/blog/${post.slug}`} className="hover:text-blue-600">
                  {post.title}
                </a>
              </h2>
              <div className="post-meta text-sm text-gray-500 mb-4">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-600 leading-relaxed">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </main>

      <Footer header={header} />
    </div>
  );
};

export default CategoryTemplate;