import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings, ThemeTemplateProps } from '@/types';
import { Header } from '../parts/Header';
import { Footer } from '../parts/Footer';

export default function PageTemplate(props: ThemeTemplateProps) {
  const { posts = [], post, primaryMenu, footerMenu, sidebarWidgets = [], footerWidgets = [], header } = props;

  return (
    <div className="page-template min-h-screen flex flex-col bg-white text-slate-800 font-sans">
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-12">
        {post ? (
          <div className="flex flex-col lg:flex-row gap-12">
            <article className="flex-1 w-full">
              <header className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900">{post.title}</h1>
                <div className="flex items-center text-sm text-slate-500 space-x-4 border-b pb-8">
                  <span className="font-medium text-slate-900">By {post.author}</span>
                  <span>&bull;</span>
                  <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString()}</time>
                </div>
              </header>

              {post.featuredImage && (
                <div className="mb-10 w-full overflow-hidden rounded-xl shadow-lg">
                  <img 
                    src={post.featuredImage} 
                    alt={post.title} 
                    className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500" />
                </div>
              )}

              <div className="prose prose-lg max-w-none prose-slate" dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>

            {sidebarWidgets.length > 0 && (
              <aside className="w-full lg:w-80 flex-shrink-0 space-y-8">
                {sidebarWidgets.map((widget) => (
                  <div key={widget.id} className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                    <h3 className="font-bold text-lg mb-4 text-slate-900 border-b pb-2">{widget.title}</h3>
                    <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: widget.content }} />
                  </div>
                ))}
              </aside>
            )}
          </div>
        ) : (
          <div className="posts-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts?.filter(p => p.status === 'PUBLISHED').map((post) => (
              <article key={post.id} className="post-card flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {post.featuredImage && (
                  <a href={`/blog/${post.slug}`} className="block overflow-hidden aspect-video">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title} 
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
                  </a>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-xs text-blue-600 font-semibold mb-2 uppercase tracking-wider">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                  <h2 className="text-xl font-bold mb-3 text-slate-900 leading-tight">
                    <a href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                      {post.title}
                    </a>
                  </h2>
                  <p className="text-slate-600 mb-4 line-clamp-3 flex-grow">{post.excerpt}</p>
                  <a href={`/blog/${post.slug}`} className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800">
                    Read Article 
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}