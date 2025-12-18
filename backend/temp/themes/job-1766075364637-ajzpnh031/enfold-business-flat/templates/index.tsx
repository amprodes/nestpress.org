import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings } from '@/types';

interface HomeProps {
  posts?: Post[];
  post?: Post;
  primaryMenu?: Menu;
  sidebarWidgets?: Widget[];
  header?: SiteSettings;
}

export default function HomeTemplate({ 
  posts = [], 
  post,
  primaryMenu,
  sidebarWidgets = [],
  header 
}: HomeProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(68, 68, 68)' }}>

      <header className="border-b" style={{ borderColor: '#64748b' }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 style={{ color: '#2563eb' }}>{(header as any)?.general?.siteTitle || 'Site Title'}</h1>
          <nav>
            {primaryMenu?.items?.map(item => (
              <a key={item.id} href={item.url} className="mr-4 hover:opacity-80">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div>
          {posts.map(post => (
            <article key={post.id} className="mb-8">
              <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
              <p className="mb-4">{post.excerpt}</p>
              <a href={`/${post.slug}`} className="text-blue-600 hover:underline">Read more</a>
            </article>
          ))}
        </div>
      </main>

      <footer className="border-t mt-12" style={{ borderColor: '#64748b' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p>&copy; {new Date().getFullYear()} {(header as any)?.general?.siteTitle}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}