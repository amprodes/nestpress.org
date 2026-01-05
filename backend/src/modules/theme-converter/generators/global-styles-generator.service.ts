import { Injectable, Logger } from '@nestjs/common';

/**
 * Global Styles Generator Service  
 * Generates WordPress-compliant global-styles CSS from theme.json
 * This replicates WordPress's wp_add_global_styles_for_blocks() function
 */
@Injectable()
export class GlobalStylesGeneratorService {
  private readonly logger = new Logger(GlobalStylesGeneratorService.name);

  /**
   * Convert WordPress CSS variable syntax to proper CSS var() syntax
   * var:preset|color|base → var(--wp--preset--color--base)
   * var:theme|spacing|50 → var(--wp--style--spacing--50)
   */
  private convertWordPressVar(value: string): string {
    if (!value || typeof value !== 'string') return value;
    
    // Convert var:preset|type|slug → var(--wp--preset--type--slug)
    value = value.replace(
      /var:preset\|([^|]+)\|([^);\s]+)/g,
      'var(--wp--preset--$1--$2)'
    );
    
    // Convert var:theme|type|slug → var(--wp--style--type--slug)
    value = value.replace(
      /var:theme\|([^|]+)\|([^);\s]+)/g,
      'var(--wp--style--$1--$2)'
    );
    
    return value;
  }

  /**
   * Generate complete global styles CSS from theme.json
   * This matches WordPress's inline global-styles CSS output
   */
  generateGlobalStyles(themeJson: any): string {
    const css: string[] = [];

    // 1. CSS Custom Properties (:root variables)
    css.push(this.generateRootVariables(themeJson));

    // 2. Layout variables
    css.push(this.generateLayoutStyles(themeJson));

    // 3. Global element styles (body, a, h1-h6, buttons, etc.)
    css.push(this.generateElementStyles(themeJson));

    // 4. Utility classes for colors, fonts, gradients
    css.push(this.generateUtilityClasses(themeJson));

    // 5. Block-specific styles
    css.push(this.generateBlockStyles(themeJson));

    return css.filter(Boolean).join('\n');
  }

  /**
   * Generate :root CSS variables from theme.json settings
   */
  private generateRootVariables(themeJson: any): string {
    const vars: string[] = [];
    const settings = themeJson.settings || {};

    // Aspect ratios
    const aspectRatios = [
      { slug: 'square', value: '1' },
      { slug: '4-3', value: '4/3' },
      { slug: '3-4', value: '3/4' },
      { slug: '3-2', value: '3/2' },
      { slug: '2-3', value: '2/3' },
      { slug: '16-9', value: '16/9' },
      { slug: '9-16', value: '9/16' },
    ];
    aspectRatios.forEach(({ slug, value }) => {
      vars.push(`--wp--preset--aspect-ratio--${slug}: ${value};`);
    });

    // Colors
    if (settings.color?.palette) {
      settings.color.palette.forEach((preset: any) => {
        vars.push(`--wp--preset--color--${preset.slug}: ${preset.color};`);
      });
    }

    // Gradients
    if (settings.color?.gradients) {
      settings.color.gradients.forEach((preset: any) => {
        vars.push(`--wp--preset--gradient--${preset.slug}: ${preset.gradient};`);
      });
    }

    // Font sizes
    if (settings.typography?.fontSizes) {
      settings.typography.fontSizes.forEach((preset: any) => {
        vars.push(`--wp--preset--font-size--${preset.slug}: ${preset.size};`);
      });
    }

    // Font families
    if (settings.typography?.fontFamilies) {
      settings.typography.fontFamilies.forEach((preset: any) => {
        vars.push(`--wp--preset--font-family--${preset.slug}: ${preset.fontFamily};`);
      });
    }

    // Spacing
    if (settings.spacing?.spacingSizes) {
      settings.spacing.spacingSizes.forEach((preset: any) => {
        vars.push(`--wp--preset--spacing--${preset.slug}: ${preset.size};`);
      });
    }

    // Shadows
    if (settings.shadow?.presets) {
      settings.shadow.presets.forEach((preset: any) => {
        vars.push(`--wp--preset--shadow--${preset.slug}: ${preset.shadow};`);
      });
    }

    return `:root{${vars.join('')}}`;
  }

  /**
   * Generate layout-related styles
   */
  private generateLayoutStyles(themeJson: any): string {
    const css: string[] = [];
    const settings = themeJson.settings || {};
    const styles = themeJson.styles || {};

    // Content and wide sizes
    const layoutVars: string[] = [];
    if (settings.layout?.contentSize) {
      layoutVars.push(`--wp--style--global--content-size: ${settings.layout.contentSize};`);
    }
    if (settings.layout?.wideSize) {
      layoutVars.push(`--wp--style--global--wide-size: ${settings.layout.wideSize};`);
    }

    if (layoutVars.length > 0) {
      css.push(`:root { ${layoutVars.join('')} }`);
    }

    // Body margin
    css.push(`:where(body) { margin: 0; }`);

    // wp-site-blocks padding
    css.push(`.wp-site-blocks { padding-top: var(--wp--style--root--padding-top); padding-bottom: var(--wp--style--root--padding-bottom); }`);

    // has-global-padding
    css.push(`.has-global-padding { padding-right: var(--wp--style--root--padding-right); padding-left: var(--wp--style--root--padding-left); }`);
    css.push(`.has-global-padding > .alignfull { margin-right: calc(var(--wp--style--root--padding-right) * -1); margin-left: calc(var(--wp--style--root--padding-left) * -1); }`);
    css.push(`.has-global-padding :where(:not(.alignfull.is-layout-flow) > .has-global-padding:not(.wp-block-block, .alignfull)) { padding-right: 0; padding-left: 0; }`);
    css.push(`.has-global-padding :where(:not(.alignfull.is-layout-flow) > .has-global-padding:not(.wp-block-block, .alignfull)) > .alignfull { margin-left: 0; margin-right: 0; }`);

    // Alignment helpers
    css.push(`.wp-site-blocks > .alignleft { float: left; margin-right: 2em; }`);
    css.push(`.wp-site-blocks > .alignright { float: right; margin-left: 2em; }`);
    css.push(`.wp-site-blocks > .aligncenter { justify-content: center; margin-left: auto; margin-right: auto; }`);

    // Block gap (spacing between blocks)
    const blockGap = styles.spacing?.blockGap || '1.2rem';
    css.push(`:where(.wp-site-blocks) > * { margin-block-start: ${blockGap}; margin-block-end: 0; }`);
    css.push(`:where(.wp-site-blocks) > :first-child { margin-block-start: 0; }`);
    css.push(`:where(.wp-site-blocks) > :last-child { margin-block-end: 0; }`);
    css.push(`:root { --wp--style--block-gap: ${blockGap}; }`);

    // Layout type styles (flow, constrained, flex, grid)
    this.generateLayoutTypeStyles(css, blockGap);

    return css.join('');
  }

  /**
   * Generate layout type-specific styles
   */
  private generateLayoutTypeStyles(css: string[], blockGap: string): void {
    // Flow layout
    css.push(`:root :where(.is-layout-flow) > :first-child{margin-block-start: 0;}`);
    css.push(`:root :where(.is-layout-flow) > :last-child{margin-block-end: 0;}`);
    css.push(`:root :where(.is-layout-flow) > *{margin-block-start: ${blockGap};margin-block-end: 0;}`);

    // Constrained layout
    css.push(`:root :where(.is-layout-constrained) > :first-child{margin-block-start: 0;}`);
    css.push(`:root :where(.is-layout-constrained) > :last-child{margin-block-end: 0;}`);
    css.push(`:root :where(.is-layout-constrained) > *{margin-block-start: ${blockGap};margin-block-end: 0;}`);
    
    // Flex layout
    css.push(`:root :where(.is-layout-flex){gap: ${blockGap};}`);
    
    // Grid layout
    css.push(`:root :where(.is-layout-grid){gap: ${blockGap};}`);

    // Alignment in layouts
    css.push(`.is-layout-flow > .alignleft{float: left;margin-inline-start: 0;margin-inline-end: 2em;}`);
    css.push(`.is-layout-flow > .alignright{float: right;margin-inline-start: 2em;margin-inline-end: 0;}`);
    css.push(`.is-layout-flow > .aligncenter{margin-left: auto !important;margin-right: auto !important;}`);
    
    css.push(`.is-layout-constrained > .alignleft{float: left;margin-inline-start: 0;margin-inline-end: 2em;}`);
    css.push(`.is-layout-constrained > .alignright{float: right;margin-inline-start: 2em;margin-inline-end: 0;}`);
    css.push(`.is-layout-constrained > .aligncenter{margin-left: auto !important;margin-right: auto !important;}`);
    css.push(`.is-layout-constrained > :where(:not(.alignleft):not(.alignright):not(.alignfull)){max-width: var(--wp--style--global--content-size);margin-left: auto !important;margin-right: auto !important;}`);
    css.push(`.is-layout-constrained > .alignwide{max-width: var(--wp--style--global--wide-size);}`);

    // Flex and grid display
    css.push(`body .is-layout-flex{display: flex;}`);
    css.push(`.is-layout-flex{flex-wrap: wrap;align-items: center;}`);
    css.push(`.is-layout-flex > :is(*, div){margin: 0;}`);
    
    css.push(`body .is-layout-grid{display: grid;}`);
    css.push(`.is-layout-grid > :is(*, div){margin: 0;}`);
  }

  /**
   * Generate element styles (body, links, headings, buttons)
   */
  private generateElementStyles(themeJson: any): string {
    const css: string[] = [];
    const styles = themeJson.styles || {};

    // Body styles
    const bodyStyles: string[] = [];
    if (styles.color?.background) bodyStyles.push(`background-color: ${this.convertWordPressVar(styles.color.background)};`);
    if (styles.color?.text) bodyStyles.push(`color: ${this.convertWordPressVar(styles.color.text)};`);
    if (styles.typography?.fontFamily) bodyStyles.push(`font-family: ${this.convertWordPressVar(styles.typography.fontFamily)};`);
    if (styles.typography?.fontSize) bodyStyles.push(`font-size: ${this.convertWordPressVar(styles.typography.fontSize)};`);
    if (styles.typography?.fontWeight) bodyStyles.push(`font-weight: ${styles.typography.fontWeight};`);
    if (styles.typography?.letterSpacing) bodyStyles.push(`letter-spacing: ${styles.typography.letterSpacing};`);
    if (styles.typography?.lineHeight) bodyStyles.push(`line-height: ${styles.typography.lineHeight};`);
    
    // Root padding
    if (styles.spacing?.padding) {
      const p = styles.spacing.padding;
      if (p.top) bodyStyles.push(`--wp--style--root--padding-top: ${this.convertWordPressVar(p.top)};`);
      if (p.right) bodyStyles.push(`--wp--style--root--padding-right: ${this.convertWordPressVar(p.right)};`);
      if (p.bottom) bodyStyles.push(`--wp--style--root--padding-bottom: ${this.convertWordPressVar(p.bottom)};`);
      if (p.left) bodyStyles.push(`--wp--style--root--padding-left: ${this.convertWordPressVar(p.left)};`);
    }

    if (bodyStyles.length > 0) {
      css.push(`body{${bodyStyles.join('')}}`);
    }

    // Links
    if (styles.elements?.link) {
      const link = styles.elements.link;
      const linkStyles: string[] = [];
      if (link.color?.text) linkStyles.push(`color: ${this.convertWordPressVar(link.color.text)};`);
      if (link.typography?.textDecoration) linkStyles.push(`text-decoration: ${link.typography.textDecoration};`);
      if (linkStyles.length > 0) {
        css.push(`a:where(:not(.wp-element-button)){${linkStyles.join('')}}`);
      }

      // Link hover
      if (link[':hover']) {
        const hoverStyles: string[] = [];
        if (link[':hover'].typography?.textDecoration) hoverStyles.push(`text-decoration: ${link[':hover'].typography.textDecoration};`);
        if (hoverStyles.length > 0) {
          css.push(`:root :where(a:where(:not(.wp-element-button)):hover){${hoverStyles.join('')}}`);
        }
      }
    }

    // Headings
    const headingStyles = styles.elements?.heading;
    if (headingStyles) {
      const hStyles: string[] = [];
      if (headingStyles.typography?.fontWeight) hStyles.push(`font-weight: ${headingStyles.typography.fontWeight};`);
      if (headingStyles.typography?.letterSpacing) hStyles.push(`letter-spacing: ${headingStyles.typography.letterSpacing};`);
      if (headingStyles.typography?.lineHeight) hStyles.push(`line-height: ${headingStyles.typography.lineHeight};`);
      if (hStyles.length > 0) {
        css.push(`h1, h2, h3, h4, h5, h6{${hStyles.join('')}}`);
      }
    }

    // Individual heading levels
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach((tag) => {
      if (styles.elements?.[tag]) {
        const elemStyles: string[] = [];
        const elem = styles.elements[tag];
        if (elem.typography?.fontSize) elemStyles.push(`font-size: ${this.convertWordPressVar(elem.typography.fontSize)};`);
        if (elem.typography?.fontWeight) elemStyles.push(`font-weight: ${elem.typography.fontWeight};`);
        if (elem.typography?.letterSpacing) elemStyles.push(`letter-spacing: ${elem.typography.letterSpacing};`);
        if (elem.typography?.textTransform) elemStyles.push(`text-transform: ${elem.typography.textTransform};`);
        if (elemStyles.length > 0) {
          css.push(`${tag}{${elemStyles.join('')}}`);
        }
      }
    });

    // Buttons
    if (styles.elements?.button) {
      const button = styles.elements.button;
      const btnStyles: string[] = [];
      if (button.color?.background) btnStyles.push(`background-color: ${this.convertWordPressVar(button.color.background)};`);
      if (button.border?.width) btnStyles.push(`border-width: ${button.border.width};`);
      if (button.color?.text) btnStyles.push(`color: ${this.convertWordPressVar(button.color.text)};`);
      if (button.typography?.fontFamily) btnStyles.push(`font-family: ${this.convertWordPressVar(button.typography.fontFamily)};`);
      if (button.typography?.fontSize) btnStyles.push(`font-size: ${this.convertWordPressVar(button.typography.fontSize)};`);
      if (button.spacing?.padding) {
        const p = button.spacing.padding;
        if (p.top) btnStyles.push(`padding-top: ${this.convertWordPressVar(p.top)};`);
        if (p.right) btnStyles.push(`padding-right: ${this.convertWordPressVar(p.right)};`);
        if (p.bottom) btnStyles.push(`padding-bottom: ${this.convertWordPressVar(p.bottom)};`);
        if (p.left) btnStyles.push(`padding-left: ${this.convertWordPressVar(p.left)};`);
      }
      if (btnStyles.length > 0) {
        css.push(`:root :where(.wp-element-button, .wp-block-button__link){${btnStyles.join('')}font-style: inherit;font-weight: inherit;letter-spacing: inherit;line-height: inherit;text-decoration: none;text-transform: inherit;}`);
      }

      // Button hover/focus states
      if (button[':hover']) {
        const hoverStyles: string[] = [];
        if (button[':hover'].color?.background) hoverStyles.push(`background-color: ${this.convertWordPressVar(button[':hover'].color.background)};`);
        if (button[':hover'].border?.color) hoverStyles.push(`border-color: ${button[':hover'].border.color};`);
        if (button[':hover'].color?.text) hoverStyles.push(`color: ${this.convertWordPressVar(button[':hover'].color.text)};`);
        if (hoverStyles.length > 0) {
          css.push(`:root :where(.wp-element-button:hover, .wp-block-button__link:hover){${hoverStyles.join('')}}`);
        }
      }

      if (button[':focus']) {
        const focusStyles: string[] = [];
        if (button[':focus'].outline?.color) focusStyles.push(`outline-color: ${this.convertWordPressVar(button[':focus'].outline.color)};`);
        if (button[':focus'].outline?.offset) focusStyles.push(`outline-offset: ${button[':focus'].outline.offset};`);
        if (focusStyles.length > 0) {
          css.push(`:root :where(.wp-element-button:focus, .wp-block-button__link:focus){${focusStyles.join('')}}`);
        }
      }
    }

    // Captions
    if (styles.elements?.caption) {
      const caption = styles.elements.caption;
      const capStyles: string[] = [];
      if (caption.typography?.fontSize) capStyles.push(`font-size: ${this.convertWordPressVar(caption.typography.fontSize)};`);
      if (caption.typography?.lineHeight) capStyles.push(`line-height: ${caption.typography.lineHeight};`);
      if (capStyles.length > 0) {
        css.push(`:root :where(.wp-element-caption, .wp-block-audio figcaption, .wp-block-embed figcaption, .wp-block-gallery figcaption, .wp-block-image figcaption, .wp-block-table figcaption, .wp-block-video figcaption){${capStyles.join('')}}`);
      }
    }

    return css.join('');
  }

  /**
   * Generate utility classes for colors, fonts, etc.
   */
  private generateUtilityClasses(themeJson: any): string {
    const css: string[] = [];
    const settings = themeJson.settings || {};

    // Color classes
    if (settings.color?.palette) {
      settings.color.palette.forEach((preset: any) => {
        css.push(`.has-${preset.slug}-color{color: var(--wp--preset--color--${preset.slug}) !important;}`);
        css.push(`.has-${preset.slug}-background-color{background-color: var(--wp--preset--color--${preset.slug}) !important;}`);
        css.push(`.has-${preset.slug}-border-color{border-color: var(--wp--preset--color--${preset.slug}) !important;}`);
      });
    }

    // Gradient classes
    if (settings.color?.gradients) {
      settings.color.gradients.forEach((preset: any) => {
        css.push(`.has-${preset.slug}-gradient-background{background: var(--wp--preset--gradient--${preset.slug}) !important;}`);
      });
    }

    // Font size classes
    if (settings.typography?.fontSizes) {
      settings.typography.fontSizes.forEach((preset: any) => {
        css.push(`.has-${preset.slug}-font-size{font-size: var(--wp--preset--font-size--${preset.slug}) !important;}`);
      });
    }

    // Font family classes
    if (settings.typography?.fontFamilies) {
      settings.typography.fontFamilies.forEach((preset: any) => {
        css.push(`.has-${preset.slug}-font-family{font-family: var(--wp--preset--font-family--${preset.slug}) !important;}`);
      });
    }

    return css.join('');
  }

  /**
   * Generate block-specific styles
   */
  private generateBlockStyles(themeJson: any): string {
    const css: string[] = [];
    const styles = themeJson.styles || {};

    if (styles.blocks) {
      Object.entries(styles.blocks).forEach(([blockName, blockStyles]: [string, any]) => {
        const selector = `:root :where(.wp-block-${blockName.replace('core/', '')})`;
        const blockCSS: string[] = [];

        // Block styling
        if (blockStyles.color?.text) blockCSS.push(`color: ${this.convertWordPressVar(blockStyles.color.text)};`);
        if (blockStyles.color?.background) blockCSS.push(`background-color: ${this.convertWordPressVar(blockStyles.color.background)};`);
        if (blockStyles.border) {
          if (blockStyles.border.color) blockCSS.push(`border-color: ${this.convertWordPressVar(blockStyles.border.color)};`);
          if (blockStyles.border.width) blockCSS.push(`border-width: ${blockStyles.border.width};`);
          if (blockStyles.border.style) blockCSS.push(`border-style: ${blockStyles.border.style};`);
        }
        if (blockStyles.typography?.fontSize) blockCSS.push(`font-size: ${this.convertWordPressVar(blockStyles.typography.fontSize)};`);
        if (blockStyles.typography?.fontWeight) blockCSS.push(`font-weight: ${blockStyles.typography.fontWeight};`);
        if (blockStyles.typography?.lineHeight) blockCSS.push(`line-height: ${blockStyles.typography.lineHeight};`);
        if (blockStyles.spacing?.margin) {
          const m = blockStyles.spacing.margin;
          if (m.top) blockCSS.push(`margin-top: ${this.convertWordPressVar(m.top)};`);
          if (m.right) blockCSS.push(`margin-right: ${this.convertWordPressVar(m.right)};`);
          if (m.bottom) blockCSS.push(`margin-bottom: ${this.convertWordPressVar(m.bottom)};`);
          if (m.left) blockCSS.push(`margin-left: ${this.convertWordPressVar(m.left)};`);
        }
        if (blockStyles.spacing?.padding) {
          const p = blockStyles.spacing.padding;
          if (p.top) blockCSS.push(`padding-top: ${this.convertWordPressVar(p.top)};`);
          if (p.right) blockCSS.push(`padding-right: ${this.convertWordPressVar(p.right)};`);
          if (p.bottom) blockCSS.push(`padding-bottom: ${this.convertWordPressVar(p.bottom)};`);
          if (p.left) blockCSS.push(`padding-left: ${this.convertWordPressVar(p.left)};`);
        }

        if (blockCSS.length > 0) {
          css.push(`${selector}{${blockCSS.join('')}}`);
        }

        // Block-specific layout styles
        if (blockStyles.spacing?.blockGap) {
          const gap = this.convertWordPressVar(blockStyles.spacing.blockGap);
          css.push(`:root :where(.wp-block-${blockName.replace('core/', '')}-is-layout-flow) > :first-child{margin-block-start: 0;}`);
          css.push(`:root :where(.wp-block-${blockName.replace('core/', '')}-is-layout-flow) > :last-child{margin-block-end: 0;}`);
          css.push(`:root :where(.wp-block-${blockName.replace('core/', '')}-is-layout-flow) > *{margin-block-start: ${gap};margin-block-end: 0;}`);
          css.push(`:root :where(.wp-block-${blockName.replace('core/', '')}-is-layout-constrained) > :first-child{margin-block-start: 0;}`);
          css.push(`:root :where(.wp-block-${blockName.replace('core/', '')}-is-layout-constrained) > :last-child{margin-block-end: 0;}`);
          css.push(`:root :where(.wp-block-${blockName.replace('core/', '')}-is-layout-constrained) > *{margin-block-start: ${gap};margin-block-end: 0;}`);
          css.push(`:root :where(.wp-block-${blockName.replace('core/', '')}-is-layout-flex){gap: ${gap};}`);
          css.push(`:root :where(.wp-block-${blockName.replace('core/', '')}-is-layout-grid){gap: ${gap};}`);
        }

        // Element states (hover, links, etc.)
        if (blockStyles.elements) {
          Object.entries(blockStyles.elements).forEach(([element, elemStyles]: [string, any]) => {
            const elemSelector = element === 'link' ? `${selector} a:where(:not(.wp-element-button))` : `${selector} ${element}`;
            const elemCSS: string[] = [];
            
            if (elemStyles.typography?.textDecoration) elemCSS.push(`text-decoration: ${elemStyles.typography.textDecoration};`);
            if (elemStyles.color?.text) elemCSS.push(`color: ${this.convertWordPressVar(elemStyles.color.text)};`);

            if (elemCSS.length > 0) {
              css.push(`${elemSelector}{${elemCSS.join('')}}`);
            }

            // Hover state
            if (elemStyles[':hover']) {
              const hoverCSS: string[] = [];
              if (elemStyles[':hover'].typography?.textDecoration) hoverCSS.push(`text-decoration: ${elemStyles[':hover'].typography.textDecoration};`);
              if (hoverCSS.length > 0) {
                css.push(`${elemSelector}:hover{${hoverCSS.join('')}}`);
              }
            }
          });
        }
      });
    }

    return css.join('');
  }
}
