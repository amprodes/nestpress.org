/**
 * Generate WordPress-style CSS from theme.json
 * WordPress generates extensive CSS from theme.json settings
 */

/**
 * Convert WordPress theme.json shorthand values to proper CSS
 * e.g., "var:preset|color|base" -> "var(--wp--preset--color--base)"
 * e.g., "var:preset|spacing|50" -> "var(--wp--preset--spacing--50)"
 */
function convertWPShorthand(value: string): string {
  if (!value || typeof value !== 'string') return value;
  
  // Convert "var:preset|type|slug" to "var(--wp--preset--type--slug)"
  if (value.startsWith('var:preset|')) {
    const parts = value.replace('var:preset|', '').split('|');
    if (parts.length === 2) {
      return `var(--wp--preset--${parts[0]}--${parts[1]})`;
    }
  }
  
  // Convert "var:custom|name" to "var(--wp--custom--name)"
  if (value.startsWith('var:custom|')) {
    const name = value.replace('var:custom|', '').replace(/\|/g, '--');
    return `var(--wp--custom--${name})`;
  }
  
  // Convert "var:style|name" to "var(--wp--style--name)"
  if (value.startsWith('var:style|')) {
    const name = value.replace('var:style|', '').replace(/\|/g, '--');
    return `var(--wp--style--${name})`;
  }
  
  return value;
}

