/**
 * HtmlFidelityConverter - 100% Visual Fidelity HTML to JSX Converter
 * 
 * REFACTORED: Uses Cheerio DOM manipulation for robust HTML→JSX conversion
 * 
 * This converter preserves the EXACT original HTML structure from cloned WordPress themes.
 * It converts HTML to valid JSX that can be rendered by React components.
 * 
 * Key principles:
 * 1. NEVER change the DOM structure - CSS depends on exact element hierarchy
 * 2. Extract CONTENT only (no <html><head><body> wrappers)
 * 3. Convert ALL HTML attributes to JSX: class→className, for→htmlFor, etc.
 * 4. Escape JSON in data-* attributes BEFORE attribute conversion
 * 5. Convert inline styles to React style objects
 * 6. Self-close void elements (img, br, hr, input, etc.)
 * 7. Rewrite external URLs to local theme paths
 * 
 * Follows NestJS Best Practices:
 * - Single Responsibility Principle
 * - Dependency Injection (Cheerio)
 * - Proper error handling
 * - TypeScript strict typing
 */

import * as cheerio from 'cheerio';
import type { CheerioAPI, Element } from 'cheerio';

export interface ConversionOptions {
  themeSlug: string;
  sourceUrl: string;  // Original WordPress URL (e.g., https://wp.ravextheme.com/redox-dark)
}

export class HtmlFidelityConverter {
  private options: ConversionOptions;
  
  constructor(options: ConversionOptions) {
    this.options = options;
  }

  /**
   * Convert HTML to JSX-compatible string while preserving exact structure
   * 
   * NEW APPROACH: Use Cheerio for DOM-aware transformations instead of regex
   */
  public convert(html: string): string {
    try {
      // Load HTML into Cheerio DOM
      const $ = cheerio.load(html, {
        xmlMode: false,
        decodeEntities: false, // Preserve entities like &nbsp;
      });
      
      // 1. Remove HTML comments (convert to JSX comments or remove entirely)
      this.removeHTMLComments($);
      
      // 2. Convert HTML attributes to JSX attributes (class → className)
      this.convertAttributesToJSX($);
      
      // 3. Escape JSON in data-* attributes
      this.escapeDataAttributesJSON($);
      
      // 4. Rewrite URLs from source to local theme paths
      this.rewriteUrlsInDOM($);
      
      // 5. Self-close void elements
      this.selfCloseVoidElementsInDOM($);
      
      // 6. Remove event handlers (onclick, etc.) - they don't work in React
      this.removeEventHandlersFromDOM($);
      
      // 7. Fix SVG attributes
      this.fixSvgAttributesInDOM($);
      
      // Return the transformed HTML (now valid JSX)
      // Use $('body').html() to get content only, avoiding <html><head><body> wrappers
      let bodyContent = $('body').html();
      if (bodyContent) {
        // Post-process: ensure void elements are self-closed
        bodyContent = this.ensureVoidElementsSelfClosed(bodyContent);
        // Post-process: fix double-escaped entities
        bodyContent = this.unescapeDoubleEncodedEntities(bodyContent);
        // Post-process: convert inline styles to JSX style objects
        bodyContent = this.convertStyleAttributesToJSX(bodyContent);
        return bodyContent;
      }
      
      // Fallback: Get root HTML with options to prevent entity encoding
      let result = $.html({ decodeEntities: false });
      result = this.ensureVoidElementsSelfClosed(result);
      result = this.unescapeDoubleEncodedEntities(result);
      result = this.convertStyleAttributesToJSX(result);
      return result;
      
    } catch (error: any) {
      console.error('HtmlFidelityConverter error:', error.message);
      // Fallback to original HTML if conversion fails
      return html;
    }
  }

  /**
   * Remove HTML comments from the DOM
   * HTML comments <!-- --> are not valid in JSX and cause parse errors
   */
  private removeHTMLComments($: CheerioAPI): void {
    // Find all comment nodes and remove them
    $('*').contents().each((i, el) => {
      if (el.type === 'comment') {
        $(el).remove();
      }
    });
  }

