/**
 * WordPress Block Renderer
 * Parses WordPress block HTML and renders it dynamically with React
 * This replaces the TSX template conversion approach
 */

import React, { JSX } from 'react';
import { Post, Menu, Widget, HeaderSettings } from '../types';

// Valid HTML tags that can be dynamically created
type HTMLTag = 'div' | 'header' | 'footer' | 'main' | 'section' | 'article' | 'aside' | 'nav' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'figure' | 'figcaption' | 'ul' | 'ol' | 'li' | 'a' | 'img';

interface BlockAttributes {
  [key: string]: any;
}

interface ParsedBlock {
  blockName: string;
  attrs: BlockAttributes;
  innerHTML: string;
  innerBlocks: ParsedBlock[];
}

interface RenderContext {
  post?: Post & { featuredImage?: string };
  posts?: (Post & { featuredImage?: string })[];
  primaryMenu?: Menu;
  footerMenu?: Menu;
  widgets?: Widget[];
  header?: HeaderSettings;
  data?: any;
}


/**
 * Parse WordPress block comment syntax
 * <!-- wp:block-name {"attr":"value"} -->
 */
export function parseBlockComment(html: string): ParsedBlock[] {
  if (!html || html.trim().length === 0) {
    return [];
  }

  
  function parseBlocksRecursive(content: string, depth: number = 0): ParsedBlock[] {
    const blocks: ParsedBlock[] = [];
    let searchPos = 0;
    
    while (searchPos < content.length) {
      // Find next block start
      const blockStart = content.indexOf('<!-- wp:', searchPos);
      if (blockStart === -1) break;
      
      // Extract block name
      let pos = blockStart + 8; // After '<!-- wp:'
      let blockName = '';
      while (pos < content.length && /[a-zA-Z0-9\/-]/.test(content[pos])) {
        blockName += content[pos];
        pos++;
      }
      
      if (!blockName) {
        searchPos = pos;
        continue;
      }
      
      // Skip whitespace
      while (pos < content.length && /\s/.test(content[pos])) pos++;
      
      // Parse JSON attributes if present
      let attrs: BlockAttributes = {};
      if (content[pos] === '{') {
        let braceCount = 0;
        const jsonStart = pos;
        while (pos < content.length) {
          if (content[pos] === '{') braceCount++;
          if (content[pos] === '}') {
            braceCount--;
            if (braceCount === 0) {
              pos++;
              break;
            }
          }
          pos++;
        }
        try {
          attrs = JSON.parse(content.substring(jsonStart, pos));
        } catch (e) {
        }
      }
      
      // Skip whitespace
      while (pos < content.length && /\s/.test(content[pos])) pos++;
      
      // Check if self-closing: /-->
      if (content.substring(pos, pos + 3) === '/--') {
        // Self-closing block
        blocks.push({
          blockName,
          attrs,
          innerHTML: '',
          innerBlocks: [],
        });
        searchPos = pos + 4;
        continue;
      }
      
      // Find end of opening tag: -->
      const tagEnd = content.indexOf('-->', pos);
      if (tagEnd === -1) {
        searchPos = pos;
        continue;
      }
      
      const contentStart = tagEnd + 3;
      
      // Find closing tag: <!-- /wp:blockName -->
      const closingTag = `<!-- /wp:${blockName} -->`;
      
      // Need to find the MATCHING closing tag (handle nesting)
      let nestCount = 1;
      let searchIdx = contentStart;
      let closingPos = -1;
      
      while (nestCount > 0 && searchIdx < content.length) {
        const nextOpen = content.indexOf(`<!-- wp:${blockName}`, searchIdx);
        const nextClose = content.indexOf(closingTag, searchIdx);
        
        if (nextClose === -1) break;
        
        if (nextOpen !== -1 && nextOpen < nextClose) {
          // Check if it's a self-closing version
          const checkEnd = content.indexOf('-->', nextOpen);
          if (checkEnd !== -1 && content.substring(checkEnd - 1, checkEnd) === '/') {
            // Self-closing, don't count
            searchIdx = checkEnd + 3;
          } else {
            nestCount++;
            searchIdx = checkEnd + 3;
          }
        } else {
          nestCount--;
          if (nestCount === 0) {
            closingPos = nextClose;
          } else {
            searchIdx = nextClose + closingTag.length;
          }
        }
      }
      
      if (closingPos === -1) {
        searchPos = contentStart;
        continue;
      }
      
      // Extract inner content
      const innerContent = content.substring(contentStart, closingPos);
      
      // Recursively parse inner blocks
      const innerBlocks = parseBlocksRecursive(innerContent, depth + 1);
      
      // Extract innerHTML (content without block comments)
      let innerHTML = innerContent
        .replace(/<!--\s*wp:[^>]*-->/g, '')
        .replace(/<!--\s*\/wp:[^>]*-->/g, '')
        .trim();
      
      blocks.push({
        blockName,
        attrs,
        innerHTML,
        innerBlocks,
      });
      
      
      searchPos = closingPos + closingTag.length;
    }
    
    return blocks;
  }
  
  const result = parseBlocksRecursive(html, 0);
  return result;
}

