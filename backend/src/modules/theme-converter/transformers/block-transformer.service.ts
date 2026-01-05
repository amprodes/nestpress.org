import { Injectable, Logger } from '@nestjs/common';
import { WordPressBlock, BlockTransformResult } from '../interfaces/converter.interfaces';
import { PhpParserService } from '../parsers/php-parser.service';

/**
 * Block Transformer Service
 * Converts WordPress blocks to React JSX
 */
@Injectable()
export class BlockTransformerService {
  private readonly logger = new Logger(BlockTransformerService.name);
  private containerIdCounter = 0;

  constructor(private readonly phpParser: PhpParserService) {}

  /**
   * Reset container ID counter (call at start of template conversion)
   */
  resetContainerIdCounter(): void {
    this.containerIdCounter = 0;
  }

  /**
   * Generate unique container ID (WordPress format)
   */
  private generateContainerId(blockType: string, layout?: string): string {
    this.containerIdCounter++;
    const layoutType = layout || 'constrained';
    // Generate random-looking ID (WordPress uses hashed IDs)
    const randomId = Math.random().toString(36).substring(2, 10);
    return `wp-container-core-${blockType}-is-layout-${randomId}`;
  }

  /**
   * Transform a block to JSX
   */
  transformBlock(block: WordPressBlock, context?: { inQuery?: boolean }): BlockTransformResult {
    const imports = new Set<string>();
    const warnings: string[] = [];

    let jsx = '';

    // Route to specific block transformer
    const blockType = block.blockName.replace('core/', '');

    try {
      switch (blockType) {
        case 'group':
          jsx = this.transformGroup(block, imports, context);
          break;
        case 'heading':
          jsx = this.transformHeading(block);
          break;
        case 'paragraph':
          jsx = this.transformParagraph(block);
          break;
        case 'image':
          jsx = this.transformImage(block);
          break;
        case 'button':
        case 'buttons':
          jsx = this.transformButtons(block);
          break;
        case 'cover':
          jsx = this.transformCover(block, imports, context);
          break;
        case 'navigation':
        case 'navigation-link':
          jsx = this.transformNavigation(block);
          break;
        case 'site-title':
          jsx = this.transformSiteTitle(block);
          break;
        case 'site-logo':
          jsx = this.transformSiteLogo(block);
          break;
        case 'site-tagline':
          jsx = this.transformSiteTagline(block);
          break;
        case 'template-part':
          jsx = this.transformTemplatePart(block);
          break;
        case 'pattern':
          jsx = this.transformPattern(block, context);
          break;
        case 'columns':
        case 'column':
          jsx = this.transformColumns(block, imports, context);
          break;
        case 'spacer':
          jsx = this.transformSpacer(block);
          break;
        case 'query':
          jsx = this.transformQuery(block, imports);
          break;
        case 'post-template':
          jsx = this.transformPostTemplate(block, imports);
          break;
        case 'post-title':
          jsx = this.transformPostTitle(block);
          break;
        case 'post-content':
          jsx = this.transformPostContent(block);
          break;
        case 'post-excerpt':
          jsx = this.transformPostExcerpt(block);
          break;
        case 'post-featured-image':
          jsx = this.transformPostFeaturedImage(block);
          break;
        case 'post-date':
          jsx = this.transformPostDate(block);
          break;
        default:
          jsx = this.transformGeneric(block, imports);
          warnings.push(`Unknown block type: ${blockType}`);
      }
    } catch (error) {
      this.logger.error(`Error transforming block ${blockType}: ${error.message}`);
      warnings.push(`Failed to transform ${blockType}: ${error.message}`);
      jsx = `{/* Failed to convert ${blockType} block */}`;
    }

    return { jsx, imports, warnings };
  }

