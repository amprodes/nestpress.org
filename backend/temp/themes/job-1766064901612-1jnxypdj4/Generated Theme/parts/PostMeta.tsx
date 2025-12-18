import React from 'react';
import type { Post } from '@/types';

interface PostMetaProps {
  post: Post;
  showAuthor?: boolean;
  showDate?: boolean;
  showCategories?: boolean;
}

export function PostMeta({ post, showAuthor = true, showDate = true, showCategories = true }: PostMetaProps) {
  return (
    <div className="text-sm text-gray-600 mb-4">
      {showAuthor && <span>By {post.author}</span>}
      {showAuthor && showDate && <span className="mx-2">•</span>}
      {showDate && <span>{new Date(post.createdAt).toLocaleDateString()}</span>}
      {showCategories && post.categories && post.categories.length > 0 && (
        <>
          <span className="mx-2">•</span>
          <span>{post.categories.join(', ')}</span>
        </>
      )}
    </div>
  );
}