/**
 * Convert WordPress CSS variable syntax to CSS
 * var:preset|spacing|60 → var(--wp--preset--spacing--60)
 */
function convertWordPressVars(value: string): string {
  if (!value) return value;
  return value.replace(
    /var:preset\|([^|]+)\|([^|]+)/g,
    'var(--wp--preset--$1--$2)'
  );
}

/**
 * Convert WordPress block attributes to React props
 */
function attrsToProps(attrs: BlockAttributes): {
  className?: string;
  style?: React.CSSProperties;
} {
  const props: { className?: string; style?: React.CSSProperties } = {};
  const classNames: string[] = [];
  
  // className
  if (attrs.className) {
    classNames.push(attrs.className);
  }
  
  // fontSize preset class
  if (attrs.fontSize) {
    classNames.push(`has-${attrs.fontSize}-font-size`);
  }
  
  // textAlign class
  if (attrs.textAlign) {
    classNames.push(`has-text-align-${attrs.textAlign}`);
  }
  
  // Background color preset
  if (attrs.backgroundColor) {
    classNames.push('has-background', `has-${attrs.backgroundColor}-background-color`);
  }
  
  // Text color preset
  if (attrs.textColor) {
    classNames.push('has-text-color', `has-${attrs.textColor}-color`);
  }
  
  if (classNames.length > 0) {
    props.className = classNames.join(' ');
  }
  
  // style object
  if (attrs.style) {
    const style: React.CSSProperties = {};
    
    // Spacing
    if (attrs.style.spacing) {
      const { margin, padding, blockGap } = attrs.style.spacing;
      
      if (margin) {
        Object.entries(margin).forEach(([side, value]) => {
          const cssKey = `margin${side.charAt(0).toUpperCase() + side.slice(1)}` as keyof React.CSSProperties;
          style[cssKey] = convertWordPressVars(value as string) as any;
        });
      }
      
      if (padding) {
        Object.entries(padding).forEach(([side, value]) => {
          const cssKey = `padding${side.charAt(0).toUpperCase() + side.slice(1)}` as keyof React.CSSProperties;
          style[cssKey] = convertWordPressVars(value as string) as any;
        });
      }
      
      if (blockGap) {
        style.gap = convertWordPressVars(blockGap as string);
      }
    }
    
    // Color
    if (attrs.style.color) {
      if (attrs.style.color.background) {
        style.backgroundColor = convertWordPressVars(attrs.style.color.background);
      }
      if (attrs.style.color.text) {
        style.color = convertWordPressVars(attrs.style.color.text);
      }
    }
    
    // Typography
    if (attrs.style.typography) {
      if (attrs.style.typography.fontSize) {
        style.fontSize = attrs.style.typography.fontSize;
      }
      if (attrs.style.typography.fontWeight) {
        style.fontWeight = attrs.style.typography.fontWeight;
      }
    }
    
    if (Object.keys(style).length > 0) {
      props.style = style;
    }
  }
  
  // align → className
  if (attrs.align) {
    props.className = `${props.className || ''} align${attrs.align}`.trim();
  }
  
  return props;
}

/**
 * Generate WordPress layout classes based on layout attributes
 */
