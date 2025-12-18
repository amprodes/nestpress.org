import * as React from 'react';
import type { Post, Product, Menu, Widget, SiteSettings, ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../parts/Header';

export default function NotFoundTemplate(props: ThemeTemplateProps) {
  const { 
    posts = [], 
    primaryMenu,
    footerMenu,
    sidebarWidgets = [],
    footerWidgets = [],
    header 
  } = props;

  const colors = {
    background: '#ffffff',
    text: 'rgb(68, 68, 68)',
    primary: '#2563eb',
    secondary: '#64748b'
  };

  return (
    <div className="404-template min-h-screen flex flex-col" style={{ backgroundColor: colors.background, color: colors.text }}>
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-16">
        <div className="text-center py-12 mb-16">
          <h1 className="text-9xl font-bold text-gray-200 mb-4">404</h1>
          <h2 className="text-3xl font-bold mb-4" style={{ color: colors.text }}>Page not found</h2>
          <p className="text-xl mb-8 text-gray-600">Sorry, we couldn't find the page you're looking for.</p>
          <a href="/" className="inline-block px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90" style={{ backgroundColor: colors.primary }}>
            Go back home
          </a>
        </div>

        {posts && posts.length > 0 && (
          <div className="suggested-posts border-t pt-12" style={{ borderColor: '#e5e7eb' }}>
            <h3 className="text-2xl font-bold mb-8 text-center">You might be interested in</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {posts.filter(p => p.status === 'PUBLISHED').slice(0, 3).map((post) => (
                <article key={post.id} className="post-card group">
                  {post.featuredImage && (
                    <div className="aspect-video w-full overflow-hidden rounded-lg mb-4 bg-gray-100">
                      <img 
                        src={post.featuredImage} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <h4 className="text-xl font-bold mb-2">
                    <a href={`/blog/${post.slug}`} className="hover:underline decoration-2" style={{ color: colors.text }}>
                      {post.title}
                    </a>
                  </h4>
                  {post.excerpt && (
                    <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}