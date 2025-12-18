import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings } from '@/types';

interface PagesidebarProps {
  posts?: Post[];
  post?: Post;
  primaryMenu?: Menu;
  sidebarWidgets?: Widget[];
  header?: SiteSettings;
}

export default function PagesidebarTemplate({ 
  posts = [], 
  post,
  primaryMenu,
  sidebarWidgets = [],
  header 
}: PagesidebarProps) {
  const siteTitle = (header as any)?.general?.siteTitle || 'Site Title';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(68, 68, 68)' }}>

      <header className="border-b" style={{ borderColor: '#64748b' }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 style={{ color: '#2563eb' }}>{siteTitle}</h1>
          <nav>
            {primaryMenu?.items?.map((item: any) => (
              <a key={item.id} href={item.url} className="mr-4 hover:opacity-80">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-3 gap-8">
        <div className="col-span-2">
          {post && (
            <article>
              <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
              <div className="prose">
                {post.content}
              </div>
            </article>
          )}
        </div>
        
        <aside className="col-span-1">
          {sidebarWidgets.map((widget: Widget) => (
            <div key={widget.id} className="mb-6 p-4 rounded" style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}>
              <h3 className="font-bold mb-2">{widget.title}</h3>
              <div>{widget.content}</div>
            </div>
          ))}
        </aside>
      </main>

      <footer className="border-t mt-12" style={{ borderColor: '#64748b' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p>&copy; {new Date().getFullYear()} {siteTitle}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}