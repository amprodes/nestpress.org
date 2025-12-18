import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings, ThemeTemplateProps } from '@/types';
import { Header } from '../parts/Header';
import { Footer } from '../parts/Footer';

export default function PageSidebarTemplate(props: ThemeTemplateProps) {
  const { posts, post, primaryMenu, footerMenu, sidebarWidgets, footerWidgets, header } = props;

  const colors = {
    background: 'rgba(0, 0, 0, 0)',
    text: 'rgb(68, 68, 68)',
    primary: '#2563eb',
    secondary: '#64748b'
  };

  return (
    <div className="page-sidebar-template min-h-screen flex flex-col" style={{ backgroundColor: colors.background, color: colors.text }}>
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 md:col-span-2">
          {post && (
            <article className="single-post">
              <h1 className="text-4xl font-bold mb-6" style={{ color: colors.primary }}>{post.title}</h1>
              {post.featuredImage && (
                <img 
                  src={post.featuredImage} 
                  alt={post.title} 
                  className="w-full h-auto mb-6 rounded-lg shadow-sm" />
              )}
              <div className="post-meta text-sm mb-6" style={{ color: colors.secondary }}>
                {post.author && <span className="mr-4">By {post.author}</span>}
                {post.createdAt && <span>{new Date(post.createdAt).toLocaleDateString()}</span>}
              </div>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>
          )}

          {!post && posts && (
            <div className="posts-grid grid grid-cols-1 gap-8">
              {posts.filter(p => p.status === 'PUBLISHED').map((p) => (
                <article key={p.id} className="post-card border-b pb-8" style={{ borderColor: colors.secondary }}>
                  {p.featuredImage && (
                    <img 
                      src={p.featuredImage} 
                      alt={p.title} 
                      className="w-full h-64 object-cover mb-4 rounded" />
                  )}
                  <h2 className="text-2xl font-bold mb-2">
                    <a href={`/${p.slug}`} className="hover:opacity-80" style={{ color: colors.primary }}>
                      {p.title}
                    </a>
                  </h2>
                  <p className="mb-4">{p.excerpt}</p>
                  <a 
                    href={`/${p.slug}`} 
                    className="inline-block px-4 py-2 rounded text-white hover:opacity-90"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Read More
                  </a>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="col-span-1">
          <div className="sticky top-4">
            {sidebarWidgets?.map((widget) => (
              <div key={widget.id} className="widget mb-8 p-6 rounded-lg border shadow-sm" style={{ backgroundColor: colors.background, borderColor: colors.secondary }}>
                <h3 className="font-bold text-xl mb-4 border-b pb-2" style={{ color: colors.primary, borderColor: colors.secondary }}>
                  {widget.title}
                </h3>
                <div dangerouslySetInnerHTML={{ __html: widget.content }} />
              </div>
            ))}
          </div>
        </aside>
      </main>

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}