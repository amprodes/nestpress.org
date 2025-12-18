/**
 * NestPress Comments Service
 * WordPress-like comment system with moderation, spam checking, and hooks
 */

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { HooksService } from '../hooks/hooks.service';
import { ContentHook } from '../hooks/interfaces';
import { Comment, CommentStatus } from './entities/comment.entity';
import { CreateCommentDto, UpdateCommentDto, ModerationAction } from './dto';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION = 'comments';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly hooksService: HooksService,
  ) {}

  /**
   * Create a new comment
   * WordPress: wp_insert_comment()
   */
  async create(
    createCommentDto: CreateCommentDto,
    authorId?: string,
    authorIp?: string,
    userAgent?: string,
  ): Promise<Comment> {
    // Fire before_create action
    await this.hooksService.doAction(ContentHook.COMMENT_BEFORE_CREATE, {
      ...createCommentDto,
      authorId,
    });

    // Apply content filter (sanitize, format)
    let content = createCommentDto.content;
    const contentResult = await this.hooksService.applyFilters(
      ContentHook.COMMENT_CONTENT_FILTER,
      content,
      { authorEmail: createCommentDto.authorEmail },
    );
    content = contentResult.finalValue;

    // Check for spam
    const spamResult = await this.hooksService.applyFilters(
      ContentHook.COMMENT_SPAM_CHECK,
      { isSpam: false, reason: '' },
      {
        content,
        authorEmail: createCommentDto.authorEmail,
        authorIp,
        authorName: createCommentDto.authorName,
      },
    );

    // Determine initial status
    let status = CommentStatus.PENDING;
    if (spamResult.finalValue.isSpam) {
      status = CommentStatus.SPAM;
      this.logger.warn(`Comment marked as spam: ${spamResult.finalValue.reason}`);
    }

    // Get post title for denormalized display
    let postTitle = '';
    try {
      const post = await this.database.findById<any>('posts', createCommentDto.postId);
      postTitle = post?.title || '';
    } catch {
      // Post might not exist, continue anyway
    }

    const comment = await this.database.create<Comment>(COLLECTION, {
      id: uuidv4(),
      ...createCommentDto,
      postTitle,
      authorId,
      authorIp,
      authorUserAgent: userAgent,
      content,
      status,
      karma: 0,
      approved: false, // New comments always start unapproved
      type: 'comment',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Fire after_create action
    await this.hooksService.doAction(ContentHook.COMMENT_AFTER_CREATE, comment);

    this.logger.log(`Comment created by ${comment.authorName} on post ${createCommentDto.postId}`);
    return comment;
  }

  /**
   * Get all comments with pagination and filters
   * WordPress: get_comments()
   */
  async findAll(
    page = 1,
    limit = 20,
    status?: CommentStatus,
    postId?: string,
    parentId?: string,
  ): Promise<{ data: Comment[]; total: number }> {
    const filters: Record<string, any> = {};

    if (status) {
      filters.status = status;
    }
    if (postId) {
      filters.postId = postId;
    }
    if (parentId !== undefined) {
      filters.parentId = parentId;
    }

    return this.database.findAll<Comment>(COLLECTION, {
      page,
      limit,
      filters,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }

  /**
   * Get approved comments for a post (public)
   * WordPress: get_comments() with status=approve
   */
  async findApprovedByPost(
    postId: string,
    page = 1,
    limit = 50,
  ): Promise<{ data: Comment[]; total: number }> {
    return this.findAll(page, limit, CommentStatus.APPROVED, postId);
  }

  /**
   * Get comment by ID
   * WordPress: get_comment()
   */
  async findById(id: string): Promise<Comment | null> {
    return this.database.findById<Comment>(COLLECTION, id);
  }

  /**
   * Get threaded comments (with replies)
   * Returns top-level comments with nested children
   */
  async findThreadedByPost(postId: string): Promise<Comment[]> {
    const { data: allComments } = await this.findAll(1, 1000, CommentStatus.APPROVED, postId);
    
    // Build comment tree
    const commentMap = new Map<string, Comment & { children?: Comment[] }>();
    const topLevel: (Comment & { children?: Comment[] })[] = [];

    // First pass: map all comments
    allComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, children: [] });
    });

    // Second pass: build tree structure
    allComments.forEach(comment => {
      const mappedComment = commentMap.get(comment.id)!;
      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap.get(comment.parentId)!.children!.push(mappedComment);
      } else {
        topLevel.push(mappedComment);
      }
    });

    return topLevel;
  }

  /**
   * Update a comment
   * WordPress: wp_update_comment()
   */
  async update(id: string, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment ${id} not found`);
    }

    // Apply content filter if content is being updated
    let content = updateCommentDto.content;
    if (content) {
      const contentResult = await this.hooksService.applyFilters(
        ContentHook.COMMENT_CONTENT_FILTER,
        content,
      );
      content = contentResult.finalValue;
    }

    const updatedComment = await this.database.update<Comment>(COLLECTION, id, {
      ...updateCommentDto,
      content: content || comment.content,
      approved: updateCommentDto.status === CommentStatus.APPROVED,
      updatedAt: new Date(),
    });

    this.logger.log(`Comment ${id} updated`);
    return updatedComment;
  }

  /**
   * Moderate a comment (approve, unapprove, spam, trash)
   * WordPress: wp_set_comment_status()
   */
  async moderate(id: string, action: ModerationAction): Promise<Comment> {
    const comment = await this.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment ${id} not found`);
    }

    let newStatus: CommentStatus;
    switch (action) {
      case ModerationAction.APPROVE:
        // Fire before_approve action
        await this.hooksService.doAction(ContentHook.COMMENT_BEFORE_APPROVE, comment);
        newStatus = CommentStatus.APPROVED;
        break;
      case ModerationAction.UNAPPROVE:
        newStatus = CommentStatus.PENDING;
        break;
      case ModerationAction.SPAM:
        newStatus = CommentStatus.SPAM;
        break;
      case ModerationAction.TRASH:
        newStatus = CommentStatus.TRASH;
        break;
      case ModerationAction.DELETE:
        await this.delete(id);
        return comment;
      default:
        throw new BadRequestException(`Unknown moderation action: ${action}`);
    }

    const updatedComment = await this.database.update<Comment>(COLLECTION, id, {
      status: newStatus,
      approved: newStatus === CommentStatus.APPROVED,
      updatedAt: new Date(),
    });

    this.logger.log(`Comment ${id} moderated: ${action}`);
    return updatedComment;
  }

  /**
   * Bulk moderate comments
   * WordPress: bulk actions in wp-admin
   */
  async bulkModerate(commentIds: string[], action: ModerationAction): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const id of commentIds) {
      try {
        await this.moderate(id, action);
        success++;
      } catch (error) {
        failed++;
        this.logger.error(`Failed to moderate comment ${id}: ${error}`);
      }
    }

    this.logger.log(`Bulk moderation: ${success} success, ${failed} failed`);
    return { success, failed };
  }

  /**
   * Delete a comment permanently
   * WordPress: wp_delete_comment()
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.database.delete(COLLECTION, id);
    if (result) {
      this.logger.log(`Comment ${id} permanently deleted`);
    }
    return result;
  }

  /**
   * Get comment counts by status
   * WordPress: wp_count_comments()
   */
  async getCounts(postId?: string): Promise<Record<CommentStatus | 'all', number>> {
    const filters: Record<string, any> = {};
    if (postId) {
      filters.postId = postId;
    }

    const counts: Record<CommentStatus | 'all', number> = {
      [CommentStatus.PENDING]: 0,
      [CommentStatus.APPROVED]: 0,
      [CommentStatus.SPAM]: 0,
      [CommentStatus.TRASH]: 0,
      all: 0,
    };

    // Get counts for each status
    for (const status of Object.values(CommentStatus)) {
      const { total } = await this.database.findAll<Comment>(COLLECTION, {
        page: 1,
        limit: 1,
        filters: { ...filters, status },
      });
      counts[status] = total;
      counts.all += total;
    }

    return counts;
  }

  /**
   * Reply to a comment
   * WordPress: add comment reply form
   */
  async reply(
    parentId: string,
    createCommentDto: Omit<CreateCommentDto, 'parentId'>,
    authorId?: string,
    authorIp?: string,
    userAgent?: string,
  ): Promise<Comment> {
    const parent = await this.findById(parentId);
    if (!parent) {
      throw new NotFoundException(`Parent comment ${parentId} not found`);
    }

    return this.create(
      {
        ...createCommentDto,
        postId: parent.postId,
        parentId,
      },
      authorId,
      authorIp,
      userAgent,
    );
  }

  /**
   * Get recent comments
   * WordPress: wp_get_recent_comments()
   */
  async getRecent(limit = 5): Promise<Comment[]> {
    const { data } = await this.findAll(1, limit, CommentStatus.APPROVED);
    return data;
  }

  /**
   * Check if comments are open for a post
   * WordPress: comments_open()
   */
  async commentsOpen(postId: string): Promise<boolean> {
    // Could check post meta for comment_status
    // For now, always return true
    const post = await this.database.findById<any>('posts', postId);
    return !!post; // Comments open if post exists
  }

  /**
   * Simple spam check (can be enhanced with hooks)
   * WordPress: check_comment()
   */
  private isSpam(content: string, authorEmail: string): boolean {
    // Basic spam indicators
    const spamPatterns = [
      /\[url=/i,
      /\[link=/i,
      /viagra/i,
      /casino/i,
      /porn/i,
      /xxx/i,
      /<a\s+href/i,
    ];

    for (const pattern of spamPatterns) {
      if (pattern.test(content)) {
        return true;
      }
    }

    return false;
  }
}
