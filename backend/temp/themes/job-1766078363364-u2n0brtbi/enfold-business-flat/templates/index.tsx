import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings, ThemeTemplateProps } from '@/types';
import { Header } from '../parts/Header';
import { Footer } from '../parts/Footer';

export default function HomeTemplate(props: ThemeTemplateProps) {
  const { 
    posts = [], 
    post, 
    primaryMenu, 
    footerMenu, 
    sidebarWidgets = [], 
    footerWidgets = [], 
    header 
  } = props;

  return (
    <div className="home-template min-h-screen bg-white text-gray-800 font-sans">
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {post && (
          <article className="single-post max-w-4xl mx-auto">
            <header className="mb-8">
              <h1 className="text-4xl font-bold mb-4 text-gray-900">{post.title}</h1>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                {post.author && <span>By {post.author}</span>}
                <span>{new Date(post.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </header>

            {post.featuredImage && (
              <div className="mb-10 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={post.featuredImage} 
                  alt={post.title} 
                  className="w-full h-auto object-cover max-h-[600px]" />
              </div>
            )}

            <div className="prose prose-lg max-w-none text-gray-700">
              {post.content}
            </div>
          </article>
        )}

        {!post && (
          <div className="posts-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts?.filter(p => p.status === 'PUBLISHED').map((post) => (
              <article key={post.id} className="post-card flex flex-col h-full border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {post.featuredImage && (
                  <a href={`/${post.slug}`} className="block aspect-w-16 aspect-h-9 bg-gray-100 overflow-hidden">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title} 
                      className="w-full h-64 object-cover transform hover:scale-105 transition-transform duration-500" />
                  </a>
                )}
                <div className="flex-1 p-6 flex flex-col">
                  <h2 className="text-2xl font-bold mb-3 leading-tight">
                    <a href={`/${post.slug}`} className="hover:text-blue-600 transition-colors">
                      {post.title}
                    </a>
                  </h2>
                  <p className="text-gray-600 mb-4 flex-1 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                    <a href={`/${post.slug}`} className="text-blue-600 font-medium hover:underline text-sm">
                      Read more
                    </a>
                  </div>
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