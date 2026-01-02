import * as React from 'react';
import type { Widget, Post } from '@/types';

interface SidebarProps {
  widgets?: Widget[];
  recentPosts?: Post[];
}

export function Sidebar({ widgets = [], recentPosts = [] }: SidebarProps) {
  const colors = {
    background: 'rgb(255, 255, 255)'
  };
  
  // Explicit type annotations for validation
  const widgetList: Widget[] = widgets || [];
  const postList: Post[] = recentPosts || [];

  return (
    <aside>
      {widgetList.map(widget => (
        <div key={widget?.id} className="mb-6 p-4 rounded" style={{ backgroundColor: colors.background }}>
          <h3 className="font-bold mb-2">{widget?.title}</h3>
          <div>{widget?.content}</div>
        </div>
      ))}
      
      {postList.length > 0 && (
        <div className="mb-6 p-4 rounded">
          <h3 className="font-bold mb-2">Recent Posts</h3>
          <ul>
            {postList.slice(0, 5).map(post => (
              <li key={post.id} className="mb-2">
                <a href={`/${post.slug}`} className="hover:underline">{post.title}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
