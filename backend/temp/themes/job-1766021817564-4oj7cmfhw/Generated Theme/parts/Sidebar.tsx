import React from 'react';
import type { Widget, Post } from '@/types';

interface SidebarProps {
  widgets?: Widget[];
  recentPosts?: Post[];
}

export function Sidebar({ widgets = [], recentPosts = [] }: SidebarProps) {
  return (
    <aside>
      {widgets && widgets.map((widget) => (
        <div key={widget.id} className="mb-6 p-4 rounded" style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}>
          <h3 className="font-bold mb-2">{widget.title}</h3>
          <div dangerouslySetInnerHTML={{ __html: widget.content }} />
        </div>
      ))}

      {recentPosts && recentPosts.length > 0 && (
        <div className="mb-6 p-4 rounded">
          <h3 className="font-bold mb-2">Recent Posts</h3>
          <ul>
            {recentPosts.slice(0, 5).map((post) => (
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