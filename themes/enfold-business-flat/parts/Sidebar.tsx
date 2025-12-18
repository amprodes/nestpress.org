import * as React from 'react';
import type { Post, Category } from '@/types';

interface SidebarProps {
  widgets?: any[];
  recentPosts?: Post[];
  categories?: Category[];
}

export function Sidebar({ widgets, recentPosts, categories }: SidebarProps) {
  const colors = {
    background: 'rgba(0, 0, 0, 0)'
  };

  return (
    <aside>
      {widgets?.map(widget => (
        <div key={widget.id} className="mb-6 p-4 rounded" style={{ backgroundColor: colors.background }}>
          <h3 className="font-bold mb-2">{widget.title}</h3>
          <div>{widget.content}</div>
        </div>
      ))}

      {recentPosts && recentPosts.length > 0 && (
        <div className="mb-6 p-4 rounded">
          <h3 className="font-bold mb-2">Recent Posts</h3>
          <ul>
            {recentPosts?.slice(0, 5).map(post => (
              <li key={post.id} className="mb-2">
                <a href={`/${post.slug}`} className="hover:underline">{post.title}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {categories && categories.length > 0 && (
        <div className="mb-6 p-4 rounded">
          <h3 className="font-bold mb-2">Categories</h3>
          <ul>
            {categories?.map(category => (
              <li key={category.id} className="mb-2">
                <a href={`/category/${category.slug}`} className="hover:underline">{category.name}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}