function getLayoutClasses(layout?: { type?: string; justifyContent?: string; flexWrap?: string; orientation?: string; verticalAlignment?: string }): string {
  if (!layout) return '';
  
  const classes: string[] = [];
  
  // WordPress order: justification classes FIRST, then layout type
  // Flex justification classes (must come before is-layout-flex to match WordPress)
  if (layout.justifyContent) {
    if (layout.justifyContent === 'space-between') {
      classes.push('is-content-justification-space-between');
    } else if (layout.justifyContent === 'right') {
      classes.push('is-content-justification-right');
    } else if (layout.justifyContent === 'center') {
      classes.push('is-content-justification-center');
    }
  }
  
  // Layout type classes (after justification)
  if (layout.type === 'constrained') {
    classes.push('is-layout-constrained', 'wp-block-group-is-layout-constrained');
  } else if (layout.type === 'flex') {
    classes.push('is-layout-flex', 'wp-block-group-is-layout-flex');
  } else if (layout.type === 'default' || layout.type === 'flow') {
    classes.push('is-layout-flow', 'wp-block-group-is-layout-flow');
  }
  
  // Flex wrap
  if (layout.flexWrap === 'nowrap') {
    classes.push('is-nowrap');
  }
  
  // Note: verticalAlignment is handled by WordPress via unique container classes
  // (wp-container-core-group-is-layout-*) not via is-vertical-align-* classes
  // So we don't output is-vertical-align-* classes
  
  return classes.join(' ');
}

/**
 * Component to load and render a template part dynamically
 */