  /**
   * Convert HTML attributes to JSX attributes using Cheerio DOM API
   * This is more robust than regex-based replacement
   */
  private convertAttributesToJSX($: CheerioAPI): void {
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
      'datetime': 'dateTime',
      'srclang': 'srcLang',
      'playsinline': 'playsInline',
      'controlslist': 'controlsList',
      'fetchpriority': 'fetchPriority',
      'charset': 'charSet',
      'accesskey': 'accessKey',
    };
    
    // Traverse all elements and convert attributes
    $('*').each((i, el) => {
      const $el = $(el);
      
      // Convert each HTML attribute to JSX
      for (const [htmlAttr, jsxAttr] of Object.entries(attributeMap)) {
        const value = $el.attr(htmlAttr);
        if (value !== undefined) {
          $el.attr(jsxAttr, value);
          $el.removeAttr(htmlAttr);
        }
      }
      
      // Remove xmlns attributes (not needed in JSX)
      const attrs = el.attribs || {};
      for (const attr in attrs) {
        if (attr.startsWith('xmlns')) {
          $el.removeAttr(attr);
        }
      }
    });
  }

  /**
   * Escape JSON in data-* attributes to prevent JSX parsing errors
   * Uses proper JSON parsing for robust handling
   */
  private escapeDataAttributesJSON($: CheerioAPI): void {
    $('*').each((i, el) => {
      const $el = $(el);
      const attrs = el.attribs || {};
      
      for (const attr in attrs) {
        // Check if it's a data-* attribute with JSON-like content
        if (attr.startsWith('data-') && attrs[attr].includes('{')) {
          const escaped = this.escapeJSONForJSX(attrs[attr]);
          $el.attr(attr, escaped);
        }
      }
    });
  }

  /**
   * Escape JSON string for use in JSX attribute values
   * Handles nested quotes and curly braces properly
   */
  private escapeJSONForJSX(value: string): string {
    // Skip if already escaped
    if (value.includes('&#123;') || value.includes('&quot;')) {
      return value;
    }
    
    try {
      // Try to parse as JSON first for validation
      JSON.parse(value);
      
      // If valid JSON, escape for JSX
      return value
        .replace(/\{/g, '&#123;')
        .replace(/\}/g, '&#125;')
        .replace(/"/g, '&quot;');
    } catch {
      // If not valid JSON, escape anyway (might be partial JSON)
      return value
        .replace(/\{/g, '&#123;')
        .replace(/\}/g, '&#125;')
        .replace(/"/g, '&quot;');
    }
  }

  /**
   * Rewrite URLs from WordPress source to local theme paths using DOM
   */
  private rewriteUrlsInDOM($: CheerioAPI): void {
    const { sourceUrl, themeSlug } = this.options;
    
    // Rewrite image src attributes
    $('img').each((i, el) => {
      const $el = $(el);
      const src = $el.attr('src');
      if (src && src.includes(sourceUrl)) {
        const newSrc = this.rewriteUrl(src);
        $el.attr('src', newSrc);
      }
      
      // Also handle srcset
      const srcset = $el.attr('srcset');
      if (srcset) {
        $el.attr('srcset', this.rewriteUrl(srcset));
      }
    });
    
    // Rewrite link href attributes
    $('link, a').each((i, el) => {
      const $el = $(el);
      const href = $el.attr('href');
      if (href && href.includes(sourceUrl)) {
        $el.attr('href', this.rewriteUrl(href));
      }
    });
    
    // Rewrite script src attributes
    $('script').each((i, el) => {
      const $el = $(el);
      const src = $el.attr('src');
      if (src && src.includes(sourceUrl)) {
        $el.attr('src', this.rewriteUrl(src));
      }
    });
  }

  /**
   * Rewrite a single URL from source to local theme path
   */
  private rewriteUrl(url: string): string {
    const { sourceUrl, themeSlug } = this.options;
    
    // Handle wp-content/uploads images
    if (url.includes('/wp-content/uploads/')) {
      return url.replace(
        new RegExp(`${this.escapeRegex(sourceUrl)}/wp-content/uploads/(.+)`),
        `/themes/${themeSlug}/assets/images/$1`
      );
    }
    
    // Handle wp-content/themes assets
    if (url.includes('/wp-content/themes/')) {
      return url.replace(
        new RegExp(`${this.escapeRegex(sourceUrl)}/wp-content/themes/[^/]+/(.+)`),
        `/themes/${themeSlug}/assets/$1`
      );
    }
    
    // Handle wp-content/plugins assets
    if (url.includes('/wp-content/plugins/')) {
      return url.replace(
        new RegExp(`${this.escapeRegex(sourceUrl)}/wp-content/plugins/[^/]+/(.+)`),
        `/themes/${themeSlug}/assets/plugins/$1`
      );
    }
    
    // Handle page links (convert to relative)
    if (url.startsWith(sourceUrl)) {
      return url.replace(sourceUrl, '');
    }
    
    return url;
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Convert inline style strings to React style objects using Cheerio
   */
  private convertInlineStylesToJSX($: CheerioAPI): void {
    $('[style]').each((i, el) => {
      const $el = $(el);
      const styleString = $el.attr('style');
      
      if (!styleString || !styleString.trim()) {
        $el.attr('style', '{{}}');
        return;
      }
      
      try {
        const styleObj = this.parseStyleString(styleString);
        $el.attr('style', styleObj);
      } catch {
        // If parsing fails, remove style attribute
        $el.removeAttr('style');
      }
    });
  }

  /**
   * Parse CSS style string into React style object notation
   */
  private parseStyleString(styleString: string): string {
    const styles = styleString
      .split(';')
      .filter(s => s.trim())
      .map(s => {
        const colonIndex = s.indexOf(':');
        if (colonIndex === -1) return undefined;
        
        const prop = s.substring(0, colonIndex).trim();
        const val = s.substring(colonIndex + 1).trim();
        
        if (!prop || !val) return undefined;
        
        // Convert CSS property to camelCase
        const camelProp = prop.replace(/-([a-z])/g, (m, c) => c.toUpperCase());
        
        // Handle numeric values
        let finalVal: string;
        const numericVal = parseFloat(val);
        if (!isNaN(numericVal) && val.match(/^-?\d+(\.\d+)?(px)?$/)) {
          finalVal = val.endsWith('px') ? `"${val}"` : val;
        } else {
          const escapedVal = val.replace(/"/g, '\\"');
          finalVal = `"${escapedVal}"`;
        }
        
        return `${camelProp}: ${finalVal}`;
      })
      .filter(Boolean)
      .join(', ');
    
    return `{{ ${styles} }}`;
  }

  /**
   * Self-close void elements using Cheerio
   * Note: Cheerio's .html() may not self-close properly, so we post-process
   */
  private selfCloseVoidElementsInDOM($: CheerioAPI): void {
    const voidElements = [
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
      'link', 'meta', 'param', 'source', 'track', 'wbr'
    ];
    
    voidElements.forEach(tag => {
      $(tag).each((i, el) => {
        const $el = $(el);
        // Ensure no content inside void elements
        $el.empty();
        // Mark for self-closing (Cheerio will handle)
        el.tagName = tag; // Ensure tag name is correct
      });
    });
  }
  
  /**
   * Post-process HTML to ensure void elements are properly self-closed
   */
  private ensureVoidElementsSelfClosed(html: string): string {
    const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
                          'link', 'meta', 'param', 'source', 'track', 'wbr'];
    
    voidElements.forEach(tag => {
      // Match opening tags that are not self-closed: <img ...> → <img ... />
      const regex = new RegExp(`<${tag}([^>]*[^/])>`, 'gi');
      html = html.replace(regex, `<${tag}$1 />`);
      
      // Also handle tags with no attributes: <img> → <img />
      const simpleRegex = new RegExp(`<${tag}>`, 'gi');
      html = html.replace(simpleRegex, `<${tag} />`);
    });
    
    return html;
  }

  /**
   * Post-processing: Fix double-encoded HTML entities
   * Cheerio sometimes double-encodes entities: &#123; → &amp;#123;
   */
  private unescapeDoubleEncodedEntities(html: string): string {
    return html
      .replace(/&amp;#123;/g, '&#123;')  // { character
      .replace(/&amp;#125;/g, '&#125;')  // } character
      .replace(/&amp;quot;/g, '&quot;')   // " character
      .replace(/&amp;#39;/g, '&#39;')     // ' character
      .replace(/&amp;#x([0-9A-Fa-f]+);/g, '&#x$1;'); // Hex entities
  }

  /**
   * Post-processing: Convert inline style attributes to JSX style objects
   * Converts style="color: red; font-size: 16px" to style={{ color: "red", fontSize: "16px" }}
   * Handles CSS custom properties (--my-var) by quoting them
   */
  private convertStyleAttributesToJSX(html: string): string {
    // First add readOnly to input/textarea with value but no onChange
    html = html.replace(/<(input|textarea)([^>]*value=["'][^"']*["'][^>]*)>/gi, (match, tag, attrs) => {
      // Check if it has onChange or readOnly already
      if (!attrs.includes('onChange') && !attrs.includes('readOnly')) {
        return `<${tag}${attrs} readOnly>`;
      }
      return match;
    });
    
    // Then convert style attributes
    return html.replace(/style="([^"]*)"/g, (match, styleString) => {
      if (!styleString.trim()) return 'style={{}}';
      
      try {
        const styles = styleString
          .split(';')
          .filter(s => s.trim())
          .map(s => {
            const colonIndex = s.indexOf(':');
            if (colonIndex === -1) return '';
            
            const prop = s.substring(0, colonIndex).trim();
            const val = s.substring(colonIndex + 1).trim();
            
            if (!prop || !val) return '';
            
            // CSS custom properties (CSS variables like --my-var) need to be quoted
            let jsxProp: string;
            if (prop.startsWith('--') || prop.startsWith('-')) {
              // Quote CSS variables and vendor prefixes
              jsxProp = `"${prop}"`;
            } else {
              // Convert regular CSS property to camelCase (margin-top → marginTop)
              jsxProp = prop.replace(/-([a-z])/g, (m, c) => c.toUpperCase());
            }
            
            // Escape quotes in value and wrap in quotes
            const escapedVal = val.replace(/"/g, '\\"');
            return `${jsxProp}: "${escapedVal}"`;
          })
          .filter(Boolean)
          .join(', ');
        
        return `style={{ ${styles} }}`;
      } catch {
        return 'style={{}}';
      }
    });
  }

  /**
   * Remove event handlers from DOM (onclick, onmouseover, etc.)
   */
  private removeEventHandlersFromDOM($: CheerioAPI): void {
    $('*').each((i, el) => {
      const $el = $(el);
      const attrs = el.attribs || {};
      
      for (const attr in attrs) {
        if (attr.startsWith('on')) {
          $el.removeAttr(attr);
        }
      }
    });
  }

  /**
   * Fix SVG-specific attributes using Cheerio
   */
  private fixSvgAttributesInDOM($: CheerioAPI): void {
    const svgAttributeMap: Record<string, string> = {
      'stroke-width': 'strokeWidth',
      'stroke-linecap': 'strokeLinecap',
      'stroke-linejoin': 'strokeLinejoin',
      'stroke-dasharray': 'strokeDasharray',
      'stroke-dashoffset': 'strokeDashoffset',
      'fill-rule': 'fillRule',
      'fill-opacity': 'fillOpacity',
      'stroke-opacity': 'strokeOpacity',
      'clip-path': 'clipPath',
      'clip-rule': 'clipRule',
      'font-family': 'fontFamily',
      'font-size': 'fontSize',
      'font-weight': 'fontWeight',
      'text-anchor': 'textAnchor',
      'text-decoration': 'textDecoration',
      'xlink:href': 'xlinkHref',
      'xmlns:xlink': 'xmlnsXlink',
      'xml:space': 'xmlSpace',
      'xml:lang': 'xmlLang',
      'enable-background': 'enableBackground',
      'dominant-baseline': 'dominantBaseline',
      'alignment-baseline': 'alignmentBaseline',
      'baseline-shift': 'baselineShift',
      'vector-effect': 'vectorEffect',
      'paint-order': 'paintOrder',
      'stop-color': 'stopColor',
      'stop-opacity': 'stopOpacity',
      'marker-start': 'markerStart',
      'marker-mid': 'markerMid',
      'marker-end': 'markerEnd',
    };
    
    // Process SVG elements
    $('svg, svg *').each((i, el) => {
      const $el = $(el);
      
      for (const [svgAttr, jsxAttr] of Object.entries(svgAttributeMap)) {
        const value = $el.attr(svgAttr);
        if (value !== undefined) {
          $el.attr(jsxAttr, value);
          $el.removeAttr(svgAttr);
        }
      }
    });
  }

  /**
   * Extract header HTML from full page HTML
   * Returns ONLY the inner content (no <html><head><body> wrappers)
   */
  public extractHeader(html: string, $?: CheerioAPI): string {
    const cheerioInstance = $ || cheerio.load(html, { 
      xmlMode: false,
      decodeEntities: false 
    });
    
    // Try multiple selectors for header
    const headerSelectors = [
      'header',
      '.header-area',
      '.site-header',
      '.main-header',
      '#header',
      '[class*="header"]'
    ];
    
    for (const selector of headerSelectors) {
      const headerEl = cheerioInstance(selector).first();
      if (headerEl.length && headerEl.html()?.trim()) {
        // Return INNER HTML only (content inside header tag)
        return headerEl.html() || '';
      }
    }
    
    return '';
  }

  /**
   * Extract footer HTML from full page HTML  
   * Returns ONLY the inner content (no <html><head><body> wrappers)
   */
  public extractFooter(html: string, $?: CheerioAPI): string {
    const cheerioInstance = $ || cheerio.load(html, {
      xmlMode: false,
      decodeEntities: false
    });
    
    // Try multiple selectors for footer
    const footerSelectors = [
      'footer',
      '.footer-area',
      '.site-footer',
      '.main-footer',
      '#footer',
      '[class*="footer"]'
    ];
    
    for (const selector of footerSelectors) {
      const footerEl = cheerioInstance(selector).last();
      if (footerEl.length && footerEl.html()?.trim()) {
        // Return INNER HTML only (content inside footer tag)
        return footerEl.html() || '';
      }
    }
    
    return '';
  }

  /**
   * Extract main content (excluding header/footer) from full page HTML
   * Returns clean content without HTML document structure
   */
  public extractMainContent(html: string): string {
    const $ = cheerio.load(html, {
      xmlMode: false,
      decodeEntities: false
    });
    
    // Remove header
    $('header, .header-area, .site-header, #header').remove();
    
    // Remove footer
    $('footer, .footer-area, .site-footer, #footer').remove();
    
    // Remove scripts, styles, meta
    $('script').remove();
    $('noscript').remove();
    $('link[rel="stylesheet"]').remove();
    $('style').remove();
    
    // Get body content
    const bodyContent = $('body').html();
    
    if (bodyContent) {
      return bodyContent.trim();
    }
    
    // Fallback: get all content and clean
    let content = $.html()
      .replace(/<html[^>]*>/gi, '')
      .replace(/<\/html>/gi, '')
      .replace(/<head>[\s\S]*?<\/head>/gi, '')
      .replace(/<body[^>]*>/gi, '')
      .replace(/<\/body>/gi, '')
      .trim();
    
    return content;
  }

  /**
   * Generate a complete React component from HTML content
   * Ensures proper JSX structure without HTML document wrappers
   */
  public generateComponent(
    html: string,
    componentName: string,
    includeHeaderFooter: boolean = true
  ): string {
    // Convert HTML to JSX
    const jsxContent = this.convert(html);
    
    // Clean any remaining HTML document tags (defensive)
    const cleanJSX = jsxContent
      .replace(/<\/?html[^>]*>/gi, '')
      .replace(/<\/?head[^>]*>/gi, '')
      .replace(/<\/?body[^>]*>/gi, '')
      .trim();
    
    if (includeHeaderFooter) {
      return `import * as React from 'react';
import type { ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../index';

export default function ${componentName}(props: ThemeTemplateProps) {
  return (
    <>
      <Header {...props} />
      ${cleanJSX}
      <Footer {...props} />
    </>
  );
}
`;
    } else {
      return `import * as React from 'react';
import type { ThemeTemplateProps } from '@/types';

export function ${componentName}(props: ThemeTemplateProps) {
  return (
    <>
      ${cleanJSX}
    </>
  );
}
`;
    }
  }
}

export default HtmlFidelityConverter;
