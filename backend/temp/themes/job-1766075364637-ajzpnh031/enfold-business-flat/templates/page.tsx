import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings } from '@/types';

interface PageProps {
  posts?: Post[];
  post?: Post;
  primaryMenu?: Menu;
  sidebarWidgets?: Widget[];
  header?: SiteSettings;
}

export default function PageTemplate({ 
  posts = [], 
  post,
  primaryMenu,
  sidebarWidgets = [],
  header 
}: PageProps) {
  const siteTitle = (header as any)?.general?.siteTitle || 'Site Title';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(68, 68, 68)' }}>

      <header className="border-b" style={{ borderColor: '#64748b' }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 style={{ color: '#2563eb' }}>{siteTitle}</h1>
          <nav>
            {primaryMenu?.items.map(item => (
              <a key={item.id} href={item.url} className="mr-4 hover:opacity-80">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div>
          {post && (
            <article>
              <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
              <div className="prose">
                {post.content}
              </div>
            </article>
          )}
        </div>
      </main>

      <footer className="border-t mt-12" style={{ borderColor: '#64748b' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p>&copy; {new Date().getFullYear()} {siteTitle}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}