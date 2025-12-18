/**
 * Sidebar Part Component
 * WordPress equivalent: parts/sidebar.html
 * Reusable sidebar with widgets
 */

import React from 'react';
import { Widget, Post } from '../../../types';

export interface SidebarProps {
  widgets?: Widget[];
  recentPosts?: Post[];
  categories?: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  widgets = [],
  recentPosts = [],
  categories = []
}) => {
  return (
    <aside 
      className="sidebar"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}
    >
      {/* Search Widget */}
      <div className="widget widget-search" style={{
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: 600, 
          marginBottom: '1rem',
          color: '#1e293b'
        }}>
          Search
        </h3>
        <form role="search" style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="search" 
            placeholder="Search..."
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
          <button 
            type="submit"
            style={{
              padding: '0.5rem 1rem',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '0.375rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Recent Posts Widget */}
      {recentPosts.length > 0 && (
        <div className="widget widget-recent-posts" style={{
          background: '#fff',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: 600, 
            marginBottom: '1rem',
            color: '#1e293b'
          }}>
            Recent Posts
          </h3>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {recentPosts.slice(0, 5).map(post => (
              <li key={post.id}>
                <a 
                  href={`/blog/${post.slug || post.id}`}
                  style={{
                    color: '#1e293b',
                    textDecoration: 'none',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start'
                  }}
                >
                  {post.featuredImage && (
                    <img 
                      src={post.featuredImage}
                      alt={post.title}
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '0.375rem',
                        flexShrink: 0
                      }}
                    />
                  )}
                  <div>
                    <div style={{ 
                      fontWeight: 500, 
                      fontSize: '0.875rem',
                      marginBottom: '0.25rem',
                      lineHeight: 1.4
                    }}>
                      {post.title}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#64748b' 
                    }}>
                      {new Date(post.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Categories Widget */}
      {categories.length > 0 && (
        <div className="widget widget-categories" style={{
          background: '#fff',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: 600, 
            marginBottom: '1rem',
            color: '#1e293b'
          }}>
            Categories
          </h3>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {categories.map(category => (
              <li key={category}>
                <a 
                  href={`/category/${category.toLowerCase()}`}
                  style={{
                    color: '#1e293b',
                    textDecoration: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span>{category}</span>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>→</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Custom Widgets */}
      {widgets.map(widget => (
        <div 
          key={widget.id}
          className={`widget widget-${widget.type}`}
          style={{
            background: '#fff',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0'
          }}
        >
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: 600, 
            marginBottom: '1rem',
            color: '#1e293b'
          }}>
            {widget.title}
          </h3>
          <div style={{ color: '#475569', fontSize: '0.875rem' }}>
            {widget.content}
          </div>
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
