import { Injectable, Logger } from '@nestjs/common';
import { HookProvider, OnFilter } from './decorators/hook.decorators';
import { ContentHook } from './interfaces/hook.interfaces';
import { HookContext } from './interfaces/hook.interfaces';

/**
 * ContentFiltersService - WordPress-like content filters
 * 
 * Implements the WordPress content filtering pipeline:
 * 1. wpautop - Auto-paragraph formatting
 * 2. wptexturize - Smart quotes and typography
 * 3. convert_smilies - Emoji conversion
 * 4. do_shortcode - Shortcode processing (basic)
 * 5. sanitize - XSS protection
 */
@HookProvider({ namespace: 'core' })
@Injectable()
export class ContentFiltersService {
  private readonly logger = new Logger(ContentFiltersService.name);

  // ============================================
  // POST CONTENT FILTERS (like WordPress the_content)
  // ============================================

  /**
   * Priority 5: Sanitize HTML (security first)
   * Removes dangerous tags and attributes
   */
  @OnFilter(ContentHook.POST_CONTENT_FILTER, { priority: 5 })
  async sanitizeContent(content: string, context: HookContext): Promise<string> {
    if (!content) return '';

    // Remove script tags and dangerous attributes
    let sanitized = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove inline event handlers
      .replace(/javascript:/gi, ''); // Remove javascript: protocols

    return sanitized;
  }

  /**
   * Priority 10: Auto-paragraph (wpautop)
   * Converts double line breaks to <p> tags
   */
  @OnFilter(ContentHook.POST_CONTENT_FILTER, { priority: 10 })
  async wpautop(content: string, context: HookContext): Promise<string> {
    if (!content || !content.trim()) return '';

    // Don't process if already has paragraph tags
    if (/<p[^>]*>/i.test(content)) {
      return content;
    }

    // Split by double newlines (paragraph breaks)
    const paragraphs = content.split(/\n\s*\n/);
    
    const formatted = paragraphs
      .map(para => {
        para = para.trim();
        if (!para) return '';
        
        // Don't wrap if it's already a block element
        if (/^<(div|blockquote|pre|table|ul|ol|dl|h[1-6]|hr|form|fieldset|address)/i.test(para)) {
          return para;
        }
        
        // Convert single line breaks to <br>
        para = para.replace(/\n/g, '<br>\n');
        
        return `<p>${para}</p>`;
      })
      .filter(p => p)
      .join('\n\n');

    return formatted;
  }