const TemplatePart: React.FC<{ slug: string; context: RenderContext; themeSlug?: string; tagName?: string }> = ({ slug, context, themeSlug, tagName }) => {
  const [partHTML, setPartHTML] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  
  // Determine semantic tag based on slug
  const Tag: HTMLTag = (tagName || (slug === 'header' ? 'header' : slug === 'footer' ? 'footer' : 'div')) as HTMLTag;
  
  React.useEffect(() => {
    const loadPart = async () => {
      try {
        // Get active theme from context or use default
        const theme = themeSlug || context.data?.activeTheme || 'default';
        const partPath = `/themes/${theme}/parts/${slug}.html`;
        
        
        const response = await fetch(partPath);
        
        if (!response.ok) {
          throw new Error(`Failed to load part: ${partPath} (${response.status})`);
        }
        
        const html = await response.text();
        
        // Validate that this is WordPress block HTML
        if (!html.includes('<!-- wp:')) {
          throw new Error(`Part ${slug} is not valid WordPress block HTML`);
        }
        
        setPartHTML(html);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    
    loadPart();
  }, [slug, themeSlug, context.data?.activeTheme]);
  
  if (error) {
    return React.createElement(Tag, { className: 'wp-block-template-part template-part-error' }, 
      <p>Error loading template part: {slug}</p>
    );
  }
  
  if (!partHTML) {
    return React.createElement(Tag, { className: 'wp-block-template-part template-part-loading' });
  }
  
  // Parse and render the part HTML
  const partBlocks = parseBlockComment(partHTML);
  
  return React.createElement(Tag, { className: 'wp-block-template-part' },
    partBlocks.map((block, i) => renderBlock(block, context, i))
  );
};

/**
 * Render WordPress block as React component
 */
export function renderBlock(block: ParsedBlock, context: RenderContext, key: number): React.ReactNode {
  const { blockName: rawBlockName, attrs, innerHTML, innerBlocks } = block;
  
  // Normalize block name - WordPress templates use "group" but we check for "core/group"
  // Add "core/" prefix if not present (for core blocks)
  const blockName = rawBlockName.includes('/') ? rawBlockName : `core/${rawBlockName}`;
  
  // Debug logging
  
  // Core WordPress blocks
  switch (blockName) {
    case 'core/template-part': {
      const slug = attrs.slug || attrs.theme;
      const themeSlug = context.data?.activeTheme;
      const tagName = attrs.tagName;
      
      return <TemplatePart key={key} slug={slug} context={context} themeSlug={themeSlug} tagName={tagName} />;
    }
    
    case 'core/group': {
      const Tag: HTMLTag = (attrs.tagName || 'div') as HTMLTag;
      const props = attrsToProps(attrs);
      
      // Build WordPress-compatible classes
      const layoutClasses = getLayoutClasses(attrs.layout);
      const alignClass = attrs.align ? `align${attrs.align}` : '';
      // WordPress adds has-global-padding to:
      // 1. Elements with explicit padding
      // 2. Main elements with constrained layout (WordPress default behavior)
      const hasExplicitPadding = attrs.style?.spacing?.padding;
      const isMainWithConstrained = Tag === 'main' && attrs.layout?.type === 'constrained';
      const paddingClass = (hasExplicitPadding || isMainWithConstrained) ? 'has-global-padding' : '';
      const classes = `wp-block-group ${alignClass} ${paddingClass} ${layoutClasses} ${props.className || ''}`.replace(/\s+/g, ' ').trim();
      
      
      // Render children
      const children = innerBlocks.map((innerBlock, i) => {
        return renderBlock(innerBlock, context, i);
      });
      
      // WordPress adds id="wp--skip-link--target" to main elements for accessibility
      const elementProps: Record<string, unknown> = { key, className: classes, style: props.style };
      if (Tag === 'main') {
        elementProps.id = 'wp--skip-link--target';
      }
      
      return React.createElement(
        Tag,
        elementProps,
        children
      );
    }
    
    case 'core/post-title': {
      const level = attrs.level || 1;
      const Tag: HTMLTag = `h${level}` as HTMLTag;
      const title = context.post?.title || 'Welcome';
      const props = attrsToProps(attrs);
      
      
      return (
        <Tag key={key} className="wp-block-post-title" style={props.style}>
          {title}
        </Tag>
      );
    }
    
    case 'core/post-content': {
      const props = attrsToProps(attrs);
      const layoutClasses = getLayoutClasses(attrs.layout);
      const alignClass = attrs.align ? `align${attrs.align}` : '';
      const paddingClass = attrs.style?.spacing?.padding ? 'has-global-padding' : '';
      const classes = `entry-content wp-block-post-content ${alignClass} ${paddingClass} ${layoutClasses} wp-block-post-content-is-layout-constrained ${props.className || ''}`.replace(/\s+/g, ' ').trim();
      const content = context.post?.content || '<p>This is your page content. Edit this page in the CMS to add your own content.</p>';
      
      
      return (
        <div 
          key={key} 
          className={classes}
          style={props.style}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    
    case 'core/post-featured-image': {
      if (!context.post?.featuredImage) return null;
      
      return (
        <figure key={key} className="wp-block-post-featured-image">
          <img src={context.post.featuredImage} alt={context.post.title} />
        </figure>
      );
    }
    
    case 'core/post-excerpt': {
      const props = attrsToProps(attrs);
      
      return (
        <div key={key} className="wp-block-post-excerpt" style={props.style}>
          <p>{context.post?.excerpt || ''}</p>
        </div>
      );
    }
    
    case 'core/query': {
      // Post query loop - render list of posts
      const props = attrsToProps(attrs);
      const classes = `wp-block-query ${props.className || ''}`.trim();
      
      return (
        <div key={key} className={classes} style={props.style}>
          {innerBlocks.map((innerBlock, i) => {
            // Render each inner block with post context
            if (innerBlock.blockName === 'core/post-template') {
              return context.posts?.map((post, postIndex) => (
                <div key={postIndex} className="wp-block-post">
                  {innerBlock.innerBlocks.map((postBlock, blockIndex) =>
                    renderBlock(postBlock, { ...context, post }, blockIndex)
                  )}
                </div>
              ));
            }
            return renderBlock(innerBlock, context, i);
          })}
        </div>
      );
    }
    
    case 'core/site-title': {
      // Site title block - WordPress uses <p> for level:0, otherwise <h1>-<h6>
      const props = attrsToProps(attrs);
      const siteTitle = context.data?.siteTitle || context.data?.siteName || 'NestPress Site';
      const level = attrs.level;
      const Tag: HTMLTag = (level === 0 || level === undefined ? 'p' : `h${level}`) as HTMLTag;
      
      return (
        <Tag key={key} className="wp-block-site-title" style={props.style}>
          <a href="/" rel="home">
            {siteTitle}
          </a>
        </Tag>
      );
    }
    
    case 'core/site-tagline': {
      // Site tagline block
      const props = attrsToProps(attrs);
      const tagline = context.data?.siteTagline || context.data?.siteDescription || 'Just another NestPress site';
      
      return (
        <p key={key} className="wp-block-site-tagline" style={props.style}>
          {tagline}
        </p>
      );
    }
    
    case 'core/site-logo': {
      // Site logo block - only render if logo URL is set
      const props = attrsToProps(attrs);
      const logoUrl = context.data?.siteLogo;
      const width = attrs.width || 100;
      
      // Don't render if no logo is configured
      if (!logoUrl) {
        return null;
      }
      
      return (
        <div key={key} className="wp-block-site-logo" style={props.style}>
          <a href="/" rel="home">
            <img src={logoUrl} alt="Site logo" width={width} className="custom-logo" />
          </a>
        </div>
      );
    }
    
    case 'core/navigation': {
      // Navigation block - WordPress-compatible structure with ul/li
      const props = attrsToProps(attrs);
      const menuItems = context.data?.menuItems || [
        { title: 'Blog', url: '/blog' },
        { title: 'About', url: '/about' },
        { title: 'FAQs', url: '/faqs' },
        { title: 'Contact', url: '/contact' },
      ];
      
      // Build WordPress-compatible classes
      // WordPress order: is-vertical (first if vertical), wp-block-navigation, is-layout-flex, wp-block-navigation-is-layout-flex
      const isVertical = attrs.layout?.orientation === 'vertical';
      const overlayMenu = attrs.overlayMenu || 'mobile';
      const isResponsive = overlayMenu !== 'never';
      
      // Build class list in WordPress order
      const classList: string[] = [];
      if (isVertical) classList.push('is-vertical');
      classList.push('wp-block-navigation');
      classList.push('is-layout-flex');
      classList.push('wp-block-navigation-is-layout-flex');
      if (isResponsive) classList.push('is-responsive');
      
      const classes = classList.join(' ');
      
      // If has inner navigation-link blocks, render them wrapped in ul
      if (innerBlocks.length > 0) {
        return (
          <nav key={key} className={classes} style={props.style}>
            <ul className={`wp-block-navigation__container ${isVertical ? ' is-vertical' : ''} wp-block-navigation`.trim()}>
              {innerBlocks.map((innerBlock, i) => renderBlock(innerBlock, context, i))}
            </ul>
          </nav>
        );
      }
      
      // Default navigation items with ul/li structure
      return (
        <nav key={key} className={classes} style={props.style}>
          <ul className={`wp-block-navigation__container ${isVertical ? ' is-vertical' : ''} wp-block-navigation`.trim()}>
            {menuItems.map((item: { title: string; url: string }, i: number) => (
              <li key={i} className="wp-block-navigation-item wp-block-navigation-link">
                <a href={item.url} className="wp-block-navigation-item__content">
                  <span className="wp-block-navigation-item__label">{item.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      );
    }
    
    case 'core/navigation-link': {
      // Individual navigation link - wrapped in li element
      const { label, url } = attrs;
      
      return (
        <li key={key} className="wp-block-navigation-item wp-block-navigation-link">
          <a href={url || '#'} className="wp-block-navigation-item__content">
            <span className="wp-block-navigation-item__label">{label || 'Link'}</span>
          </a>
        </li>
      );
    }
    
    case 'core/paragraph': {
      // Paragraph block - WordPress includes <p> tags in innerHTML
      // We need to extract content and render properly without nesting
      const props = attrsToProps(attrs);
      const attrClasses = `${props.className || ''}`.trim();
      
      if (innerHTML) {
        // Check if innerHTML already contains a <p> tag (WordPress format)
        const pTagMatch = innerHTML.match(/^<p[^>]*>([\s\S]*)<\/p>$/i);
        if (pTagMatch) {
          // Extract classes from the existing <p> tag - use these as the primary source
          const existingClassMatch = innerHTML.match(/class="([^"]*)"/); 
          const existingClasses = existingClassMatch ? existingClassMatch[1] : '';
          // Only use existing classes from innerHTML, don't merge with attrs (they're usually the same)
          const finalClasses = existingClasses || attrClasses || undefined;
          const innerContent = pTagMatch[1];
          
          return (
            <p 
              key={key} 
              className={finalClasses}
              style={props.style}
              dangerouslySetInnerHTML={{ __html: innerContent }}
            />
          );
        }
        
        // No <p> tag in innerHTML, wrap it
        return (
          <p 
            key={key} 
            className={attrClasses || undefined}
            style={props.style}
            dangerouslySetInnerHTML={{ __html: innerHTML }}
          />
        );
      }
      
      return <p key={key} className={attrClasses || undefined} style={props.style} />;
    }
    
    case 'core/heading': {
      // Heading block - render h1-h6
      const level = attrs.level || 2;
      const Tag: HTMLTag = `h${level}` as HTMLTag;
      const props = attrsToProps(attrs);
      
      if (innerHTML) {
        return (
          <Tag 
            key={key} 
            className="wp-block-heading"
            style={props.style}
            dangerouslySetInnerHTML={{ __html: innerHTML }}
          />
        );
      }
      
      return <Tag key={key} className="wp-block-heading" style={props.style} />;
    }
    
    case 'core/columns': {
      // Columns layout block - WordPress uses is-layout-flex
      const props = attrsToProps(attrs);
      const classes = `wp-block-columns is-layout-flex wp-container-core-columns wp-block-columns-is-layout-flex ${props.className || ''}`.replace(/\s+/g, ' ').trim();
      
      return (
        <div key={key} className={classes} style={props.style}>
          {innerBlocks.map((innerBlock, i) => renderBlock(innerBlock, context, i))}
        </div>
      );
    }
    
    case 'core/column': {
      // Single column in columns layout - WordPress adds is-layout-flow classes
      const props = attrsToProps(attrs);
      const width = attrs.width;
      const style = { ...props.style };
      if (width) {
        style.flexBasis = width;
      }
      
      return (
        <div key={key} className="wp-block-column is-layout-flow wp-block-column-is-layout-flow" style={style}>
          {innerBlocks.map((innerBlock, i) => renderBlock(innerBlock, context, i))}
        </div>
      );
    }
    
    case 'core/spacer': {
      // Spacer block - only add width if explicitly set (WordPress doesn't always include width)
      const height = attrs.height || 'var(--wp--preset--spacing--40)';
      const style: React.CSSProperties = { height: convertWordPressVars(height) };
      // Only add width if explicitly set in attributes
      if (attrs.width) {
        style.width = convertWordPressVars(attrs.width);
      }
      
      return (
        <div 
          key={key} 
          className="wp-block-spacer" 
          style={style}
          aria-hidden="true"
        />
      );
    }
    
    case 'core/image': {
      // Image block
      const props = attrsToProps(attrs);
      const { url, alt, width, height, caption } = attrs;
      
      return (
        <figure key={key} className="wp-block-image" style={props.style}>
          <img src={url} alt={alt || ''} width={width} height={height} style={{ maxWidth: '100%', height: 'auto' }} />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      );
    }
    
    case 'core/pattern': {
      // Pattern blocks - WordPress patterns need to be implemented
      // For now, return null (invisible) rather than a visible placeholder
      const slug = attrs.slug;
      
      // Return nothing - patterns are part of theme and should be pre-resolved
      // TODO: Implement pattern loading from theme's patterns/ folder
      return null;
    }
    
    default: {
      // Unknown block - render as div with innerHTML
      if (innerHTML) {
        return (
          <div 
            key={key} 
            className={`wp-block-${blockName.replace('core/', '')}`}
            dangerouslySetInnerHTML={{ __html: innerHTML }}
          />
        );
      }
      
      // Has inner blocks
      if (innerBlocks.length > 0) {
        return (
          <div key={key} className={`wp-block-${blockName.replace('core/', '')}`}>
            {innerBlocks.map((innerBlock, i) => renderBlock(innerBlock, context, i))}
          </div>
        );
      }
      
      return null;
    }
  }
}

/**
 * Render complete WordPress template HTML
 */
export function renderTemplate(
  templateHTML: string,
  context: RenderContext
): React.ReactNode {
  try {
    // Debug: Log template HTML length
    if (process.env.NODE_ENV === 'development') {
      if (templateHTML?.length > 0) {
      }
    }
    
    // Validate that this is WordPress block HTML, not full HTML document
    if (!templateHTML || !templateHTML.includes('<!-- wp:')) {
      return (
        <div className="wp-site-blocks">
          <div style={{ padding: '2rem', background: '#fee', color: '#c00' }}>
            <h1>Invalid Template</h1>
            <p>Template does not contain WordPress blocks</p>
            <pre>{templateHTML?.substring(0, 200)}</pre>
          </div>
        </div>
      );
    }
    
    // Parse WordPress blocks
    const blocks = parseBlockComment(templateHTML);
    
    if (process.env.NODE_ENV === 'development') {
      if (blocks.length > 0) {
      }
    }
    
    // Wrap in wp-site-blocks (WordPress structure) with skip link for accessibility
    return (
      <>
        {/* WordPress-style skip link for accessibility */}
        <a className="skip-link screen-reader-text" id="wp-skip-link" href="#wp--skip-link--target">
          Skip to content
        </a>
        <div className="wp-site-blocks">
          {blocks.length === 0 ? (
            <div style={{ padding: '2rem', background: '#fef3c7', color: '#92400e' }}>
              <h2>No Blocks Found</h2>
              <p>Template parsed but contained no blocks.</p>
            </div>
          ) : (
            blocks.map((block, i) => renderBlock(block, context, i))
          )}
        </div>
      </>
    );
  } catch (error) {
    return (
      <div className="wp-site-blocks">
        <div style={{ padding: '2rem', background: '#fee', color: '#c00' }}>
          <h1>Template Rendering Error</h1>
          <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
}
