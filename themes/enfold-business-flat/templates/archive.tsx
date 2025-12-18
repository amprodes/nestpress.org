import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings, ThemeTemplateProps } from '@/types';
import { Header } from '../parts/Header';
import { Footer } from '../parts/Footer';

export default function ArchiveTemplate(props: ThemeTemplateProps) {
  const { posts, post, primaryMenu, footerMenu, sidebarWidgets, footerWidgets, header } = props;

  return (
    <div className="archive-template min-h-screen flex flex-col bg-white text-gray-800">
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">

        {post && (
          <div className="single-post-container max-w-4xl mx-auto">
            <article className="mb-12">
              <header className="mb-8">
                <h1 className="text-4xl font-bold mb-4 text-gray-900">{post.title}</h1>
                <div className="post-meta text-sm text-gray-500 flex gap-4 items-center">
                  <span>{new Date(post.createdAt || Date.now()).toLocaleDateString()}</span>
                  {post.author && <span>By {post.author}</span>}
                </div>
              </header>

              {post.featuredImage && (
                <div className="mb-8">
                  <img 
                    src={post.featuredImage} 
                    alt={post.title} 
                    className="w-full h-auto rounded-lg shadow-sm" />
                </div>
              )}

              <div className="prose prose-lg max-w-none text-gray-700">

                {post.content}
              </div>
            </article>
          </div>
        )}

        {!post && posts && (
          <div className="archive-container">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">
              {header?.general?.siteTitle ? `${header.general.siteTitle} Blog` : 'Blog Archive'}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.filter(p => p.status === 'PUBLISHED').map((postItem) => (
                <article key={postItem.id} className="post-card flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {postItem.featuredImage && (
                    <div className="h-48 overflow-hidden bg-gray-100">
                      <img 
                        src={postItem.featuredImage} 
                        alt={postItem.title} 
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2">
                      <a href={`/blog/${postItem.slug}`} className="hover:text-blue-600 transition-colors">
                        {postItem.title}
                      </a>
                    </h2>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                      {postItem.excerpt}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                      <span>{new Date(postItem.createdAt).toLocaleDateString()}</span>
                      <a href={`/blog/${postItem.slug}`} className="text-blue-600 font-medium hover:underline">
                        Read more
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {posts.filter(p => p.status === 'PUBLISHED').length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No posts found.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}