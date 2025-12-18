/**
 * Phase 4: AI NestPressification Service
 * 
 * The most critical phase - converts static HTML/CSS into dynamic NestPress templates.
 * Uses AI to intelligently inject NestPress template tags, menu functions, and widget areas.
 */

import type { ThemeBlueprint } from './ThemeAnalyzer';
import type { ThemeAssembler } from './ThemeAssembler';

export interface NestPressifiedTheme extends ThemeAssembler {
  nestpressFeatures: {
    registeredMenus: string[];
    registeredWidgets: string[];
    templateTags: string[];
    hooks: string[];
  };
}

export class AINestPressifier {
  private api: any;
  private aiClient: any;
  private aiInitialized: boolean = false;

  constructor(api: any) {
    this.api = api;
    // Don't initialize AI in constructor - do it lazily when first needed
  }

  /**
   * Helper: Capitalize first letter of string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Helper: Get template type from filename
   */
  private getTemplateTypeFromName(filename: string): string {
    const name = filename.replace('.tsx', '').toLowerCase();
    
    // Map filenames to template types
    const typeMap: Record<string, string> = {
      'index': 'home',
      'single': 'single',
      'page': 'page',
      'page-with-sidebar': 'page-sidebar',
      'archive': 'archive',
      'category': 'category',
      '404': '404',
    };
    
    return typeMap[name] || 'page';
  }

  private async ensureAI() {
    if (this.aiInitialized) return;

    try {
      // Get AI credentials from database via SystemConfigService
      let apiKey: string | undefined;
      let provider: string = 'gemini';

      if (this.api.systemConfigService) {
        const credentials = await this.api.systemConfigService.getAICredentials();
        if (credentials) {
          apiKey = credentials.apiKey;
          provider = credentials.provider;
          this.api.log(`✓ Loaded AI credentials from database: ${provider}`);
        }
      }
      
      if (!apiKey) {
        this.api.log('⚠ No Gemini API key found. Configure in Settings → System → AI Services', 'warn');
        this.api.log('  Go to admin dashboard and add your API key (no restart required!)', 'warn');
        return;
      }
      
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      this.aiClient = new GoogleGenerativeAI(apiKey);
      this.api.log('✓ Gemini 3 Flash initialized for HTML assembly (loaded from database)');
      this.aiInitialized = true;
    } catch (error: any) {
      this.api.log('Failed to init Gemini: ' + error.message, 'error');
    }
  }

