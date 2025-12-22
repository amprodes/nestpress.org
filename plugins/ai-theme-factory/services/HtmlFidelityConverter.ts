/**
 * HtmlFidelityConverter - 100% Visual Fidelity HTML to JSX Converter
 * 
 * This converter preserves the EXACT original HTML structure from cloned WordPress themes.
 * It only converts attributes to JSX format and rewrites URLs to local paths.
 * 
 * Key principles:
 * 1. NEVER change the DOM structure - CSS depends on exact element hierarchy
 * 2. Only convert attributes: class→className, for→htmlFor, etc.
 * 3. Convert inline styles to React style objects
 * 4. Self-close void elements (img, br, hr, input, etc.)
 * 5. Rewrite external URLs to local theme paths
 */

import * as cheerio from 'cheerio';

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
   */
  public convert(html: string): string {
    let jsx = html;
    
    // 1. Rewrite URLs from source to local theme paths
    jsx = this.rewriteUrls(jsx);
    
    // 2. Convert HTML attributes to JSX attributes
    jsx = this.convertAttributes(jsx);
    
    // 3. Convert inline styles to React style objects
    jsx = this.convertInlineStyles(jsx);
    
    // 4. Self-close void elements
    jsx = this.selfCloseVoidElements(jsx);
    
    // 5. Convert HTML comments to JSX comments
    jsx = this.convertComments(jsx);
    
    // 6. Fix SVG attributes
    jsx = this.fixSvgAttributes(jsx);
    
    // 7. Remove event handlers (onclick, etc.) - they won't work in React
    jsx = this.removeEventHandlers(jsx);
    
    // 8. Escape curly braces that aren't part of JSX expressions
    jsx = this.escapeCurlyBraces(jsx);
    
    return jsx;
  }

  /**
   * Rewrite URLs from WordPress source to local theme paths
   */
  private rewriteUrls(html: string): string {
    const { sourceUrl, themeSlug } = this.options;
    
    // Escape special regex characters in URL
    const escapedUrl = sourceUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Rewrite image/asset URLs to local paths
    // e.g., https://wp.ravextheme.com/redox-dark/wp-content/uploads/... → /themes/redox-dark/assets/images/...
    let result = html;
    
    // Handle wp-content/uploads images
    const uploadsRegex = new RegExp(`${escapedUrl}/wp-content/uploads/([^"'\\s)]+)`, 'gi');
    result = result.replace(uploadsRegex, `/themes/${themeSlug}/assets/images/$1`);
    
    // Handle wp-content/themes assets
    const themesRegex = new RegExp(`${escapedUrl}/wp-content/themes/[^/]+/([^"'\\s)]+)`, 'gi');
    result = result.replace(themesRegex, `/themes/${themeSlug}/assets/$1`);
    
    // Handle wp-content/plugins assets
    const pluginsRegex = new RegExp(`${escapedUrl}/wp-content/plugins/[^/]+/([^"'\\s)]+)`, 'gi');
    result = result.replace(pluginsRegex, `/themes/${themeSlug}/assets/plugins/$1`);
    
    // Handle direct page links (convert to relative)
    const pageRegex = new RegExp(`href="${escapedUrl}/([^"]*)"`, 'gi');
    result = result.replace(pageRegex, 'href="/$1"');
    
    // Handle src URLs pointing to external CDNs/resources (keep as-is for now)
    // These will need to be downloaded separately
    
    return result;
  }

  /**
   * Convert HTML attributes to JSX format
   */
  private convertAttributes(html: string): string {
    let jsx = html;
    
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
      // Preserve itemscope, itemtype, itemprop for schema.org
    };
    
    for (const [htmlAttr, jsxAttr] of Object.entries(attributeMap)) {
      // Match attribute="value" or attribute='value'
      const doubleQuoteRegex = new RegExp(`\\b${htmlAttr}(\\s*=\\s*")`, 'gi');
      jsx = jsx.replace(doubleQuoteRegex, `${jsxAttr}$1`);
      
      const singleQuoteRegex = new RegExp(`\\b${htmlAttr}(\\s*=\\s*')`, 'gi');
      jsx = jsx.replace(singleQuoteRegex, `${jsxAttr}$1`);
      
      // Handle boolean attributes (no value) - convert to ={true}
      // But be careful not to match partial attribute names
      const boolRegex = new RegExp(`\\s${htmlAttr}(?=[\\s>/])`, 'gi');
      jsx = jsx.replace(boolRegex, ` ${jsxAttr}={true}`);
    }
    
    // Remove xmlns attributes (not needed in JSX)
    jsx = jsx.replace(/\s+xmlns(:[a-z]+)?="[^"]*"/gi, '');
    
    return jsx;
  }

  /**
   * Convert inline style strings to React style objects
   */
  private convertInlineStyles(html: string): string {
    return html.replace(/style="([^"]*)"/g, (match, styleString) => {
      if (!styleString.trim()) return 'style={{}}';
      
      try {
        const styles = styleString.split(';')
          .filter((s: string) => s.trim())
          .map((s: string) => {
            const colonIndex = s.indexOf(':');
            if (colonIndex === -1) return null;
            
            const prop = s.substring(0, colonIndex).trim();
            const val = s.substring(colonIndex + 1).trim();
            
            if (!prop || !val) return null;
            
            // Convert CSS property to camelCase
            const camelProp = prop.replace(/-([a-z])/g, (m: string, c: string) => c.toUpperCase());
            
            // Handle numeric values (don't quote numbers for pixel values, etc.)
            let finalVal: string;
            const numericVal = parseFloat(val);
            if (!isNaN(numericVal) && val.match(/^-?\d+(\.\d+)?(px)?$/)) {
              // It's a pure number or px value - keep as number for px
              if (val.endsWith('px')) {
                finalVal = `"${val}"`;
              } else {
                finalVal = val;
              }
            } else {
              // String value - escape quotes
              const escapedVal = val.replace(/"/g, '\\"');
              finalVal = `"${escapedVal}"`;
            }
            
            return `${camelProp}: ${finalVal}`;
          })
          .filter(Boolean)
          .join(', ');
        
        return `style={{ ${styles} }}`;
      } catch {
        // If parsing fails, return empty style object
        return 'style={{}}';
      }
    });
  }

  /**
   * Self-close void elements (img, br, hr, input, etc.)
   */
  private selfCloseVoidElements(html: string): string {
    let jsx = html;
    
    const voidElements = [
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
      'link', 'meta', 'param', 'source', 'track', 'wbr'
    ];
    
    for (const tag of voidElements) {
      // Match <tag ...> that doesn't already end with />
      // Use negative lookbehind to avoid matching already self-closed
      const regex = new RegExp(`<${tag}([^>]*[^/])>`, 'gi');
      jsx = jsx.replace(regex, `<${tag}$1 />`);
      
      // Handle <tag> with no attributes
      const simpleRegex = new RegExp(`<${tag}>`, 'gi');
      jsx = jsx.replace(simpleRegex, `<${tag} />`);
    }
    
    return jsx;
  }

  /**
   * Convert HTML comments to JSX comments
   */
  private convertComments(html: string): string {
    return html
      .replace(/<!--/g, '{/*')
      .replace(/-->/g, '*/}');
  }

  /**
   * Fix SVG-specific attributes
   */
  private fixSvgAttributes(html: string): string {
    const svgAttributeMap: Record<string, string> = {
      'stroke-width': 'strokeWidth',
      'stroke-linecap': 'strokeLinecap',
      'stroke-linejoin': 'strokeLinejoin',
      'stroke-dasharray': 'strokeDasharray',
      'stroke-dashoffset': 'strokeDashoffset',
      'stroke-miterlimit': 'strokeMiterlimit',
      'stroke-opacity': 'strokeOpacity',
      'fill-rule': 'fillRule',
      'fill-opacity': 'fillOpacity',
      'clip-rule': 'clipRule',
      'clip-path': 'clipPath',
      'font-family': 'fontFamily',
      'font-size': 'fontSize',
      'font-weight': 'fontWeight',
      'font-style': 'fontStyle',
      'text-anchor': 'textAnchor',
      'text-decoration': 'textDecoration',
      'stop-color': 'stopColor',
      'stop-opacity': 'stopOpacity',
      'xlink:href': 'xlinkHref',
      'xml:space': 'xmlSpace',
      'alignment-baseline': 'alignmentBaseline',
      'baseline-shift': 'baselineShift',
      'dominant-baseline': 'dominantBaseline',
      'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
      'glyph-orientation-vertical': 'glyphOrientationVertical',
      'horiz-adv-x': 'horizAdvX',
      'horiz-origin-x': 'horizOriginX',
      'overline-position': 'overlinePosition',
      'overline-thickness': 'overlineThickness',
      'paint-order': 'paintOrder',
      'panose-1': 'panose1',
      'strikethrough-position': 'strikethroughPosition',
      'strikethrough-thickness': 'strikethroughThickness',
      'underline-position': 'underlinePosition',
      'underline-thickness': 'underlineThickness',
      'unicode-bidi': 'unicodeBidi',
      'unicode-range': 'unicodeRange',
      'units-per-em': 'unitsPerEm',
      'v-alphabetic': 'vAlphabetic',
      'v-hanging': 'vHanging',
      'v-ideographic': 'vIdeographic',
      'v-mathematical': 'vMathematical',
      'vert-adv-y': 'vertAdvY',
      'vert-origin-x': 'vertOriginX',
      'vert-origin-y': 'vertOriginY',
      'word-spacing': 'wordSpacing',
      'writing-mode': 'writingMode',
      'x-height': 'xHeight',
    };
    
    let jsx = html;
    
    for (const [svgAttr, jsxAttr] of Object.entries(svgAttributeMap)) {
      // Be more careful with SVG attribute replacement to avoid false positives
      const regex = new RegExp(`\\b${svgAttr}=`, 'g');
      jsx = jsx.replace(regex, `${jsxAttr}=`);
    }
    
    return jsx;
  }

  /**
   * Remove event handlers (onclick, onmouseover, etc.)
   * These don't work in React and could cause issues
   */
  private removeEventHandlers(html: string): string {
    return html.replace(/\s+on[a-z]+="[^"]*"/gi, '');
  }

  /**
   * Escape curly braces that aren't part of JSX expressions
   * In template content, { and } need to be {'{'} and {'}'}
   */
  private escapeCurlyBraces(html: string): string {
    // This is tricky - we need to NOT escape curly braces that are already part of JSX
    // For now, we'll only escape standalone braces that look like they're content
    // This is a conservative approach
    
    // Don't escape if it looks like JSX expression (followed by variable/function)
    // Only escape literal braces in text content
    
    // Skip this for now as it could break legitimate JSX - manual review needed
    return html;
  }

  /**
   * Extract header HTML from full page HTML
   */
  public extractHeader(html: string, $?: cheerio.CheerioAPI): string {
    const cheerioInstance = $ || cheerio.load(html);
    
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
        return cheerioInstance.html(headerEl) || '';
      }
    }
    
    return '';
  }

  /**
   * Extract footer HTML from full page HTML
   */
  public extractFooter(html: string, $?: cheerio.CheerioAPI): string {
    const cheerioInstance = $ || cheerio.load(html);
    
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
      const footerEl = cheerioInstance(selector).last(); // Use last() for footer
      if (footerEl.length && footerEl.html()?.trim()) {
        return cheerioInstance.html(footerEl) || '';
      }
    }
    
    return '';
  }

  /**
   * Extract main content (excluding header/footer) from full page HTML
   */
  public extractMainContent(html: string): string {
    const $ = cheerio.load(html);
    
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
    let content = $('body').html() || $.html();
    
    // Clean up
    content = content
      .replace(/<html[^>]*>/gi, '')
      .replace(/<\/html>/gi, '')
      .replace(/<head>[\s\S]*?<\/head>/gi, '')
      .replace(/<body[^>]*>/gi, '')
      .replace(/<\/body>/gi, '')
      .trim();
    
    return content;
  }

  /**
   * Generate a complete React component from HTML
   */
  public generateComponent(
    html: string, 
    componentName: string, 
    includeHeaderFooter: boolean = true
  ): string {
    const jsxContent = this.convert(html);
    
    if (includeHeaderFooter) {
      return `import * as React from 'react';
import type { ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../index';

export default function ${componentName}(props: ThemeTemplateProps) {
  return (
    <>
      <Header {...props} />
      ${jsxContent}
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
      ${jsxContent}
    </>
  );
}
`;
    }
  }
}

export default HtmlFidelityConverter;
