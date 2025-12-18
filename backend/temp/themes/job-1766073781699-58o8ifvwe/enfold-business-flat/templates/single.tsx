import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings, ThemeTemplateProps, Product } from '@/types';
import { Header, Footer } from '../parts/Header';

export default function SingleTemplate(props: ThemeTemplateProps) {
  const { posts = [], post, primaryMenu, sidebarWidgets = [], header, footerMenu, footerWidgets } = props;

  return (
    <div className="single-template min-h-screen flex flex-col" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(68, 68, 68)' }}>
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-grow">
        {post ? (
          <article className="single-post">
            <header className="mb-8">
              <h1 className="text-4xl font-bold mb-4" style={{ color: '#2563eb' }}>{post.title}</h1>
              <div className="post-meta text-gray-500 flex items-center gap-4 text-sm">
                <span>By {post.author}</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
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

            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
        ) : (
          <div className="posts-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts?.filter(p => p.status === 'PUBLISHED').map((postItem) => (
              <article key={postItem.id} className="post-card border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                {postItem.featuredImage && (
                  <img 
                    src={postItem.featuredImage} 
                    alt={postItem.title} 
                    className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">
                    <a href={`/blog/${postItem.slug}`} className="hover:text-blue-600 transition-colors">
                      {postItem.title}
                    </a>
                  </h2>
                  <p className="text-gray-600 line-clamp-3">{postItem.excerpt}</p>
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