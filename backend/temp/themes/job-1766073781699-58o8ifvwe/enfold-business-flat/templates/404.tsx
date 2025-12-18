import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings, ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../parts/Header';

export default function 404Template(props: ThemeTemplateProps) {
  const { posts = [], primaryMenu, footerMenu, sidebarWidgets = [], footerWidgets = [], header } = props;

  return (
    <div className="404-template min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(68, 68, 68)' }}>
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12 mb-12">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <p className="text-xl mb-8">Page not found</p>
          <a href="/" className="text-blue-600 hover:underline">Go back home</a>
        </div>

        {posts && posts.length > 0 && (
          <div className="posts-grid mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center">You might be interested in</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.filter(p => p.status === 'PUBLISHED').slice(0, 3).map((post) => (
                <article key={post.id} className="post-card border rounded-lg overflow-hidden shadow-sm bg-white">
                  {post.featuredImage && (
                    <img 
                      src={post.featuredImage} 
                      alt={post.title} 
                      className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">
                      <a href={`/blog/${post.slug}`} className="hover:text-blue-600">
                        {post.title}
                      </a>
                    </h3>
                    <p className="text-sm opacity-80 line-clamp-3">{post.excerpt}</p>
                  </div>
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