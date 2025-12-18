/**
 * Comment Entity
 * WordPress-like comment system for posts and pages
 */

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  SPAM = 'spam',
  TRASH = 'trash',
}

export interface Comment {
  id: string;
  postId: string;
  postTitle?: string; // Denormalized for display
  parentId?: string; // For nested/threaded comments
  authorId?: string; // If logged in user
  authorName: string;
  authorEmail: string;
  authorUrl?: string;
  authorIp?: string;
  authorUserAgent?: string;
  content: string;
  status: CommentStatus;
  karma: number; // Upvotes/downvotes
  approved: boolean;
  agent?: string; // User agent string
  type: 'comment' | 'pingback' | 'trackback';
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentMeta {
  id: string;
  commentId: string;
  metaKey: string;
  metaValue: any;
}
