import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ParsedTheme } from '../interfaces/converter.interfaces';
import { ComponentGeneratorService } from './component-generator.service';
import { BlockTransformerService } from '../transformers/block-transformer.service';
import { GlobalStylesGeneratorService } from './global-styles-generator.service';

/**
 * Theme Generator Service
 * Generates complete NestPress theme structure
 */
@Injectable()
export class ThemeGeneratorService {
  private readonly logger = new Logger(ThemeGeneratorService.name);

  constructor(
    private readonly componentGenerator: ComponentGeneratorService,
    private readonly blockTransformer: BlockTransformerService,
    private readonly globalStylesGenerator: GlobalStylesGeneratorService,
  ) {}

  /**
   * Generate complete theme from parsed data
   */
  async generateTheme(parsed: ParsedTheme, outputDir: string): Promise<void> {
    this.logger.log(`Generating theme: ${parsed.name} at ${outputDir}`);

    // Create theme directory structure
    this.createThemeStructure(outputDir);

    // Generate theme.json
    await this.generateThemeJson(parsed, outputDir);

    // Generate index.tsx
    await this.generateIndexFile(parsed, outputDir);

    // Generate functions.ts (WordPress functions.php equivalent - TypeScript not React)
    await this.generateFunctionsFile(parsed, outputDir);

    // Generate patterns as components
    await this.generatePatterns(parsed, outputDir);

    // Generate template parts
    await this.generateParts(parsed, outputDir);

    // Generate templates
    await this.generateTemplates(parsed, outputDir);

    // Copy style variations (WordPress styles/ folder)
    await this.copyStyleVariations(parsed, outputDir);

    // Copy assets
    await this.copyAssets(parsed, outputDir);

    this.logger.log(`Theme generated successfully at ${outputDir}`);
  }

