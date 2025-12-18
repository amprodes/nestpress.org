/**
 * NestPress Post Hooks
 * Example hook handlers for post lifecycle events
 */

import { Injectable, Logger } from '@nestjs/common';
import { HookProvider, OnAction, OnFilter, AIHook } from '../hooks/decorators';
import { HookContext, ContentHook, AIContentHook } from '../hooks/interfaces';

@HookProvider({ namespace: 'nestpress-posts' })
@Injectable()
export class PostHooksService {
  private readonly logger = new Logger(PostHooksService.name);

  /**
   * Validate post before creation
   */
  @OnAction(ContentHook.POST_BEFORE_CREATE, { priority: 10 })
  async validatePostBeforeCreate(post: any, context: HookContext): Promise<void> {
    this.logger.debug(`Validating post before create: ${post.title}`);
    
    // Example validation
    if (!post.title || post.title.trim().length === 0) {
      throw new Error('Post title is required');
    }
    
    if (post.title.length > 200) {
      throw new Error('Post title must be less than 200 characters');
    }
  }

  /**
   * Log post creation
   */
  @OnAction(ContentHook.POST_AFTER_CREATE, { priority: 100 })
  async logPostCreation(post: any, context: HookContext): Promise<void> {
    this.logger.log(`Post created: "${post.title}" (ID: ${post.id})`);
    
    // Here you could:
    // - Send notifications
    // - Update search index
    // - Clear cache
    // - Trigger webhooks
  }

  /**
   * Process content before saving
   */
  @OnFilter(ContentHook.POST_CONTENT_FILTER, { priority: 20 })
  async processContent(content: string, context: HookContext): Promise<string> {
    // Example: Add automatic paragraph wrapping
    if (!content.includes('<p>')) {
      const paragraphs = content.split('\n\n');
      return paragraphs.map(p => `<p>${p}</p>`).join('\n');
    }
    return content;
  }

  /**
   * Sanitize content
   */
  @OnFilter(ContentHook.POST_CONTENT_FILTER, { priority: 10 })
  async sanitizeContent(content: string, context: HookContext): Promise<string> {
    // Example: Basic XSS prevention (in production use a proper sanitizer)
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '');
  }

  /**
   * Generate excerpt if not provided
   */
  @OnFilter(ContentHook.POST_EXCERPT_FILTER, { priority: 50 })
  async generateExcerpt(
    excerpt: string,
    context: HookContext,
  ): Promise<string> {
    // If excerpt already exists and has content, return it
    if (excerpt && typeof excerpt === 'string' && excerpt.trim().length > 0) {
      return excerpt;
    }

    // Get content from metadata
    const content = context.metadata?.content as string;
    if (!content || typeof content !== 'string') {
      return excerpt || '';
    }

    // Strip HTML and get first 200 characters
    const plainText = content.replace(/<[^>]*>/g, '');
    const newExcerpt = plainText.substring(0, 200).trim() + (plainText.length > 200 ? '...' : '');

    return newExcerpt;
  }

  /**
   * Pre-publish checks
   */
  @OnAction(ContentHook.POST_BEFORE_PUBLISH, { priority: 10 })
  async prePublishChecks(post: any, context: HookContext): Promise<void> {
    this.logger.debug(`Running pre-publish checks for: ${post.title}`);
    
    // Example checks before publishing
    if (!post.content || post.content.trim().length < 100) {
      throw new Error('Post content must be at least 100 characters');
    }

    // Check for required featured image (optional enforcement)
    // if (!post.featuredImage) {
    //   throw new Error('Featured image is required for publishing');
    // }
  }

  /**
   * Notify after publish
   */
  @OnAction(ContentHook.POST_AFTER_PUBLISH, { priority: 50 })
  async notifyAfterPublish(post: any, context: HookContext): Promise<void> {
    this.logger.log(`Post published: "${post.title}"`);
    
    // Here you could:
    // - Send email notifications to subscribers
    // - Post to social media
    // - Ping search engines
    // - Update RSS feed
  }

  /**
   * SEO optimization filter
   */
  @OnFilter(ContentHook.POST_SEO_FILTER, { priority: 50 })
  async optimizeSEO(
    data: { title: string; content: string; metaTitle?: string; metaDescription?: string },
    context: HookContext,
  ): Promise<typeof data> {
    // Generate meta title if not set
    if (!data.metaTitle) {
      data.metaTitle = data.title.substring(0, 60);
    }

    // Generate meta description if not set
    if (!data.metaDescription) {
      const plainText = data.content.replace(/<[^>]*>/g, '');
      data.metaDescription = plainText.substring(0, 160).trim();
    }

    return data;
  }
}
