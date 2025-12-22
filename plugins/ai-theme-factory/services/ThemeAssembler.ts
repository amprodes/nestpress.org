/**
 * Phase 3: Theme Assembler Service
 * 
 * Generates NestPress theme structure:
 * - Directory structure (templates, parts, patterns, assets)
 * - theme.json with WordPress v3 schema
 * - Template files (index, single, page, archive, etc.)
 * - Template parts (Header, Footer, Sidebar, PostMeta)
 * - Pattern files (HeroBanner, PostsGrid, etc.)
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ThemeBlueprint } from './ThemeAnalyzer';
import type { PluginAPI } from '../types';
import { ThemeValidator } from './ThemeValidator';
import { ThemePatternMemory } from './ThemePatternMemory';

export interface ThemeStructure {
  rootDir: string;
  templateFiles: string[];
  partFiles: string[];
  patternFiles: string[];
  assetFiles: string[];
}

export class ThemeAssembler {
  private api: PluginAPI;
  private tempDir: string;
  private memory: ThemePatternMemory;

  constructor(api: PluginAPI, tempDir: string) {
    this.api = api;
    this.tempDir = tempDir;
    this.memory = new ThemePatternMemory(api);
    
    // Log memory stats
    const stats = this.memory.getStats();
    if (stats.totalErrorPatterns > 0) {
      this.api.log(`[ThemeAssembler] Memory loaded: ${stats.highConfidencePatterns} high-confidence patterns`);
    }
  }

  async assemble(blueprint: ThemeBlueprint, themeName: string): Promise<ThemeStructure> {
    this.api.log(`[ThemeAssembler] Assembling theme: ${themeName}`);

    this.api.sendProgress?.(50, 'Creating directory structure...', { type: 'phase', phase: 3 });
    const dirs = this.createDirectoryStructure(themeName);
    this.api.sendProgress?.(52, 'Directories created', { type: 'phase', phase: 3 });

    // Copy assets from job root to theme folder
    this.api.sendProgress?.(53, 'Copying CSS and assets to theme...', { type: 'phase', phase: 3 });
    this.copyAssetsToTheme(dirs.assetsDir);
    this.api.sendProgress?.(54, 'Assets copied', { type: 'phase', phase: 3 });
    
    // Copy original HTML to theme for fallback templates
    this.api.sendProgress?.(54.5, 'Preserving original HTML for design fidelity...', { type: 'phase', phase: 3 });
    this.copyOriginalHTMLToTheme(dirs.rootDir);

    this.api.sendProgress?.(55, 'Generating theme.json metadata...', { type: 'phase', phase: 3 });
    this.generateThemeJson(blueprint, themeName, dirs.rootDir);
    this.api.sendProgress?.(56, 'theme.json written', { type: 'phase', phase: 3 });

    this.api.sendProgress?.(58, 'Generating templates with validation...', { type: 'phase', phase: 3 });
    const templateFiles = await this.generateTemplates(blueprint, dirs);
    this.api.sendProgress?.(60, `${templateFiles.length} templates created`, { type: 'phase', phase: 3 });

    this.api.sendProgress?.(62, 'Generating template parts with validation...', { type: 'phase', phase: 3 });
    const partFiles = await this.generateParts(blueprint, dirs);
    this.api.sendProgress?.(64, `${partFiles.length} parts generated`, { type: 'phase', phase: 3 });

    this.api.sendProgress?.(66, 'Creating patterns library...', { type: 'phase', phase: 3 });
    const patternFiles = this.generatePatterns(blueprint, dirs);
    this.api.sendProgress?.(68, `${patternFiles.length} patterns ready`, { type: 'phase', phase: 3 });

    this.api.sendProgress?.(69, 'Writing README.md...', { type: 'phase', phase: 3 });
    this.generateReadme(blueprint, themeName, dirs.rootDir);
    
    // Generate root index.tsx that exports all components
    this.api.sendProgress?.(69.5, 'Creating index.tsx entry point...', { type: 'phase', phase: 3 });
    this.generateIndexFile(dirs.rootDir, partFiles);
    
    this.api.sendProgress?.(70, 'Documentation complete', { type: 'phase', phase: 3 });

    this.api.log(`✓ Theme assembled: ${templateFiles.length} templates, ${partFiles.length} parts, ${patternFiles.length} patterns`);

    return {
      rootDir: dirs.rootDir,
      templateFiles,
      partFiles,
      patternFiles,
      assetFiles: [],
    };
  }
  
  /**
   * Copy original-html folder to theme directory
   * This preserves the original cloned HTML for fallback templates
   */
  private copyOriginalHTMLToTheme(themeRootDir: string): void {
    const originalHTMLDir = path.join(this.tempDir, 'original-html');
    const destDir = path.join(themeRootDir, 'original-html');
    
    if (!fs.existsSync(originalHTMLDir)) {
      this.api.log(`⚠ No original-html directory found at ${originalHTMLDir}`);
      return;
    }
    
    try {
      this.copyDirectoryRecursive(originalHTMLDir, destDir);
      const htmlFiles = fs.readdirSync(destDir).filter(f => f.endsWith('.html'));
      this.api.log(`✓ Copied ${htmlFiles.length} original HTML files for design fidelity: ${htmlFiles.join(', ')}`);
    } catch (error) {
      this.api.error(`Failed to copy original HTML: ${error.message}`);
    }
  }

  private createDirectoryStructure(themeName: string): any {
    const rootDir = path.join(this.tempDir, themeName);
    const templatesDir = path.join(rootDir, 'templates');
    const partsDir = path.join(rootDir, 'parts');
    const patternsDir = path.join(rootDir, 'patterns');
    const stylesDir = path.join(rootDir, 'styles');
    const assetsDir = path.join(rootDir, 'assets');

    [rootDir, templatesDir, partsDir, patternsDir, stylesDir, assetsDir].forEach(dir => {
      fs.mkdirSync(dir, { recursive: true });
    });

    return { rootDir, templatesDir, partsDir, patternsDir, stylesDir, assetsDir };
  }

  /**
   * Copy assets from job root to theme folder
   * CSS files are consolidated in job-xxx/assets/css/ by ResourceCloner
   * This method copies them to job-xxx/theme-name/assets/ for packaging
   */
  private copyAssetsToTheme(themeAssetsDir: string): void {
    const jobAssetsDir = path.join(this.tempDir, 'assets');
    
    if (!fs.existsSync(jobAssetsDir)) {
      this.api.warn(`⚠ No assets directory found at ${jobAssetsDir}`);
      return;
    }

    this.api.log(`[ThemeAssembler] Copying assets from ${jobAssetsDir} to ${themeAssetsDir}`);
    
    try {
      // Copy entire assets directory recursively
      this.copyDirectoryRecursive(jobAssetsDir, themeAssetsDir);
      
      // Log what was copied
      const cssDir = path.join(themeAssetsDir, 'css');
      if (fs.existsSync(cssDir)) {
        const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
        this.api.log(`✓ Copied ${cssFiles.length} CSS files: ${cssFiles.join(', ')}`);
      }
      
    } catch (error) {
      this.api.error(`Failed to copy assets: ${error.message}`);
    }
  }

  /**
   * Recursively copy directory contents
   */
  private copyDirectoryRecursive(src: string, dest: string): void {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectoryRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  private generateThemeJson(blueprint: ThemeBlueprint, themeName: string, rootDir: string): void {
    // Generate proper slug: lowercase, alphanumeric + hyphens only
    const slug = themeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    const themeJson = {
      $schema: 'https://schemas.wp.org/trunk/theme.json',
      version: 3,
      title: blueprint.siteTitle || themeName,
      slug: slug,
      author: 'AI Theme Factory',
      description: `AI-generated theme cloned from ${blueprint.url}`,
      requires: '1.0.0',
      settings: {
        color: {
          palette: [
            { slug: 'primary', color: blueprint.designSystem.colors.primary, name: 'Primary' },
            { slug: 'secondary', color: blueprint.designSystem.colors.secondary, name: 'Secondary' },
            { slug: 'accent', color: blueprint.designSystem.colors.accent, name: 'Accent' },
            { slug: 'text', color: blueprint.designSystem.colors.text, name: 'Text' },
            { slug: 'background', color: blueprint.designSystem.colors.background, name: 'Background' },
          ],
        },
        typography: {
          fontFamilies: [
            { slug: 'heading', fontFamily: blueprint.designSystem.typography.headingFont, name: 'Heading' },
            { slug: 'body', fontFamily: blueprint.designSystem.typography.bodyFont, name: 'Body' },
          ],
        },
        layout: {
          contentSize: '800px',
          wideSize: '1200px',
        },
      },
      styles: {
        color: {
          text: blueprint.designSystem.colors.text,
          background: blueprint.designSystem.colors.background,
        },
        typography: {
          fontFamily: blueprint.designSystem.typography.bodyFont,
          fontSize: blueprint.designSystem.typography.sizes.base || '16px',
        },
      },
      templateParts: [
        { name: 'header', title: 'Header', area: 'header' },
        { name: 'footer', title: 'Footer', area: 'footer' },
        { name: 'sidebar', title: 'Sidebar', area: 'sidebar' },
      ],
      customTemplates: [
        { name: 'page-with-sidebar', title: 'Page with Sidebar', postTypes: ['page'] },
      ],
      assets: {
        css: this.getCSSFiles(rootDir),
        js: this.getJSFiles(rootDir)
      },
    };

    fs.writeFileSync(
      path.join(rootDir, 'theme.json'),
      JSON.stringify(themeJson, null, 2)
    );
  }

  /**
   * Get all CSS files from assets/css directory
   */
  private getCSSFiles(rootDir: string): string[] {
    const cssDir = path.join(rootDir, 'assets', 'css');
    
    if (!fs.existsSync(cssDir)) {
      return [];
    }

    const cssFiles = fs.readdirSync(cssDir)
      .filter(file => file.endsWith('.css'))
      .sort() // Sort alphabetically for consistent order
      .map(file => `assets/css/${file}`);

    this.api.log(`✓ Found ${cssFiles.length} CSS files for theme.json`);
    return cssFiles;
  }

  /**
   * Get all JS files from assets/js directory
   * NOTE: WordPress-cloned JS is typically incompatible with NestPress
   * We skip JS entirely since it usually requires WordPress globals
   */
  private getJSFiles(rootDir: string): string[] {
    // IMPORTANT: Don't include cloned JS files - they typically contain:
    // - WordPress-specific code (wp-emoji, twemoji)
    // - jQuery plugins that expect WordPress globals
    // - Scripts that error out without WordPress environment
    // 
    // NestPress themes should use React components instead of JS files
    this.api.log(`⚠ Skipping JS files - WordPress scripts incompatible with NestPress`);
    return [];
  }

  private async generateTemplates(blueprint: ThemeBlueprint, dirs: any): Promise<string[]> {
    const templates = [
      { name: 'index.tsx', type: 'home' },
      { name: 'single.tsx', type: 'single' },
      { name: 'page.tsx', type: 'page' },
      { name: 'page-with-sidebar.tsx', type: 'page-sidebar' },
      { name: 'archive.tsx', type: 'archive' },
      { name: 'category.tsx', type: 'category' },
      { name: 'search.tsx', type: 'search' },
      { name: '404.tsx', type: '404' },
    ];

    const files: string[] = [];

    for (let index = 0; index < templates.length; index++) {
      const template = templates[index];
      
      // Generate initial content
      let content = this.generateTemplateBoilerplate(template.type, blueprint);
      const filePath = path.join(dirs.templatesDir, template.name);
      
      // Apply learned patterns before writing
      content = this.memory.applyLearnedPatterns(content);
      
      // Write and validate immediately
      fs.writeFileSync(filePath, content);
      const validatedContent = await this.validateAndFixFile(filePath, template.name, 'template');
      
      // Overwrite with validated/fixed content
      if (validatedContent !== content) {
        fs.writeFileSync(filePath, validatedContent);
        this.api.log(`  ✓ Auto-fixed: ${template.name}`);
      }
      
      files.push(filePath);

      if (index % 2 === 1) {
        this.api.sendProgress?.(
          58 + Math.floor((index / templates.length) * 2),
          `Created ${template.name}`,
          { type: 'phase', phase: 3 }
        );
      }
    }

    return files;
  }

  private generateTemplateBoilerplate(type: string, blueprint: ThemeBlueprint): string {
    const colors = blueprint.designSystem.colors;
    const hasSidebar = type === 'page-sidebar';
    
    // Generate valid interface name (404 -> NotFound)
    const interfaceName = type === '404' ? 'NotFound' : this.capitalize(type);
    const templateName = type === '404' ? 'NotFound' : this.capitalize(type);

    return `import * as React from 'react';
import type { Post, Menu, Widget, SiteSettings } from '@/types';

interface ${interfaceName}Props {
  posts?: Post[];
  post?: Post;
  primaryMenu?: Menu;
  sidebarWidgets?: Widget[];
  header?: SiteSettings;
}

export default function ${templateName}Template({ 
  posts = [], 
  post,
  primaryMenu,
  sidebarWidgets = [],
  header 
}: ${interfaceName}Props) {
  const colors = {
    background: '${colors.background}',
    text: '${colors.text}',
    primary: '${colors.primary}',
    secondary: '${colors.secondary}'
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Header placeholder - will be replaced by AI */}
      <header className="border-b" style={{ borderColor: colors.secondary }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 style={{ color: colors.primary }}>{header?.general?.siteTitle || 'Site Title'}</h1>
          <nav>
            {primaryMenu?.items?.map(item => (
              <a key={item.id} href={item.url} className="mr-4 hover:opacity-80">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content area */}
      <main className={\`max-w-7xl mx-auto px-4 py-8\${${hasSidebar} ? ' grid grid-cols-3 gap-8' : ''}\`}>
        <div className={${hasSidebar} ? 'col-span-2' : ''}>
          ${this.getContentBoilerplate(type)}
        </div>
        ${hasSidebar ? `
        <aside className="col-span-1">
          {sidebarWidgets?.map(widget => (
            <div key={widget?.id} className="mb-6 p-4 rounded" style={{ backgroundColor: colors.background }}>
              <h3 className="font-bold mb-2">{widget?.title}</h3>
              <div>{widget?.content}</div>
            </div>
          ))}
        </aside>` : ''}
      </main>

      {/* Footer placeholder - will be replaced by AI */}
      <footer className="border-t mt-12" style={{ borderColor: colors.secondary }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p>&copy; {new Date().getFullYear()} {header?.general?.siteTitle}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
`;
  }

  private getContentBoilerplate(type: string): string {
    switch (type) {
      case 'home':
        return `{posts.map(post => (
            <article key={post.id} className="mb-8">
              <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
              <p className="mb-4">{post.excerpt}</p>
              <a href={\`/\${post.slug}\`} className="text-blue-600 hover:underline">Read more</a>
            </article>
          ))}`;
      case 'single':
        return `{post && (
            <article>
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
              <div className="prose" dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>
          )}`;
      case 'page':
      case 'page-sidebar':
        return `{post && (
            <article>
              <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
              <div className="prose" dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>
          )}`;
      case 'archive':
      case 'category':
      case 'search':
        return `<h1 className="text-3xl font-bold mb-8">Blog Archive</h1>
          {posts.map(post => (
            <article key={post.id} className="mb-6">
              <h2 className="text-xl font-bold">{post.title}</h2>
              <p>{post.excerpt}</p>
            </article>
          ))}`;
      case '404':
        return `<div className="text-center py-12">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-xl mb-8">Page not found</p>
            <a href="/" className="text-blue-600 hover:underline">Go back home</a>
          </div>`;
      default:
        return `<div>Content placeholder</div>`;
    }
  }

  private async generateParts(blueprint: ThemeBlueprint, dirs: any): Promise<string[]> {
    const parts = [
      { name: 'Header.tsx', component: 'Header' },
      { name: 'Footer.tsx', component: 'Footer' },
      { name: 'Sidebar.tsx', component: 'Sidebar' },
      { name: 'PostMeta.tsx', component: 'PostMeta' },
    ];

    const files: string[] = [];

    for (const part of parts) {
      // Generate initial content
      let content = this.generatePartBoilerplate(part.component, blueprint);
      const filePath = path.join(dirs.partsDir, part.name);
      
      // Apply learned patterns before writing
      content = this.memory.applyLearnedPatterns(content);
      
      // Write and validate immediately
      fs.writeFileSync(filePath, content);
      const validatedContent = await this.validateAndFixFile(filePath, part.name, 'part');
      
      // Overwrite with validated/fixed content
      if (validatedContent !== content) {
        fs.writeFileSync(filePath, validatedContent);
        this.api.log(`  ✓ Auto-fixed: ${part.name}`);
      }
      
      files.push(filePath);
    }

    // Create barrel export file (index.ts) in parts folder
    // This allows templates to import: import { Header, Footer } from '../parts'
    const barrelContent = `/**
 * Template Parts - Barrel Export
 * Allows importing parts with: import { Header, Footer } from '../parts'
 */

${parts.map(p => `export { ${p.component} } from './${p.name.replace('.tsx', '')}';`).join('\n')}
`;
    const barrelPath = path.join(dirs.partsDir, 'index.ts');
    fs.writeFileSync(barrelPath, barrelContent);
    this.api.log(`  ✓ Created parts/index.ts barrel export`);

    return files;
  }

  private generatePartBoilerplate(component: string, blueprint: ThemeBlueprint): string {
    const colors = blueprint.designSystem.colors;

    switch (component) {
      case 'Header':
        return `import * as React from 'react';
import type { Menu, SiteSettings } from '@/types';

interface HeaderProps {
  primaryMenu?: Menu;
  header?: SiteSettings;
}

export function Header({ primaryMenu, header }: HeaderProps) {
  const colors = {
    secondary: '${colors.secondary}',
    primary: '${colors.primary}'
  };

  return (
    <header className="border-b" style={{ borderColor: colors.secondary }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 style={{ color: colors.primary }}>
          {header?.general?.siteTitle || 'Site Title'}
        </h1>
        <nav className="mt-4">
          {primaryMenu?.items?.map(item => (
            <a key={item.id} href={item.url} className="mr-6 hover:opacity-80">
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
`;
      case 'Footer':
        return `import * as React from 'react';
import type { Menu, Widget, SiteSettings } from '@/types';

interface FooterProps {
  footerMenu?: Menu;
  footerWidgets?: Widget[];
  header?: SiteSettings;
}

export function Footer({ footerMenu, footerWidgets = [], header }: FooterProps) {
  const colors = {
    secondary: '${colors.secondary}'
  };

  return (
    <footer className="border-t mt-12" style={{ borderColor: colors.secondary }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8 mb-8">
          {footerWidgets?.map(widget => (
            <div key={widget?.id}>
              <h3 className="font-bold mb-4">{widget?.title}</h3>
              <div>{widget?.content}</div>
            </div>
          ))}
        </div>
        <div className="border-t pt-6" style={{ borderColor: colors.secondary }}>
          <p>&copy; {new Date().getFullYear()} {header?.general?.siteTitle}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
`;
      case 'Sidebar':
        return `import * as React from 'react';
import type { Widget, Post } from '@/types';

interface SidebarProps {
  widgets?: Widget[];
  recentPosts?: Post[];
}

export function Sidebar({ widgets = [], recentPosts = [] }: SidebarProps) {
  const colors = {
    background: '${colors.background}'
  };
  
  // Explicit type annotations for validation
  const widgetList: Widget[] = widgets || [];
  const postList: Post[] = recentPosts || [];

  return (
    <aside>
      {widgetList.map(widget => (
        <div key={widget?.id} className="mb-6 p-4 rounded" style={{ backgroundColor: colors.background }}>
          <h3 className="font-bold mb-2">{widget?.title}</h3>
          <div>{widget?.content}</div>
        </div>
      ))}
      
      {postList.length > 0 && (
        <div className="mb-6 p-4 rounded">
          <h3 className="font-bold mb-2">Recent Posts</h3>
          <ul>
            {postList.slice(0, 5).map(post => (
              <li key={post.id} className="mb-2">
                <a href={\`/\${post.slug}\`} className="hover:underline">{post.title}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
`;
      case 'PostMeta':
        return `import * as React from 'react';
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
`;
      default:
        // Ensure component name is valid (no starting numbers)
        const validComponentName = /^[0-9]/.test(component) ? `Component${component}` : component;
        return `import React from 'react';\n\nexport default function ${validComponentName}() {\n  return <div>${component}</div>;\n}\n`;
    }
  }

  private generatePatterns(blueprint: ThemeBlueprint, dirs: any): string[] {
    const patterns = [
      { name: 'HeroBanner.tsx', component: 'HeroBanner' },
      { name: 'PostsGrid.tsx', component: 'PostsGrid' },
      { name: 'FeatureGrid.tsx', component: 'FeatureGrid' },
      { name: 'CTA.tsx', component: 'CTA' },
    ];

    const files: string[] = [];

    patterns.forEach(pattern => {
      const content = `import React from 'react';\n\nexport function ${pattern.component}() {\n  return <div>Pattern placeholder</div>;\n}\n`;
      const filePath = path.join(dirs.patternsDir, pattern.name);
      fs.writeFileSync(filePath, content);
      files.push(filePath);
    });

    // Create barrel export file (index.ts) in patterns folder
    // This allows templates to import: import { HeroBanner, PostsGrid } from '../patterns'
    const barrelContent = `/**
 * Patterns - Barrel Export
 * Allows importing patterns with: import { HeroBanner, PostsGrid } from '../patterns'
 */

${patterns.map(p => `export { ${p.component} } from './${p.name.replace('.tsx', '')}';`).join('\n')}
`;
    const barrelPath = path.join(dirs.patternsDir, 'index.ts');
    fs.writeFileSync(barrelPath, barrelContent);
    this.api.log(`  ✓ Created patterns/index.ts barrel export`);

    return files;
  }

  private generateReadme(blueprint: ThemeBlueprint, themeName: string, rootDir: string): void {
    const readme = `# ${themeName}

AI-generated NestPress theme cloned from: ${blueprint.url}

## Installation

1. Extract theme to \`/themes/${themeName}/\`
2. Activate in NestPress admin: Appearance → Themes
3. Customize via Appearance → Customize

## Credits

- Source: ${blueprint.url}
- Generated: ${new Date().toISOString()}
- Tool: AI Theme Factory Plugin
`;

    fs.writeFileSync(path.join(rootDir, 'README.md'), readme);
  }

  private generateIndexFile(rootDir: string, partFiles: string[]): void {
    // Generate root index.tsx that exports all parts and templates
    const content = `/**
 * Theme Entry Point
 * Exports all theme components for use by NestPress
 */

// Template Parts (re-export named exports)
export { Header } from './parts/Header';
export { Footer } from './parts/Footer';
export { Sidebar } from './parts/Sidebar';
export { PostMeta } from './parts/PostMeta';

// Templates (re-export with proper names expected by theme loader)
export { default as IndexTemplate } from './templates/index';
export { default as SingleTemplate } from './templates/single';
export { default as PageTemplate } from './templates/page';
export { default as PageWithSidebarTemplate } from './templates/page-with-sidebar';
export { default as ArchiveTemplate } from './templates/archive';
export { default as CategoryTemplate } from './templates/category';
export { default as SearchTemplate } from './templates/search';
export { default as NotFoundTemplate } from './templates/404';
`;

    fs.writeFileSync(path.join(rootDir, 'index.tsx'), content);
  }

  private capitalize(str: string): string {
    // Handle kebab-case to PascalCase (e.g. page-sidebar -> PageSidebar)
    return str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  }

  /**
   * Validate file and auto-fix with AI if errors found
   * Returns fixed content or original if validation passes
   */
  private async validateAndFixFile(filePath: string, filename: string, fileType: 'template' | 'part'): Promise<string> {
    const validator = new ThemeValidator(this.api);
    const originalCode = fs.readFileSync(filePath, 'utf-8');
    
    // Quick validation of single file
    const themeDir = path.dirname(path.dirname(filePath)); // Go up to theme root
    const result = await validator.validateFile(filePath, themeDir);
    
    if (result.valid) {
      this.api.log(`  ✓ ${filename} passed validation`);
      return originalCode;
    }
    
    // Record errors in memory
    result.errors.forEach(err => this.memory.recordError(err, fileType, filename));
    
    // Has errors - fix with AI
    this.api.log(`  ⚠️ ${filename} has ${result.errors.length} errors`);
    
    // Log first 3 errors for debugging
    if (result.errors.length > 0) {
      this.api.log(`    First errors:`);
      result.errors.slice(0, 3).forEach(err => {
        this.api.log(`    - Line ${err.line}: ${err.message} (TS${err.code})`);
      });
    }
    
    // AI fix removed in new architecture - just fail
    this.api.log(`  ❌ ${filename} has ${result.errors.length} errors - ABORTING (Auto-fix disabled)`, 'error');
    
    throw new Error(`Validation failed for ${filename} with ${result.errors.length} errors. Automatic fixing is disabled in the new architecture to prevent empty file generation.`);
  }
}
