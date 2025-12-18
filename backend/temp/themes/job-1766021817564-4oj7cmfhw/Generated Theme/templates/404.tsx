import React from 'react';
import type { Post, Menu, Widget, SiteSettings } from '@/types';

interface 404Props {
  posts?: Post[];
  post?: Post;
  primaryMenu?: Menu;
  sidebarWidgets?: Widget[];
  header?: SiteSettings;
}

export default function 404Template({ 
  posts = [], 
  post,
  primaryMenu,
  sidebarWidgets = [],
  header 
}: 404Props) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(68, 68, 68)' }}>
      {/* Header placeholder - will be replaced by AI */}
      <header className="border-b" style={{ borderColor: '#64748b' }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 style={{ color: '#2563eb' }}>{header?.general.siteTitle || 'Site Title'}</h1>
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
          <div className="text-center py-12">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-xl mb-8">Page not found</p>
            <a href="/" className="text-blue-600 hover:underline">Go back home</a>
          </div>
        </div>
        
        
      </main>

      {/* Footer placeholder - will be replaced by AI */}
      <footer className="border-t mt-12" style={{ borderColor: '#64748b' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p>&copy; {new Date().getFullYear()} {header?.general.siteTitle}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
