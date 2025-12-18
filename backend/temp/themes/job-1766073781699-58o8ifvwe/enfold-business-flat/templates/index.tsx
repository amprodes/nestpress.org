import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings, ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../parts/Header';

export default function HomeTemplate(props: ThemeTemplateProps) {
  const { posts = [], post, primaryMenu, footerMenu, sidebarWidgets = [], footerWidgets = [], header } = props;

  return (
    <div className="home-template min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-12">

        {post && (
          <article className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 border border-slate-100">
            <header className="mb-8 border-b border-slate-100 pb-8">
              <h1 className="text-4xl font-extrabold text-slate-900 mb-4 leading-tight">{post.title}</h1>
              <div className="flex items-center text-sm text-slate-500 space-x-4">
                {post.author && <span className="font-medium text-blue-600">By {post.author}</span>}
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </header>

            {post.featuredImage && (
              <div className="mb-10 rounded-lg overflow-hidden shadow-md">
                <img 
                  src={post.featuredImage} 
                  alt={post.title} 
                  className="w-full h-auto object-cover max-h-[600px]" />
              </div>
            )}

            <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed">
              {post.content}
            </div>
          </article>
        )}

        {!post && (
          <div className="posts-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts?.filter(p => p.status === 'PUBLISHED').map((post) => (
              <article key={post.id} className="post-card bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 flex flex-col overflow-hidden h-full">
                {post.featuredImage && (
                  <div className="relative h-56 overflow-hidden bg-slate-200">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title} 
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wider">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-3 leading-snug">
                    <a href={`/${post.slug}`} className="hover:text-blue-700 transition-colors">
                      {post.title}
                    </a>
                  </h2>
                  <p className="text-slate-600 mb-6 line-clamp-3 flex-grow leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto pt-4 border-t border-slate-50">
                    <a href={`/${post.slug}`} className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors group">
                      Read Article
                      <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!post && (!posts || posts.length === 0) && (
          <div className="text-center py-24 bg-white rounded-xl border border-dashed border-slate-300">
            <h3 className="text-lg font-medium text-slate-900">No posts found</h3>
            <p className="mt-1 text-sm text-slate-500">Get started by creating a new post.</p>
          </div>
        )}
      </main>

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}