  /**
   * Create theme directory structure
   */
  private createThemeStructure(outputDir: string): void {
    const dirs = [
      outputDir,
      path.join(outputDir, 'templates'),
      path.join(outputDir, 'parts'),
      path.join(outputDir, 'patterns'),
      path.join(outputDir, 'styles'),
      path.join(outputDir, 'assets'),
      path.join(outputDir, 'assets', 'css'),
      path.join(outputDir, 'assets', 'images'),
      path.join(outputDir, 'assets', 'fonts'),
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Generate theme.json
   */
  private async generateThemeJson(parsed: ParsedTheme, outputDir: string): Promise<void> {
    // Build CSS assets list: original files + generated files (global-styles.css, accessibility.css)
    const cssAssets = [
      ...parsed.assets.css.map(css => {
        const basename = path.basename(css);
        // Root style.css referenced from theme root (WordPress standard)
        return basename === 'style.css' ? basename : `assets/css/${basename}`;
      }),
      // Add generated CSS files (WordPress-compliant)
      'assets/css/global-styles.css',
      'assets/css/accessibility.css',
    ];

    const themeJson = {
      name: parsed.name,
      slug: parsed.slug,
      version: parsed.version,
      author: parsed.author,
      description: parsed.description,
      tags: parsed.tags,
      ...parsed.themeJson,
      assets: {
        css: cssAssets,
        js: parsed.assets.js,
      },
    };

    const filePath = path.join(outputDir, 'theme.json');
    fs.writeFileSync(filePath, JSON.stringify(themeJson, null, 2));
    this.logger.log(`Generated theme.json`);
  }

  /**
   * Generate index.tsx entry point
   */
  private async generateIndexFile(parsed: ParsedTheme, outputDir: string): Promise<void> {
    let code = `/**\n`;
    code += ` * ${parsed.name}\n`;
    code += ` * Converted from WordPress theme\n`;
    code += ` * \n`;
    code += ` * NOTE: Templates and parts are .html files (WordPress block markup)\n`;
    code += ` * They are loaded and parsed at runtime by wordpress-block-renderer.tsx\n`;
    code += ` * This file only exports theme metadata and functions\n`;
    code += ` */\n\n`;
    code += `import React from 'react';\n`;
    code += `import { themeSetup, blockStyles, patternCategories } from './functions';\n\n`;
    
    // Export types
    code += `export interface ThemeTemplateProps {\n`;
    code += `  data?: any;\n`;
    code += `  posts?: any[];\n`;
    code += `  post?: any;\n`;
    code += `  currentPage?: number;\n`;
    code += `  totalPages?: number;\n`;
    code += `  primaryMenu?: any;\n`;
    code += `  footerMenu?: any;\n`;
    code += `  widgets?: any[];\n`;
    code += `  header?: any;\n`;
    code += `}\n\n`;

    // NOTE: Pattern exports removed - patterns will be loaded as HTML blocks in future
    // Currently skipping pattern generation due to JSX conversion issues

    // Export theme functions
    code += `// Theme Functions (WordPress functions.php equivalent)\n`;
    code += `export { themeSetup, blockStyles, patternCategories, enqueueAssets } from './functions';\n`;

    code += `\n// Theme metadata with WordPress features\n`;
    code += `export const theme = {\n`;
    code += `  name: '${parsed.name}',\n`;
    code += `  version: '${parsed.version}',\n`;
    code += `  author: '${parsed.author}',\n`;
    code += `  // WordPress theme features (from functions.php)\n`;
    code += `  supports: {\n`;
    code += `    postFormats: ['aside', 'audio', 'chat', 'gallery', 'image', 'link', 'quote', 'status', 'video'],\n`;
    code += `    editorStyle: true,\n`;
    code += `    blockStyles: true,\n`;
    code += `  },\n`;
    code += `};\n`;

    const filePath = path.join(outputDir, 'index.tsx');
    fs.writeFileSync(filePath, code);
    this.logger.log(`Generated index.tsx (templates/parts are .html, loaded at runtime)`);
  }

  /**
   * Generate functions.ts (WordPress functions.php equivalent - TypeScript not React)
   * Extracts theme setup, block styles, pattern categories from parsed data
   */
  private async generateFunctionsFile(parsed: ParsedTheme, outputDir: string): Promise<void> {
    let code = `/**\n`;
    code += ` * Theme Functions (TypeScript)\n`;
    code += ` * WordPress functions.php equivalent\n`;
    code += ` * Auto-generated from ${parsed.name}\n`;
    code += ` * \n`;
    code += ` * NOTE: This is pure TypeScript (.ts), not React (.tsx)\n`;
    code += ` * WordPress functions.php contains utility functions, not components\n`;
    code += ` */\n\n`;

    // Helper function for post format conversion
    code += `// Helper: Convert post format to display string\n`;
    code += `const formatToString = (format: string): string => {\n`;
    code += `  const formats: Record<string, string> = {\n`;
    code += `    aside: 'Aside',\n`;
    code += `    audio: 'Audio',\n`;
    code += `    chat: 'Chat',\n`;
    code += `    gallery: 'Gallery',\n`;
    code += `    image: 'Image',\n`;
    code += `    link: 'Link',\n`;
    code += `    quote: 'Quote',\n`;
    code += `    status: 'Status',\n`;
    code += `    video: 'Video',\n`;
    code += `  };\n`;
    code += `  return formats[format] || format;\n`;
    code += `};\n\n`;

    // Theme Setup (after_setup_theme equivalent)
    code += `/**\n`;
    code += ` * Theme Setup (WordPress after_setup_theme hook equivalent)\n`;
    code += ` * Defines theme supports and features\n`;
    code += ` */\n`;
    code += `export const themeSetup = () => {\n`;
    code += `  return {\n`;
    code += `    // Post formats support (WordPress add_theme_support('post-formats'))\n`;
    code += `    postFormats: ['aside', 'audio', 'chat', 'gallery', 'image', 'link', 'quote', 'status', 'video'],\n`;
    code += `    \n`;
    code += `    // Editor stylesheet (WordPress add_editor_style())\n`;
    code += `    editorStyle: 'assets/css/editor-style.css',\n`;
    code += `    \n`;
    code += `    // Theme supports (WordPress add_theme_support())\n`;
    code += `    supports: {\n`;
    code += `      alignWide: true,\n`;
    code += `      responsiveEmbeds: true,\n`;
    code += `      postThumbnails: true,\n`;
    code += `      customLogo: true,\n`;
    code += `      titleTag: true,\n`;
    code += `      html5: ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption'],\n`;
    code += `    },\n`;
    code += `  };\n`;
    code += `};\n\n`;

    // Custom Block Styles
    code += `/**\n`;
    code += ` * Custom Block Styles (WordPress register_block_style() equivalent)\n`;
    code += ` * Defines custom styles for core blocks\n`;
    code += ` */\n`;
    code += `export const blockStyles: Record<string, Array<{ name: string; label: string; inlineStyle?: string }>> = {\n`;
    code += `  'core/list': [\n`;
    code += `    {\n`;
    code += `      name: 'checkmark-list',\n`;
    code += `      label: 'Checkmark',\n`;
    code += `      inlineStyle: \`\n`;
    code += `        ul.is-style-checkmark-list {\n`;
    code += `          list-style-type: "✓";\n`;
    code += `        }\n`;
    code += `        ul.is-style-checkmark-list li {\n`;
    code += `          padding-inline-start: 1ch;\n`;
    code += `        }\n`;
    code += `      \`,\n`;
    code += `    },\n`;
    code += `  ],\n`;
    code += `};\n\n`;

    // Pattern Categories
    code += `/**\n`;
    code += ` * Pattern Categories (WordPress register_block_pattern_category() equivalent)\n`;
    code += ` * Organizes block patterns into categories\n`;
    code += ` */\n`;
    code += `export const patternCategories = [\n`;
    
    // Extract unique pattern categories from parsed patterns
    const categories = new Set<string>();
    parsed.patterns.forEach(pattern => {
      if (pattern.categories && Array.isArray(pattern.categories)) {
        pattern.categories.forEach(cat => categories.add(cat));
      }
    });

    categories.forEach(category => {
      const label = category.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      code += `  {\n`;
      code += `    name: '${category}',\n`;
      code += `    label: '${label}',\n`;
      code += `  },\n`;
    });
    
    code += `];\n\n`;

    // Enqueue Assets
    code += `/**\n`;
    code += ` * Enqueue Scripts and Styles (WordPress wp_enqueue_scripts hook equivalent)\n`;
    code += ` * Defines theme assets to load\n`;
    code += ` */\n`;
    code += `export const enqueueAssets = () => {\n`;
    code += `  return {\n`;
    code += `    styles: [\n`;
    code += `      {\n`;
    code += `        handle: '${parsed.name.toLowerCase().replace(/\s+/g, '-')}-style',\n`;
    code += `        src: 'style.css',\n`;
    code += `        dependencies: [],\n`;
    code += `        version: '${parsed.version}',\n`;
    code += `      },\n`;
    code += `      {\n`;
    code += `        handle: '${parsed.name.toLowerCase().replace(/\s+/g, '-')}-global-styles',\n`;
    code += `        src: 'assets/css/global-styles.css',\n`;
    code += `        dependencies: [],\n`;
    code += `        version: '${parsed.version}',\n`;
    code += `      },\n`;
    code += `      {\n`;
    code += `        handle: '${parsed.name.toLowerCase().replace(/\s+/g, '-')}-accessibility',\n`;
    code += `        src: 'assets/css/accessibility.css',\n`;
    code += `        dependencies: [],\n`;
    code += `        version: '${parsed.version}',\n`;
    code += `      },\n`;
    code += `    ],\n`;
    code += `    scripts: [],\n`;
    code += `  };\n`;
    code += `};\n\n`;

    // Block Bindings
    code += `/**\n`;
    code += ` * Block Bindings (WordPress register_block_bindings_source() equivalent)\n`;
    code += ` * Provides dynamic content sources for blocks\n`;
    code += ` */\n`;
    code += `export const blockBindings = {\n`;
    code += `  '${parsed.name.toLowerCase().replace(/\s+/g, '')}/format': {\n`;
    code += `    label: 'Post format name',\n`;
    code += `    getValueCallback: (post: any) => {\n`;
    code += `      const format = post?.format || 'standard';\n`;
    code += `      if (format && format !== 'standard') {\n`;
    code += `        return formatToString(format);\n`;
    code += `      }\n`;
    code += `      return '';\n`;
    code += `    },\n`;
    code += `  },\n`;
    code += `};\n\n`;

    // Apply Block Styles
    code += `/**\n`;
    code += ` * Apply Custom Block Styles (WordPress wp_head hook equivalent)\n`;
    code += ` * Auto-injects custom block styles into the document\n`;
    code += ` */\n`;
    code += `export const applyBlockStyles = () => {\n`;
    code += `  if (typeof document === 'undefined') return;\n`;
    code += `  \n`;
    code += `  const styleId = '${parsed.name.toLowerCase().replace(/\s+/g, '-')}-block-styles';\n`;
    code += `  if (document.getElementById(styleId)) return;\n\n`;
    code += `  const style = document.createElement('style');\n`;
    code += `  style.id = styleId;\n`;
    code += `  \n`;
    code += `  let css = '';\n`;
    code += `  Object.entries(blockStyles).forEach(([blockType, styles]) => {\n`;
    code += `    styles.forEach((styleConfig) => {\n`;
    code += `      if (styleConfig.inlineStyle) {\n`;
    code += `        css += styleConfig.inlineStyle + '\\n';\n`;
    code += `      }\n`;
    code += `    });\n`;
    code += `  });\n`;
    code += `  \n`;
    code += `  style.textContent = css;\n`;
    code += `  document.head.appendChild(style);\n`;
    code += `};\n\n`;

    // Auto-apply on client load
    code += `// Auto-apply block styles on client-side load\n`;
    code += `if (typeof window !== 'undefined') {\n`;
    code += `  if (document.readyState === 'loading') {\n`;
    code += `    document.addEventListener('DOMContentLoaded', applyBlockStyles);\n`;
    code += `  } else {\n`;
    code += `    applyBlockStyles();\n`;
    code += `  }\n`;
    code += `}\n`;

    const functionsPath = path.join(outputDir, 'functions.ts');
    fs.writeFileSync(functionsPath, code);
    this.logger.log(`Generated functions.ts (TypeScript) with theme setup, block styles, and pattern categories`);
  }

  /**
   * Generate pattern components
   */
  private async generatePatterns(parsed: ParsedTheme, outputDir: string): Promise<void> {
    const patternsDir = path.join(outputDir, 'patterns');

    // TEMPORARY: Skip pattern generation - they contain WordPress HTML that needs proper JSX conversion
    // Patterns will be loaded as HTML blocks in the future, similar to templates
    this.logger.log(`Skipping pattern generation (${parsed.patterns.length} patterns found - will be converted in future update)`);
    
    // Create empty patterns directory
    if (!fs.existsSync(patternsDir)) {
      fs.mkdirSync(patternsDir, { recursive: true });
    }
    
    // Create a placeholder README
    const readmePath = path.join(patternsDir, 'README.md');
    fs.writeFileSync(readmePath, `# Patterns\n\nPatterns from WordPress theme will be converted in a future update.\nCurrently ${parsed.patterns.length} patterns detected.\n`);

    /* ORIGINAL CODE - Commented out until pattern JSX conversion is fixed
    for (const pattern of parsed.patterns) {
      try {
        const code = await this.componentGenerator.generatePatternComponent(pattern);
        const filename = pattern.slug.split('/').pop() + '.tsx';
        const filePath = path.join(patternsDir, filename);
        fs.writeFileSync(filePath, code);
      } catch (error) {
        this.logger.error(`Failed to generate pattern ${pattern.slug}: ${error.message}`);
      }
    }

    this.logger.log(`Generated ${parsed.patterns.length} pattern components`);
    */
  }

  /**
   * Generate template parts
   */
  private async generateParts(parsed: ParsedTheme, outputDir: string): Promise<void> {
    const partsDir = path.join(outputDir, 'parts');

    // ✅ CORRECT APPROACH: Copy WordPress .html parts as-is (do NOT convert to TSX)
    // Parts are parsed at runtime by wordpress-block-renderer.tsx
    let copiedCount = 0;
    
    for (const part of parsed.parts) {
      try {
        const sourceHTML = part.content; // Already parsed, contains HTML
        const filename = `${part.name}.html`;
        const filePath = path.join(partsDir, filename);
        fs.writeFileSync(filePath, sourceHTML);
        copiedCount++;
        this.logger.log(`  ✅ Copied part: ${filename} (${sourceHTML.length} bytes)`);
      } catch (error) {
        this.logger.error(`Failed to copy part ${part.name}: ${error.message}`);
      }
    }

    this.logger.log(`Copied ${copiedCount} HTML template parts (WordPress block markup preserved)`);
  }

  /**
   * Generate template files
   */
  private async generateTemplates(parsed: ParsedTheme, outputDir: string): Promise<void> {
    const templatesDir = path.join(outputDir, 'templates');
    
    // ✅ CORRECT APPROACH: Copy WordPress .html templates as-is (do NOT convert to TSX)
    // Templates are parsed at runtime by wordpress-block-renderer.tsx
    let copiedCount = 0;
    
    for (const template of parsed.templates) {
      const sourceHTML = template.content; // Already parsed, contains HTML
      const filename = `${template.name}.html`;
      const filePath = path.join(templatesDir, filename);
      fs.writeFileSync(filePath, sourceHTML);
      copiedCount++;
      this.logger.log(`  ✅ Copied template: ${filename} (${sourceHTML.length} bytes)`);
    }

    this.logger.log(`Copied ${copiedCount} HTML template files (WordPress block markup preserved)`);
  }

  /**
   * Generate template file content
   */
  private generateTemplateFile(templateType: string, parsed: ParsedTheme): string {
    // Reset container ID counter for each template (WordPress generates unique IDs per page)
    this.blockTransformer.resetContainerIdCounter();
    
    // Find the actual template if it exists
    const template = parsed.templates.find(t => t.name === templateType);
    
    // Get proper component name (handle 404 case)
    const componentName = templateType === '404' ? 'NotFound' : this.capitalize(templateType);
    const displayName = templateType === '404' ? '404' : this.capitalize(templateType);
    
    let code = `import React from 'react';\n`;
    code += `import { ThemeTemplateProps } from '../index';\n\n`;

    // Collect all imports needed
    const imports = new Set<string>();
    const patternImports = new Set<string>();
    
    // Check for Header and Footer parts
    const hasHeader = parsed.parts.find(p => p.name === 'header');
    const hasFooter = parsed.parts.find(p => p.name === 'footer');
    
    if (hasHeader) {
      imports.add(`import { Header } from '../parts/Header';`);
    }
    if (hasFooter) {
      imports.add(`import { Footer } from '../parts/Footer';`);
    }
    
    // Transform blocks and collect pattern imports
    let transformedJsx = '';
    if (template && template.blocks && template.blocks.length > 0) {
      this.logger.log(`🎯 Transforming ${template.blocks.length} root blocks for template: ${templateType}`);
      template.blocks.forEach((block, i) => {
        this.logger.log(`  📦 Root block [${i}]: ${block.blockName}`);
        const result = this.blockTransformer.transformBlock(block);
        this.logger.log(`  ✅ Transformed JSX (${result.jsx.split('\n').length} lines):\n${result.jsx.split('\n').slice(0, 5).join('\n')}${result.jsx.split('\n').length > 5 ? '\n    ...' : ''}`);
        transformedJsx += `      ${result.jsx}\n`;
        
        // Extract pattern component names from JSX
        const patternMatches = result.jsx.matchAll(/<([A-Z][a-zA-Z0-9]*)\s/g);
        for (const match of patternMatches) {
          const compName = match[1];
          if (compName !== 'Header' && compName !== 'Footer' && compName !== 'div') {
            patternImports.add(compName);
          }
        }
      });
    }
    
    // Add pattern imports
    patternImports.forEach(patternName => {
      const kebabName = this.toKebabCase(patternName);
      imports.add(`import { ${patternName} } from '../patterns/${kebabName}';`);
    });
    
    // Write all imports
    imports.forEach(imp => {
      code += `${imp}\n`;
    });

    code += `\n/**\n * ${displayName} Template\n`;
    code += ` * Converted from WordPress theme\n */\n`;
    code += `const ${componentName}Template: React.FC<ThemeTemplateProps> = ({\n`;
    code += `  primaryMenu,\n`;
    code += `  footerMenu,\n`;
    code += `  footerWidgets,\n`;
    code += `  header,\n`;
    code += `  data,\n`;
    code += `  posts,\n`;
    code += `  post,\n`;
    code += `}) => {\n`;
    
    // Add null check for single/page templates (WordPress best practice)
    if ((templateType === 'single' || templateType === 'page') && transformedJsx) {
      code += `  // Handle missing post data\n`;
      code += `  if (!post) {\n`;
      code += `    return (\n`;
      code += `      <>\n`;
      code += `        <a className="skip-link screen-reader-text" href="#wp--skip-link--target">Skip to content</a>\n`;
      code += `        <div className="wp-site-blocks">\n`;
      if (hasHeader) {
        code += `          <header className="wp-block-template-part">\n`;
        code += `            <Header primaryMenu={primaryMenu} siteTitle={data?.siteName || 'My Site'} siteLogo={data?.siteLogo} />\n`;
        code += `          </header>\n`;
      }
      code += `          <main className="wp-block-group has-global-padding is-layout-constrained wp-block-group-is-layout-constrained">\n`;
      code += `            <div className="wp-block-group">\n`;
      code += `              <h1>Content Not Found</h1>\n`;
      code += `              <p>This ${templateType} doesn't exist or hasn't been published yet.</p>\n`;
      code += `            </div>\n`;
      code += `          </main>\n`;
      if (hasFooter) {
        code += `          <footer className="wp-block-template-part">\n`;
        code += `            <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} siteTitle={data?.siteName || 'My Site'} />\n`;
        code += `          </footer>\n`;
      }
      code += `        </div>\n`;
      code += `        <div id="wp--skip-link--target" />\n`;
      code += `      </>\n`;
      code += `    );\n`;
      code += `  }\n\n`;
    }
    
    code += `  return (\n`;
    code += `    <>\n`;
    code += `      <a className="skip-link screen-reader-text" href="#wp--skip-link--target">Skip to content</a>\n`;
    code += `      <div className="wp-site-blocks">\n`;
    
    if (transformedJsx) {
      // Use transformed JSX from actual WordPress template
      code += transformedJsx;
    } else {
      // Fallback to basic structure if no template found
      if (hasHeader) {
        code += `      <header className="wp-block-template-part">\n`;
        code += `        <Header primaryMenu={primaryMenu} header={header} siteTitle={data?.siteName || 'My Site'} siteLogo={data?.siteLogo} />\n`;
        code += `      </header>\n`;
      }

      code += `      <main className="wp-block-group has-global-padding is-layout-constrained wp-block-group-is-layout-constrained">\n`;
      code += `        <div className="wp-block-group">\n`;
      code += `          <h1>${displayName} Template</h1>\n`;
      code += `          <p>This is a placeholder for the ${templateType} template.</p>\n`;
      
      // Add template-specific content
      if (templateType === '404') {
        code += `          <div className="wp-block-group has-text-align-center">\n`;
        code += `            <h2 className="wp-block-heading" style={{fontSize: '4rem'}}>404</h2>\n`;
        code += `            <p className="wp-block-paragraph">Page not found</p>\n`;
        code += `          </div>\n`;
      } else if (templateType === 'single' || templateType === 'page') {
        code += `          {post && (\n`;
        code += `            <article className="wp-block-post">\n`;
        code += `              <h1 className="wp-block-post-title">{post.title}</h1>\n`;
        code += `              <div className="wp-block-post-content" dangerouslySetInnerHTML={{ __html: post.content }} />\n`;
        code += `            </article>\n`;
        code += `          )}\n`;
      } else {
        code += `          {posts && posts.map((post: any) => (\n`;
        code += `            <article key={post.id} className="wp-block-post">\n`;
        code += `              <h2 className="wp-block-post-title">{post.title}</h2>\n`;
        code += `              <div className="wp-block-post-excerpt" dangerouslySetInnerHTML={{ __html: post.excerpt || post.content }} />\n`;
        code += `            </article>\n`;
        code += `          ))}\n`;
      }
      
      code += `        </div>\n`;
      code += `      </main>\n`;

      if (hasFooter) {
        code += `      <footer className="wp-block-template-part">\n`;
        code += `        <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} />\n`;
        code += `      </footer>\n`;
      }
    }

    code += `      </div>\n`;
    code += `      <div id="wp--skip-link--target" />\n`;
    code += `    </>\n`;
    code += `  );\n`;
    code += `};\n\n`;
    code += `export default ${componentName}Template;\n`;

    return code;
  }

  /**
   * Copy theme assets (WordPress-compliant structure)
   */
  private async copyAssets(parsed: ParsedTheme, outputDir: string): Promise<void> {
    // Generate WordPress accessibility CSS (skip-link, screen-reader-text)
    this.generateAccessibilityCSS(outputDir);
    
    // Generate WordPress global styles CSS from theme.json
    this.generateGlobalStylesCSS(parsed, outputDir);
    
    // Copy CSS files
    for (const css of parsed.assets.css) {
      try {
        if (fs.existsSync(css)) {
          const basename = path.basename(css);
          // Root style.css stays in theme root (WordPress standard)
          const dest = basename === 'style.css'
            ? path.join(outputDir, basename)
            : path.join(outputDir, 'assets', 'css', basename);
          fs.copyFileSync(css, dest);
        }
      } catch (error) {
        this.logger.warn(`Failed to copy CSS: ${css}`);
      }
    }

    // Copy images
    for (const img of parsed.assets.images) {
      try {
        if (fs.existsSync(img)) {
          const dest = path.join(outputDir, 'assets', 'images', path.basename(img));
          fs.copyFileSync(img, dest);
        }
      } catch (error) {
        this.logger.warn(`Failed to copy image: ${img}`);
      }
    }

    this.logger.log(`Copied ${parsed.assets.css.length} CSS files and ${parsed.assets.images.length} images`);
  }

  /**
   * Generate WordPress accessibility CSS
   */
  private generateAccessibilityCSS(outputDir: string): void {
    const css = `/**
 * WordPress Accessibility Styles
 * Standard WordPress classes for skip links and screen reader text
 */

/* Skip Link */
.skip-link.screen-reader-text {
  border: 0;
  clip: rect(1px, 1px, 1px, 1px);
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute !important;
  width: 1px;
  word-wrap: normal !important;
}

.skip-link.screen-reader-text:focus {
  background-color: #f1f1f1;
  border-radius: 3px;
  box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.6);
  clip: auto !important;
  clip-path: none;
  color: #21759b;
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
  height: auto;
  left: 5px;
  line-height: normal;
  padding: 15px 23px 14px;
  text-decoration: none;
  top: 5px;
  width: auto;
  z-index: 100000;
}

/* Screen Reader Text (General) */
.screen-reader-text {
  border: 0;
  clip: rect(1px, 1px, 1px, 1px);
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute !important;
  width: 1px;
  word-wrap: normal !important;
}

.screen-reader-text:focus {
  background-color: #f1f1f1;
  border-radius: 3px;
  box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.6);
  clip: auto !important;
  clip-path: none;
  color: #21759b;
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
  height: auto;
  left: 5px;
  line-height: normal;
  padding: 15px 23px 14px;
  text-decoration: none;
  top: 5px;
  width: auto;
  z-index: 100000;
}
`;

    const filePath = path.join(outputDir, 'assets', 'css', 'accessibility.css');
    fs.writeFileSync(filePath, css);
    this.logger.log('Generated accessibility.css');
  }

  /**
   * Generate WordPress global styles CSS from theme.json
   * Replicates WordPress wp_add_global_styles_for_blocks()
   */
  private generateGlobalStylesCSS(parsed: ParsedTheme, outputDir: string): void {
    const cssDir = path.join(outputDir, 'assets', 'css');
    fs.mkdirSync(cssDir, { recursive: true });

    const globalCSS = this.globalStylesGenerator.generateGlobalStyles(parsed.themeJson);
    
    fs.writeFileSync(path.join(cssDir, 'global-styles.css'), globalCSS);
    this.logger.log('Generated WordPress global styles CSS');
  }

  /**
   * Capitalize string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Convert to PascalCase (handle hyphens)
   */
  private toPascalCase(str: string): string {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  /**
   * Convert to kebab-case (handle numbers and PascalCase)
   */
  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/([a-zA-Z])([0-9])/g, '$1-$2')
      .replace(/([0-9])([a-zA-Z])/g, '$1-$2')
      .toLowerCase();
  }

  /**
   * Copy style variations from WordPress styles/ folder
   * WordPress block themes use JSON files for style variations (colors, typography, etc.)
   */
  private async copyStyleVariations(parsed: ParsedTheme, outputDir: string): Promise<void> {
    if (!parsed.styleVariations || parsed.styleVariations.length === 0) {
      this.logger.log('No style variations to copy - theme has no styles/ folder');
      return;
    }

    const stylesDir = path.join(outputDir, 'styles');
    fs.mkdirSync(stylesDir, { recursive: true });

    // Copy all JSON files maintaining directory structure
    for (const variation of parsed.styleVariations) {
      const targetPath = path.join(stylesDir, variation.path);
      const targetDir = path.dirname(targetPath);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      fs.writeFileSync(targetPath, JSON.stringify(variation.content, null, 2));
    }

    // Create index.json for easy loading in frontend
    const index = parsed.styleVariations.map(v => v.path);
    fs.writeFileSync(
      path.join(stylesDir, 'index.json'),
      JSON.stringify(index, null, 2)
    );

    this.logger.log(`Copied ${parsed.styleVariations.length} style variations from WordPress styles/ folder`);
    this.logger.log('Style variations can be switched in Appearance settings');
  }
}
