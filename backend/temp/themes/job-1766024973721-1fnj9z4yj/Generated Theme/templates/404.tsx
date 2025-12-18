import React from 'react';
import { ThemeTemplateProps } from '@/types';
import Header from './Header';
import Footer from './Footer';

const NotFoundTemplate: React.FC<ThemeTemplateProps> = ({ 
  posts = [], 
  post,
  primaryMenu,
  sidebarWidgets = [],
  header 
}) => {
  return (
    <div className="404-template min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(68, 68, 68)' }}>
      <Header header={header} primaryMenu={primaryMenu} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div>
          <div className="text-center py-12">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-xl mb-8">Page not found</p>
            <a href="/" className="text-blue-600 hover:underline">Go back home</a>
          </div>
        </div>

        {/* Suggest recent posts to keep user on site - adhering to index loop rule */}
        {posts && posts.length > 0 && (
          <div className="posts-grid mt-16 pt-8 border-t" style={{ borderColor: '#e5e7eb' }}>
            <h2 className="text-2xl font-bold mb-6 text-center">You might be interested in</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.filter(p => p.status === 'PUBLISHED').map((post) => (
                <article key={post.id} className="post-card">
                  {post.featuredImage && (
                    <img 
                      src={post.featuredImage} 
                      alt={post.title} 
                      className="w-full h-48 object-cover mb-4 rounded" 
                    />
                  )}
                  <h2 className="text-xl font-semibold mb-2">
                    <a href={`/blog/${post.slug}`} className="hover:text-blue-600">
                      {post.title}
                    </a>
                  </h2>
                  <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer header={header} />
    </div>
  );
};

export default NotFoundTemplate;