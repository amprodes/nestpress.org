import React, { useEffect, useState } from 'react';
import { Post } from '@/types';
import { useNestPressFilteredValue } from '@/hooks/nestpress-hooks.tsx';

/**
 * WordPress-like Loop Component
 * 
 * Implements the WordPress loop pattern:
 * - Fires loop:start action before rendering
 * - Fires loop:end action after rendering
 * - Provides post classes and structure
 * - Supports custom render functions
 * 
 * @example
 * ```tsx
 * <Loop posts={posts}>
 *   {(post, index) => (
 *     <>
 *       <h2 className="entry-title">{post.title}</h2>
 *       <div className="entry-content" dangerouslySetInnerHTML={{ __html: post.content }} />
 *     </>
 *   )}
 * </Loop>
 * ```
 */

interface LoopProps {
  posts: Post[];
  children: (post: Post, index: number, isLast: boolean) => React.ReactNode;
  className?: string;
  onLoopStart?: (posts: Post[]) => void;
  onLoopEnd?: (posts: Post[]) => void;
}

export function Loop({ 
  posts, 
  children, 
  className = '',
  onLoopStart,
  onLoopEnd 
}: LoopProps) {
  useEffect(() => {
    if (posts.length > 0) {
      onLoopStart?.(posts);
    }
    
    return () => {
      if (posts.length > 0) {
        onLoopEnd?.(posts);
      }
    };
  }, [posts, onLoopStart, onLoopEnd]);

  if (posts.length === 0) {
    return (
      <div className="no-posts">
        <p>No posts found.</p>
      </div>
    );
  }

  return (
    <div className={`posts-loop ${className}`}>
      {posts.map((post, index) => (
        <article 
          key={post.id} 
          id={`post-${post.id}`}
          className={getPostClass(post, index === 0, index === posts.length - 1)}
        >
          {children(post, index, index === posts.length - 1)}
        </article>
      ))}
    </div>
  );
}

/**
 * Generate WordPress-like post classes
 * Similar to WordPress's post_class() function
 */
function getPostClass(post: Post, isFirst: boolean, isLast: boolean): string {
  const classes = [
    'post',
    `post-${post.id}`,
    'type-post',
    `status-${post.status}`,
    'hentry', // hAtom microformat
  ];

  // First/last markers
  if (isFirst) classes.push('first-post');
  if (isLast) classes.push('last-post');

  // Category classes (if available)
  if (post.categories && post.categories.length > 0) {
    post.categories.forEach(cat => {
      classes.push(`category-${slugify(cat)}`);
    });
  }

  // Tag classes (if available)
  if (post.tags && post.tags.length > 0) {
    post.tags.forEach(tag => {
      classes.push(`tag-${slugify(tag)}`);
    });
  }

  // Featured image
  if (post.featuredImage) {
    classes.push('has-post-thumbnail');
  }

  return classes.join(' ');
}

/**
 * Simple slugify helper
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

/**
 * LoopItem - Individual post wrapper with WordPress-like template tags
 */
interface LoopItemProps {
  post: Post;
  children?: React.ReactNode;
}

export function LoopItem({ post, children }: LoopItemProps) {
  return (
    <article className={getPostClass(post, false, false)}>
      {children}
    </article>
  );
}

/**
 * Template Tags - WordPress-like functions as components
 */

export function TheTitle({ post, link = false }: { post: Post; link?: boolean }) {
  // Apply WordPress-like title filters from plugins
  // WordPress equivalent: apply_filters('the_title', $title)
  const filteredTitle = useNestPressFilteredValue('post:title_filter', post.title, { postId: post.id });
  const title = <h2 className="entry-title">{filteredTitle}</h2>;
  
  if (link) {
    const permalink = post.slug || post.id;
    return <a href={`/blog/${permalink}`}>{title}</a>;
  }
  
  return title;
}

export function TheContent({ post }: { post: Post }) {
  // Apply WordPress-like content filters from plugins
  // WordPress equivalent: apply_filters('the_content', $content)
  const filteredContent = useNestPressFilteredValue('post:content_filter', post.content, { postId: post.id });
  
  return (
    <div 
      className="entry-content" 
      dangerouslySetInnerHTML={{ __html: filteredContent }}
    />
  );
}

export function TheExcerpt({ post, length = 55 }: { post: Post; length?: number }) {
  const excerpt = post.excerpt || generateExcerpt(post.content, length);
  
  // Apply WordPress-like excerpt filters from plugins
  // WordPress equivalent: apply_filters('the_excerpt', $excerpt)
  const filteredExcerpt = useNestPressFilteredValue('post:excerpt_filter', excerpt, { postId: post.id });
  
  return (
    <div className="entry-excerpt">
      <p>{filteredExcerpt}</p>
    </div>
  );
}

export function ThePermalink({ post, children }: { post: Post; children?: React.ReactNode }) {
  const permalink = post.slug || post.id;
  return (
    <a href={`/blog/${permalink}`} className="permalink">
      {children || 'View Post →'}
    </a>
  );
}

export function TheMeta({ post }: { post: Post }) {
  return (
    <div className="entry-meta">
      <span className="posted-on">
        {new Date(post.createdAt).toLocaleDateString()}
      </span>
      {post.authorId && (
        <span className="byline"> by <span className="author">{post.authorId}</span></span>
      )}
      {post.views !== undefined && (
        <span className="view-count"> • {post.views} views</span>
      )}
    </div>
  );
}

export function TheFeaturedImage({ post }: { post: Post }) {
  if (!post.featuredImage) return null;
  
  return (
    <div className="post-thumbnail">
      <img 
        src={post.featuredImage} 
        alt={post.title}
        loading="lazy"
      />
    </div>
  );
}

export function TheCategories({ post }: { post: Post }) {
  if (!post.categories || post.categories.length === 0) return null;
  
  return (
    <div className="categories">
      {post.categories.map(cat => (
        <span key={cat} className="category-link">
          {cat}
        </span>
      ))}
    </div>
  );
}

export function TheTags({ post }: { post: Post }) {
  if (!post.tags || post.tags.length === 0) return null;
  
  return (
    <div className="tags">
      {post.tags.map(tag => (
        <span key={tag} className="tag-link">
          #{tag}
        </span>
      ))}
    </div>
  );
}

/**
 * Helper function to generate excerpt from content
 */
function generateExcerpt(content: string, wordLimit: number = 55): string {
  // Strip HTML
  const text = content.replace(/<[^>]*>/g, '');
  
  // Split into words
  const words = text.split(/\s+/).filter(w => w);
  
  if (words.length <= wordLimit) {
    return text;
  }
  
  return words.slice(0, wordLimit).join(' ') + '…';
}

/**
 * Pagination Component (WordPress-like)
 */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ThePagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    // Show first, last, current, and 2 pages around current
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 2 && i <= currentPage + 2)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <nav className="pagination" role="navigation">
      <div className="nav-links">
        {currentPage > 1 && (
          <button
            onClick={() => onPageChange(currentPage - 1)}
            className="prev page-numbers"
          >
            ← Previous
          </button>
        )}
        
        {pages.map((page, idx) => {
          if (page === '...') {
            return <span key={`ellipsis-${idx}`} className="page-numbers dots">…</span>;
          }
          
          const pageNum = page as number;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`page-numbers ${pageNum === currentPage ? 'current' : ''}`}
            >
              {pageNum}
            </button>
          );
        })}
        
        {currentPage < totalPages && (
          <button
            onClick={() => onPageChange(currentPage + 1)}
            className="next page-numbers"
          >
            Next →
          </button>
        )}
      </div>
    </nav>
  );
}
