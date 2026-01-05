import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

/**
 * PHP Parser Service
 * Extracts metadata and converts PHP code
 */
@Injectable()
export class PhpParserService {
  /**
   * Parse theme style.css header
   */
  parseThemeHeader(styleCssPath: string): any {
    const content = fs.readFileSync(styleCssPath, 'utf-8');
    const metadata: any = {};

    const extractField = (field: string) => {
      const regex = new RegExp(`${field}:\\s*(.+)`, 'i');
      const match = content.match(regex);
      return match ? match[1].trim() : null;
    };

    metadata.name = extractField('Theme Name');
    metadata.themeUri = extractField('Theme URI');
    metadata.author = extractField('Author');
    metadata.authorUri = extractField('Author URI');
    metadata.description = extractField('Description');
    metadata.version = extractField('Version');
    metadata.requiresPhp = extractField('Requires PHP');
    metadata.requiresWP = extractField('Requires at least');
    metadata.textDomain = extractField('Text Domain');
    
    const tagsField = extractField('Tags');
    metadata.tags = tagsField ? tagsField.split(',').map(t => t.trim()) : [];

    return metadata;
  }

  /**
   * Convert PHP function calls to TypeScript/JSX
   */
  convertPhpToTs(phpCode: string): string {
    let result = phpCode;

    // Normalize whitespace to make regex easier
    const normalized = result.replace(/\s+/g, ' ').trim();

    // Match printf with WordPress i18n - handle escaped quotes
    // Pattern: printf(esc_html_x('text with %s', ...), '<strong>' . esc_html_x('Brand', ...) . '</strong>')
    const printfPattern = /<\?php printf\([^)]*esc_html_x\s*\(\s*['"]([^'"]*(?:\\'|\\"|[^'"])*)['"]/;
    const brandPattern = /<strong>'\s*\.\s*esc_html_x\s*\(\s*['"]([^'"]*(?:\\'|\\"|[^'"])*)['"]/;
    
    const printfMatch = normalized.match(printfPattern);
    const brandMatch = normalized.match(brandPattern);

    if (printfMatch && brandMatch) {
      let template = printfMatch[1];
      let brandName = brandMatch[1];
      
      // Unescape PHP escaped characters
      template = template.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      brandName = brandName.replace(/\\'/g, "'").replace(/\\"/g, '"');
      
      // Replace %s placeholders with branded content
      result = template.replace(/%s/g, `<strong>${brandName}</strong>`);
      return result;
    }

    // Simpler printf without brand
    if (normalized.includes('printf')) {
      const simpleMatch = normalized.match(/esc_html_x\s*\(\s*['"]([^'"]*(?:\\'|\\"|[^'"])*)['"]/i);
      if (simpleMatch) {
        let text = simpleMatch[1];
        text = text.replace(/\\'/g, "'").replace(/\\"/g, '"');
        text = text.replace(/%s/g, 'Content');
        return text;
      }
    }

    // Convert esc_html_e()
    result = normalized.replace(
      /<\?php esc_html_e\(\s*['"]([^'"]+)['"]\s*,[^)]+\); \?>/g,
      (match, text) => text.replace(/\\'/g, "'").replace(/\\"/g, '"')
    );

    // Convert echo esc_html_x()
    result = result.replace(
      /<\?php echo esc_html_x\(\s*['"]([^'"]+)['"]\s*,[^)]+\); \?>/g,
      (match, text) => text.replace(/\\'/g, "'").replace(/\\"/g, '"')
    );

    // Convert echo esc_html__()
    result = result.replace(
      /<\?php echo esc_html__\(\s*['"]([^'"]+)['"]\s*,[^)]+\); \?>/g,
      (match, text) => text.replace(/\\'/g, "'").replace(/\\"/g, '"')
    );

    // Convert standalone esc_html__()
    result = result.replace(
      /esc_html__\(\s*['"]([^'"]+)['"]\s*,[^)]+\)/g,
      (match, text) => text.replace(/\\'/g, "'").replace(/\\"/g, '"')
    );

    // Convert wp_kses_post with _x() - extracts text and converts HTML entities
    // Pattern handles strings with escaped quotes and HTML tags
    result = result.replace(
      /<\?php echo wp_kses_post\(\s*_x\(\s*'([^']*(?:\\'[^']*)*)',\s*'[^']*(?:\\'[^']*)*',\s*'[^']*(?:\\'[^']*)*'\s*\)\s*\); \?>/g,
      (match, text) => {
        // Unescape and convert HTML entities
        return text
          .replace(/\\'/g, "'")
          .replace(/\\"/g, '"')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'");
      }
    );

    // Convert esc_url(get_template_directory_uri()) in echo statements
    result = result.replace(
      /<\?php echo esc_url\(\s*get_template_directory_uri\(\)\s*\); \?>/g,
      '__THEME_ASSETS__'
    );

    // Convert esc_url(get_template_directory_uri()) without echo (in attributes/URLs)
    result = result.replace(
      /<\?php esc_url\(\s*get_template_directory_uri\(\)\s*\); \?>/g,
      '__THEME_ASSETS__'
    );

    // Remove any remaining PHP tags
    result = result.replace(/<\?php[^?]*\?>/g, '');

    // Final cleanup
    result = result.trim();

    return result;
  }

  /**
   * Convert HTML attributes to JSX
   */
  convertHtmlToJsx(html: string): string {
    let result = html;

    // Convert class to className
    result = result.replace(/\sclass=/g, ' className=');

    // Convert for to htmlFor
    result = result.replace(/\sfor=/g, ' htmlFor=');

    // Convert style strings to style objects
    result = result.replace(/style="([^"]+)"/g, (match, styleStr) => {
      const styles = styleStr.split(';').filter(s => s.trim());
      const styleObj = styles.map(s => {
        const colonIndex = s.indexOf(':');
        if (colonIndex === -1) return '';
        const key = s.substring(0, colonIndex).trim();
        const value = s.substring(colonIndex + 1).trim();
        if (!key || !value) return '';
        // Convert kebab-case to camelCase
        const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        // Replace theme assets placeholder with relative path (./assets)
        if (value.includes('__THEME_ASSETS__')) {
          const processedValue = value.replace(/__THEME_ASSETS__/g, './assets');
          return `${camelKey}: '${processedValue}'`;
        }
        return `${camelKey}: '${value}'`;
      }).filter(s => s).join(', ');
      return styleObj ? `style={{${styleObj}}}` : '';
    });

    return result;
  }

  /**
   * Extract translatable strings
   */
  extractTranslations(content: string): Map<string, string> {
    const translations = new Map<string, string>();

    // Match esc_html_e('text', 'domain')
    const pattern1 = /esc_html_e\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g;
    let match;
    while ((match = pattern1.exec(content)) !== null) {
      translations.set(match[1], match[1]);
    }

    // Match esc_html_x('text', 'context', 'domain')
    const pattern2 = /esc_html_x\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = pattern2.exec(content)) !== null) {
      translations.set(match[1], match[1]);
    }

    return translations;
  }
}