  /**
   * Clean up JSX syntax errors that AI might generate
   * ULTRA-AGGRESSIVE fragment removal - NO FRAGMENTS ALLOWED!
   */
  private cleanJSX(code: string): string {
    this.api.log('[cleanJSX] Starting aggressive JSX cleanup...');
    
    // 0. CRITICAL: Fix React imports FIRST (must be correct format)
    // Replace any incorrect React import with correct one
    if (code.includes('import React from')) {
      this.api.log('[cleanJSX] Fixing React import format...');
      code = code.replace(/import\s+React\s+from\s+['"]react['"]\s*;?\s*\n?/g, '');
    }
    
    // Ensure React import is first line (if not already present)
    if (!code.includes('import * as React from')) {
      this.api.log('[cleanJSX] Adding React import...');
      code = `import * as React from 'react';\n${code}`;
    } else {
      // Move React import to first line if not already
      const reactImport = code.match(/import\s+\*\s+as\s+React\s+from\s+['"]react['"];?\s*\n?/);
      if (reactImport && code.indexOf(reactImport[0]) > 0) {
        this.api.log('[cleanJSX] Moving React import to first line...');
        code = code.replace(reactImport[0], '');
        code = `${reactImport[0]}\n${code}`;
      }
    }
    
    // 1. Fix HTML comments to JSX comments
    code = code.replace(/<!--\s*(.*?)\s*-->/gs, '{/* $1 */}');
    
    // 2. NUCLEAR OPTION: Remove ALL fragment patterns
    // Log if we find any fragments for debugging
    const fragmentCount = (code.match(/<>|<\/>/g) || []).length;
    if (fragmentCount > 0) {
      this.api.log(`[cleanJSX] WARNING: Found ${fragmentCount} fragment tags - removing all...`);
    }
    
    // Pattern A: return (<>...content...</>) - replace with proper wrapper
    code = code.replace(/return\s*\(\s*<>([\s\S]*?)<\/>\s*\)/g, (match, content) => {
      this.api.log('[cleanJSX] Fixed: return (<>...</>) pattern');
      return `return (\n    <div className="component-wrapper">\n${content}    </div>\n  )`;
    });
    
    // Pattern B: return (<> with just comments/whitespace
    code = code.replace(/return\s*\(\s*<>\s*\{\/\*[^}]*\}\s*/g, (match) => {
      this.api.log('[cleanJSX] Fixed: return (<> with comment');
      return 'return (\n    <div className="component-wrapper">\n      ';
    });
    
    // Pattern C: Standalone opening fragments
    code = code.replace(/return\s*\(\s*<>/g, (match) => {
      this.api.log('[cleanJSX] Fixed: return (<> standalone');
      return 'return (\n    <div className="component-wrapper">';
    });
    
    // Pattern D: Closing fragments before );
    code = code.replace(/<\/>\s*\)/g, (match) => {
      this.api.log('[cleanJSX] Fixed: </>) closing');
      return '</div>\n  )';
    });
    
    // Pattern E: Any remaining opening fragments (emergency catch-all)
    code = code.replace(/<>/g, (match) => {
      this.api.log('[cleanJSX] Fixed: remaining <> fragment');
      return '<div className="wrapper">';
    });
    
    // Pattern F: Any remaining closing fragments (emergency catch-all)
    code = code.replace(/<\/>/g, (match) => {
      this.api.log('[cleanJSX] Fixed: remaining </> fragment');
      return '</div>';
    });
    
    // Verify no fragments remain
    const remainingFragments = (code.match(/<>|<\/>/g) || []).length;
    if (remainingFragments > 0) {
      this.api.log(`[cleanJSX] ERROR: Still have ${remainingFragments} fragments after cleanup!`, 'error');
    } else if (fragmentCount > 0) {
      this.api.log(`[cleanJSX] SUCCESS: Removed all ${fragmentCount} fragments!`);
    }
    
    // 3. Fix self-closing tags
    code = code.replace(/<(img|br|hr|input|meta|link|area|base|col|embed|source|track|wbr)([^>]*?)(?<!\/)>/gi, '<$1$2 />');
    
    // 4. Fix React attribute names
    code = code.replace(/\sclass=/g, ' className=');
    code = code.replace(/\sfor=/g, ' htmlFor=');
    code = code.replace(/\sitemscope=/gi, ' itemScope=');
    code = code.replace(/\sitemtype=/gi, ' itemType=');
    code = code.replace(/\sitemprop=/gi, ' itemProp=');
    code = code.replace(/\stabindex=/gi, ' tabIndex=');
    
    // 5. Fix unquoted attribute values
    code = code.replace(/(\w+)=([a-zA-Z0-9_-]+)(\s|\/?>)/g, '$1="$2"$3');
    
    // 6. Remove markdown code fences
    code = code.replace(/```(?:typescript|tsx|jsx|javascript)?\n?/g, '');
    
    // 7. Fix dangling closing tags
    code = code.replace(/\s+\/>/g, ' />');
    
    // 8. Fix aria attributes
    code = code.replace(/\saria-([a-z]+)=/gi, (match, attr) => ` aria-${attr}=`);
    
    // 9. Remove orphaned JSX comments
    code = code.replace(/^\s*\{\/\*[^*]*\*\/\}\s*$/gm, '');
    
    this.api.log('[cleanJSX] JSX cleanup complete');
    return code;
  }

  /**
   * Main conversion method - transforms static theme into dynamic NestPress theme
   */
  async convertToNestPress(
    theme: any,
    blueprint: ThemeBlueprint
  ): Promise<any> {
    this.api.log('Starting NestPressification...');

    const fs = require('fs');
    const path = require('path');

    try {
      // Read part files from disk
      const headerPath = theme.partFiles.find((f: string) => f.endsWith('Header.tsx'));
      const footerPath = theme.partFiles.find((f: string) => f.endsWith('Footer.tsx'));
      const sidebarPath = theme.partFiles.find((f: string) => f.endsWith('Sidebar.tsx'));

      // Step 1: Enhance Header with dynamic navigation
      if (headerPath && fs.existsSync(headerPath)) {
        this.api.sendProgress?.(71, 'AI enhancing Header component with navigation...', { type: 'phase', phase: 4 });
        this.api.log('Injecting dynamic navigation...');
        const headerContent = fs.readFileSync(headerPath, 'utf-8');
        const enhanced = await this.nestpressifyHeader(headerContent, blueprint);
        fs.writeFileSync(headerPath, enhanced);
      }

      // Step 2: Enhance Footer with widget areas
      if (footerPath && fs.existsSync(footerPath)) {
        this.api.sendProgress?.(73, 'AI enhancing Footer component with widgets...', { type: 'phase', phase: 4 });
        this.api.log('Injecting footer widgets...');
        const footerContent = fs.readFileSync(footerPath, 'utf-8');
        const enhanced = await this.nestpressifyFooter(footerContent, blueprint);
        fs.writeFileSync(footerPath, enhanced);
      }

      // Step 3: Enhance Sidebar with widget areas
      if (sidebarPath && fs.existsSync(sidebarPath)) {
        this.api.sendProgress?.(75, 'AI enhancing Sidebar component with widgets...', { type: 'phase', phase: 4 });
        this.api.log('Injecting sidebar widgets...');
        const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');
        const enhanced = await this.nestpressifySidebar(sidebarContent, blueprint);
        fs.writeFileSync(sidebarPath, enhanced);
      }

      // Step 4: Enhance content templates with Loop and template tags
      this.api.sendProgress?.(76, `AI enhancing ${theme.templateFiles.length} templates with NestPress Loop...`, { type: 'phase', phase: 4 });
      this.api.log('Injecting NestPress Loop...');
      
      let templateIndex = 0;
      for (const templatePath of theme.templateFiles) {
        templateIndex++;
        const progress = 76 + templateIndex; // 77, 78, 79, 80, 81, 82, 83
        const name = path.basename(templatePath);
        this.api.sendProgress?.(progress, `AI enhancing template: ${name}`, { type: 'phase', phase: 4 });
        
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        const templateType = this.getTemplateTypeFromName(name);
        const enhanced = await this.nestpressifyTemplate(
          templateContent,
          templateType,
          blueprint
        );
        fs.writeFileSync(templatePath, enhanced);
      }

      this.api.sendProgress?.(88, 'NestPressification complete!', { type: 'phase', phase: 4 });
      this.api.log('NestPressification complete!');

      return theme;

    } catch (error: any) {
      this.api.log('NestPressification failed: ' + error.message, 'error');
      throw error;
    }
  }

  /**
   * Convert static header navigation to dynamic NestPress menu system
   */
  private async nestpressifyHeader(headerCode: string, blueprint: ThemeBlueprint): Promise<string> {
    await this.ensureAI();
    
    // AI Prompt with JSX examples (stored as plain strings to avoid compilation)
    const menuExample = '<nav className="main-nav">\n  {menuItems.map((item) => (\n    <a key={item.id} href={item.url}>{item.label}</a>\n  ))}\n</nav>';
    const logoExample = '<div className="logo">\n  <img src="/logo.png" alt={siteName} />\n  <span>{siteName}</span>\n</div>';
    
    const aiPrompt = 'You are a SENIOR REACT ENGINEER converting static HTML to TypeScript React components.\n\n' +
      'CURRENT CODE:\n' + headerCode + '\n\n' +
      'CRITICAL RULES - FOLLOW EXACTLY:\n' +
      '1. FIRST LINE MUST BE: import * as React from \'react\';\n' +
      '2. SECOND LINE MUST BE: import type { Menu, SiteSettings } from \'@/types\';\n' +
      '3. PRESERVE ALL EXISTING IMPORTS - DO NOT REMOVE THEM\n' +
      '4. Create HeaderProps interface with primaryMenu?: Menu and header?: SiteSettings\n' +
      '5. Export function: export function Header({ primaryMenu, header }: HeaderProps)\n' +
      '6. Extract menuItems from primaryMenu?.items || [] with .sort((a,b) => a.order - b.order)\n' +
      '7. Extract siteName from header?.general.siteTitle\n' +
      '8. Use className not class, self-closing tags, NO fragments, NO dangerouslySetInnerHTML\n' +
      '9. Return COMPLETE valid TypeScript - NO placeholders, NO comments like "// rest of code"\n\n' +
      'EXAMPLE - Dynamic menu:\n' + menuExample + '\n\n' +
      'EXAMPLE - Logo with site name:\n' + logoExample + '\n\n' +
      'OUTPUT: Pure TypeScript code only, no markdown, MUST start with: import * as React from \'react\';';

    // Use AI to transform the header code
    if (this.aiClient) {
      try {
        const model = this.aiClient.getGenerativeModel({ model: 'gemini-3-pro-preview' });
        const result = await model.generateContent(aiPrompt);
        let aiResponse = result.response.text();
        
        // Extract code from markdown if present
        const codeMatch = aiResponse.match(/```(?:typescript|tsx)?\n([\s\S]+?)\n```/);
        if (codeMatch) {
          aiResponse = codeMatch[1];
        }
        
        // Clean up JSX syntax errors
        aiResponse = this.cleanJSX(aiResponse);
        
        this.api.log('✓ AI enhanced header with dynamic navigation');
        return aiResponse;
      } catch (error: any) {
        this.api.log('AI enhancement failed, using original: ' + error.message, 'warn');
      }
    }

    // Fallback: return original
    return headerCode;
  }

  /**
   * Convert static footer to dynamic widget areas
   */
  private async nestpressifyFooter(footerCode: string, blueprint: ThemeBlueprint): Promise<string> {
    await this.ensureAI();
    
    // AI Prompt with JSX examples (stored as plain strings to avoid compilation)
    const copyrightExample = '<div className="copyright">\n  © {currentYear} {siteName}. All rights reserved.\n</div>';
    const footerMenuExample = '<nav className="footer-nav">\n  {menuItems.map((item) => (\n    <a key={item.id} href={item.url}>{item.label}</a>\n  ))}\n</nav>';
    const widgetExample = '{footerWidgets && footerWidgets.map((widget) => (\n  <div key={widget.id} className="widget">\n    <h4>{widget.title}</h4>\n    <div dangerouslySetInnerHTML={{ __html: widget.content }} />\n  </div>\n))}';
    
    const aiPrompt = 'You are a SENIOR REACT ENGINEER converting static HTML to TypeScript React components.\n\n' +
      'CURRENT CODE:\n' + footerCode + '\n\n' +
      'CRITICAL RULES - FOLLOW EXACTLY:\n' +
      '1. FIRST LINE MUST BE: import * as React from \'react\';\n' +
      '2. SECOND LINE MUST BE: import type { Menu, SiteSettings } from \'@/types\';\n' +
      '3. PRESERVE ALL EXISTING IMPORTS - DO NOT REMOVE THEM\n' +
      '4. Create FooterProps interface with footerMenu?: Menu, footerWidgets?: any[], header?: SiteSettings\n' +
      '5. Export function: export function Footer({ footerMenu, footerWidgets, header }: FooterProps)\n' +
      '6. Extract menuItems from footerMenu?.items || [], siteName from header?.general.siteTitle, currentYear = new Date().getFullYear()\n' +
      '7. Use className not class, self-closing tags, NO fragments, NO dangerouslySetInnerHTML\n' +
      '8. Return COMPLETE valid TypeScript - NO placeholders, NO comments like "// rest of code"\n\n' +
      'EXAMPLE - Copyright:\n' + copyrightExample + '\n\n' +
      'EXAMPLE - Footer menu:\n' + footerMenuExample + '\n\n' +
      'EXAMPLE - Widget area:\n' + widgetExample + '\n\n' +
      'OUTPUT: Pure TypeScript code only, no markdown, MUST start with: import * as React from \'react\';';

    // Use AI to transform the footer code
    if (this.aiClient) {
      try {
        const model = this.aiClient.getGenerativeModel({ model: 'gemini-3-pro-preview' });
        const result = await model.generateContent(aiPrompt);
        let aiResponse = result.response.text();
        
        // Extract code from markdown if present
        const codeMatch = aiResponse.match(/```(?:typescript|tsx)?\n([\s\S]+?)\n```/);
        if (codeMatch) {
          aiResponse = codeMatch[1];
        }
        
        // Clean up JSX syntax errors
        aiResponse = this.cleanJSX(aiResponse);
        
        this.api.log('✓ AI enhanced footer with widgets and menus');
        return aiResponse;
      } catch (error: any) {
        this.api.log('AI enhancement failed, using original: ' + error.message, 'warn');
      }
    }

    // Fallback: return original
    return footerCode;
  }

  private async nestpressifySidebar(sidebarCode: string, blueprint: ThemeBlueprint): Promise<string> {
    await this.ensureAI();
    
    // AI Prompt with JSX examples (stored as plain strings to avoid compilation)
    const sidebarExample = '<aside>\n  {widgets && widgets.map((widget) => (\n    <div key={widget.id} className="widget">\n      <h3>{widget.title}</h3>\n      <div dangerouslySetInnerHTML={{ __html: widget.content }} />\n    </div>\n  ))}\n</aside>';
    
    const aiPrompt = 'You are a SENIOR REACT ENGINEER converting static HTML to TypeScript React components.\n\n' +
      'CURRENT CODE:\n' + sidebarCode + '\n\n' +
      'CRITICAL RULES - FOLLOW EXACTLY:\n' +
      '1. FIRST LINE MUST BE: import * as React from \'react\';\n' +
      '2. SECOND LINE MUST BE: import type { Post, Category } from \'@/types\';\n' +
      '3. PRESERVE ALL EXISTING IMPORTS - DO NOT REMOVE THEM\n' +
      '4. Create SidebarProps interface with widgets?: any[], recentPosts?: Post[], categories?: Category[]\n' +
      '5. Export function: export function Sidebar({ widgets, recentPosts, categories }: SidebarProps)\n' +
      '6. Map widgets with widgets?.map(w => ...) using key={w.id}\n' +
      '7. Map recentPosts with recentPosts?.slice(0,5).map(p => ...) using key={p.id}\n' +
      '8. Map categories with categories?.map(c => ...) using key={c.id}\n' +
      '9. Use className not class, self-closing tags, NO fragments, NO dangerouslySetInnerHTML\n' +
      '10. Return COMPLETE valid TypeScript - NO placeholders, NO comments like "// rest of code"\n\n' +
      'EXAMPLE - Widget mapping:\n' + sidebarExample + '\n\n' +
      'OUTPUT: Pure TypeScript code only, no markdown, MUST start with: import * as React from \'react\';';

    if (this.aiClient) {
      try {
        const model = this.aiClient.getGenerativeModel({ model: 'gemini-3-pro-preview' });
        const result = await model.generateContent(aiPrompt);
        let aiResponse = result.response.text();
        
        const codeMatch = aiResponse.match(/```(?:typescript|tsx)?\n([\s\S]+?)\n```/);
        if (codeMatch) {
          aiResponse = codeMatch[1];
        }
        
        // Clean up JSX syntax errors and fix imports
        aiResponse = this.cleanJSX(aiResponse);
        
        this.api.log('✓ AI enhanced sidebar with dynamic widgets');
        return aiResponse;
      } catch (error: any) {
        this.api.log('AI sidebar enhancement failed: ' + error.message, 'warn');
      }
    }

    return sidebarCode;
  }

  private async nestpressifyTemplate(templateCode: string, templateName: string, blueprint: ThemeBlueprint): Promise<string> {
    await this.ensureAI();
    
    const componentName = this.capitalize(templateName);
    
    // JSX examples stored as plain strings (not template literals to avoid compilation)
    const postsGridExample = '<div className="posts-grid">\n  {posts.filter(p => p.status === \'PUBLISHED\').map((post) => (\n    <article key={post.id} className="post-card">\n      {post.featuredImage && <img src={post.featuredImage} alt={post.title} />}\n      <h2><a href={`/blog/${post.slug}`}>{post.title}</a></h2>\n      <p>{post.excerpt}</p>\n    </article>\n  ))}\n</div>';
    
    const singlePostExample = '{post && (\n  <article className="single-post">\n    <h1>{post.title}</h1>\n    {post.featuredImage && <img src={post.featuredImage} alt={post.title} />}\n    <div className="post-meta">\n      <span>By {post.author}</span>\n      <span>{new Date(post.createdAt).toLocaleDateString()}</span>\n    </div>\n    <div dangerouslySetInnerHTML={{ __html: post.content }} />\n  </article>\n)}';
    
    const aiPrompt = 'You are a SENIOR REACT ENGINEER creating a ' + templateName + ' template for a headless CMS.\n\n' +
      'CURRENT CODE:\n' + templateCode + '\n\n' +
      'CRITICAL RULES - FOLLOW EXACTLY:\n' +
      '1. FIRST LINE MUST BE: import * as React from \'react\';\n' +
      '2. Import all needed types from \'@/types\' (Post, Product, ThemeTemplateProps, etc.)\n' +
      '3. Import parts: import { Header, Footer } from \'../parts/Header\';\n' +
      '4. PRESERVE ALL EXISTING IMPORTS - DO NOT REMOVE THEM\n' +
      '5. Component name: ' + componentName + 'Template\n' +
      '6. Export default function: export default function ' + componentName + 'Template(props: ThemeTemplateProps)\n' +
      '7. Wrapper: <div className="' + templateName + '-template">\n' +
      '8. Include <Header primaryMenu={primaryMenu} header={header} /> at top\n' +
      '9. Include <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} /> at bottom\n' +
      '10. For index/archive: Use posts?.filter(p => p.status === \'PUBLISHED\').map() with key={post.id}\n' +
      '11. For single: Use post object with conditional rendering {post && ...}\n' +
      '12. Use className not class, self-closing tags, NO fragments, NO dangerouslySetInnerHTML\n' +
      '13. Return COMPLETE valid TypeScript - NO placeholders, NO comments like "// rest of code"\n\n' +
      'EXAMPLE - Posts grid (index/archive):\n' + postsGridExample + '\n\n' +
      'EXAMPLE - Single post:\n' + singlePostExample + '\n\n' +
      'OUTPUT: Pure TypeScript code only, no markdown, MUST start with: import * as React from \'react\';';

    if (this.aiClient) {
      try {
        const model = this.aiClient.getGenerativeModel({ model: 'gemini-3-pro-preview' });
        const result = await model.generateContent(aiPrompt);
        let aiResponse = result.response.text();
        
        const codeMatch = aiResponse.match(/```(?:typescript|tsx)?\n([\s\S]+?)\n```/);
        if (codeMatch) {
          aiResponse = codeMatch[1];
        }
        
        // Clean up JSX syntax errors and fix imports
        aiResponse = this.cleanJSX(aiResponse);
        
        this.api.log('✓ AI enhanced template: ' + templateName);
        return aiResponse;
      } catch (error: any) {
        this.api.log('AI template enhancement failed for ' + templateName + ': ' + error.message, 'warn');
      }
    }

    return templateCode;
  }

  /**
   * AI-powered TypeScript error fixing
   * Analyzes errors and uses AI to generate corrected code
   */
  async fixTypeScriptErrors(code: string, errors: any[], filename: string): Promise<string> {
    await this.ensureAI();
    
    if (!this.aiClient) {
      this.api.log('AI not available for error fixing, returning original code', 'warn');
      return code;
    }
    
    // Build error context
    const errorList = errors.map(err => 
      `Line ${err.line}: ${err.message} (code: ${err.code})`
    ).join('\n');
    
    const aiPrompt = `You are a TypeScript/React expert fixing compilation errors.

FILE: ${filename}

CURRENT CODE:
\`\`\`typescript
${code}
\`\`\`

ERRORS:
${errorList}

CRITICAL RULES:
1. FIRST LINE MUST BE: import * as React from 'react';
2. Import types from '@/types' (Post, Menu, SiteSettings, etc.)
3. Use proper TypeScript interfaces for all props
4. Use className not class
5. NO fragments (<> or </>)
6. NO dangerouslySetInnerHTML
7. Self-closing tags for void elements
8. Return COMPLETE valid TypeScript - NO placeholders, NO "// rest of code" comments
9. Fix ALL errors listed above
10. Preserve all functionality - only fix syntax/type errors

OUTPUT: Pure TypeScript code only, no markdown, no explanations. Start with: import * as React from 'react';`;

    try {
      const model = this.aiClient.getGenerativeModel({ model: 'gemini-3-pro-preview' });
      const result = await model.generateContent(aiPrompt);
      let fixedCode = result.response.text();
      
      // Extract code from markdown if present
      const codeMatch = fixedCode.match(/```(?:typescript|tsx)?\n([\s\S]+?)\n```/);
      if (codeMatch) {
        fixedCode = codeMatch[1];
      }
      
      // Apply cleanJSX to ensure correct format
      fixedCode = this.cleanJSX(fixedCode);
      
      this.api.log(`✓ AI fixed ${errors.length} errors in ${filename}`);
      return fixedCode;
      
    } catch (error: any) {
      this.api.log(`AI error fixing failed: ${error.message}`, 'warn');
      return code; // Return original on error
    }
  }
}
