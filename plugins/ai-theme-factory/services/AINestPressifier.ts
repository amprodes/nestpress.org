/**
 * AINestPressifier - Converts cloned HTML into dynamic NestPress React themes
 * 
 * Strategy: "HTML-First Fidelity"
 * 1. Load the original cloned HTML exactly as-is
 * 2. Inject dynamic placeholders using Cheerio
 * 3. Convert HTML attributes to JSX-compatible format
 * 4. Wrap in React component boilerplate
 * 
 * The goal is 100% visual fidelity - the theme should look EXACTLY like the original
 */

import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

export class AINestPressifier {
  private api: any;

  constructor(api: any) {
    this.api = api;
  }

  /**
   * Main entry point - convert all theme templates to use original HTML
   */
  async convertToNestPress(theme: any, blueprint: any): Promise<any> {
    this.api.log('🎨 Starting NestPressification (HTML-First Fidelity Strategy)...');
    
    try {
      const themeRootDir = theme.rootDir;
      const originalHTMLDir = path.join(themeRootDir, 'original-html');
      
      if (!fs.existsSync(originalHTMLDir)) {
        this.api.log('⚠ No original-html directory found, skipping conversion', 'warn');
        return theme;
      }

      // List available HTML files
      const htmlFiles = fs.readdirSync(originalHTMLDir).filter(f => f.endsWith('.html'));
      this.api.log(`Found ${htmlFiles.length} original HTML files: ${htmlFiles.join(', ')}`);

      // Load and analyze homepage for structure extraction
      const homepageHtml = this.loadHTML(originalHTMLDir, ['index.html', 'home.html']);
      if (!homepageHtml) {
        this.api.log('No homepage HTML found', 'warn');
        return theme;
      }

      // Extract structural components
      const structure = this.analyzeHTMLStructure(homepageHtml);
      this.api.log(`Structure: Header=${structure.headerSelector}, Footer=${structure.footerSelector}`);

      // Process Header
      await this.generateHeader(theme, homepageHtml, structure);
      
      // Process Footer  
      await this.generateFooter(theme, homepageHtml, structure);

      // Process Index/Homepage template
      await this.generateTemplate(theme, 'index', homepageHtml, structure, 'home');
      
      // Process Single Post template (try single.html, fallback to index)
      const singleHtml = this.loadHTML(originalHTMLDir, ['single.html', 'post.html']) || homepageHtml;
      await this.generateTemplate(theme, 'single', singleHtml, structure, 'single');
      
      // Process Page template
      const pageHtml = this.loadHTML(originalHTMLDir, ['page.html']) || homepageHtml;
      await this.generateTemplate(theme, 'page', pageHtml, structure, 'page');
      await this.generateTemplate(theme, 'page-with-sidebar', pageHtml, structure, 'page-sidebar');
      
      // Process Archive templates
      const archiveHtml = this.loadHTML(originalHTMLDir, ['archive.html', 'blog.html']) || homepageHtml;
      await this.generateTemplate(theme, 'archive', archiveHtml, structure, 'archive');
      await this.generateTemplate(theme, 'category', archiveHtml, structure, 'category');
      await this.generateTemplate(theme, 'search', archiveHtml, structure, 'search');
      
      // Process 404
      const notFoundHtml = this.loadHTML(originalHTMLDir, ['404.html']) || homepageHtml;
      await this.generateTemplate(theme, '404', notFoundHtml, structure, '404');

      this.api.log('✅ NestPressification complete!');
      return theme;

    } catch (error: any) {
      this.api.log(`NestPressification failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Load HTML from one of multiple possible filenames
   */
  private loadHTML(dir: string, filenames: string[]): string | null {
    for (const filename of filenames) {
      const filepath = path.join(dir, filename);
      if (fs.existsSync(filepath)) {
        return fs.readFileSync(filepath, 'utf-8');
      }
    }
    return null;
  }

  /**
   * Analyze HTML structure to find header/footer/main content selectors
   */
  private analyzeHTMLStructure(html: string): {
    headerSelector: string;
    footerSelector: string;
    mainSelector: string;
    headerHtml: string;
    footerHtml: string;
  } {
    const $ = cheerio.load(html);
    
    // Find header - check common patterns
    let headerSelector = 'header';
    let headerEl = $('header').first();
    if (!headerEl.length) {
      headerEl = $('[class*="header"]').first();
      if (headerEl.length) headerSelector = `.${headerEl.attr('class')?.split(' ')[0]}`;
    }
    if (!headerEl.length) {
      headerEl = $('#header, .site-header, .main-header').first();
      headerSelector = headerEl.length ? (headerEl.attr('id') ? `#${headerEl.attr('id')}` : `.${headerEl.attr('class')?.split(' ')[0]}`) : 'header';
    }
    
    // Find footer
    let footerSelector = 'footer';
    let footerEl = $('footer').first();
    if (!footerEl.length) {
      footerEl = $('[class*="footer"]').first();
      if (footerEl.length) footerSelector = `.${footerEl.attr('class')?.split(' ')[0]}`;
    }
    if (!footerEl.length) {
      footerEl = $('#footer, .site-footer, .main-footer').first();
      footerSelector = footerEl.length ? (footerEl.attr('id') ? `#${footerEl.attr('id')}` : `.${footerEl.attr('class')?.split(' ')[0]}`) : 'footer';
    }
    
    // Find main content area
    let mainSelector = 'main';
    const mainEl = $('main, #main, .main-content, .site-content, .content-area, [role="main"]').first();
    if (mainEl.length) {
      mainSelector = mainEl.attr('id') ? `#${mainEl.attr('id')}` : (mainEl.attr('class') ? `.${mainEl.attr('class')?.split(' ')[0]}` : 'main');
    }

    return {
      headerSelector,
      footerSelector,
      mainSelector,
      headerHtml: headerEl.length ? $.html(headerEl) : '',
      footerHtml: footerEl.length ? $.html(footerEl) : ''
    };
  }

  /**
   * Generate Header.tsx from original HTML
   */
  private async generateHeader(theme: any, html: string, structure: any): Promise<void> {
    const $ = cheerio.load(html);
    const headerEl = $(structure.headerSelector).first();
    
    if (!headerEl.length) {
      this.api.log('⚠ No header element found, using fallback', 'warn');
      return;
    }

    let headerHtml = $.html(headerEl);
    
    // Make navigation dynamic - find nav links and replace with dynamic menu
    const $header = cheerio.load(headerHtml);
    
    // Find the main nav element
    const navEl = $header('nav, .nav, .navigation, .main-nav, .primary-nav, [class*="menu"]').first();
    if (navEl.length) {
      // Replace nav content with dynamic menu placeholder
      navEl.html(`{/* Dynamic Menu */}
        {(props.menus?.primary || []).map((item) => (
          <a key={item.id} href={item.url} className="nav-item">{item.title}</a>
        ))}`);
    }
    
    // Find logo/site title and make dynamic
    const logoEl = $header('.logo, .site-logo, .brand, .site-title, [class*="logo"]').first();
    if (logoEl.length) {
      const hasImg = logoEl.find('img').length > 0;
      if (hasImg) {
        // Keep the image structure but could make src dynamic
      } else {
        // Text logo - make dynamic
        logoEl.html(`{props.site?.name || 'Site Name'}`);
      }
    }

    headerHtml = $header.html() || headerHtml;
    
    // Convert to JSX
    const jsxContent = this.htmlToJsx(headerHtml);
    
    const headerComponent = `import * as React from 'react';
import type { ThemeTemplateProps } from '@/types';

export function Header(props: ThemeTemplateProps) {
  return (
    <>
      ${jsxContent}
    </>
  );
}
`;

    const headerPath = theme.partFiles?.find((f: string) => f.includes('Header.tsx'));
    if (headerPath) {
      fs.writeFileSync(headerPath, headerComponent);
      this.api.log('✓ Generated Header.tsx from original HTML');
    }
  }

  /**
   * Generate Footer.tsx from original HTML
   */
  private async generateFooter(theme: any, html: string, structure: any): Promise<void> {
    const $ = cheerio.load(html);
    const footerEl = $(structure.footerSelector).first();
    
    if (!footerEl.length) {
      this.api.log('⚠ No footer element found, using fallback', 'warn');
      return;
    }

    let footerHtml = $.html(footerEl);
    
    // Make copyright year dynamic
    const currentYear = new Date().getFullYear();
    footerHtml = footerHtml.replace(new RegExp(`(©|&copy;|copyright)\\\\s*\\\\d{4}`, 'gi'), `© {new Date().getFullYear()}`);
    
    // Convert to JSX
    const jsxContent = this.htmlToJsx(footerHtml);
    
    const footerComponent = `import * as React from 'react';
import type { ThemeTemplateProps } from '@/types';

export function Footer(props: ThemeTemplateProps) {
  return (
    <>
      ${jsxContent}
    </>
  );
}
`;

    const footerPath = theme.partFiles?.find((f: string) => f.includes('Footer.tsx'));
    if (footerPath) {
      fs.writeFileSync(footerPath, footerComponent);
      this.api.log('✓ Generated Footer.tsx from original HTML');
    }
  }

  /**
   * Generate a template file from original HTML
   */
  private async generateTemplate(
    theme: any, 
    templateName: string, 
    html: string, 
    structure: any,
    type: string
  ): Promise<void> {
    const $ = cheerio.load(html);
    
    // Remove header and footer - they'll be injected as components
    $(structure.headerSelector).remove();
    $(structure.footerSelector).remove();
    
    // Remove scripts and meta
    $('script').remove();
    $('noscript').remove();
    $('link[rel="stylesheet"]').remove();
    $('style').remove();
    
    // Get body content (or full HTML if no body)
    let bodyContent = $('body').html() || $.html();
    
    // Clean up the HTML
    bodyContent = bodyContent
      .replace(/<html[^>]*>/gi, '')
      .replace(/<\/html>/gi, '')
      .replace(/<head>.*?<\/head>/gis, '')
      .replace(/<body[^>]*>/gi, '')
      .replace(/<\/body>/gi, '')
      .trim();

    // Inject dynamic content based on template type
    bodyContent = this.injectDynamicContent(bodyContent, type, $);
    
    // Convert to JSX
    const jsxContent = this.htmlToJsx(bodyContent);
    
    // Generate component name
    const componentName = this.getComponentName(templateName);
    
    const templateComponent = `import * as React from 'react';
import type { ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../index';

export default function ${componentName}(props: ThemeTemplateProps) {
  const { posts = [], post, site } = props || {};
  
  return (
    <div className="theme-page-wrapper">
      <Header {...props} />
      ${jsxContent}
      <Footer {...props} />
    </div>
  );
}
`;

    const templatePath = theme.templateFiles?.find((f: string) => 
      f.includes(`${templateName}.tsx`) || f.endsWith(`/${templateName}.tsx`)
    );
    
    if (templatePath) {
      fs.writeFileSync(templatePath, templateComponent);
      this.api.log(`✓ Generated ${templateName}.tsx from original HTML`);
    }
  }

  /**
   * Inject dynamic content placeholders based on template type
   */
  private injectDynamicContent(html: string, type: string, $: cheerio.CheerioAPI): string {
    // For now, keep the original HTML structure
    // The dynamic parts will be the Header/Footer components
    
    // For archive/blog pages, we could try to find and replace post loops
    // but for now just preserve the original design
    
    switch (type) {
      case 'single':
      case 'page':
      case 'page-sidebar':
        // These could have dynamic title/content but original design is preserved
        break;
      case 'archive':
      case 'category':
      case 'search':
        // Original design shows how posts should look
        break;
      case '404':
        // Keep original 404 design
        break;
    }
    
    return html;
  }

  /**
   * Get React component name from template name
   */
  private getComponentName(templateName: string): string {
    if (templateName === '404') return 'NotFoundTemplate';
    if (templateName === 'index') return 'IndexTemplate';
    
    // Convert kebab-case to PascalCase
    return templateName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('') + 'Template';
  }

  /**
   * Convert HTML to JSX-compatible string
   */
  private htmlToJsx(html: string): string {
    let jsx = html;
    
    // Decode HTML entities FIRST
    jsx = jsx
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#(\d+);/g, (match, code) => String.fromCharCode(parseInt(code, 10)));
    
    // HTML attribute to JSX conversions
    const attributeMap: Record<string, string> = {
      'class': 'className',
      'for': 'htmlFor',
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'maxlength': 'maxLength',
      'cellpadding': 'cellPadding',
      'cellspacing': 'cellSpacing',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable',
      'crossorigin': 'crossOrigin',
      'srcset': 'srcSet',
      'novalidate': 'noValidate',
      'autocomplete': 'autoComplete',
      'autofocus': 'autoFocus',
      'autoplay': 'autoPlay',
      'enctype': 'encType',
      'formaction': 'formAction',
      'formmethod': 'formMethod',
      'formtarget': 'formTarget',
      'formnovalidate': 'formNoValidate',
      'hreflang': 'hrefLang',
      'inputmode': 'inputMode',
      'minlength': 'minLength',
      'spellcheck': 'spellCheck',
      'itemscope': 'itemScope',
      'itemtype': 'itemType',
      'itemprop': 'itemProp',
      'datetime': 'dateTime',
      'srclang': 'srcLang',
      'playsinline': 'playsInline',
      'controlslist': 'controlsList',
      'fetchpriority': 'fetchPriority',
    };
    
    // Replace attributes
    for (const [htmlAttr, jsxAttr] of Object.entries(attributeMap)) {
      // Match attribute=" or attribute=' (case insensitive)
      const regex = new RegExp(`\\\\b${htmlAttr}(\\\\s*=\\\\s*["'])`, 'gi');
      jsx = jsx.replace(regex, `${jsxAttr}$1`);
      
      // Also handle boolean attributes (no value)
      const boolRegex = new RegExp(`\\\\b${htmlAttr}(?=[\\\\s>])`, 'gi');
      jsx = jsx.replace(boolRegex, `${jsxAttr}={true}`);
    }
    
    // Fix style attributes - convert string to object
    jsx = jsx.replace(/style="([^"]*)"/g, (match, styleString) => {
      if (!styleString.trim()) return 'style={{}}';
      
      try {
        const styles = styleString.split(';')
          .filter((s: string) => s.trim())
          .map((s: string) => {
            const [prop, val] = s.split(':').map((x: string) => x.trim());
            if (!prop || val === undefined) return null;
            // Convert CSS property to camelCase
            const camelProp = prop.replace(/-([a-z])/g, (m: string, c: string) => c.toUpperCase());
            // Escape quotes in value
            const escapedVal = val.replace(/"/g, '\\\\"');
            return `${camelProp}: "${escapedVal}"`;
          })
          .filter(Boolean)
          .join(', ');
        
        return `style={{ ${styles} }}`;
      } catch {
        return 'style={{}}';
      }
    });
    
