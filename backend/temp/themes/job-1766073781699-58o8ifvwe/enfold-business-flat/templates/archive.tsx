import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings, ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../parts/Header';

export default function ArchiveTemplate(props: ThemeTemplateProps) {
  const { posts, post, primaryMenu, footerMenu, sidebarWidgets, footerWidgets, header } = props;

  return (
    <div className="archive-template min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-12">

        {post && (
          <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 mb-12">
            <header className="mb-8 border-b pb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 gap-4">
                <span className="font-medium text-gray-900">By {post.author || 'Editor'}</span>
                <span>•</span>
                <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString()}</time>
              </div>
              {post.featuredImage && (
                <div className="w-full h-auto overflow-hidden rounded-xl shadow-md">
                  <img 
                    src={post.featuredImage} 
                    alt={post.title} 
                    className="w-full h-full object-cover" />
                </div>
              )}
            </header>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              {post.content}
            </div>
          </article>
        )}

        {!post && (
          <div className="w-full">
            <div className="mb-16 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                {header?.general?.siteTitle || 'Blog'}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {header?.general?.siteDescription || 'Discover our latest stories, updates, and news.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts?.filter(p => p.status === 'PUBLISHED').map((item) => (
                <article key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100 overflow-hidden group">
                  {item.featuredImage && (
                    <a href={`/blog/${item.slug}`} className="block h-56 overflow-hidden relative">
                      <img 
                        src={item.featuredImage} 
                        alt={item.title} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    </a>
                  )}
                  <div className="p-6 flex flex-col flex-grow">
                    <header className="mb-4">
                      <div className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">
                        Article
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 leading-snug group-hover:text-blue-700 transition-colors">
                        <a href={`/blog/${item.slug}`} className="block">
                          {item.title}
                        </a>
                      </h2>
                      <div className="text-sm text-gray-400 mt-2">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </header>
                    <p className="text-gray-600 mb-6 flex-grow line-clamp-3 leading-relaxed">
                      {item.excerpt}
                    </p>
                    <footer className="mt-auto border-t pt-4 border-gray-50">
                      <a 
                        href={`/blog/${item.slug}`} 
                        className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors text-sm"
                      >
                        Read Full Story
                        <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
                      </a>
                    </footer>
                  </div>
                </article>
              ))}
            </div>

            {posts?.filter(p => p.status === 'PUBLISHED').length === 0 && (
              <div className="text-center py-32 bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-2xl text-gray-400 font-light">No posts found.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}