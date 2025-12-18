import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings } from '@/types';

declare var Date: any;

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
  const colors = {
    background: '#ffffff',
    text: '#000000',
    primary: '#000000',
    secondary: '#666666'
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>

      <header className="border-b" style={{ borderColor: colors.secondary }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 style={{ color: colors.primary }}>{header?.general.siteTitle || 'Site Title'}</h1>
          <nav>
            {primaryMenu?.items.map(item => (
              <a key={item.id} href={item.url} className="mr-4 hover:opacity-80">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className={`max-w-7xl mx-auto px-4 py-8${false ? ' grid grid-cols-3 gap-8' : ''}`}>
        <div className={false ? 'col-span-2' : ''}>
          {(posts as Post[]).map(post => (
            <article key={post.id} className="mb-8">
              <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
              <p className="mb-4">{post.excerpt}</p>
              <a href={`/${post.slug}`} className="text-blue-600 hover:underline">Read more</a>
            </article>
          ))}
        </div>
        
      </main>

      <footer className="border-t mt-12" style={{ borderColor: colors.secondary }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p>&copy; {new Date().getFullYear()} {header?.general.siteTitle}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}