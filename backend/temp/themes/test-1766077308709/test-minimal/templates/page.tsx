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
  const colors = {
    background: '#ffffff',
    text: '#000000',
    primary: '#000000',
    secondary: '#666666'
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Header placeholder - will be replaced by AI */}
      <header className="border-b" style={{ borderColor: colors.secondary }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 style={{ color: colors.primary }}>{header?.general.siteTitle || 'Site Title'}</h1>
          <nav>
            {primaryMenu?.items?.map(item => (
              <a key={item.id} href={item.url} className="mr-4 hover:opacity-80">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content area */}
      <main className={`max-w-7xl mx-auto px-4 py-8${false ? ' grid grid-cols-3 gap-8' : ''}`}>
        <div className={false ? 'col-span-2' : ''}>
          {post && (
            <article>
              <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
              <div className="prose" dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>
          )}
        </div>
        
      </main>

      {/* Footer placeholder - will be replaced by AI */}
      <footer className="border-t mt-12" style={{ borderColor: colors.secondary }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p>&copy; {new Date().getFullYear()} {header?.general.siteTitle}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
