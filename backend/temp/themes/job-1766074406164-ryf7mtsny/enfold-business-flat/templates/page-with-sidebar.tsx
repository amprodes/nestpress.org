import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings, ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../parts/Header';

export default function PageSidebarTemplate(props: ThemeTemplateProps) {
  const { posts, post, primaryMenu, sidebarWidgets, header, footerMenu, footerWidgets } = props;

  return (
    <div className="page-sidebar-template min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(68, 68, 68)' }}>
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 md:col-span-2">
          {post && (
            <article className="single-post">
              <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
              {post.featuredImage && (
                <img 
                  src={post.featuredImage} 
                  alt={post.title} 
                  className="w-full h-auto mb-6 rounded" />
              )}
              <div className="post-meta mb-6 text-sm text-gray-500">
                {post.author && <span className="mr-4">By {post.author}</span>}
                {post.createdAt && <span>{new Date(post.createdAt).toLocaleDateString()}</span>}
              </div>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>
          )}

          {!post && posts && (
            <div className="posts-grid grid gap-8">
              {posts.filter(p => p.status === 'PUBLISHED').map((post) => (
                <article key={post.id} className="post-card border-b border-gray-200 pb-8">
                  {post.featuredImage && (
                    <img 
                      src={post.featuredImage} 
                      alt={post.title} 
                      className="w-full h-64 object-cover mb-4 rounded" />
                  )}
                  <h2 className="text-2xl font-bold mb-3">
                    <a href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                      {post.title}
                    </a>
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  <a href={`/blog/${post.slug}`} className="text-blue-600 font-medium hover:underline">
                    Read more
                  </a>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="col-span-1">
          {sidebarWidgets?.map((widget) => (
            <div key={widget.id} className="widget mb-8 p-6 rounded bg-gray-50">
              <h3 className="font-bold text-lg mb-4 border-b pb-2">{widget.title}</h3>
              <div className="widget-content" dangerouslySetInnerHTML={{ __html: widget.content }} />
            </div>
          ))}
        </aside>
      </main>

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}