  /**
   * Transform group block
   */
  private transformGroup(block: WordPressBlock, imports: Set<string>, context?: { inQuery?: boolean }): string {
    const className = this.extractClasses(block);
    const style = this.extractInlineStyles(block);
    const dataAttrs = this.extractDataAttributes(block);
    
    // WordPress supports tagName attribute for semantic HTML
    const tagName = block.attrs.tagName || 'div';
    
    // Generate unique container ID if block has layout
    let containerId = '';
    if (block.attrs.layout?.type) {
      containerId = this.generateContainerId('group', block.attrs.layout.type);
    }
    
    // DEBUG: Log inner blocks to verify parsing
    if (tagName === 'main') {
      this.logger.log(`🔍 DEBUG: Main group has ${block.innerBlocks.length} inner blocks:`);
      block.innerBlocks.forEach((inner, i) => {
        this.logger.log(`  ${i + 1}. ${inner.blockName}${inner.attrs?.slug ? ` (slug: ${inner.attrs.slug})` : ''}`);
      });
    }
    
    const children = this.transformInnerBlocks(block, context);
    
    return `<${tagName}${containerId ? ` id="${containerId}"` : ''}${className ? ` className="${className}"` : ''}${style ? ` style={${style}}` : ''}${dataAttrs}>
  ${children}
</${tagName}>`;
  }

  /**
   * Transform heading block
   */
  private transformHeading(block: WordPressBlock): string {
    const level = block.attrs.level || 2;
    const className = this.extractClasses(block);
    let content = this.phpParser.convertPhpToTs(block.innerHTML);
    content = this.phpParser.convertHtmlToJsx(content);
    
    // Remove nested heading tags to avoid invalid HTML (h1 cannot contain h1)
    content = content.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gs, '$1');
    
