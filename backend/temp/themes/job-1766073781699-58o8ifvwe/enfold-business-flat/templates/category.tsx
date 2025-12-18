import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings, ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../parts/Header';

export default function CategoryTemplate(props: ThemeTemplateProps) {
  const { posts = [], primaryMenu, footerMenu, footerWidgets = [], header } = props;

  return (
    <div className="category-template flex flex-col min-h-screen bg-gray-50 text-slate-800 font-sans">
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-gray-200 pb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Category Archive
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Explore our latest articles, news, and updates.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts?.filter((p: Post) => p.status === 'PUBLISHED').map((post: Post) => (
            <article 
              key={post.id} 
              className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md border border-gray-100"
            >
              {post.featuredImage && (
                <div className="aspect-w-16 aspect-h-9 w-full bg-gray-100">
                  <img 
                    src={post.featuredImage} 
                    alt={post.title} 
                    className="h-48 w-full object-cover"
                    loading="lazy" />
                </div>
              )}
              
              <div className="flex flex-1 flex-col p-6">
                <div className="flex-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <time dateTime={post.createdAt}>
                      {new Date(post.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                  
                  <a href={`/blog/${post.slug}`} className="mt-2 block group">
                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>
                    <p className="mt-3 text-base text-gray-500 line-clamp-3">
                      {post.excerpt}
                    </p>
                  </a>
                </div>
                
                <div className="mt-6 flex items-center border-t border-gray-50 pt-4">
                  <div className="text-sm font-medium text-gray-900">
                    {post.author ? `By ${post.author}` : 'Editorial Team'}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {(!posts || posts.filter((p: Post) => p.status === 'PUBLISHED').length === 0) && (
          <div className="py-12 text-center">
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No posts found</h3>
            <p className="mt-1 text-sm text-gray-500">There are currently no published posts in this category.</p>
          </div>
        )}
      </main>

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}