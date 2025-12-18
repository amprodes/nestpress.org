import React from 'react';
import { ThemeTemplateProps } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Template404: React.FC<ThemeTemplateProps> = ({ 
  posts = [], 
  post,
  primaryMenu,
  sidebarWidgets = [],
  header 
}) => {
  return (
    <div className="404-template">
      <Header menu={primaryMenu} settings={header} />

      <main className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
        <div className="text-center py-12">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <p className="text-xl mb-8">Page not found</p>
          <a href="/" className="text-blue-600 hover:underline">Go back home</a>
        </div>

        {/* Suggested/Recent Posts Display */}
        {posts.length > 0 && (
          <div className="posts-grid mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center">You might be interested in</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.filter(p => p.status === 'PUBLISHED').map((post) => (
                <article key={post.id} className="post-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  {post.featuredImage && (
                    <img 
                      src={post.featuredImage} 
                      alt={post.title} 
                      className="w-full h-48 object-cover rounded mb-4"
                    />
                  )}
                  <h3 className="text-xl font-semibold mb-2">
                    <a href={`/blog/${post.slug}`} className="hover:text-blue-600">
                      {post.title}
                    </a>
                  </h3>
                  <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>
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

export default Template404;