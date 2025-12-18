import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings, Product, ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../parts/Header';

export default function PageTemplate(props: ThemeTemplateProps) {
  const { posts, post, primaryMenu, footerMenu, sidebarWidgets, footerWidgets, header } = props;

  return (
    <div className="page-template min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(68, 68, 68)' }}>
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
            <div className="post-meta mb-8 text-gray-500 text-sm border-b pb-4">
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
        )}

        {!post && posts && (
          <div className="posts-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.filter(p => p.status === 'PUBLISHED').map((postItem) => (
              <article key={postItem.id} className="post-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
                {postItem.featuredImage && (
                  <div className="aspect-w-16 aspect-h-9">
                    <img 
                      src={postItem.featuredImage} 
                      alt={postItem.title} 
                      className="w-full h-48 object-cover" />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-3 text-gray-900">
                    <a href={`/blog/${postItem.slug}`} className="hover:text-blue-600 transition-colors">
                      {postItem.title}
                    </a>
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">{postItem.excerpt}</p>
                  <div className="text-sm text-gray-500 pt-4 border-t">
                    {new Date(postItem.createdAt).toLocaleDateString()}
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