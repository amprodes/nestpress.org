import React from 'react';
import type { Widget } from '@/types';

interface SidebarProps {
  widgets?: Widget[];
}

export const Sidebar: React.FC<SidebarProps> = ({ widgets = [] }) => {
  if (widgets.length === 0) {
    return null;
  }
  
  return (
    <aside className="sidebar">
      {widgets.map((widget) => (
        <div key={widget.id} className="sidebar-widget">
          <h3 className="widget-title">{widget.title}</h3>
          <div 
            className="widget-content"
            dangerouslySetInnerHTML={{ __html: widget.content }}
          />
        </div>
      ))}
    </aside>
  );
};