    return `<h${level}${className ? ` className="${className}"` : ''}>${content}</h${level}>`;
  }

  /**
   * Transform paragraph block
   */
  private transformParagraph(block: WordPressBlock): string {
    const className = this.extractClasses(block);
    let content = this.phpParser.convertPhpToTs(block.innerHTML);
    content = this.phpParser.convertHtmlToJsx(content);
    
    // Remove nested <p> tags to avoid invalid HTML (p cannot contain p)
    content = content.replace(/<p[^>]*>(.*?)<\/p>/gs, '$1');
    
    return `<p${className ? ` className="${className}"` : ''}>${content}</p>`;
  }

  /**
   * Transform image block
   */
  private transformImage(block: WordPressBlock): string {
    let url = block.attrs.url || block.attrs.src || '';
    let alt = block.attrs.alt || '';
    const className = this.extractClasses(block);
    
    // Convert PHP in URL and alt attributes
    url = this.phpParser.convertPhpToTs(url);
    alt = this.phpParser.convertPhpToTs(alt);
    
    return `<img src="${url}" alt="${alt}"${className ? ` className="${className}"` : ''} />`;
  }

  /**
   * Transform buttons block
   */
  private transformButtons(block: WordPressBlock): string {
    if (block.blockName === 'core/buttons') {
      const children = this.transformInnerBlocks(block);
      return `<div className="flex gap-2">
  ${children}
</div>`;
    }
    
    // Single button
    const className = this.extractClasses(block);
    let content = this.phpParser.convertPhpToTs(block.innerHTML);
    content = this.phpParser.convertHtmlToJsx(content);
    
    return `<button${className ? ` className="${className}"` : ''}>${content}</button>`;
  }

  /**
   * Transform cover block
   */
  private transformCover(block: WordPressBlock, imports: Set<string>, context?: { inQuery?: boolean }): string {
    let url = block.attrs.url || '';
    const className = this.extractClasses(block);
    
    // Convert PHP in URL attribute
    url = this.phpParser.convertPhpToTs(url);
    
    const children = this.transformInnerBlocks(block, context);
    
    return `<div className="relative ${className}" style={{backgroundImage: 'url(${url})'}}>
  ${children}
</div>`;
  }

  /**
   * Transform navigation block
   */
  private transformNavigation(block: WordPressBlock): string {
    if (block.blockName === 'core/navigation') {
      const className = this.extractClasses(block);
      const dataAttrs = this.extractDataAttributes(block);
      const children = this.transformInnerBlocks(block);
      
      // Generate container ID for navigation
      const containerId = this.generateContainerId('navigation', block.attrs.layout?.type);
      
      // WordPress Interactivity API attributes for navigation (mobile menu)
      const interactivityAttrs = this.generateNavigationInteractivityAttrs(block);
      
      return `<nav id="${containerId}" className="${className}"${dataAttrs}${interactivityAttrs}>
  ${children}
</nav>`;
    }
    
    // Navigation link
    let label = block.attrs.label || '';
    const url = block.attrs.url || '#';
    const className = this.extractClasses(block);
    const dataAttrs = this.extractDataAttributes(block);
    
    // Convert PHP in label attribute
    label = this.phpParser.convertPhpToTs(label);
    
    return `<a href="${url}" className="${className}"${dataAttrs}>${label}</a>`;
  }

  /**
   * Generate WordPress Interactivity API attributes for navigation
   * This replicates WordPress core/navigation block behavior
   */
  private generateNavigationInteractivityAttrs(block: WordPressBlock): string {
    const attrs: string[] = [];
    
    // Core navigation interactive attributes
    attrs.push('data-wp-interactive="core/navigation"');
    
    // Navigation context (overlay state)
    const context = {
      overlayOpenedBy: { click: false, hover: false, focus: false },
      type: "overlay",
      roleAttribute: "",
      ariaLabel: "Menu"
    };
    attrs.push(`data-wp-context='${JSON.stringify(context)}'`);
    
    return ' ' + attrs.join(' ');
  }

  /**
   * Transform site-title block
   */
  private transformSiteTitle(block: WordPressBlock): string {
    const level = block.attrs.level || 0;
    const className = this.extractClasses(block);
    
    if (level === 0) {
      return `<p${className ? ` className="${className}"` : ''}>{siteTitle}</p>`;
    }
    
    return `<h${level}${className ? ` className="${className}"` : ''}>{siteTitle}</h${level}>`;
  }

  /**
   * Transform site-logo block
   */
  private transformSiteLogo(block: WordPressBlock): string {
    return `<img src={siteLogo} alt={siteTitle} className="site-logo" />`;
  }

  /**
   * Transform site-tagline block
   */
  private transformSiteTagline(block: WordPressBlock): string {
    const className = this.extractClasses(block);
    return `<p${className ? ` className="${className}"` : ''}>{siteTagline}</p>`;
  }

  /**
   * Transform pattern reference
   */
  private transformPattern(block: WordPressBlock, context?: { inQuery?: boolean }): string {
    const slug = block.attrs.slug || '';
    const componentName = this.slugToComponentName(slug);
    
    // If inside query loop, pass post prop
    if (context?.inQuery) {
      return `{/* Pattern: ${slug} */}\n<${componentName} post={post} />`;
    }
    
    return `{/* Pattern: ${slug} */}\n<${componentName} />`;
  }

  /**
   * Transform template part (header, footer, etc.)
   */
  private transformTemplatePart(block: WordPressBlock): string {
    const slug = block.attrs.slug || '';
    const componentName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    
    // WordPress wraps template parts in semantic HTML with .wp-block-template-part class
    if (slug === 'header' || slug.startsWith('header-')) {
      return `<header className="wp-block-template-part">
  <${componentName} primaryMenu={primaryMenu} siteTitle={data?.siteName || 'My Site'} siteLogo={data?.siteLogo} />
</header>`;
    } else if (slug === 'footer' || slug.startsWith('footer-')) {
      return `<footer className="wp-block-template-part">
  <${componentName} footerMenu={footerMenu} footerWidgets={footerWidgets} siteTitle={data?.siteName || 'My Site'} />
</footer>`;
    }
    
    // Generic template part (sidebar, etc.)
    return `<aside className="wp-block-template-part">
  <${componentName} />
</aside>`;
  }

  /**
   * Transform columns block
   */
  private transformColumns(block: WordPressBlock, imports: Set<string>, context?: { inQuery?: boolean }): string {
    if (block.blockName === 'core/columns') {
      const children = this.transformInnerBlocks(block, context);
      return `<div className="grid grid-cols-${block.innerBlocks.length} gap-4">
  ${children}
</div>`;
    }
    
    // Single column
    const className = this.extractClasses(block);
    const children = this.transformInnerBlocks(block, context);
    
    return `<div${className ? ` className="${className}"` : ''}>
  ${children}
</div>`;
  }

  /**
   * Transform query block (post loop)
   */
  private transformQuery(block: WordPressBlock, imports: Set<string>): string {
    const postTemplate = block.innerBlocks.find(b => b.blockName === 'core/post-template');
    const blockCount = postTemplate ? postTemplate.innerBlocks.reduce((sum, b) => sum + b.innerBlocks.length + 1, 0) : 0;
    this.logger.log(`🔍 Query: ${block.innerBlocks.length} children, ${blockCount} total blocks in post-template`);
    
    // Transform inner blocks with query context
    const children = this.transformInnerBlocks(block, { inQuery: true });
    
    return `{posts && posts.map((post: any) => (
  <div key={post.id}>
    ${children}
  </div>
))}`;
  }

  /**
   * Transform post-template block
   */
  private transformPostTemplate(block: WordPressBlock, imports: Set<string>): string {
    const blockTypes = block.innerBlocks.flatMap(b => [b.blockName, ...b.innerBlocks.map(ib => ib.blockName)]);
    this.logger.log(`📝 Post-template: [${blockTypes.join(', ')}]`);
    const children = this.transformInnerBlocks(block, { inQuery: true });
    const className = this.extractClasses(block);
    return `<div${className ? ` className="${className}"` : ''}>
  ${children}
</div>`;
  }

  /**
   * Transform post-title block
   */
  private transformPostTitle(block: WordPressBlock): string {
    const level = block.attrs.level || 2;
    const className = this.extractClasses(block);
    const isLink = block.attrs.isLink !== false;
    
    if (isLink) {
      return `<h${level}${className ? ` className="${className}"` : ''}>
  <a href={\`/posts/\${post.slug}\`}>{post.title}</a>
</h${level}>`;
    }
    return `<h${level}${className ? ` className="${className}"` : ''}>{post.title}</h${level}>`;
  }

  /**
   * Transform post-content block
   */
  private transformPostContent(block: WordPressBlock): string {
    const className = this.extractClasses(block);
    return `<div${className ? ` className="${className}"` : ''} dangerouslySetInnerHTML={{ __html: post.content }} />`;
  }

  /**
   * Transform post-excerpt block
   */
  private transformPostExcerpt(block: WordPressBlock): string {
    const className = this.extractClasses(block);
    return `<div${className ? ` className="${className}"` : ''}>{post.excerpt}</div>`;
  }

  /**
   * Transform post-featured-image block
   */
  private transformPostFeaturedImage(block: WordPressBlock): string {
    const className = this.extractClasses(block);
    const isLink = block.attrs.isLink !== false;
    
    if (isLink) {
      return `{post.featuredImage && (
  <a href={\`/posts/\${post.slug}\`}>
    <img src={post.featuredImage} alt={post.title}${className ? ` className="${className}"` : ''} />
  </a>
)}`;
    }
    return `{post.featuredImage && <img src={post.featuredImage} alt={post.title}${className ? ` className="${className}"` : ''} />}`;
  }

  /**
   * Transform post-date block
   */
  private transformPostDate(block: WordPressBlock): string {
    const className = this.extractClasses(block);
    return `<time${className ? ` className="${className}"` : ''}>{new Date(post.date).toLocaleDateString()}</time>`;
  }

  /**
   * Transform spacer block
   */
  private transformSpacer(block: WordPressBlock): string {
    const height = block.attrs.height || 'var(--wp--preset--spacing--50)';
    return `<div className="spacer" style={{height: '${height}'}} aria-hidden="true" />`;
  }

  /**
   * Transform generic unknown block
   */
  private transformGeneric(block: WordPressBlock, imports: Set<string>): string {
    const className = this.extractClasses(block);
    const style = this.extractInlineStyles(block);
    
    let children = this.transformInnerBlocks(block);
    
    // If no inner blocks, convert innerHTML
    if (!children.trim() && block.innerHTML) {
      children = this.phpParser.convertPhpToTs(block.innerHTML);
      children = this.phpParser.convertHtmlToJsx(children);
    }
    
    if (children.trim()) {
      return `<div${className ? ` className="${className}"` : ''}${style ? ` style={${style}}` : ''}>
  ${children}
</div>`;
    }
    
    // Empty block
    return `<div${className ? ` className="${className}"` : ''}${style ? ` style={${style}}` : ''} />`;
  }

  /**
   * Transform inner blocks
   */
  private transformInnerBlocks(block: WordPressBlock, context?: { inQuery?: boolean }): string {
    if (!block.innerBlocks || block.innerBlocks.length === 0) {
      // Convert PHP and HTML to JSX for leaf nodes
      let content = this.phpParser.convertPhpToTs(block.innerHTML);
      content = this.phpParser.convertHtmlToJsx(content);
      // Remove HTML comments
      content = content.replace(/<!--[\s\S]*?-->/g, '');
      return content;
    }

    return block.innerBlocks
      .map(innerBlock => this.transformBlock(innerBlock, context).jsx)
      .join('\n  ');
  }

  /**
   * Extract CSS classes from block attributes AND innerHTML (WordPress-compliant)
   */
  private extractClasses(block: WordPressBlock): string {
    const classes: string[] = [];

    // FIRST: Try to extract classes from innerHTML (WordPress-generated HTML)
    // This preserves ALL WordPress classes like has-global-padding, is-layout-constrained, etc.
    if (block.innerHTML) {
      const classMatch = block.innerHTML.match(/class=["']([^"']+)["']/);
      if (classMatch) {
        // WordPress HTML has ALL the classes we need
        return classMatch[1];
      }
    }

    // FALLBACK: Generate classes from attributes if no innerHTML
    // WordPress standard: wp-block-{blocktype} class
    if (block.blockName) {
      const blockType = block.blockName.replace('core/', '');
      classes.push(`wp-block-${blockType}`);
    }

    // Alignment (WordPress uses alignfull, alignwide, etc.)
    if (block.attrs.align) {
      classes.push(`align${block.attrs.align}`);
      if (block.attrs.align === 'full') {
        classes.push(`has-full-align`);
      }
    }

    // Layout classes (WordPress generates these)
    if (block.attrs.layout?.type) {
      const layoutType = block.attrs.layout.type;
      classes.push(`is-layout-${layoutType}`);
      classes.push(`wp-block-group-is-layout-${layoutType}`);
      
      if (layoutType === 'constrained') {
        classes.push('has-global-padding');
      }
      
      // Flex layout modifiers
      if (layoutType === 'flex') {
        if (block.attrs.layout.flexWrap === 'nowrap') {
          classes.push('is-nowrap');
        }
        if (block.attrs.layout.justifyContent) {
          classes.push(`is-content-justification-${block.attrs.layout.justifyContent}`);
        }
        if (block.attrs.layout.orientation === 'vertical') {
          classes.push('is-vertical');
        }
      }
    }

    // Responsive navigation
    if (block.blockName === 'core/navigation') {
      if (block.attrs.overlayMenu === 'always' || block.attrs.overlayMenu === 'mobile') {
        classes.push('is-responsive');
      }
      if (block.attrs.layout?.justifyContent) {
        classes.push(`items-justified-${block.attrs.layout.justifyContent}`);
      }
    }

    // Font size (WordPress class format)
    if (block.attrs.fontSize) {
      classes.push(`has-${block.attrs.fontSize}-font-size`);
    }

    // Text align (WordPress class format)
    if (block.attrs.textAlign) {
      classes.push(`has-text-align-${block.attrs.textAlign}`);
    }

    // Custom className (WordPress allows custom classes)
    if (block.attrs.className) {
      classes.push(block.attrs.className);
    }

    return classes.join(' ');
  }

  /**
   * Extract WordPress Interactivity API data attributes (data-wp-*)
   */
  private extractDataAttributes(block: WordPressBlock): string {
    const dataAttrs: string[] = [];
    
    // Extract from innerHTML (WordPress-generated)
    if (block.innerHTML) {
      const dataMatches = block.innerHTML.matchAll(/data-wp-([a-z-]+)="([^"]*)"/g);
      for (const match of dataMatches) {
        const attrName = match[1];
        const attrValue = match[2];
        // Escape quotes in attribute value
        const escapedValue = attrValue.replace(/"/g, '&quot;');
        dataAttrs.push(`data-wp-${attrName}="${escapedValue}"`);
      }
    }
    
    return dataAttrs.length > 0 ? ' ' + dataAttrs.join(' ') : '';
  }

  /**
   * Extract inline styles
   */
  private extractInlineStyles(block: WordPressBlock): string | null {
    if (!block.attrs.style) {
      return null;
    }

    const styles: string[] = [];
    const styleObj = block.attrs.style;

    // Spacing
    if (styleObj.spacing?.padding) {
      const p = styleObj.spacing.padding;
      if (p.top) styles.push(`paddingTop: '${this.convertWordPressVar(p.top)}'`);
      if (p.bottom) styles.push(`paddingBottom: '${this.convertWordPressVar(p.bottom)}'`);
      if (p.left) styles.push(`paddingLeft: '${this.convertWordPressVar(p.left)}'`);
      if (p.right) styles.push(`paddingRight: '${this.convertWordPressVar(p.right)}'`);
    }

    if (styleObj.spacing?.margin) {
      const m = styleObj.spacing.margin;
      if (m.top) styles.push(`marginTop: '${this.convertWordPressVar(m.top)}'`);
      if (m.bottom) styles.push(`marginBottom: '${this.convertWordPressVar(m.bottom)}'`);
      if (m.left) styles.push(`marginLeft: '${this.convertWordPressVar(m.left)}'`);
      if (m.right) styles.push(`marginRight: '${this.convertWordPressVar(m.right)}'`);
    }

    if (styles.length === 0) return null;

    return `{${styles.join(', ')}}`;
  }

  /**
   * Convert WordPress CSS variables from var:preset|type|value to var(--wp--preset--type--value)
   */
  private convertWordPressVar(value: string): string {
    if (!value) return value;
    
    // Convert var:preset|spacing|60 -> var(--wp--preset--spacing--60)
    const varMatch = value.match(/var:preset\|([^|]+)\|([^|]+)/);
    if (varMatch) {
      const [, type, val] = varMatch;
      return `var(--wp--preset--${type}--${val})`;
    }
    
    // Already in correct format or regular value
    return value;
  }

  /**
   * Convert WordPress font size to Tailwind
   */
  private fontSizeToTailwind(fontSize: string): string {
    const sizeMap: Record<string, string> = {
      'small': 'sm',
      'medium': 'base',
      'large': 'lg',
      'x-large': 'xl',
      'xx-large': '2xl',
    };

    return sizeMap[fontSize] || fontSize;
  }

  /**
   * Convert slug to component name
   */
  private slugToComponentName(slug: string): string {
    return slug
      .split('/')
      .pop()!
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}
