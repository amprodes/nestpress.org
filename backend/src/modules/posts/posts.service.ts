import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { HooksService } from '../hooks/hooks.service';
import { ContentHook } from '../hooks/interfaces';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, PostStatus } from './entities/post.entity';
import slugify from 'slugify';

const COLLECTION = 'posts';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly hooksService: HooksService,
  ) {}

  async create(createPostDto: CreatePostDto, authorId: string): Promise<Post> {
    // Fire before_create action
    await this.hooksService.doAction(ContentHook.POST_BEFORE_CREATE, {
      ...createPostDto,
      authorId,
    });

    // Apply content filter
    let content = createPostDto.content;
    if (content) {
      const contentResult = await this.hooksService.applyFilters(
        ContentHook.POST_CONTENT_FILTER,
        content,
      );
      content = contentResult.finalValue;
    }

    // Apply excerpt filter
    let excerpt = createPostDto.excerpt || '';
    const excerptResult = await this.hooksService.applyFilters(
      ContentHook.POST_EXCERPT_FILTER,
      excerpt,
      { content: createPostDto.content },
    );
    excerpt = excerptResult.finalValue;

    const slug = this.generateSlug(createPostDto.title);
    
    const post = await this.database.create<Post>(COLLECTION, {
      ...createPostDto,
      content,
      excerpt,
      slug,
      authorId,
      status: createPostDto.status || PostStatus.DRAFT,
      views: 0,
      likes: 0,
    });

    // Fire after_create action
    await this.hooksService.doAction(ContentHook.POST_AFTER_CREATE, post);

    this.logger.log(`Post created: ${post.title}`);
    return post;
  }

  async findAll(
    page = 1,
    limit = 10,
    status?: PostStatus,
    authorId?: string,
  ): Promise<{ data: Post[]; total: number }> {
    const filters: Record<string, any> = {};
    
    if (status) {
      filters.status = status;
    }
    if (authorId) {
      filters.authorId = authorId;
    }

    return this.database.findAll<Post>(COLLECTION, {
      page,
      limit,
      filters,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }

  async findPublished(page = 1, limit = 10): Promise<{ data: Post[]; total: number }> {
    return this.findAll(page, limit, PostStatus.PUBLISHED);
  }

  async findById(id: string): Promise<Post | null> {
    return this.database.findById<Post>(COLLECTION, id);
  }

  async findBySlug(slug: string): Promise<Post | null> {
    return this.database.findByField<Post>(COLLECTION, 'slug', slug);
  }

  /**
   * Get post for display with all filters applied (WordPress-like)
   * This applies content, title, and excerpt filters before returning
   */
  async findByIdForDisplay(id: string): Promise<Post | null> {
    const post = await this.findById(id);
    if (!post) return null;

    return this.applyDisplayFilters(post);
  }

  async findBySlugForDisplay(slug: string): Promise<Post | null> {
    const post = await this.findBySlug(slug);
    if (!post) return null;

    return this.applyDisplayFilters(post);
  }

  async findPublishedForDisplay(page = 1, limit = 10): Promise<{ data: Post[]; total: number }> {
    const result = await this.findPublished(page, limit);
    
    // Apply filters to each post
    const filteredPosts = await Promise.all(
      result.data.map(post => this.applyDisplayFilters(post))
    );

    return {
      data: filteredPosts,
      total: result.total,
    };
  }

  /**
   * Apply WordPress-like display filters to a post
   * Filters: the_title, the_content, the_excerpt
   */
  private async applyDisplayFilters(post: Post): Promise<Post> {
    // Apply title filter
    if (post.title) {
      const titleResult = await this.hooksService.applyFilters(
        ContentHook.POST_TITLE_FILTER,
        post.title,
        { postId: post.id }
      );
      post.title = titleResult.finalValue;
    }

    // Apply content filter
    if (post.content) {
      const contentResult = await this.hooksService.applyFilters(
        ContentHook.POST_CONTENT_FILTER,
        post.content,
        { postId: post.id }
      );
      post.content = contentResult.finalValue;
    }

    // Apply excerpt filter
    if (post.excerpt || post.content) {
      const excerptResult = await this.hooksService.applyFilters(
        ContentHook.POST_EXCERPT_FILTER,
        post.excerpt || '',
        { postId: post.id, content: post.content }
      );
      post.excerpt = excerptResult.finalValue;
    }

    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Fire before_update action
    await this.hooksService.doAction(ContentHook.POST_BEFORE_UPDATE, {
      post,
      updates: updatePostDto,
    });

    // Apply content filter if content is being updated
    const updateData: any = { ...updatePostDto };
    if (updatePostDto.content) {
      const contentResult = await this.hooksService.applyFilters(
        ContentHook.POST_CONTENT_FILTER,
        updatePostDto.content,
      );
      updateData.content = contentResult.finalValue;
    }

    // Generate new slug if title changed
    if (updatePostDto.title && updatePostDto.title !== post.title) {
      updateData.slug = this.generateSlug(updatePostDto.title);
    }

    const updated = await this.database.update<Post>(COLLECTION, id, updateData);
    
    // Fire after_update action
    await this.hooksService.doAction(ContentHook.POST_AFTER_UPDATE, updated);
    
    this.logger.log(`Post updated: ${id}`);
    return updated;
  }

  async publish(id: string): Promise<Post> {
    const post = await this.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Fire before_publish action (can throw to prevent publishing)
    await this.hooksService.doAction(ContentHook.POST_BEFORE_PUBLISH, post);

    // Apply SEO filter before publishing
    const seoResult = await this.hooksService.applyFilters(
      ContentHook.POST_SEO_FILTER,
      {
        title: post.title,
        content: post.content,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
      },
    );

    const published = await this.database.update<Post>(COLLECTION, id, {
      status: PostStatus.PUBLISHED,
      publishedAt: new Date().toISOString(),
      metaTitle: seoResult.finalValue.metaTitle,
      metaDescription: seoResult.finalValue.metaDescription,
    });

    // Fire after_publish action
    await this.hooksService.doAction(ContentHook.POST_AFTER_PUBLISH, published);

    return published;
  }

  async unpublish(id: string): Promise<Post> {
    return this.update(id, { status: PostStatus.DRAFT });
  }

  async trash(id: string): Promise<Post> {
    return this.update(id, { status: PostStatus.TRASH });
  }

  async remove(id: string): Promise<boolean> {
    const post = await this.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Fire before_delete action
    await this.hooksService.doAction(ContentHook.POST_BEFORE_DELETE, post);

    await this.database.delete(COLLECTION, id);
    
    // Fire after_delete action
    await this.hooksService.doAction(ContentHook.POST_AFTER_DELETE, { id, post });
    
    this.logger.log(`Post deleted: ${id}`);
    return true;
  }

  async incrementViews(id: string): Promise<Post> {
    const post = await this.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return this.database.update<Post>(COLLECTION, id, {
      views: (post.views || 0) + 1,
    });
  }

  private generateSlug(title: string): string {
    return slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
  }
}
