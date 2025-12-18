/**
 * NestPress Templates Service
 * WordPress-like template management with hierarchy support
 */

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { HooksService } from '../hooks/hooks.service';
import { ContentHook } from '../hooks/interfaces';
import {
  Template,
  TemplatePart,
  TemplateAssignment,
  TemplateType,
  TemplateStatus,
  TemplateSettings,
  CreateTemplateDto,
  UpdateTemplateDto,
  AssignTemplateDto,
  DEFAULT_TEMPLATE_SETTINGS,
  TemplateRenderContext,
} from './interfaces';
import { v4 as uuidv4 } from 'uuid';

const TEMPLATES_COLLECTION = 'templates';
const TEMPLATE_PARTS_COLLECTION = 'template_parts';
const TEMPLATE_ASSIGNMENTS_COLLECTION = 'template_assignments';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly hooksService: HooksService,
  ) {}

  /**
   * Initialize default templates on module startup
   */
  async onModuleInit() {
    await this.seedDefaultTemplates();
  }

  /**
   * Create default templates if none exist
   */
  private async seedDefaultTemplates(): Promise<void> {
    const { total } = await this.database.findAll<Template>(TEMPLATES_COLLECTION);
    
    if (total > 0) {
      this.logger.log(`Found ${total} existing templates`);
      return;
    }

    this.logger.log('Seeding default templates...');

    const defaultTemplates: CreateTemplateDto[] = [
      // Single Post Template
      {
        name: 'Single Post',
        slug: 'single-post',
        description: 'Default template for displaying a single blog post',
        type: 'post',
        content: this.getDefaultPostTemplate(),
        settings: {
          ...DEFAULT_TEMPLATE_SETTINGS,
          layout: 'no-sidebar',
          showComments: true,
        },
        isDefault: true,
      },
      // Single Page Template
      {
        name: 'Default Page',
        slug: 'default-page',
        description: 'Default template for static pages',
        type: 'page',
        content: this.getDefaultPageTemplate(),
        settings: {
          ...DEFAULT_TEMPLATE_SETTINGS,
          layout: 'no-sidebar',
          showMeta: false,
          showComments: false,
        },
        isDefault: true,
      },
      // Blog Archive Template
      {
        name: 'Blog Archive',
        slug: 'archive',
        description: 'Template for blog listing and archives',
        type: 'archive',
        content: this.getDefaultArchiveTemplate(),
        settings: {
          ...DEFAULT_TEMPLATE_SETTINGS,
          layout: 'sidebar-right',
          showSidebar: true,
        },
        isDefault: true,
      },
      // Homepage Template
      {
        name: 'Homepage',
        slug: 'home',
        description: 'Default homepage template',
        type: 'home',
        content: this.getDefaultHomeTemplate(),
        settings: {
          ...DEFAULT_TEMPLATE_SETTINGS,
          layout: 'full-width',
          showTitle: false,
        },
        isDefault: true,
      },
      // 404 Template
      {
        name: '404 Not Found',
        slug: '404',
        description: 'Template for 404 error pages',
        type: '404',
        content: this.getDefault404Template(),
        settings: {
          ...DEFAULT_TEMPLATE_SETTINGS,
          showMeta: false,
          showComments: false,
        },
        isDefault: true,
      },
      // Full Width Page Template
      {
        name: 'Full Width Page',
        slug: 'full-width',
        description: 'Full width page without sidebar',
        type: 'page',
        content: this.getFullWidthTemplate(),
        settings: {
          ...DEFAULT_TEMPLATE_SETTINGS,
          layout: 'full-width',
          showSidebar: false,
        },
        isDefault: false,
      },
      // Landing Page Template
      {
        name: 'Landing Page',
        slug: 'landing-page',
        description: 'Clean landing page without header/footer',
        type: 'page',
        content: this.getLandingPageTemplate(),
        settings: {
          ...DEFAULT_TEMPLATE_SETTINGS,
          layout: 'full-width',
          showHeader: false,
          showFooter: false,
          showTitle: false,
        },
        isDefault: false,
      },
    ];

    // Seed default template parts
    await this.seedDefaultTemplateParts();

    for (const templateData of defaultTemplates) {
      await this.create(templateData);
    }

    this.logger.log(`Seeded ${defaultTemplates.length} default templates`);
  }

  /**
   * Seed default template parts (header, footer, sidebar)
   */
  private async seedDefaultTemplateParts(): Promise<void> {
    const parts: Omit<TemplatePart, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Default Header',
        slug: 'header',
        area: 'header',
        content: this.getDefaultHeaderPart(),
        isDefault: true,
      },
      {
        name: 'Default Footer',
        slug: 'footer',
        area: 'footer',
        content: this.getDefaultFooterPart(),
        isDefault: true,
      },
      {
        name: 'Default Sidebar',
        slug: 'sidebar',
        area: 'sidebar',
        content: this.getDefaultSidebarPart(),
        isDefault: true,
      },
    ];

    for (const part of parts) {
      await this.database.create<TemplatePart>(TEMPLATE_PARTS_COLLECTION, {
        id: uuidv4(),
        ...part,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // ============================================
  // CRUD Operations
  // ============================================

  /**
   * Create a new template
   */
  async create(data: CreateTemplateDto): Promise<Template> {
    const slug = data.slug || this.generateSlug(data.name);

    // Check for duplicate slug
    const existing = await this.database.findByField<Template>(
      TEMPLATES_COLLECTION,
      'slug',
      slug,
    );
    if (existing) {
      throw new BadRequestException(`Template with slug "${slug}" already exists`);
    }

    // If this is a default template, unset other defaults of same type
    if (data.isDefault) {
      await this.unsetDefaultForType(data.type);
    }

    const template: Template = {
      id: uuidv4(),
      name: data.name,
      slug,
      description: data.description,
      type: data.type,
      status: 'active',
      content: data.content,
      blocks: data.blocks,
      settings: {
        ...DEFAULT_TEMPLATE_SETTINGS,
        ...data.settings,
      },
      parent: data.parent,
      isDefault: data.isDefault || false,
      version: '1.0.0',
      author: 'NestPress',
      themeId: data.themeId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await this.database.create<Template>(TEMPLATES_COLLECTION, template);
    this.logger.log(`Created template: ${created.name} (${created.type})`);

    return created;
  }

  /**
   * Get all templates
   */
  async findAll(options?: {
    type?: TemplateType;
    status?: TemplateStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: Template[]; total: number }> {
    const filters: Record<string, any> = {};
    
    if (options?.type) filters.type = options.type;
    if (options?.status) filters.status = options.status;

    return this.database.findAll<Template>(TEMPLATES_COLLECTION, {
      page: options?.page || 1,
      limit: options?.limit || 50,
      filters,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    });
  }

  /**
   * Get template by ID
   */
  async findById(id: string): Promise<Template> {
    const template = await this.database.findById<Template>(TEMPLATES_COLLECTION, id);
    if (!template) {
      throw new NotFoundException(`Template with ID "${id}" not found`);
    }
    return template;
  }

  /**
   * Get template by slug
   */
  async findBySlug(slug: string): Promise<Template> {
    const template = await this.database.findByField<Template>(
      TEMPLATES_COLLECTION,
      'slug',
      slug,
    );
    if (!template) {
      throw new NotFoundException(`Template with slug "${slug}" not found`);
    }
    return template;
  }

  /**
   * Get default template for a type
   */
  async getDefaultForType(type: TemplateType): Promise<Template | null> {
    const { data } = await this.database.findAll<Template>(TEMPLATES_COLLECTION, {
      filters: { type, isDefault: true, status: 'active' },
      limit: 1,
    });
    return data[0] || null;
  }

  /**
   * Update template
   */
  async update(id: string, data: UpdateTemplateDto): Promise<Template> {
    const existing = await this.findById(id);

    // If setting as default, unset other defaults
    if (data.isDefault && !existing.isDefault) {
      await this.unsetDefaultForType(existing.type);
    }

    const updated = await this.database.update<Template>(TEMPLATES_COLLECTION, id, {
      ...data,
      settings: data.settings 
        ? { ...existing.settings, ...data.settings }
        : existing.settings,
      updatedAt: new Date().toISOString(),
    });

    this.logger.log(`Updated template: ${updated.name}`);
    return updated;
  }

  /**
   * Delete template
   */
  async delete(id: string): Promise<void> {
    const template = await this.findById(id);
    
    if (template.isDefault) {
      throw new BadRequestException('Cannot delete default template. Set another template as default first.');
    }

    // Remove assignments
    const { data: assignments } = await this.database.findAll<TemplateAssignment>(
      TEMPLATE_ASSIGNMENTS_COLLECTION,
      { filters: { templateId: id } },
    );
    
    for (const assignment of assignments) {
      await this.database.delete(TEMPLATE_ASSIGNMENTS_COLLECTION, assignment.id);
    }

    await this.database.delete(TEMPLATES_COLLECTION, id);
    this.logger.log(`Deleted template: ${template.name}`);
  }

  /**
   * Clone an existing template
   */
  async clone(id: string, newName?: string): Promise<Template> {
    const original = await this.findById(id);
    
    const cloneName = newName || `${original.name} (Copy)`;
    const cloneSlug = `${original.slug}-copy-${Date.now()}`;

    const cloneData: CreateTemplateDto = {
      name: cloneName,
      slug: cloneSlug,
      description: original.description,
      type: original.type,
      content: original.content,
      blocks: original.blocks,
      settings: original.settings,
      parent: original.parent,
      isDefault: false, // Never clone as default
      themeId: original.themeId,
    };

    const cloned = await this.create(cloneData);
    this.logger.log(`Cloned template: ${original.name} -> ${cloned.name}`);
    return cloned;
  }

  // ============================================
  // Template Assignment
  // ============================================

  /**
   * Assign template to specific content
   */
  async assignTemplate(data: AssignTemplateDto): Promise<TemplateAssignment[]> {
    const template = await this.findById(data.templateId);
    const assignments: TemplateAssignment[] = [];

    for (const contentId of data.contentIds) {
      // Remove existing assignment for this content
      const existing = await this.database.findByField<TemplateAssignment>(
        TEMPLATE_ASSIGNMENTS_COLLECTION,
        'contentId',
        contentId,
      );
      if (existing) {
        await this.database.delete(TEMPLATE_ASSIGNMENTS_COLLECTION, existing.id);
      }

      const assignment: TemplateAssignment = {
        id: uuidv4(),
        templateId: data.templateId,
        contentType: data.contentType,
        contentId,
        priority: 10,
        createdAt: new Date().toISOString(),
      };

      const created = await this.database.create<TemplateAssignment>(
        TEMPLATE_ASSIGNMENTS_COLLECTION,
        assignment,
      );
      assignments.push(created);
    }

    this.logger.log(`Assigned template "${template.name}" to ${assignments.length} items`);
    return assignments;
  }

  /**
   * Get template for specific content
   */
  async getTemplateForContent(
    contentType: 'page' | 'post' | 'product',
    contentId: string,
  ): Promise<Template> {
    // Check for specific assignment
    const assignment = await this.database.findByField<TemplateAssignment>(
      TEMPLATE_ASSIGNMENTS_COLLECTION,
      'contentId',
      contentId,
    );

    if (assignment) {
      return this.findById(assignment.templateId);
    }

    // Fall back to default template for type
    const templateType: TemplateType = contentType === 'post' ? 'post' : 'page';
    const defaultTemplate = await this.getDefaultForType(templateType);
    
    if (!defaultTemplate) {
      throw new NotFoundException(`No default template found for type "${templateType}"`);
    }

    return defaultTemplate;
  }

  /**
   * Get assignments for a template
   */
  async getTemplateAssignments(templateId: string): Promise<TemplateAssignment[]> {
    const { data } = await this.database.findAll<TemplateAssignment>(
      TEMPLATE_ASSIGNMENTS_COLLECTION,
      { filters: { templateId } },
    );
    return data;
  }

  // ============================================
  // Template Parts
  // ============================================

  /**
   * Get all template parts
   */
  async getTemplateParts(area?: 'header' | 'footer' | 'sidebar' | 'general'): Promise<TemplatePart[]> {
    const filters = area ? { area } : {};
    const { data } = await this.database.findAll<TemplatePart>(TEMPLATE_PARTS_COLLECTION, {
      filters,
    });
    return data;
  }

  /**
   * Get template part by slug
   */
  async getTemplatePart(slug: string): Promise<TemplatePart> {
    const part = await this.database.findByField<TemplatePart>(
      TEMPLATE_PARTS_COLLECTION,
      'slug',
      slug,
    );
    if (!part) {
      throw new NotFoundException(`Template part "${slug}" not found`);
    }
    return part;
  }

  /**
   * Update template part
   */
  async updateTemplatePart(
    slug: string,
    data: { content?: string; name?: string },
  ): Promise<TemplatePart> {
    const part = await this.getTemplatePart(slug);
    const updated = await this.database.update<TemplatePart>(
      TEMPLATE_PARTS_COLLECTION,
      part.id,
      {
        ...data,
        updatedAt: new Date().toISOString(),
      },
    );
    return updated;
  }

  // ============================================
  // Template Rendering
  // ============================================

  /**
   * Render template with context
   */
  async renderTemplate(
    templateId: string,
    context: Partial<TemplateRenderContext>,
  ): Promise<string> {
    const template = await this.findById(templateId);
    
    // Apply hooks before rendering
    const filteredTemplate = await this.hooksService.applyFilters<Template>(
      'template:before_render',
      template,
      { templateId, context },
    );

    let html = filteredTemplate.finalValue.content;

    // Simple template variable replacement
    html = this.replaceTemplateVariables(html, {
      ...context,
      template: filteredTemplate.finalValue,
    } as TemplateRenderContext);

    // Apply post-render hooks
    const result = await this.hooksService.applyFilters<string>(
      'template:after_render',
      html,
      { templateId, context },
    );

    return result.finalValue;
  }

  /**
   * Simple template variable replacement
   */
  private replaceTemplateVariables(
    html: string,
    context: TemplateRenderContext,
  ): string {
    const replacements: Record<string, string> = {
      '{{site.name}}': context.site?.name || '',
      '{{site.tagline}}': context.site?.tagline || '',
      '{{site.url}}': context.site?.url || '',
      '{{content.title}}': context.content?.title || '',
      '{{content.content}}': context.content?.content || '',
      '{{content.excerpt}}': context.content?.excerpt || '',
      '{{content.author}}': context.content?.author?.name || '',
      '{{content.date}}': context.content?.createdAt || '',
      '{{content.featuredImage}}': context.content?.featuredImage || '',
    };

    let result = html;
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    return result;
  }

  // ============================================
  // Helper Methods
  // ============================================

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async unsetDefaultForType(type: TemplateType): Promise<void> {
    const { data } = await this.database.findAll<Template>(TEMPLATES_COLLECTION, {
      filters: { type, isDefault: true },
    });

    for (const template of data) {
      await this.database.update<Template>(TEMPLATES_COLLECTION, template.id, {
        isDefault: false,
      });
    }
  }

  // ============================================
  // Default Template Content
  // ============================================

  private getDefaultPostTemplate(): string {
    return `
<article class="post single-post">
  {{#if settings.showFeaturedImage}}
  <div class="post-featured-image">
    <img src="{{content.featuredImage}}" alt="{{content.title}}" />
  </div>
  {{/if}}
  
  <header class="post-header">
    <h1 class="post-title">{{content.title}}</h1>
    
    {{#if settings.showMeta}}
    <div class="post-meta">
      {{#if settings.showAuthor}}
      <span class="post-author">By {{content.author}}</span>
      {{/if}}
      {{#if settings.showDate}}
      <span class="post-date">{{content.date}}</span>
      {{/if}}
      {{#if settings.showCategories}}
      <span class="post-categories">{{content.categories}}</span>
      {{/if}}
    </div>
    {{/if}}
  </header>
  
  <div class="post-content">
    {{content.content}}
  </div>
  
  {{#if settings.showTags}}
  <footer class="post-footer">
    <div class="post-tags">{{content.tags}}</div>
  </footer>
  {{/if}}
  
  {{#if settings.showComments}}
  <section class="comments-section">
    {{comments}}
  </section>
  {{/if}}
</article>
    `.trim();
  }

  private getDefaultPageTemplate(): string {
    return `
<article class="page">
  <header class="page-header">
    <h1 class="page-title">{{content.title}}</h1>
  </header>
  
  <div class="page-content">
    {{content.content}}
  </div>
</article>
    `.trim();
  }

  private getDefaultArchiveTemplate(): string {
    return `
<div class="archive">
  <header class="archive-header">
    <h1 class="archive-title">{{archive.title}}</h1>
    {{#if archive.description}}
    <div class="archive-description">{{archive.description}}</div>
    {{/if}}
  </header>
  
  <div class="posts-grid">
    {{#each posts}}
    <article class="post-card">
      {{#if featuredImage}}
      <div class="post-card-image">
        <img src="{{featuredImage}}" alt="{{title}}" />
      </div>
      {{/if}}
      <div class="post-card-content">
        <h2 class="post-card-title">
          <a href="{{url}}">{{title}}</a>
        </h2>
        <p class="post-card-excerpt">{{excerpt}}</p>
        <div class="post-card-meta">
          <span class="post-card-date">{{date}}</span>
        </div>
      </div>
    </article>
    {{/each}}
  </div>
  
  {{#if pagination}}
  <nav class="pagination">
    {{pagination}}
  </nav>
  {{/if}}
</div>
    `.trim();
  }

  private getDefaultHomeTemplate(): string {
    return `
<div class="home">
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <h1>{{site.name}}</h1>
      <p>{{site.tagline}}</p>
    </div>
  </section>
  
  <!-- Latest Posts -->
  <section class="latest-posts">
    <h2>Latest Posts</h2>
    <div class="posts-grid">
      {{#each latestPosts}}
      <article class="post-card">
        <h3><a href="{{url}}">{{title}}</a></h3>
        <p>{{excerpt}}</p>
      </article>
      {{/each}}
    </div>
  </section>
</div>
    `.trim();
  }

  private getDefault404Template(): string {
    return `
<div class="error-404">
  <h1>404</h1>
  <h2>Page Not Found</h2>
  <p>The page you're looking for doesn't exist or has been moved.</p>
  <a href="/" class="btn">Go Home</a>
</div>
    `.trim();
  }

  private getFullWidthTemplate(): string {
    return `
<article class="page full-width">
  <div class="page-content full-width-content">
    {{content.content}}
  </div>
</article>
    `.trim();
  }

  private getLandingPageTemplate(): string {
    return `
<div class="landing-page">
  {{content.content}}
</div>
    `.trim();
  }

  private getDefaultHeaderPart(): string {
    return `
<header class="site-header">
  <div class="header-container">
    <div class="site-branding">
      {{#if site.logo}}
      <img src="{{site.logo}}" alt="{{site.name}}" class="site-logo" />
      {{else}}
      <h1 class="site-title"><a href="/">{{site.name}}</a></h1>
      {{/if}}
    </div>
    <nav class="main-navigation">
      {{navigation}}
    </nav>
  </div>
</header>
    `.trim();
  }

  private getDefaultFooterPart(): string {
    return `
<footer class="site-footer">
  <div class="footer-container">
    <div class="footer-widgets">
      {{widgets.footer}}
    </div>
    <div class="footer-bottom">
      <p class="copyright">{{footer.copyright}}</p>
      {{#if footer.showPoweredBy}}
      <p class="powered-by">Powered by NestPress</p>
      {{/if}}
    </div>
  </div>
</footer>
    `.trim();
  }

  private getDefaultSidebarPart(): string {
    return `
<aside class="sidebar">
  {{widgets.sidebar}}
</aside>
    `.trim();
  }
}
