import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings, ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../parts/Header';

export default function HomeTemplate(props: ThemeTemplateProps) {
  const { posts = [], post, primaryMenu, footerMenu, sidebarWidgets = [], footerWidgets = [], header } = props;

  return (
    <div className="home-template min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(68, 68, 68)' }}>
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {post && (
          <div className="single-post-container mb-12">
            <article className="single-post">
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
              {post.featuredImage && (
                <img 
                  src={post.featuredImage} 
                  alt={post.title} 
                  className="w-full h-auto rounded-lg mb-6" />
              )}
              <div className="post-meta text-sm text-gray-500 mb-6">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="post-content prose max-w-none">
                {post.content}
              </div>
            </article>
          </div>
        )}

        {!post && (
          <div className="posts-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts?.filter(p => p.status === 'PUBLISHED').map((post) => (
              <article key={post.id} className="post-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
                {post.featuredImage && (
                  <div className="aspect-w-16 aspect-h-9">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title} 
                      className="w-full h-48 object-cover" />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2">
                    <a href={`/${post.slug}`} className="hover:text-blue-600 transition-colors">
                      {post.title}
                    </a>
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  <a href={`/${post.slug}`} className="text-blue-600 font-medium hover:underline">
                    Read more
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {sidebarWidgets && sidebarWidgets.length > 0 && (
          <aside className="sidebar-section mt-16 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {sidebarWidgets.map((widget) => (
                <div key={widget.id} className="widget">
                  <h3 className="text-lg font-bold mb-3">{widget.title}</h3>
                  <div className="widget-content">
                    {widget.content}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </main>

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}