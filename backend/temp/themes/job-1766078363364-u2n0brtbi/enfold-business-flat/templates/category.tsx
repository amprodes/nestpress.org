import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings, ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../parts/Header';

export default function CategoryTemplate(props: ThemeTemplateProps) {
  const { 
    posts = [], 
    primaryMenu, 
    sidebarWidgets = [], 
    header, 
    footerMenu, 
    footerWidgets 
  } = props;

  const publishedPosts = posts?.filter((p) => p.status === 'PUBLISHED') || [];

  return (
    <div className="category-template min-h-screen flex flex-col bg-white text-gray-800">
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">

          <div className={`w-full ${sidebarWidgets?.length > 0 ? 'lg:w-2/3' : 'lg:w-full'}`}>
            <header className="mb-10 border-b pb-4">
              <h1 className="text-4xl font-bold text-gray-900">Blog Archive</h1>
              <p className="mt-2 text-gray-500">Latest updates and articles</p>
            </header>

            <div className="flex flex-col gap-10">
              {publishedPosts.length > 0 ? (
                publishedPosts.map((post) => (
                  <article key={post.id} className="flex flex-col bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    {post.featuredImage && (
                      <div className="w-full h-64 bg-gray-100 overflow-hidden">
                        <img 
                          src={post.featuredImage} 
                          alt={post.title} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        {post.author && <span>By {post.author}</span>}
                      </div>

                      <h2 className="text-2xl font-bold mb-3 text-gray-900">
                        <a href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                          {post.title}
                        </a>
                      </h2>

                      <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <a href={`/blog/${post.slug}`} className="inline-flex items-center text-blue-600 font-medium hover:underline">
                        Read Article
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </a>
                    </div>
                  </article>
                ))
              ) : (
                <div className="py-12 text-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-lg">No posts found in this category.</p>
                </div>
              )}
            </div>
          </div>

          {sidebarWidgets && sidebarWidgets.length > 0 && (
            <aside className="w-full lg:w-1/3">
              <div className="sticky top-8 space-y-8">
                {sidebarWidgets.map((widget) => (
                  <div key={widget.id} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 border-b border-gray-200 pb-2">
                      {widget.title}
                    </h3>
                    <div className="prose prose-sm max-w-none text-gray-600">

                      {widget.content}
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          )}

        </div>
      </main>

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}