  /**
   * Priority 15: Smart typography (wptexturize)
   * Converts straight quotes to curly quotes, etc.
   */
  @OnFilter(ContentHook.POST_CONTENT_FILTER, { priority: 15 })
  async wptexturize(content: string, context: HookContext): Promise<string> {
    if (!content) return '';

    let texturized = content;

    // Smart quotes
    texturized = texturized
      .replace(/(\s|^)"([^"]*)"(\s|[.,;!?]|$)/g, '$1\u201C$2\u201D$3') // Double quotes
      .replace(/(\s|^)'([^']*)'(\s|[.,;!?]|$)/g, '$1\u2018$2\u2019$3') // Single quotes
      .replace(/(\w)'(\w)/g, '$1\u2019$2'); // Apostrophes

    // Dashes
    texturized = texturized
      .replace(/(\s)--(\s)/g, '$1\u2014$2') // Em dash
      .replace(/(\d+)-(\d+)/g, '$1\u2013$2'); // En dash for ranges

    // Ellipsis
    texturized = texturized.replace(/\.{3}/g, '\u2026');

    return texturized;
  }

  /**
   * Priority 20: Convert smilies to emoji
   */
  @OnFilter(ContentHook.POST_CONTENT_FILTER, { priority: 20 })
  async convertSmilies(content: string, context: HookContext): Promise<string> {
    if (!content) return '';

    const smilies: Record<string, string> = {
      ':)': '😊',
      ':-)': '😊',
      ':(': '😞',
      ':-(': '😞',
      ':D': '😄',
      ':-D': '😄',
      ';)': '😉',
      ';-)': '😉',
      ':P': '😛',
      ':-P': '😛',
      ':O': '😮',
      ':-O': '😮',
      '<3': '❤️',
      ':heart:': '❤️',
      ':star:': '⭐',
      ':fire:': '🔥',
      ':check:': '✓',
      ':x:': '✗',
    };

    let converted = content;
    for (const [smiley, emoji] of Object.entries(smilies)) {
      const escaped = smiley.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      converted = converted.replace(new RegExp(escaped, 'g'), emoji);
    }

    return converted;
  }

  /**
   * Priority 25: Process basic shortcodes
   * Simple shortcode support [gallery], [video], etc.
   */
  @OnFilter(ContentHook.POST_CONTENT_FILTER, { priority: 25 })
  async doShortcode(content: string, context: HookContext): Promise<string> {
    if (!content || !content.includes('[')) return content;

    let processed = content;

    // [gallery] shortcode
    processed = processed.replace(
      /\[gallery\s+ids=["']([^"']+)["']\]/g,
      (match, ids) => {
        const imageIds = ids.split(',').map((id: string) => id.trim());
        return `<div class="gallery gallery-columns-3">
          ${imageIds.map((id: string) => `<div class="gallery-item"><img src="/api/v1/media/${id}" alt="Gallery image ${id}"></div>`).join('')}
        </div>`;
      }
    );

    // [video] shortcode
    processed = processed.replace(
      /\[video\s+src=["']([^"']+)["']\]/g,
      (match, src) => {
        return `<video controls style="max-width: 100%;"><source src="${src}" type="video/mp4"></video>`;
      }
    );

    // [embed] shortcode for YouTube
    processed = processed.replace(
      /\[embed\]https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)\[\/embed\]/g,
      (match, videoId) => {
        return `<div class="video-embed" style="position: relative; padding-bottom: 56.25%; height: 0;">
          <iframe src="https://www.youtube-nocookie.com/embed/${videoId}" 
                  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
                  frameborder="0" allowfullscreen></iframe>
        </div>`;
      }
    );

    // [caption] shortcode
    processed = processed.replace(
      /\[caption[^\]]*\](.*?)\[\/caption\]/gs,
      (match, content) => {
        return `<figure class="wp-caption">${content.trim()}</figure>`;
      }
    );

    return processed;
  }

  /**
   * Priority 30: Add lazy loading to images
   */
  @OnFilter(ContentHook.POST_CONTENT_FILTER, { priority: 30 })
  async addLazyLoading(content: string, context: HookContext): Promise<string> {
    if (!content || !content.includes('<img')) return content;

    return content.replace(
      /<img([^>]*?)>/g,
      (match, attrs) => {
        if (attrs.includes('loading=')) return match;
        return `<img${attrs} loading="lazy">`;
      }
    );
  }

  // ============================================
  // POST TITLE FILTERS (like WordPress the_title)
  // ============================================

  /**
   * Priority 5: Trim whitespace
   */
  @OnFilter(ContentHook.POST_TITLE_FILTER, { priority: 5 })
  async trimTitle(title: string, context: HookContext): Promise<string> {
    return title?.trim() || '';
  }

  /**
   * Priority 10: Convert special characters
   */
  @OnFilter(ContentHook.POST_TITLE_FILTER, { priority: 10 })
  async convertTitleChars(title: string, context: HookContext): Promise<string> {
    if (!title) return '';

    return title
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  }

  /**
   * Priority 15: Smart quotes in titles
   */
  @OnFilter(ContentHook.POST_TITLE_FILTER, { priority: 15 })
  async texturizeTitles(title: string, context: HookContext): Promise<string> {
    if (!title) return '';

    return title
      .replace(/"([^"]*)"/g, '\u201C$1\u201D')
      .replace(/'([^']*)'/g, '\u2018$1\u2019')
      .replace(/(\w)'(\w)/g, '$1\u2019$2');
  }

  // ============================================
  // POST EXCERPT FILTERS (like WordPress the_excerpt)
  // ============================================

  /**
   * Priority 10: Generate excerpt from content
   */
  @OnFilter(ContentHook.POST_EXCERPT_FILTER, { priority: 10 })
  async generateExcerpt(excerpt: string, context: HookContext): Promise<string> {
    // Handle null/undefined
    if (excerpt === null || excerpt === undefined) {
      excerpt = '';
    }

    // If excerpt exists, use it
    if (typeof excerpt === 'string' && excerpt.trim()) {
      return excerpt;
    }

    // Otherwise, generate from content
    const content = context.metadata?.content as string;
    if (!content || typeof content !== 'string') return '';

    // Strip HTML tags
    const text = content.replace(/<[^>]*>/g, '');
    
    // Truncate to 55 words (WordPress default)
    const words = text.split(/\s+/).filter(w => w);
    if (words.length <= 55) return text.trim();

    return words.slice(0, 55).join(' ') + '…';
  }

  /**
   * Priority 20: Format excerpt
   */
  @OnFilter(ContentHook.POST_EXCERPT_FILTER, { priority: 20 })
  async formatExcerpt(excerpt: string, context: HookContext): Promise<string> {
    if (!excerpt || typeof excerpt !== 'string') return '';

    return excerpt
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ============================================
  // PRODUCT DESCRIPTION FILTERS
  // ============================================

  @OnFilter(ContentHook.PRODUCT_DESCRIPTION_FILTER, { priority: 10 })
  async formatProductDescription(description: string, context: HookContext): Promise<string> {
    if (!description) return '';

    // Apply same formatting as post content
    description = await this.sanitizeContent(description, context);
    description = await this.wpautop(description, context);
    description = await this.addLazyLoading(description, context);

    return description;
  }

  // ============================================
  // COMMENT CONTENT FILTERS
  // ============================================

  @OnFilter(ContentHook.COMMENT_CONTENT_FILTER, { priority: 5 })
  async sanitizeComment(content: string, context: HookContext): Promise<string> {
    if (!content) return '';

    // More aggressive sanitization for comments
    return content
      .replace(/<(?!\/?(p|br|strong|em|b|i|a|ul|ol|li|blockquote)\b)[^>]+>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '')
      .trim();
  }

  @OnFilter(ContentHook.COMMENT_CONTENT_FILTER, { priority: 10 })
  async formatCommentContent(content: string, context: HookContext): Promise<string> {
    if (!content) return '';

    // Convert line breaks to <br>
    return content.replace(/\n/g, '<br>\n');
  }

  @OnFilter(ContentHook.COMMENT_CONTENT_FILTER, { priority: 15 })
  async linkifyComments(content: string, context: HookContext): Promise<string> {
    if (!content) return '';

    // Convert URLs to links
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    return content.replace(urlRegex, '<a href="$1" rel="nofollow" target="_blank">$1</a>');
  }

  // ============================================
  // PAGE CONTENT FILTERS
  // ============================================

  @OnFilter(ContentHook.PAGE_CONTENT_FILTER, { priority: 10 })
  async formatPageContent(content: string, context: HookContext): Promise<string> {
    if (!content) return '';

    // Pages use same filters as posts
    content = await this.sanitizeContent(content, context);
    content = await this.wpautop(content, context);
    content = await this.wptexturize(content, context);
    content = await this.doShortcode(content, context);
    content = await this.addLazyLoading(content, context);

    return content;
  }
}