    // Convert HTML comments to JSX comments
    jsx = jsx.replace(/<!--/g, '{/*');
    jsx = jsx.replace(/-->/g, '*/}');
    
    // Self-close void elements
    const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
    for (const tag of voidElements) {
      // Match <tag ...> that doesn't already end with />
      const regex = new RegExp(`<${tag}([^>]*[^/])>`, 'gi');
      jsx = jsx.replace(regex, `<${tag}$1 />`);
      // Also handle <tag> with no attributes
      const simpleRegex = new RegExp(`<${tag}>`, 'gi');
      jsx = jsx.replace(simpleRegex, `<${tag} />`);
    }
    
    // Remove xmlns attributes (not needed in JSX)
    jsx = jsx.replace(/\\s+xmlns(:[a-z]+)?="[^"]*"/gi, '');
    
    // Fix SVG attributes
    jsx = jsx.replace(/stroke-width/g, 'strokeWidth');
    jsx = jsx.replace(/stroke-linecap/g, 'strokeLinecap');
    jsx = jsx.replace(/stroke-linejoin/g, 'strokeLinejoin');
    jsx = jsx.replace(/fill-rule/g, 'fillRule');
    jsx = jsx.replace(/clip-rule/g, 'clipRule');
    jsx = jsx.replace(/clip-path/g, 'clipPath');
    jsx = jsx.replace(/font-family/g, 'fontFamily');
    jsx = jsx.replace(/font-size/g, 'fontSize');
    jsx = jsx.replace(/text-anchor/g, 'textAnchor');
    jsx = jsx.replace(/stop-color/g, 'stopColor');
    jsx = jsx.replace(/stop-opacity/g, 'stopOpacity');
    
    // Remove event handlers (onclick, onmouseover, etc) - they won't work in React
    jsx = jsx.replace(/\\s+on[a-z]+="[^"]*"/gi, '');
    
    return jsx;
  }
}