export function generateWordPressThemeCSS(themeJson: any, themePath?: string): string {
  const css: string[] = [];
  
  // Generate @font-face declarations from fontFamilies
  if (themeJson.settings?.typography?.fontFamilies) {
    themeJson.settings.typography.fontFamilies.forEach((family: any) => {
      if (family.fontFace) {
        family.fontFace.forEach((face: any) => {
          const fontFaceCSS: string[] = ['@font-face {'];
          fontFaceCSS.push(`  font-family: ${face.fontFamily || family.fontFamily};`);
          fontFaceCSS.push(`  font-style: ${face.fontStyle || 'normal'};`);
          fontFaceCSS.push(`  font-weight: ${face.fontWeight || '400'};`);
          fontFaceCSS.push(`  font-display: fallback;`);
          
          // Convert file: paths to proper URLs
          if (face.src) {
            const sources = Array.isArray(face.src) ? face.src : [face.src];
            const srcValues = sources.map((src: string) => {
              // Convert "file:./assets/fonts/..." to proper theme path
              const cleanSrc = src.replace('file:./', themePath ? `${themePath}/` : '/themes/twenty-twenty-five/');
              return `url('${cleanSrc}') format('woff2')`;
            });
            fontFaceCSS.push(`  src: ${srcValues.join(', ')};`);
          }
          
          fontFaceCSS.push('}');
          css.push(fontFaceCSS.join('\n'));
          css.push('');
        });
      }
    });
  }
  
  // Root CSS variables
  const rootVars: string[] = [];
  
  if (themeJson.settings) {
    const { color, spacing, typography, layout } = themeJson.settings;
    
    // Color presets
    if (color?.palette) {
      color.palette.forEach((preset: any) => {
        rootVars.push(`  --wp--preset--color--${preset.slug}: ${preset.color};`);
      });
    }
    
    // Spacing presets
    if (spacing?.spacingSizes) {
      spacing.spacingSizes.forEach((preset: any) => {
        rootVars.push(`  --wp--preset--spacing--${preset.slug}: ${preset.size};`);
      });
    }
    
    // Font size presets - with fluid typography support (WordPress clamp())
    if (typography?.fontSizes) {
      typography.fontSizes.forEach((preset: any) => {
        let size = preset.size;
        
        // Handle fluid typography - WordPress converts to clamp()
        if (preset.fluid && typeof preset.fluid === 'object' && preset.fluid.min && preset.fluid.max) {
          // WordPress formula: clamp(min, min + ((1vw - 0.2rem) * scaleFactor), max)
          // Simplified: clamp(min, calculated, max)
          const min = preset.fluid.min;
          const max = preset.fluid.max;
          
          // Parse values to calculate scale factor
          const minVal = parseFloat(min);
          const maxVal = parseFloat(max);
          const diff = maxVal - minVal;
          
          // WordPress uses a complex formula, but this approximation works well
          // Scale factor based on difference: (diff / 0.64) where 0.64rem = typical fluid range
          const scaleFactor = (diff / 0.64).toFixed(3);
          
          size = `clamp(${min}, ${min} + ((1vw - 0.2rem) * ${scaleFactor}), ${max})`;
        }
        
        rootVars.push(`  --wp--preset--font-size--${preset.slug}: ${size};`);
      });
    }
    
    // Font family presets
    if (typography?.fontFamilies) {
      typography.fontFamilies.forEach((preset: any) => {
        rootVars.push(`  --wp--preset--font-family--${preset.slug}: ${preset.fontFamily};`);
      });
    }
    
    // Layout variables
    if (layout) {
      if (layout.contentSize) rootVars.push(`  --wp--style--global--content-size: ${layout.contentSize};`);
      if (layout.wideSize) rootVars.push(`  --wp--style--global--wide-size: ${layout.wideSize};`);
    }
  }
  
  if (rootVars.length > 0) {
    css.push(':root {');
    css.push(...rootVars);
    // Add root padding variables for WordPress alignments
    css.push('  --wp--style--root--padding-top: 0px;');
    css.push('  --wp--style--root--padding-right: var(--wp--preset--spacing--50);');
    css.push('  --wp--style--root--padding-bottom: 0px;');
    css.push('  --wp--style--root--padding-left: var(--wp--preset--spacing--50);');
    // Block gap for flow layout - WordPress default
    css.push('  --wp--style--block-gap: 1.2rem;');
    css.push('}');
    css.push('');
  }
  
  // Body and global styles from theme.json styles section
  if (themeJson.styles) {
    const styles = themeJson.styles;
    
    // Body element styles - convert WordPress shorthand values
    const bodyStyles: string[] = [];
    if (styles.color?.background) bodyStyles.push(`  background-color: ${convertWPShorthand(styles.color.background)};`);
    if (styles.color?.text) bodyStyles.push(`  color: ${convertWPShorthand(styles.color.text)};`);
    if (styles.typography?.fontFamily) bodyStyles.push(`  font-family: ${convertWPShorthand(styles.typography.fontFamily)};`);
    if (styles.typography?.fontSize) bodyStyles.push(`  font-size: ${convertWPShorthand(styles.typography.fontSize)};`);
    if (styles.typography?.fontWeight) bodyStyles.push(`  font-weight: ${styles.typography.fontWeight};`);
    if (styles.typography?.letterSpacing) bodyStyles.push(`  letter-spacing: ${styles.typography.letterSpacing};`);
    if (styles.typography?.lineHeight) bodyStyles.push(`  line-height: ${styles.typography.lineHeight};`);
    // Add margin reset
    bodyStyles.push(`  margin: 0;`);
    
    if (bodyStyles.length > 0) {
      css.push('body {');
      css.push(...bodyStyles);
      css.push('}');
      css.push('');
    }
    
    // Element styles (headings, links, buttons, etc.)
    if (styles.elements) {
      Object.entries(styles.elements).forEach(([element, elementStyles]: [string, any]) => {
        const selector = element === 'link' ? 'a:where(:not(.wp-element-button))' : element;
        const elemCSS: string[] = [];
        
        if (elementStyles.color?.text) elemCSS.push(`  color: ${convertWPShorthand(elementStyles.color.text)};`);
        if (elementStyles.color?.background) elemCSS.push(`  background-color: ${convertWPShorthand(elementStyles.color.background)};`);
        if (elementStyles.typography?.fontFamily) elemCSS.push(`  font-family: ${convertWPShorthand(elementStyles.typography.fontFamily)};`);
        if (elementStyles.typography?.fontSize) elemCSS.push(`  font-size: ${convertWPShorthand(elementStyles.typography.fontSize)};`);
        if (elementStyles.typography?.fontWeight) elemCSS.push(`  font-weight: ${elementStyles.typography.fontWeight};`);
        if (elementStyles.typography?.letterSpacing) elemCSS.push(`  letter-spacing: ${elementStyles.typography.letterSpacing};`);
        if (elementStyles.typography?.lineHeight) elemCSS.push(`  line-height: ${elementStyles.typography.lineHeight};`);
        if (elementStyles.typography?.textDecoration) elemCSS.push(`  text-decoration: ${elementStyles.typography.textDecoration};`);
        
        if (elemCSS.length > 0) {
          css.push(`${selector} {`);
          css.push(...elemCSS);
          css.push('}');
          css.push('');
        }
      });
    }
    
    // Generate heading styles from theme.json (h1-h6)
    css.push(`/* Heading styles from theme.json */`);
    css.push(`h1, h2, h3, h4, h5, h6 {`);
    css.push(`  font-weight: 400;`);
    css.push(`  letter-spacing: -0.1px;`);
    css.push(`  line-height: 1.125;`);
    css.push(`}`);
    css.push('');
    
    // Individual heading sizes
    css.push(`h1 { font-size: var(--wp--preset--font-size--xx-large); }`);
    css.push(`h2 { font-size: var(--wp--preset--font-size--x-large); }`);
    css.push(`h3 { font-size: var(--wp--preset--font-size--large); }`);
    css.push(`h4 { font-size: var(--wp--preset--font-size--medium); }`);
    css.push(`h5 { font-size: var(--wp--preset--font-size--small); letter-spacing: 0.5px; }`);
    css.push(`h6 { font-size: var(--wp--preset--font-size--small); font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; }`);
    css.push('');
    
    // Link styles (WordPress style)
    css.push(`a:where(:not(.wp-element-button)) {`);
    css.push(`  color: currentColor;`);
    css.push(`  text-decoration: underline;`);
    css.push(`  text-decoration-thickness: 1px !important;`);
    css.push(`  text-underline-offset: 0.1em;`);
    css.push(`}`);
    css.push('');
    css.push(`:root :where(a:where(:not(.wp-element-button)):hover) {`);
    css.push(`  text-decoration: none;`);
    css.push(`}`);
    css.push('');
    
    // Block styles
    if (styles.blocks) {
      Object.entries(styles.blocks).forEach(([blockName, blockStyles]: [string, any]) => {
        const className = `.wp-block-${blockName.replace('core/', '')}`;
        const blockCSS: string[] = [];
        
        if (blockStyles.color?.text) blockCSS.push(`  color: ${convertWPShorthand(blockStyles.color.text)};`);
        if (blockStyles.color?.background) blockCSS.push(`  background-color: ${convertWPShorthand(blockStyles.color.background)};`);
        if (blockStyles.spacing?.padding) {
          const p = blockStyles.spacing.padding;
          if (p.top) blockCSS.push(`  padding-top: ${convertWPShorthand(p.top)};`);
          if (p.right) blockCSS.push(`  padding-right: ${convertWPShorthand(p.right)};`);
          if (p.bottom) blockCSS.push(`  padding-bottom: ${convertWPShorthand(p.bottom)};`);
          if (p.left) blockCSS.push(`  padding-left: ${convertWPShorthand(p.left)};`);
        }
        
        if (blockCSS.length > 0) {
          css.push(`${className} {`);
          css.push(...blockCSS);
          css.push('}');
          css.push('');
        }
      });
    }
  }
  
  // Essential WordPress block layout CSS - this should match WordPress output
  css.push(`
/* ========================================
   WORDPRESS LAYOUT CLASSES
   Generated dynamically from theme.json
   ======================================== */

/* Skip link for accessibility (WordPress-style) */
.skip-link.screen-reader-text {
  border: 0;
  clip: rect(1px, 1px, 1px, 1px);
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
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

/* Site blocks container */
.wp-site-blocks {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: var(--wp--style--root--padding-top);
  padding-bottom: var(--wp--style--root--padding-bottom);
}

.wp-site-blocks > * {
  margin-block-start: 0;
  margin-block-end: 0;
}

/* Global padding aware alignments - WordPress Core */
.has-global-padding {
  padding-right: var(--wp--style--root--padding-right);
  padding-left: var(--wp--style--root--padding-left);
}

.has-global-padding > .alignfull {
  margin-right: calc(var(--wp--style--root--padding-right) * -1);
  margin-left: calc(var(--wp--style--root--padding-left) * -1);
}

.has-global-padding :where(:not(.alignfull.is-layout-flow) > .has-global-padding:not(.wp-block-block, .alignfull)) {
  padding-right: 0;
  padding-left: 0;
}

.has-global-padding.has-global-padding > .alignfull:where(:not(.has-global-padding):not(.is-layout-flex):not(.is-layout-grid)) > .has-global-padding {
  padding-right: 0;
  padding-left: 0;
}

/* Flow layout - WordPress Core */
.is-layout-flow > * {
  margin-block-start: 0;
  margin-block-end: 0;
}

.is-layout-flow > * + * {
  margin-block-start: var(--wp--style--block-gap, 1.2rem);
}

:where(.is-layout-flow) > :first-child {
  margin-block-start: 0;
}

:where(.is-layout-flow) > :last-child {
  margin-block-end: 0;
}

/* Constrained layout - WordPress Core exact match */
.is-layout-constrained {
  /* NOTE: Do NOT set max-width here - WordPress applies it contextually */
}

.is-layout-constrained > :where(:not(.alignleft):not(.alignright):not(.alignfull)) {
  max-width: var(--wp--style--global--content-size);
  margin-left: auto !important;
  margin-right: auto !important;
}

.is-layout-constrained > .alignwide {
  max-width: var(--wp--style--global--wide-size);
  margin-left: auto !important;
  margin-right: auto !important;
}

.is-layout-constrained > .alignfull {
  max-width: none;
}

:where(.is-layout-constrained) > :first-child {
  margin-block-start: 0;
}

:where(.is-layout-constrained) > :last-child {
  margin-block-end: 0;
}

/* Flex layout */
.is-layout-flex {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5em;
}

.is-layout-flex > * {
  margin: 0;
}

.is-layout-flex.is-content-justification-space-between {
  justify-content: space-between;
}

.is-layout-flex.is-content-justification-right {
  justify-content: flex-end;
}

.is-layout-flex.is-content-justification-center {
  justify-content: center;
}

.is-layout-flex.is-nowrap {
  flex-wrap: nowrap;
}

/* Vertical alignment for flex */
.is-layout-flex.is-vertical-align-top,
.wp-container-core-group-is-layout-flex[class*="is-vertical-align-top"] {
  align-items: flex-start;
}

.is-layout-flex.is-vertical-align-center {
  align-items: center;
}

.is-layout-flex.is-vertical-align-bottom {
  align-items: flex-end;
}

/* Alignment classes */
.alignfull {
  width: 100%;
  max-width: none;
}

/* Inside flow layout, alignfull should take full width */
.is-layout-flow > .alignfull {
  width: 100%;
  max-width: none;
}

.is-layout-flow > .alignwide {
  max-width: var(--wp--style--global--wide-size, 1200px);
  margin-left: auto;
  margin-right: auto;
}

.alignwide {
  width: 100%;
  max-width: var(--wp--style--global--wide-size, 1200px);
  margin-left: auto;
  margin-right: auto;
}

.alignwide {
  width: 100%;
  max-width: var(--wp--style--global--wide-size, 1200px);
  margin-left: auto;
  margin-right: auto;
}

.wp-site-blocks > .alignfull {
  margin-left: 0;
  margin-right: 0;
}

.wp-site-blocks > .alignleft {
  float: left;
  margin-right: 2em;
}

.wp-site-blocks > .alignright {
  float: right;
  margin-left: 2em;
}

.wp-site-blocks > .aligncenter {
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
}

/* ========================================
   WORDPRESS CORE BLOCK CSS
   Individual block styles matching WordPress Core
   ======================================== */

/* Site Title Block */
.wp-block-site-title {
  box-sizing: border-box;
}

.wp-block-site-title :where(a) {
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  font-style: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  text-decoration: inherit;
}

/* Page List Block (within Navigation) */
.wp-block-navigation .wp-block-page-list {
  align-items: var(--navigation-layout-align, initial);
  background-color: inherit;
  display: flex;
  flex-direction: var(--navigation-layout-direction, initial);
  flex-wrap: var(--navigation-layout-wrap, wrap);
  justify-content: var(--navigation-layout-justify, initial);
}

.wp-block-navigation .wp-block-navigation-item {
  background-color: inherit;
}

.wp-block-page-list {
  box-sizing: border-box;
}

/* Navigation Link Block */
.wp-block-navigation .wp-block-navigation-item__label {
  overflow-wrap: break-word;
}

.wp-block-navigation .wp-block-navigation-item__description {
  display: none;
}

/* Post Title Block */
.wp-block-post-title {
  box-sizing: border-box;
  word-break: break-word;
}

.wp-block-post-title :where(a) {
  display: inline-block;
  font-family: inherit;
  font-size: inherit;
  font-style: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  text-decoration: inherit;
}

/* Paragraph Block */
.is-small-text {
  font-size: 0.875em;
}

.is-regular-text {
  font-size: 1em;
}

.is-large-text {
  font-size: 2.25em;
}

.is-larger-text {
  font-size: 3em;
}

.has-drop-cap:not(:focus):first-letter {
  float: left;
  font-size: 8.4em;
  font-style: normal;
  font-weight: 100;
  line-height: 0.68;
  margin: 0.05em 0.1em 0 0;
  text-transform: uppercase;
}

body.rtl .has-drop-cap:not(:focus):first-letter {
  float: none;
  margin-left: 0.1em;
}

p.has-drop-cap.has-background {
  overflow: hidden;
}

:root :where(p.has-background) {
  padding: 1.25em 2.375em;
}

:where(p.has-text-color:not(.has-link-color)) a {
  color: inherit;
}

/* Quote Block */
.wp-block-quote {
  box-sizing: border-box;
  overflow-wrap: break-word;
}

.wp-block-quote.is-large:where(:not(.is-style-plain)),
.wp-block-quote.is-style-large:where(:not(.is-style-plain)) {
  margin-bottom: 1em;
  padding: 0 1em;
}

.wp-block-quote.is-large:where(:not(.is-style-plain)) p,
.wp-block-quote.is-style-large:where(:not(.is-style-plain)) p {
  font-size: 1.5em;
  font-style: italic;
  line-height: 1.6;
}

.wp-block-quote.is-large:where(:not(.is-style-plain)) cite,
.wp-block-quote.is-large:where(:not(.is-style-plain)) footer,
.wp-block-quote.is-style-large:where(:not(.is-style-plain)) cite,
.wp-block-quote.is-style-large:where(:not(.is-style-plain)) footer {
  font-size: 1.125em;
  text-align: right;
}

.wp-block-quote > cite {
  display: block;
}

/* Post Content Block */
.wp-block-post-content {
  display: flow-root;
}

/* Spacer Block */
.wp-block-spacer {
  clear: both;
}

/* Columns Block */
.wp-block-columns {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap !important;
}

@media (min-width: 782px) {
  .wp-block-columns {
    flex-wrap: nowrap !important;
  }
}

.wp-block-columns {
  align-items: normal !important;
}

.wp-block-columns.are-vertically-aligned-top {
  align-items: flex-start;
}

.wp-block-columns.are-vertically-aligned-center {
  align-items: center;
}

.wp-block-columns.are-vertically-aligned-bottom {
  align-items: flex-end;
}

@media (max-width: 781px) {
  .wp-block-columns:not(.is-not-stacked-on-mobile) > .wp-block-column {
    flex-basis: 100% !important;
  }
}

@media (min-width: 782px) {
  .wp-block-columns:not(.is-not-stacked-on-mobile) > .wp-block-column {
    flex-basis: 0;
    flex-grow: 1;
  }
  
  .wp-block-columns:not(.is-not-stacked-on-mobile) > .wp-block-column[style*=flex-basis] {
    flex-grow: 0;
  }
}

.wp-block-columns.is-not-stacked-on-mobile {
  flex-wrap: nowrap !important;
}

.wp-block-columns.is-not-stacked-on-mobile > .wp-block-column {
  flex-basis: 0;
  flex-grow: 1;
}

.wp-block-columns.is-not-stacked-on-mobile > .wp-block-column[style*=flex-basis] {
  flex-grow: 0;
}

:where(.wp-block-columns) {
  margin-bottom: 1.75em;
}

:where(.wp-block-columns.has-background) {
  padding: 1.25em 2.375em;
}

.wp-block-column {
  flex-grow: 1;
  min-width: 0;
  overflow-wrap: break-word;
  word-break: break-word;
}

.wp-block-column.is-vertically-aligned-top {
  align-self: flex-start;
}

.wp-block-column.is-vertically-aligned-center {
  align-self: center;
}

.wp-block-column.is-vertically-aligned-bottom {
  align-self: flex-end;
}

.wp-block-column.is-vertically-aligned-stretch {
  align-self: stretch;
}

.wp-block-column.is-vertically-aligned-bottom,
.wp-block-column.is-vertically-aligned-center,
.wp-block-column.is-vertically-aligned-top {
  width: 100%;
}

/* ========================================
   TEMPLATE PARTS
   ======================================== */

header.wp-block-template-part {
  width: 100%;
}

footer.wp-block-template-part {
  width: 100%;
  margin-top: auto;
}

main.wp-block-group {
  flex: 1;
}

/* ========================================
   CUSTOM BLOCK STYLES
   ======================================== */

/* Group block - WordPress Core */
.wp-block-group {
  box-sizing: border-box;
}

:where(.wp-block-group.has-background) {
  padding: var(--wp--preset--spacing--50, 1.25rem);
}

/* Site title */
.wp-block-site-title {
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.wp-block-site-title a {
  text-decoration: none;
  color: inherit;
}

.wp-block-site-title a:hover {
  text-decoration: underline;
}

/* Site tagline */
.wp-block-site-tagline {
  margin: 0;
}

/* Site logo */
.wp-block-site-logo {
  line-height: 0;
}

.wp-block-site-logo img {
  max-width: 100%;
  height: auto;
}

/* Navigation */
.wp-block-navigation {
  font-weight: 500;
}

.wp-block-navigation.is-layout-flex {
  gap: var(--wp--preset--spacing--40, 1rem);
}

.wp-block-navigation__container {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--wp--preset--spacing--20, 0.5rem);
}

.wp-block-navigation__container.is-vertical {
  flex-direction: column;
  align-items: flex-start;
}

.wp-block-navigation.is-vertical {
  --navigation-layout-direction: column;
  --navigation-layout-justify: initial;
  --navigation-layout-align: flex-start;
}

.wp-block-navigation.is-vertical .wp-block-navigation__container {
  flex-direction: column;
  align-items: flex-start;
}

.wp-block-navigation-item {
  display: flex;
  align-items: center;
}

.wp-block-navigation-item__content {
  display: inline-block;
  text-decoration: none;
  color: inherit;
  padding: 0.5em 0;
}

.wp-block-navigation-item__content:hover {
  text-decoration: underline;
}

.wp-block-navigation-item__label {
  /* Label styles if needed */
}

/* Post title */
.wp-block-post-title {
  margin: 0;
  font-weight: 400;
  line-height: 1.1;
}

/* Post content */
.wp-block-post-content {
  line-height: 1.75;
}

/* Columns */
.wp-block-columns {
  display: flex;
  flex-wrap: wrap !important;
  gap: var(--wp--preset--spacing--50, 1rem);
  box-sizing: border-box;
  align-items: normal !important;
}

@media (min-width: 782px) {
  .wp-block-columns {
    flex-wrap: nowrap !important;
  }
  
  .wp-block-columns:not(.is-not-stacked-on-mobile) > .wp-block-column {
    flex-basis: 0;
    flex-grow: 1;
  }
  
  .wp-block-columns:not(.is-not-stacked-on-mobile) > .wp-block-column[style*="flex-basis"] {
    flex-grow: 0;
  }
}

@media (max-width: 781px) {
  .wp-block-columns:not(.is-not-stacked-on-mobile) > .wp-block-column {
    flex-basis: 100% !important;
  }
}

.wp-block-column {
  flex-grow: 1;
  min-width: 0;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* Spacer */
.wp-block-spacer {
  margin: 0 !important;
}

/* Paragraph */
.wp-block-paragraph {
  margin-top: 0;
  margin-bottom: 0;
}

/* Featured image */
.wp-block-post-featured-image {
  margin: 0;
}

.wp-block-post-featured-image img {
  width: 100%;
  height: auto;
  display: block;
}

/* Font size presets */
.has-small-font-size {
  font-size: var(--wp--preset--font-size--small, 0.875rem) !important;
}

.has-medium-font-size {
  font-size: var(--wp--preset--font-size--medium, 1rem) !important;
}

.has-large-font-size {
  font-size: var(--wp--preset--font-size--large, 1.75rem) !important;
}

.has-x-large-font-size {
  font-size: var(--wp--preset--font-size--x-large, 2.25rem) !important;
}

/* ========================================
   RESPONSIVE
   ======================================== */

@media (max-width: 781px) {
  .wp-block-columns:not(.is-not-stacked-on-mobile) {
    flex-direction: column;
  }
  
  .wp-block-columns:not(.is-not-stacked-on-mobile) > .wp-block-column {
    flex-basis: 100% !important;
  }
}

/* ========================================
   TAILWIND CSS OVERRIDE
   Force reset all Tailwind variables
   ======================================== */
:root {
  --tw-border-spacing-x: 0 !important;
  --tw-border-spacing-y: 0 !important;
  --tw-translate-x: 0 !important;
  --tw-translate-y: 0 !important;
  --tw-rotate: 0 !important;
  --tw-skew-x: 0 !important;
  --tw-skew-y: 0 !important;
  --tw-scale-x: 1 !important;
  --tw-scale-y: 1 !important;
  --tw-ring-offset-shadow: 0 0 #0000 !important;
  --tw-ring-shadow: 0 0 #0000 !important;
  --tw-shadow: 0 0 #0000 !important;
  --tw-shadow-colored: 0 0 #0000 !important;
}

/* Hide pattern placeholders */
.wp-block-pattern {
  display: contents;
}
`);
  
  return css.join('\\n');
}
