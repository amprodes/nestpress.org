import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings, ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../parts/Header';

export default function PageTemplate(props: ThemeTemplateProps) {
  const { posts, post, primaryMenu, footerMenu, footerWidgets, header } = props;

  return (
    <div className="page-template min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(68, 68, 68)' }}>
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="max-w-7xl mx-auto px-4 py-8">

        {post && (
          <article className="single-post">
            <header className="mb-8">
              <h1 className="text-4xl font-bold mb-4 text-gray-900">{post.title}</h1>
              {post.featuredImage && (
                <div className="mb-6">
                  <img 
                    src={post.featuredImage} 
                    alt={post.title} 
                    className="w-full h-auto rounded-lg shadow-sm" />
                </div>
              )}
              <div className="flex items-center text-sm text-gray-500 mb-6">
                <span className="mr-4">By {post.author || 'Admin'}</span>
                <span>{new Date(post.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </header>
            <div 
              className="prose prose-lg max-w-none" 
              dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
        )}

        {!post && posts && (
          <div className="posts-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.filter(p => p.status === 'PUBLISHED').map((item) => (
              <article key={item.id} className="post-card bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100">
                {item.featuredImage && (
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                    <img 
                      src={item.featuredImage} 
                      alt={item.title} 
                      className="object-cover w-full h-48" />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2 text-gray-900">
                    <a href={`/blog/${item.slug}`} className="hover:text-blue-600 transition-colors">
                      {item.title}
                    </a>
                  </h2>
                  <p className="text-gray-600 line-clamp-3 mb-4">
                    {item.excerpt || 'Read more about this topic...'}
                  </p>
                  <a href={`/blog/${item.slug}`} className="inline-block text-blue-600 font-medium hover:underline">
                    Read Article &rarr;
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