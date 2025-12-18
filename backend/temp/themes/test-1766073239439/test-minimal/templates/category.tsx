import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings } from '@/types';

interface CategoryProps {
  posts?: Post[];
  post?: Post;
  primaryMenu?: Menu;
  sidebarWidgets?: Widget[];
  header?: SiteSettings;
}

export default function CategoryTemplate({ 
  posts = [], 
  post,
  primaryMenu,
  sidebarWidgets = [],
  header 
}: CategoryProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
      {/* Header placeholder - will be replaced by AI */}
      <header className="border-b" style={{ borderColor: '#666666' }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 style={{ color: '#000000' }}>{header?.general.siteTitle || 'Site Title'}</h1>
          <nav>
            {primaryMenu?.items.map(item => (
              <a key={item.id} href={item.url} className="mr-4 hover:opacity-80">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content area */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div>
          <h1 className="text-3xl font-bold mb-8">Blog Archive</h1>
          {posts.map(post => (
            <article key={post.id} className="mb-6">
              <h2 className="text-xl font-bold">{post.title}</h2>
              <p>{post.excerpt}</p>
            </article>
          ))}
        </div>
        
        
      </main>

      {/* Footer placeholder - will be replaced by AI */}
      <footer className="border-t mt-12" style={{ borderColor: '#666666' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p>&copy; {new Date().getFullYear()} {header?.general.siteTitle}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
