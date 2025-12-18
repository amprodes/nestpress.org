import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Post, PostStatus } from '../posts/entities/post.entity';
import { Page, PageStatus } from '../pages/pages.service';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../../common/decorators';
import * as bcrypt from 'bcrypt';

/**
 * Data Seeder Service
 * Seeds initial data for development and demo purposes
 * Similar to WordPress's default content but modernized
 */
@Injectable()
export class DataSeederService implements OnModuleInit {
  private readonly logger = new Logger(DataSeederService.name);

  constructor(private readonly database: DatabaseService) {}

  async onModuleInit() {
    // Only seed if environment variable is set
    if (process.env.SEED_DATA === 'true') {
      // Delay seeding to ensure database connection is established
      // MongoDB's onModuleInit runs asynchronously
      setTimeout(() => this.seedAll(), 3000);
    }
  }

  async seedAll() {
    this.logger.log('Starting data seeding...');
    
    try {
      // Ensure database is connected - retry logic
      let retries = 5;
      while (retries > 0) {
        try {
          await this.database.connect();
          // Test connection with a simple query
          await this.database.findAll('posts', { limit: 1 });
          break;
        } catch (error) {
          retries--;
          if (retries === 0) throw error;
          this.logger.warn(`Database not ready, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Check if data already exists
      const existingPosts = await this.database.findAll('posts', { limit: 1 });
      if (existingPosts.total > 0) {
        this.logger.log('Data already exists, skipping seed');
        return;
      }

      // Seed in order
      await this.seedUsers();
      await this.seedPages();
      await this.seedPosts();
      await this.seedProducts();
      await this.seedAppearance();
      
      this.logger.log('Data seeding completed successfully!');
    } catch (error) {
      this.logger.error('Data seeding failed:', error.message || error);
      this.logger.error('Stack:', error.stack);
    }
  }

  private async seedUsers() {
    this.logger.log('Seeding users...');
    
    const users = [
      {
        email: 'admin@nestpress.com',
        password: await bcrypt.hash('admin123', 10),
        name: 'Admin User',
        role: Role.ADMIN,
        bio: 'Site administrator and content manager',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff',
      },
      {
        email: 'editor@nestpress.com',
        password: await bcrypt.hash('editor123', 10),
        name: 'Jane Editor',
        role: Role.EDITOR,
        bio: 'Content editor and curator',
        avatar: 'https://ui-avatars.com/api/?name=Jane+Editor&background=7C3AED&color=fff',
      },
      {
        email: 'author@nestpress.com',
        password: await bcrypt.hash('author123', 10),
        name: 'John Author',
        role: Role.AUTHOR,
        bio: 'Tech blogger and content creator',
        avatar: 'https://ui-avatars.com/api/?name=John+Author&background=059669&color=fff',
      },
    ];

    for (const user of users) {
      await this.database.create<User>('users', user);
    }
    
    this.logger.log(`Seeded ${users.length} users`);
  }

  private async seedPages() {
    this.logger.log('Seeding pages...');
    
    const pages = [
      {
        title: 'Home',
        slug: 'home',
        content: `
          <div class="hero-section" style="text-align: center; padding: 4rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; margin-bottom: 3rem;">
            <h1 style="font-size: 3rem; font-weight: bold; margin-bottom: 1rem;">Welcome to NestPress</h1>
            <p style="font-size: 1.5rem; margin-bottom: 2rem; opacity: 0.9;">A modern CMS combining WordPress simplicity with cutting-edge technology</p>
            <a href="/blog" style="display: inline-block; background: white; color: #667eea; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600; transition: transform 0.2s;">Explore Blog →</a>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 3rem;">
            <div style="padding: 2rem; background: #f8fafc; border-radius: 12px; border-left: 4px solid #3b82f6;">
              <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: #1e293b;">⚡ Lightning Fast</h3>
              <p style="color: #64748b; line-height: 1.6;">Built with modern technologies for optimal performance and developer experience.</p>
            </div>
            
            <div style="padding: 2rem; background: #f8fafc; border-radius: 12px; border-left: 4px solid #8b5cf6;">
              <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: #1e293b;">🎨 Beautiful Design</h3>
              <p style="color: #64748b; line-height: 1.6;">Gorgeous themes and templates that work out of the box with full customization.</p>
            </div>
            
            <div style="padding: 2rem; background: #f8fafc; border-radius: 12px; border-left: 4px solid #10b981;">
              <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: #1e293b;">🚀 Easy to Use</h3>
              <p style="color: #64748b; line-height: 1.6;">Intuitive interface inspired by WordPress but powered by React and NestJS.</p>
            </div>
          </div>

          <div style="background: #fef3c7; padding: 2rem; border-radius: 12px; border-left: 4px solid #f59e0b;">
            <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; color: #92400e;">🎯 Getting Started</h3>
            <p style="color: #78350f; line-height: 1.6;">This is a demo page showing what NestPress can do. Edit this content in the admin dashboard at <code>/admin</code></p>
          </div>
        `,
        status: PageStatus.PUBLISHED,
        order: 0,
        metaTitle: 'Home - NestPress CMS',
        metaDescription: 'Welcome to NestPress, a modern CMS with WordPress-like features',
      },
      {
        title: 'About',
        slug: 'about',
        content: `
          <h2>About NestPress</h2>
          <p style="font-size: 1.125rem; color: #64748b; line-height: 1.8; margin-bottom: 2rem;">NestPress is a modern content management system that combines the best of WordPress's user-friendly approach with cutting-edge web technologies.</p>

          <h3>Our Mission</h3>
          <p style="line-height: 1.8; color: #475569; margin-bottom: 2rem;">To provide developers and content creators with a powerful, flexible, and enjoyable platform for building modern websites and applications.</p>

          <h3>Key Features</h3>
          <ul style="line-height: 2; color: #475569; margin-bottom: 2rem;">
            <li><strong>WordPress-like Simplicity:</strong> Familiar interface and concepts for easy adoption</li>
            <li><strong>Modern Stack:</strong> Built with React, NestJS, and TypeScript</li>
            <li><strong>Hook System:</strong> Extensible architecture with actions and filters</li>
            <li><strong>AI Integration:</strong> Built-in AI for content enhancement and SEO</li>
            <li><strong>Multi-Database:</strong> Support for MongoDB, Firebase, DynamoDB, and Supabase</li>
            <li><strong>E-commerce Ready:</strong> Shopify-like product and order management</li>
          </ul>

          <h3>Technology Stack</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 2rem;">
            <div style="padding: 1.5rem; background: #eff6ff; border-radius: 8px; text-align: center;">
              <strong style="color: #1e40af;">React 19</strong>
              <p style="color: #60a5fa; font-size: 0.875rem; margin-top: 0.5rem;">Frontend Framework</p>
            </div>
            <div style="padding: 1.5rem; background: #fef2f2; border-radius: 8px; text-align: center;">
              <strong style="color: #991b1b;">NestJS</strong>
              <p style="color: #f87171; font-size: 0.875rem; margin-top: 0.5rem;">Backend Framework</p>
            </div>
            <div style="padding: 1.5rem; background: #f0fdf4; border-radius: 8px; text-align: center;">
              <strong style="color: #166534;">TypeScript</strong>
              <p style="color: #4ade80; font-size: 0.875rem; margin-top: 0.5rem;">Type Safety</p>
            </div>
            <div style="padding: 1.5rem; background: #faf5ff; border-radius: 8px; text-align: center;">
              <strong style="color: #6b21a8;">Tailwind CSS</strong>
              <p style="color: #c084fc; font-size: 0.875rem; margin-top: 0.5rem;">Styling</p>
            </div>
          </div>
        `,
        status: PageStatus.PUBLISHED,
        order: 1,
        metaTitle: 'About NestPress - Modern CMS',
        metaDescription: 'Learn about NestPress, a modern CMS with WordPress-like features',
      },
      {
        title: 'Contact',
        slug: 'contact',
        content: `
          <h2>Get In Touch</h2>
          <p style="font-size: 1.125rem; color: #64748b; line-height: 1.8; margin-bottom: 3rem;">We'd love to hear from you! Whether you have questions, feedback, or just want to say hello.</p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-bottom: 3rem;">
            <div>
              <h3>Contact Information</h3>
              <div style="margin-top: 1.5rem;">
                <p style="margin-bottom: 1rem; color: #475569;"><strong>Email:</strong> hello@nestpress.com</p>
                <p style="margin-bottom: 1rem; color: #475569;"><strong>GitHub:</strong> github.com/nestpress</p>
                <p style="margin-bottom: 1rem; color: #475569;"><strong>Twitter:</strong> @nestpress</p>
              </div>
            </div>
            
            <div>
              <h3>Office Hours</h3>
              <div style="margin-top: 1.5rem; color: #475569;">
                <p style="margin-bottom: 0.5rem;"><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM</p>
                <p style="margin-bottom: 0.5rem;"><strong>Saturday:</strong> 10:00 AM - 4:00 PM</p>
                <p style="margin-bottom: 0.5rem;"><strong>Sunday:</strong> Closed</p>
              </div>
            </div>
          </div>

          <div style="background: #f1f5f9; padding: 2rem; border-radius: 12px;">
            <h3 style="margin-bottom: 1.5rem;">Send us a message</h3>
            <form style="display: flex; flex-direction: column; gap: 1rem;">
              <input type="text" placeholder="Your Name" style="padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px;">
              <input type="email" placeholder="Your Email" style="padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px;">
              <textarea placeholder="Your Message" rows="5" style="padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; resize: vertical;"></textarea>
              <button type="submit" style="background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Send Message</button>
            </form>
          </div>
        `,
        status: PageStatus.PUBLISHED,
        order: 2,
        metaTitle: 'Contact Us - NestPress',
        metaDescription: 'Get in touch with the NestPress team',
      },
    ];

    for (const page of pages) {
      await this.database.create<Page>('pages', page);
    }
    
    this.logger.log(`Seeded ${pages.length} pages`);
  }

  private async seedPosts() {
    this.logger.log('Seeding posts...');
    
    // Get a user to be the author
    const users = await this.database.findAll<User>('users', { limit: 3 });
    const authorIds = users.data.map(u => u.id);

    const posts = [
      {
        title: 'Getting Started with NestPress',
        slug: 'getting-started-with-nestpress',
        content: `
          <p class="lead" style="font-size: 1.25rem; color: #64748b; line-height: 1.8; margin-bottom: 2rem;">Welcome to NestPress! This guide will help you get started with your new CMS and show you around the main features.</p>

          <h2>What is NestPress?</h2>
          <p>NestPress is a modern content management system that brings together the simplicity of WordPress with the power of modern web technologies. Built with React, NestJS, and TypeScript, it offers a familiar interface with cutting-edge performance.</p>

          <h2>Key Features</h2>
          <ul>
            <li><strong>WordPress-like Interface:</strong> If you've used WordPress, you'll feel right at home</li>
            <li><strong>Modern Stack:</strong> React 19, NestJS, TypeScript - all the latest technologies</li>
            <li><strong>Flexible Database:</strong> Choose between MongoDB, Firebase, DynamoDB, or Supabase</li>
            <li><strong>AI Integration:</strong> Built-in AI for content enhancement, SEO optimization, and more</li>
            <li><strong>Hook System:</strong> WordPress-like actions and filters for extensibility</li>
          </ul>

          <h2>Getting Started</h2>
          <p>Here's how to start using NestPress:</p>

          <ol>
            <li><strong>Access the Admin:</strong> Navigate to <code>/admin</code> to access the dashboard</li>
            <li><strong>Create Content:</strong> Use the Posts and Pages sections to create your content</li>
            <li><strong>Customize Your Site:</strong> Visit Appearance → Themes to change the look</li>
            <li><strong>Configure Settings:</strong> Go to Settings to configure your site details</li>
          </ol>

          <h2>Next Steps</h2>
          <p>Now that you're familiar with the basics, here are some things to try:</p>

          <ul>
            <li>Create your first blog post</li>
            <li>Add a new page</li>
            <li>Upload media to the media library</li>
            <li>Explore the theme customization options</li>
            <li>Try the AI content enhancement features</li>
          </ul>

          <p style="background: #dbeafe; padding: 1.5rem; border-left: 4px solid #3b82f6; border-radius: 4px; margin-top: 2rem;"><strong>💡 Pro Tip:</strong> Check out the documentation for advanced features like custom hooks, template development, and API integration.</p>
        `,
        excerpt: 'Learn how to get started with NestPress, a modern CMS with WordPress-like features and cutting-edge technology.',
        status: PostStatus.PUBLISHED,
        authorId: authorIds[0],
        categories: ['Getting Started', 'Tutorials'],
        tags: ['nestpress', 'cms', 'tutorial', 'beginner'],
        featuredImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop',
        views: 145,
        likes: 23,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'Understanding the WordPress-like Hook System',
        slug: 'understanding-wordpress-hook-system',
        content: `
          <p class="lead" style="font-size: 1.25rem; color: #64748b; line-height: 1.8; margin-bottom: 2rem;">NestPress includes a powerful hook system inspired by WordPress, allowing you to extend and customize functionality without modifying core code.</p>

          <h2>What Are Hooks?</h2>
          <p>Hooks are a way to change or add functionality at specific points in the code execution. NestPress supports two types of hooks:</p>

          <ul>
            <li><strong>Actions:</strong> Execute code at specific points (side effects only)</li>
            <li><strong>Filters:</strong> Modify data as it passes through the system</li>
          </ul>

          <h2>Using Filters</h2>
          <p>Filters allow you to modify content before it's displayed. For example:</p>

          <pre style="background: #1e293b; color: #e2e8f0; padding: 1.5rem; border-radius: 8px; overflow-x: auto;"><code>@OnFilter(ContentHook.POST_CONTENT_FILTER, { priority: 10 })
async customFilter(content: string): Promise&lt;string&gt; {
  return content.toUpperCase();
}</code></pre>

          <h2>Built-in Filters</h2>
          <p>NestPress comes with several built-in filters that process your content:</p>

          <ul>
            <li><code>sanitizeContent</code> - XSS protection and security</li>
            <li><code>wpautop</code> - Automatic paragraph formatting</li>
            <li><code>wptexturize</code> - Smart quotes and typography</li>
            <li><code>convertSmilies</code> - Convert text smilies to emoji</li>
            <li><code>doShortcode</code> - Process shortcodes like [gallery]</li>
          </ul>

          <h2>Creating Custom Hooks</h2>
          <p>You can create your own hooks to make your code extensible:</p>

          <pre style="background: #1e293b; color: #e2e8f0; padding: 1.5rem; border-radius: 8px; overflow-x: auto;"><code>// Execute an action
await this.hooksService.doAction('my_custom_action', data);

// Apply a filter
const filtered = await this.hooksService.applyFilters(
  'my_custom_filter',
  content
);</code></pre>

          <p style="background: #fef3c7; padding: 1.5rem; border-left: 4px solid #f59e0b; border-radius: 4px; margin-top: 2rem;"><strong>⚡ Power Tip:</strong> Use decorators like <code>@OnAction</code> and <code>@OnFilter</code> for clean, declarative hook registration in your services.</p>
        `,
        excerpt: 'Deep dive into NestPress\'s WordPress-inspired hook system and learn how to extend functionality with actions and filters.',
        status: PostStatus.PUBLISHED,
        authorId: authorIds[1],
        categories: ['Development', 'Advanced'],
        tags: ['hooks', 'development', 'wordpress', 'filters', 'actions'],
        featuredImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
        views: 89,
        likes: 15,
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'Building Your First Custom Template',
        slug: 'building-custom-template',
        content: `
          <p class="lead" style="font-size: 1.25rem; color: #64748b; line-height: 1.8; margin-bottom: 2rem;">Learn how to create custom templates in NestPress using the WordPress-like template hierarchy system.</p>

          <h2>Template Hierarchy</h2>
          <p>NestPress follows a WordPress-like template hierarchy:</p>

          <pre style="background: #1e293b; color: #e2e8f0; padding: 1.5rem; border-radius: 8px; overflow-x: auto;"><code>front-page → home → index
single → singular → index
page-{slug} → page → singular → index
category-{slug} → category → archive → index</code></pre>

          <h2>Creating a Template</h2>
          <p>Templates are React components that receive post/page data:</p>

          <pre style="background: #1e293b; color: #e2e8f0; padding: 1.5rem; border-radius: 8px; overflow-x: auto;"><code>export function CustomTemplate({ post, posts }: TemplateProps) {
  return (
    &lt;div className="custom-template"&gt;
      &lt;Loop posts={posts}&gt;
        {(post) =&gt; (
          &lt;&gt;
            &lt;TheTitle post={post} /&gt;
            &lt;TheContent post={post} /&gt;
          &lt;/&gt;
        )}
      &lt;/Loop&gt;
    &lt;/div&gt;
  );
}</code></pre>

          <h2>Template Tags</h2>
          <p>Use WordPress-like template tags in your components:</p>

          <ul>
            <li><code>&lt;TheTitle /&gt;</code> - Display post title</li>
            <li><code>&lt;TheContent /&gt;</code> - Display post content</li>
            <li><code>&lt;TheExcerpt /&gt;</code> - Display post excerpt</li>
            <li><code>&lt;TheMeta /&gt;</code> - Display post metadata</li>
            <li><code>&lt;TheFeaturedImage /&gt;</code> - Display featured image</li>
          </ul>

          <h2>The Loop</h2>
          <p>The Loop component works just like WordPress's loop:</p>

          <pre style="background: #1e293b; color: #e2e8f0; padding: 1.5rem; border-radius: 8px; overflow-x: auto;"><code>&lt;Loop posts={posts}&gt;
  {(post, index) =&gt; (
    &lt;article&gt;
      &lt;TheTitle post={post} link={true} /&gt;
      &lt;TheExcerpt post={post} /&gt;
      &lt;ThePermalink post={post}&gt;Read more&lt;/ThePermalink&gt;
    &lt;/article&gt;
  )}
&lt;/Loop&gt;</code></pre>

          <p style="background: #dcfce7; padding: 1.5rem; border-left: 4px solid #22c55e; border-radius: 4px; margin-top: 2rem;"><strong>✨ Best Practice:</strong> Keep templates focused and reusable. Use template parts for common elements like headers and footers.</p>
        `,
        excerpt: 'Step-by-step guide to creating custom templates using NestPress\'s WordPress-like template hierarchy and Loop system.',
        status: PostStatus.PUBLISHED,
        authorId: authorIds[2],
        categories: ['Development', 'Tutorials'],
        tags: ['templates', 'theming', 'development', 'wordpress'],
        featuredImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&h=400&fit=crop',
        views: 67,
        likes: 12,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'AI-Powered Content Enhancement',
        slug: 'ai-powered-content-enhancement',
        content: `
          <p class="lead" style="font-size: 1.25rem; color: #64748b; line-height: 1.8; margin-bottom: 2rem;">Discover how NestPress uses AI to enhance your content, improve SEO, and automate common tasks.</p>

          <h2>Built-in AI Features</h2>
          <p>NestPress integrates AI capabilities directly into the CMS:</p>

          <ul>
            <li><strong>Content Enhancement:</strong> Improve readability and engagement</li>
            <li><strong>SEO Optimization:</strong> Auto-generate meta descriptions and keywords</li>
            <li><strong>Grammar Checking:</strong> Catch errors before publishing</li>
            <li><strong>Image Alt Text:</strong> Generate descriptive alt text for accessibility</li>
            <li><strong>Content Moderation:</strong> Detect inappropriate content</li>
            <li><strong>Translation:</strong> Multi-language support</li>
          </ul>

          <h2>Using AI Hooks</h2>
          <p>Add AI capabilities to your hooks with the @AIHook decorator:</p>

          <pre style="background: #1e293b; color: #e2e8f0; padding: 1.5rem; border-radius: 8px; overflow-x: auto;"><code>@AIHook(ContentHook.POST_SEO_FILTER, { 
  aiTask: 'seo_optimize',
  priority: 50,
  fallbackOnError: true 
})
async optimizeSEO(post: Post): Promise&lt;Post&gt; {
  // AI will enhance SEO metadata
  return post;
}</code></pre>

          <h2>Content Generation</h2>
          <p>Use AI to help create content:</p>

          <pre style="background: #1e293b; color: #e2e8f0; padding: 1.5rem; border-radius: 8px; overflow-x: auto;"><code>const enhanced = await aiService.enhanceContent({
  content: post.content,
  tone: 'professional',
  targetLength: 500
});</code></pre>

          <h2>Configuration</h2>
          <p>NestPress supports multiple AI providers:</p>

          <ul>
            <li>Google Gemini (default)</li>
            <li>OpenAI GPT-4</li>
            <li>Anthropic Claude</li>
          </ul>

          <p style="background: #f3e8ff; padding: 1.5rem; border-left: 4px solid #a855f7; border-radius: 4px; margin-top: 2rem;"><strong>🤖 AI Tip:</strong> AI features are rate-limited by default to prevent API abuse. Configure limits in your environment variables.</p>
        `,
        excerpt: 'Learn how to leverage AI in NestPress for content enhancement, SEO optimization, and automated content moderation.',
        status: PostStatus.PUBLISHED,
        authorId: authorIds[0],
        categories: ['AI', 'Features'],
        tags: ['ai', 'seo', 'automation', 'content'],
        featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
        views: 201,
        likes: 45,
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'Multi-Database Support Explained',
        slug: 'multi-database-support',
        content: `
          <p class="lead" style="font-size: 1.25rem; color: #64748b; line-height: 1.8; margin-bottom: 2rem;">One of NestPress's unique features is its ability to work with multiple database providers. Choose the one that fits your needs best.</p>

          <h2>Supported Databases</h2>
          <p>NestPress provides a unified interface for multiple database systems:</p>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin: 2rem 0;">
            <div style="padding: 1.5rem; background: #fef3c7; border-radius: 8px;">
              <h3 style="color: #92400e; margin-bottom: 0.5rem;">🍃 MongoDB</h3>
              <p style="color: #78350f; font-size: 0.875rem;">Flexible document database, great for rapid development</p>
            </div>
            <div style="padding: 1.5rem; background: #fee2e2; border-radius: 8px;">
              <h3 style="color: #991b1b; margin-bottom: 0.5rem;">🔥 Firebase</h3>
              <p style="color: #7f1d1d; font-size: 0.875rem;">Google's real-time database with built-in authentication</p>
            </div>
            <div style="padding: 1.5rem; background: #dbeafe; border-radius: 8px;">
              <h3 style="color: #1e40af; margin-bottom: 0.5rem;">⚡ DynamoDB</h3>
              <p style="color: #1e3a8a; font-size: 0.875rem;">AWS's serverless NoSQL database for scalability</p>
            </div>
            <div style="padding: 1.5rem; background: #dcfce7; border-radius: 8px;">
              <h3 style="color: #166534; margin-bottom: 0.5rem;">🚀 Supabase</h3>
              <p style="color: #14532d; font-size: 0.875rem;">Open-source Firebase alternative with PostgreSQL</p>
            </div>
          </div>

          <h2>Database Abstraction</h2>
          <p>NestPress uses a unified database service that abstracts provider differences:</p>

          <pre style="background: #1e293b; color: #e2e8f0; padding: 1.5rem; border-radius: 8px; overflow-x: auto;"><code>// Same code works with any database
const post = await this.database.findById('posts', id);
const posts = await this.database.findAll('posts', options);
await this.database.create('posts', data);</code></pre>

          <h2>Switching Databases</h2>
          <p>Change databases without code changes:</p>

          <ol>
            <li>Update <code>DATABASE_PROVIDER</code> in .env file</li>
            <li>Add provider-specific configuration</li>
            <li>Restart the application</li>
          </ol>

          <p style="background: #e0e7ff; padding: 1.5rem; border-left: 4px solid #4f46e5; border-radius: 4px; margin-top: 2rem;"><strong>💾 Database Tip:</strong> Use MongoDB for development, then switch to DynamoDB or Supabase for production scaling.</p>
        `,
        excerpt: 'Explore NestPress\'s flexible database abstraction layer that supports MongoDB, Firebase, DynamoDB, and Supabase.',
        status: PostStatus.PUBLISHED,
        authorId: authorIds[1],
        categories: ['Architecture', 'Advanced'],
        tags: ['database', 'mongodb', 'firebase', 'architecture'],
        featuredImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=400&fit=crop',
        views: 112,
        likes: 19,
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    for (const post of posts) {
      await this.database.create<Post>('posts', post);
    }
    
    this.logger.log(`Seeded ${posts.length} posts`);
  }

  private async seedProducts() {
    this.logger.log('Seeding products...');
    
    const products = [
      {
        name: 'NestPress Pro License',
        slug: 'nestpress-pro-license',
        description: `
          <h3>Unlock the full power of NestPress</h3>
          <p>Get access to premium features, priority support, and exclusive templates with the NestPress Pro license.</p>
          
          <h4>What's Included:</h4>
          <ul>
            <li>✅ All premium themes and templates</li>
            <li>✅ Advanced AI features (unlimited usage)</li>
            <li>✅ Priority email support</li>
            <li>✅ Multi-site management</li>
            <li>✅ White-label options</li>
            <li>✅ Lifetime updates</li>
          </ul>
        `,
        price: 99,
        compareAtPrice: 149,
        sku: 'NP-PRO-001',
        inventory: 9999,
        images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'],
        category: 'Licenses',
        tags: ['pro', 'license', 'premium'],
        featured: true,
      },
      {
        name: 'Custom Theme Development',
        slug: 'custom-theme-development',
        description: `
          <h3>Get a custom theme built for your brand</h3>
          <p>Our expert developers will create a unique, fully responsive theme tailored to your specific needs.</p>
          
          <h4>Service Includes:</h4>
          <ul>
            <li>✅ Custom design mockups</li>
            <li>✅ Fully responsive implementation</li>
            <li>✅ WordPress-like customization options</li>
            <li>✅ 3 rounds of revisions</li>
            <li>✅ Performance optimization</li>
            <li>✅ 30 days post-launch support</li>
          </ul>
        `,
        price: 499,
        sku: 'NP-THEME-DEV',
        inventory: 5,
        images: ['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop'],
        category: 'Services',
        tags: ['custom', 'theme', 'development', 'service'],
        featured: true,
      },
      {
        name: 'AI Content Bundle - 1000 Credits',
        slug: 'ai-content-bundle',
        description: `
          <h3>Supercharge your content creation with AI</h3>
          <p>Get 1000 AI credits to enhance your content, generate descriptions, optimize SEO, and more.</p>
          
          <h4>What You Can Do:</h4>
          <ul>
            <li>🤖 Generate 500+ blog post introductions</li>
            <li>🎯 Optimize 200+ meta descriptions</li>
            <li>✨ Enhance 100+ full articles</li>
            <li>🌍 Translate 50+ pages</li>
            <li>📸 Generate 1000+ image alt texts</li>
          </ul>
        `,
        price: 29,
        sku: 'NP-AI-1000',
        inventory: 9999,
        images: ['https://images.unsplash.com/photo-1655393001768-d946c97d6fd1?w=800&h=600&fit=crop'],
        category: 'Credits',
        tags: ['ai', 'credits', 'content'],
        featured: false,
      },
    ];

    for (const product of products) {
      await this.database.create<Product>('products', product);
    }
    
    this.logger.log(`Seeded ${products.length} products`);
  }

  /**
   * Manual seeding method (can be called via API)
   */
  async seed() {
    return this.seedAll();
  }

  /**
   * Seed only appearance data (public method for manual seeding)
   */
  async seedAppearanceOnly() {
    this.logger.log('Seeding appearance data only...');
    try {
      await this.database.connect();
      await this.seedAppearance();
      this.logger.log('Appearance data seeded successfully!');
    } catch (error) {
      this.logger.error('Appearance seeding failed:', error.message || error);
      throw error;
    }
  }

  /**
   * Seed appearance data (menus, widgets, header)
   */
  private async seedAppearance() {
    this.logger.log('Seeding appearance data...');

    // Create Primary Navigation Menu
    const primaryMenu: any = await this.database.create('menus', {
      name: 'Primary Menu',
      slug: 'primary-menu',
      location: 'primary',
      items: [
        {
          id: 'menu-item-1',
          label: 'Home',
          url: '/',
          target: '_self',
          order: 0,
        },
        {
          id: 'menu-item-2',
          label: 'Blog',
          url: '/blog',
          target: '_self',
          order: 1,
        },
        {
          id: 'menu-item-3',
          label: 'About',
          url: '/about',
          target: '_self',
          order: 2,
        },
        {
          id: 'menu-item-4',
          label: 'Shop',
          url: '/shop',
          target: '_self',
          order: 3,
        },
        {
          id: 'menu-item-5',
          label: 'Contact',
          url: '/contact',
          target: '_self',
          order: 4,
        },
      ],
    });

    // Create Footer Menu
    const footerMenu: any = await this.database.create('menus', {
      name: 'Footer Menu',
      slug: 'footer-menu',
      location: 'footer',
      items: [
        {
          id: 'footer-item-1',
          label: 'Privacy Policy',
          url: '/privacy',
          target: '_self',
          order: 0,
        },
        {
          id: 'footer-item-2',
          label: 'Terms of Service',
          url: '/terms',
          target: '_self',
          order: 1,
        },
        {
          id: 'footer-item-3',
          label: 'Sitemap',
          url: '/sitemap',
          target: '_self',
          order: 2,
        },
      ],
    });

    this.logger.log(`Created menus: ${primaryMenu.id}, ${footerMenu.id}`);

    // Create Sidebar Widgets
    const searchWidget = await this.database.create('widgets', {
      type: 'search',
      title: 'Search',
      content: '',
      area: 'sidebar',
      position: 0,
      isActive: true,
      settings: { placeholder: 'Search posts...' },
    });

    const categoriesWidget = await this.database.create('widgets', {
      type: 'categories',
      title: 'Categories',
      content: '',
      area: 'sidebar',
      position: 1,
      isActive: true,
      settings: { showCount: true },
    });

    const recentPostsWidget = await this.database.create('widgets', {
      type: 'recent-posts',
      title: 'Recent Posts',
      content: '',
      area: 'sidebar',
      position: 2,
      isActive: true,
      settings: { count: 5, showThumbnail: true },
    });

    // Create Footer Widgets
    const aboutWidget = await this.database.create('widgets', {
      type: 'text',
      title: 'About NestPress',
      content: 'A modern headless CMS combining WordPress-like content management with powerful e-commerce features.',
      area: 'footer',
      position: 0,
      isActive: true,
      settings: {},
    });

    const menuWidget = await this.database.create('widgets', {
      type: 'menu',
      title: 'Quick Links',
      content: footerMenu.id,
      area: 'footer',
      position: 1,
      isActive: true,
      settings: { menuId: footerMenu.id },
    });

    this.logger.log(`Created widgets: search, categories, recent-posts, about, menu`);

    // Update Header Settings
    await this.database.create('site_settings', {
      key: 'header_settings',
      value: {
        logo: '',
        logoText: 'NestPress CMS',
        tagline: 'Modern WordPress Alternative',
        showTagline: true,
        backgroundColor: '#1e293b',
        textColor: '#ffffff',
        height: 80,
        sticky: true,
        transparent: false,
        customCss: '',
        customHtml: '',
      },
    });

    this.logger.log('Appearance data seeded successfully');
  }

  /**
   * Clear all seeded data
   */
  async clear() {
    this.logger.log('Clearing seeded data...');
    
    try {
      await this.database.delete('posts', '*');
      await this.database.delete('pages', '*');
      await this.database.delete('products', '*');
      await this.database.delete('menus', '*');
      await this.database.delete('widgets', '*');
      // Don't delete users for safety
      
      this.logger.log('Data cleared successfully');
    } catch (error) {
      this.logger.error('Failed to clear data:', error);
    }
  }
}
