import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings, ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../parts/Header';

export default function 404Template(props: ThemeTemplateProps) {
  const { posts = [], post, primaryMenu, footerMenu, sidebarWidgets = [], footerWidgets = [], header } = props;

  return (
    <div className="404-template min-h-screen flex flex-col" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(68, 68, 68)' }}>
      <Header primaryMenu={primaryMenu} header={header} />

      <main className="max-w-7xl mx-auto px-4 py-12 flex-grow w-full">
        <div className="text-center py-20">
          <h1 className="text-9xl font-bold mb-4 text-gray-200">404</h1>
          <h2 className="text-4xl font-bold mb-6 text-gray-800">Page not found</h2>
          <p className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto">
            Sorry, the page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <a href="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
            Go back home
          </a>
        </div>

        {post && (
          <div className="max-w-3xl mx-auto mb-16 prose lg:prose-xl text-center">
            <h3>{post.title}</h3>
            {post.featuredImage && <img src={post.featuredImage} alt={post.title} className="mx-auto rounded-lg shadow-md my-6" />}
            <div>{post.excerpt}</div>
          </div>
        )}

        {posts && posts.length > 0 && (
          <div className="mt-12 border-t pt-12 border-gray-200">
            <h3 className="text-2xl font-bold mb-8 text-center text-gray-800">You might be interested in</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {posts.filter(p => p.status === 'PUBLISHED').slice(0, 3).map((post) => (
                <article key={post.id} className="flex flex-col bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                  {post.featuredImage && (
                    <a href={`/blog/${post.slug}`} className="block aspect-w-16 aspect-h-9 overflow-hidden">
                      <img 
                        src={post.featuredImage} 
                        alt={post.title} 
                        className="object-cover w-full h-48 transform hover:scale-105 transition-transform duration-300" />
                    </a>
                  )}
                  <div className="p-6 flex-grow flex flex-col">
                    <h4 className="text-lg font-semibold mb-2">
                      <a href={`/blog/${post.slug}`} className="text-gray-900 hover:text-blue-600 transition-colors">
                        {post.title}
                      </a>
                    </h4>
                    <div className="text-sm text-gray-500 mb-3">
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
                      {post.excerpt}
                    </p>
                    <a href={`/blog/${post.slug}`} className="text-blue-600 text-sm font-medium hover:underline mt-auto">
                      Read more &rarr;
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}