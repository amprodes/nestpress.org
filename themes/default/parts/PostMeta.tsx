/**
 * Post Meta Part Component
 * WordPress equivalent: parts/post-meta.html
 * Displays post metadata (author, date, categories, tags)
 */

import React from 'react';
import { Post } from '../../../types';

export interface PostMetaProps {
  post: Post;
  showAuthor?: boolean;
  showDate?: boolean;
  showCategories?: boolean;
  showTags?: boolean;
  showComments?: boolean;
}

export const PostMeta: React.FC<PostMetaProps> = ({ 
  post,
  showAuthor = true,
  showDate = true,
  showCategories = true,
  showTags = true,
  showComments = false
}) => {
  return (
    <div 
      className="post-meta"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        fontSize: '0.875rem',
        color: '#64748b',
        padding: '1rem 0',
        borderTop: '1px solid #e2e8f0',
        borderBottom: '1px solid #e2e8f0'
      }}
    >
      {/* Author */}
      {showAuthor && post.author && (
        <div className="post-author" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ opacity: 0.7 }}>👤</span>
          <a 
            href={`/author/${post.author.toLowerCase().replace(/\s+/g, '-')}`}
            style={{ color: '#64748b', textDecoration: 'none', fontWeight: 500 }}
          >
            {post.author}
          </a>
        </div>
      )}

      {/* Date */}
      {showDate && post.date && (
        <div className="post-date" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ opacity: 0.7 }}>📅</span>
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-US', { 
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
        </div>
      )}

      {/* Categories */}
      {showCategories && post.categories && post.categories.length > 0 && (
        <div className="post-categories" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ opacity: 0.7 }}>📁</span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {post.categories.map((category, index) => (
              <React.Fragment key={category}>
                <a 
                  href={`/category/${category.toLowerCase()}`}
                  style={{ 
                    color: '#64748b', 
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                >
                  {category}
                </a>
                {index < post.categories.length - 1 && <span>,</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {showTags && post.tags && post.tags.length > 0 && (
        <div className="post-tags" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ opacity: 0.7 }}>🏷️</span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {post.tags.map(tag => (
              <a 
                key={tag}
                href={`/tag/${tag.toLowerCase()}`}
                style={{ 
                  color: '#64748b',
                  textDecoration: 'none',
                  background: '#f1f5f9',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.8125rem'
                }}
              >
                #{tag}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Comments Count */}
      {showComments && (
        <div className="post-comments" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ opacity: 0.7 }}>💬</span>
          <a 
            href={`#comments`}
            style={{ color: '#64748b', textDecoration: 'none' }}
          >
            {post.commentsCount || 0} Comments
          </a>
        </div>
      )}
    </div>
  );
};

export default PostMeta;
