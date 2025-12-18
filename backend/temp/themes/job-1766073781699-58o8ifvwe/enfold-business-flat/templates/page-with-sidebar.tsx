import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings, ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../parts/Header';

export default function PagesidebarTemplate(props: ThemeTemplateProps) {
  const { posts, post, primaryMenu, sidebarWidgets, header, footerMenu, footerWidgets } = props;

  return (
    <div className="page-sidebar-template min-h-screen flex flex-col bg-transparent text-gray-700">
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {post && (
              <article className="single-post bg-white p-6 rounded shadow-sm">
                <h1 className="text-4xl font-bold mb-4 text-gray-900">{post.title}</h1>
                {post.featuredImage && (
                  <img 
                    src={post.featuredImage} 
                    alt={post.title} 
                    className="w-full h-auto mb-6 rounded" />
                )}
                <div className="post-meta text-sm text-gray-500 mb-6 flex gap-4">
                  {post.author && <span>By {post.author}</span>}
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
              </article>
            )}

            {!post && posts && (
              <div className="posts-grid space-y-8">
                {posts.filter(p => p.status === 'PUBLISHED').map((postItem) => (
                  <article key={postItem.id} className="post-card bg-white p-6 rounded shadow-sm">
                    {postItem.featuredImage && (
                      <img 
                        src={postItem.featuredImage} 
                        alt={postItem.title} 
                        className="w-full h-64 object-cover mb-4 rounded" />
                    )}
                    <h2 className="text-2xl font-bold mb-2">
                      <a href={`/blog/${postItem.slug}`} className="hover:text-blue-600 transition-colors">
                        {postItem.title}
                      </a>
                    </h2>
                    <div className="text-sm text-gray-500 mb-3">
                      {new Date(postItem.createdAt).toLocaleDateString()}
                    </div>
                    <p className="text-gray-600 mb-4">{postItem.excerpt}</p>
                    <a href={`/blog/${postItem.slug}`} className="text-blue-600 font-medium hover:underline">
                      Read more &rarr;
                    </a>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="lg:col-span-1 space-y-6">
            {sidebarWidgets && sidebarWidgets.map((widget) => (
              <div key={widget.id} className="widget p-4 bg-gray-50 rounded shadow-sm">
                <h3 className="font-bold text-lg mb-3 border-b pb-2">{widget.title}</h3>
                <div className="widget-content">
                  {widget.content}
                </div>
              </div>
            ))}
          </aside>
        </div>
      </main>

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}