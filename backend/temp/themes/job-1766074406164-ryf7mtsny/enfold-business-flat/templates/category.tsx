import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings, ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../parts/Header';

export default function CategoryTemplate(props: ThemeTemplateProps) {
  const { posts, primaryMenu, footerMenu, footerWidgets, header } = props;

  return (
    <div className="category-template flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 border-b border-slate-200 pb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
            Category Archive
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Explore our latest articles, news, and updates within this category.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts?.filter((p) => p.status === 'PUBLISHED').map((post) => (
            <article key={post.id} className="flex flex-col overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 bg-white border border-slate-200">
              {post.featuredImage && (
                <div className="relative flex-shrink-0 h-52 w-full overflow-hidden bg-slate-200 group">
                  <img
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={post.featuredImage}
                    alt={post.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )}
              
              <div className="flex flex-1 flex-col justify-between p-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Post
                    </span>
                    <time className="text-sm text-slate-500" dateTime={post.createdAt}>
                      {new Date(post.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                  
                  <a href={`/blog/${post.slug}`} className="block group">
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="mt-3 text-base text-slate-600 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </a>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 uppercase">
                      {typeof post.author === 'string' ? post.author.charAt(0) : 'A'}
                    </div>
                    <span className="ml-2 text-sm font-medium text-slate-700">
                      {post.author}
                    </span>
                  </div>
                  <a href={`/blog/${post.slug}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                    Read more &rarr;
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {(!posts || posts.filter((p) => p.status === 'PUBLISHED').length === 0) && (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed border-slate-300">
            <div className="mx-auto h-12 w-12 text-slate-300 mb-3">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900">No posts found</h3>
            <p className="mt-1 text-sm text-slate-500">There are no published posts available in this category at the moment.</p>
          </div>
        )}
      </main>

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}