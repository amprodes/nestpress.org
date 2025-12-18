import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings, ThemeTemplateProps } from '@/types';
import { Header } from '../parts/Header';
import { Footer } from '../parts/Footer';

interface SingleProps {
  posts?: Post[];
  post?: Post;
  primaryMenu?: Menu;
  sidebarWidgets?: Widget[];
  header?: SiteSettings;
}

export default function SingleTemplate(props: ThemeTemplateProps) {
  const { posts, post, primaryMenu, footerMenu, sidebarWidgets, footerWidgets, header } = props;

  return (
    <div className="single-template min-h-screen bg-white text-gray-900 font-sans flex flex-col">
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-12">

        {post && (
          <article className="max-w-4xl mx-auto">
            <header className="mb-10 text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-gray-900">
                {post.title}
              </h1>
              
              <div className="flex items-center justify-center text-gray-500 text-sm space-x-4 border-b pb-8">
                {post.author && (
                  <span className="font-medium text-gray-900">By {post.author}</span>
                )}
                {post.createdAt && (
                  <time dateTime={post.createdAt}>
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                )}
              </div>
            </header>

            {post.featuredImage && (
              <div className="mb-10 rounded-xl overflow-hidden shadow-lg aspect-video">
                <img 
                  src={post.featuredImage} 
                  alt={post.title} 
                  className="w-full h-full object-cover" />
              </div>
            )}

            <div 
              className="prose prose-lg prose-blue mx-auto max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
        )}

        {!post && posts && (
          <div className="posts-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.filter(p => p.status === 'PUBLISHED').map((postItem) => (
              <article key={postItem.id} className="flex flex-col h-full border rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300 bg-white">
                {postItem.featuredImage && (
                  <a href={`/blog/${postItem.slug}`} className="block aspect-video overflow-hidden bg-gray-100">
                    <img 
                      src={postItem.featuredImage} 
                      alt={postItem.title}
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
                  </a>
                )}
                
                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="text-xl font-bold mb-3 leading-tight">
                    <a href={`/blog/${postItem.slug}`} className="hover:text-blue-600 transition-colors">
                      {postItem.title}
                    </a>
                  </h2>
                  
                  {postItem.excerpt && (
                    <div 
                      className="text-gray-600 mb-4 text-sm line-clamp-3 flex-grow"
                      dangerouslySetInnerHTML={{ __html: postItem.excerpt }} />
                  )}
                  
                  <div className="mt-auto pt-4 border-t flex justify-between items-center text-xs text-gray-500 font-medium uppercase tracking-wider">
                    <span>{new Date(postItem.createdAt).toLocaleDateString()}</span>
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