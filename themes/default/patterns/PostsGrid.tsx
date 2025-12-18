/**
 * Posts Grid Pattern
 * WordPress equivalent: patterns/posts-grid-2-col.php
 * Displays posts in a responsive grid layout
 */

import React from 'react';
import { Post } from '../../../types';
import { getPostPermalink } from '../index';

export interface PostsGridProps {
  posts: Post[];
  columns?: 2 | 3 | 4;
  showExcerpt?: boolean;
  showMeta?: boolean;
  showFeaturedImage?: boolean;
}

export const PostsGrid: React.FC<PostsGridProps> = ({
  posts,
  columns = 3,
  showExcerpt = true,
  showMeta = true,
  showFeaturedImage = true
}) => {
  const getColumnClass = () => {
    const minWidth = columns === 2 ? '400px' : columns === 3 ? '300px' : '250px';
    return `repeat(auto-fill, minmax(${minWidth}, 1fr))`;
  };

  return (
    <div 
      className="pattern-posts-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: getColumnClass(),
        gap: 'var(--spacing-50, 2rem)',
        padding: 'var(--spacing-50, 2rem) 0'
      }}
    >
      {posts.map(post => (
        <article 
          key={post.id}
          className="post-card"
          style={{
            background: '#fff',
            borderRadius: '0.5rem',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {showFeaturedImage && post.featuredImage && (
            <a href={getPostPermalink(post)}>
              <img 
                src={post.featuredImage} 
                alt={post.title}
                style={{ 
                  width: '100%', 
                  height: '200px', 
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </a>
          )}
          
          <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {showMeta && (
              <div style={{ 
                fontSize: '0.875rem', 
                color: '#64748b',
                marginBottom: '0.75rem',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                {post.author && <span>By {post.author}</span>}
                {post.date && (
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </time>
                )}
              </div>
            )}

            <h3 style={{ 
              fontSize: '1.25rem', 
              marginBottom: '0.75rem', 
              fontWeight: 600,
              lineHeight: 1.4
            }}>
              <a 
                href={getPostPermalink(post)}
                style={{ 
                  color: '#1e293b', 
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
              >
                {post.title}
              </a>
            </h3>

            {showExcerpt && post.excerpt && (
              <p style={{ 
                color: '#64748b', 
                marginBottom: '1rem',
                lineHeight: 1.6,
                flex: 1
              }}>
                {post.excerpt}
              </p>
            )}

            {post.categories && post.categories.length > 0 && (
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                flexWrap: 'wrap',
                marginTop: 'auto'
              }}>
                {post.categories.slice(0, 3).map(category => (
                  <span 
                    key={category}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.75rem',
                      background: '#f1f5f9',
                      color: '#64748b',
                      borderRadius: '0.25rem',
                      fontWeight: 500
                    }}
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
};

export default PostsGrid;
