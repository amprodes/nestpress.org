import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings, ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../parts/Header';

export default function SingleTemplate(props: ThemeTemplateProps) {
  const { 
    posts = [], 
    post, 
    primaryMenu, 
    sidebarWidgets = [], 
    header,
    footerMenu,
    footerWidgets = [] 
  } = props;

  return (
    <div className="single-template min-h-screen bg-white text-gray-800 font-sans">
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className={sidebarWidgets.length > 0 ? "w-full lg:w-2/3" : "w-full mx-auto max-w-4xl"}>

            {post && (
              <article className="single-post">
                {post.featuredImage && (
                  <div className="mb-8 rounded-xl overflow-hidden shadow-sm aspect-video relative">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title} 
                      className="w-full h-full object-cover" />
                  </div>
                )}
                
                <header className="mb-8 border-b border-gray-100 pb-8">
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4 leading-tight">
                    {post.title}
                  </h1>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    {post.author && (
                      <span className="font-medium text-gray-900 flex items-center">
                        By {post.author}
                      </span>
                    )}
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </header>

                <div 
                  className="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed" 
                  dangerouslySetInnerHTML={{ __html: post.content }} />
              </article>
            )}

            {!post && posts && (
              <div className="posts-grid space-y-12">
                {posts.filter(p => p.status === 'PUBLISHED').map((item) => (
                  <article key={item.id} className="post-card flex flex-col md:flex-row gap-6 items-start border-b border-gray-100 pb-12 last:border-0">
                    {item.featuredImage && (
                      <div className="w-full md:w-1/3 aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        <a href={`/blog/${item.slug}`} className="hover:text-blue-600 transition-colors">
                          {item.title}
                        </a>
                      </h2>
                      <div className="text-sm text-gray-500 mb-3">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                      {item.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3">{item.excerpt}</p>
                      )}
                      <a href={`/blog/${item.slug}`} className="inline-flex items-center text-blue-600 font-semibold hover:underline">
                        Read Article &rarr;
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {sidebarWidgets.length > 0 && (
            <aside className="w-full lg:w-1/3 space-y-8">
              {sidebarWidgets.map((widget) => (
                <div key={widget.id} className="sidebar-widget bg-gray-50 p-6 rounded-xl border border-gray-100">
                  {widget.title && (
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      {widget.title}
                    </h3>
                  )}
                  <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: widget.content }} />
                </div>
              ))}
            </aside>
          )}
          
        </div>
      </main>

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}