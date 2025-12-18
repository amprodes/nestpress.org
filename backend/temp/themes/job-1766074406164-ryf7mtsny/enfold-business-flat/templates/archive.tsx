import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings, ThemeTemplateProps } from '@/types';
import { Header } from '../parts/Header';
import { Footer } from '../parts/Footer';

export default function ArchiveTemplate(props: ThemeTemplateProps) {
  const { 
    posts = [], 
    post, 
    primaryMenu, 
    footerMenu, 
    sidebarWidgets, 
    footerWidgets, 
    header 
  } = props;

  return (
    <div className="archive-template min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(68, 68, 68)' }}>
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="max-w-7xl mx-auto px-4 py-8">

        {post && (
          <article className="single-post">
            <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
            {post.featuredImage && (
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="w-full h-auto mb-8 rounded-lg shadow-sm" />
            )}
            <div className="post-meta flex items-center gap-4 text-gray-500 mb-8 border-b pb-4">
              <span>By {post.author}</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="post-content prose prose-lg max-w-none">
              {post.content}
            </div>
          </article>
        )}

        {!post && (
          <div className="archive-content">
            <h1 className="text-3xl font-bold mb-8">Blog Archive</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts?.filter(p => p.status === 'PUBLISHED').map((post) => (
                <article key={post.id} className="post-card flex flex-col h-full border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {post.featuredImage && (
                    <img 
                      src={post.featuredImage} 
                      alt={post.title} 
                      className="w-full h-48 object-cover" />
                  )}
                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-xl font-bold mb-3">
                      <a href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                        {post.title}
                      </a>
                    </h2>
                    <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto pt-4 border-t">
                      <a href={`/blog/${post.slug}`} className="text-blue-600 font-medium hover:underline inline-flex items-center">
                        Read more 
                        <span className="ml-1">&rarr;</span>
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {posts?.filter(p => p.status === 'PUBLISHED').length === 0 && (
              <p className="text-gray-500">No posts found.</p>
            )}
          </div>
        )}
      </main>

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}