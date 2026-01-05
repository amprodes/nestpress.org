import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ParsedPattern } from '../interfaces/converter.interfaces';
import { BlockParserService } from './block-parser.service';

/**
 * Pattern Parser Service
 * Parses WordPress pattern PHP files
 */
@Injectable()
export class PatternParserService {
  private readonly logger = new Logger(PatternParserService.name);

  constructor(private readonly blockParser: BlockParserService) {}

  /**
   * Parse a pattern file
   */
  parsePattern(filePath: string): ParsedPattern | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const filename = path.basename(filePath, '.php');

      // Extract PHP doc comment metadata
      const metadata = this.extractPatternMetadata(content);

      // Extract block content (after ?>)
      const blockContent = this.extractBlockContent(content);

      // Parse blocks
      const blocks = this.blockParser.parseBlocks(blockContent);

      // Log query blocks with detailed structure for debugging
      blocks.forEach((b) => {
        if (b.blockName === 'core/query') {
          const postTemplate = b.innerBlocks.find(ib => ib.blockName === 'core/post-template');
          if (postTemplate) {
            const childCount = postTemplate.innerBlocks.reduce((sum, child) => sum + child.innerBlocks.length + 1, 0);
            this.logger.log(`📋 Query in ${filename}: post-template has ${postTemplate.innerBlocks.length} containers with ${childCount} total blocks`);
          }
        }
      });

      return {
        slug: metadata.slug || filename,
        title: metadata.title || this.titleFromFilename(filename),
        categories: metadata.categories || [],
        keywords: metadata.keywords || [],
        description: metadata.description || '',
        blockTypes: metadata.blockTypes,
        postTypes: metadata.postTypes,
        viewportWidth: metadata.viewportWidth,
        blocks,
        rawContent: blockContent,
      };
    } catch (error) {
      this.logger.error(`Failed to parse pattern ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract pattern metadata from PHP doc comment
   */
  private extractPatternMetadata(content: string): any {
    const metadata: any = {};

    // Extract Title
    const titleMatch = content.match(/\*\s+Title:\s*(.+)/);
    if (titleMatch) metadata.title = titleMatch[1].trim();

    // Extract Slug
    const slugMatch = content.match(/\*\s+Slug:\s*(.+)/);
    if (slugMatch) metadata.slug = slugMatch[1].trim();

    // Extract Categories
    const categoriesMatch = content.match(/\*\s+Categories:\s*(.+)/);
    if (categoriesMatch) {
      metadata.categories = categoriesMatch[1]
        .split(',')
        .map((c) => c.trim());
    }

    // Extract Keywords
    const keywordsMatch = content.match(/\*\s+Keywords:\s*(.+)/);
    if (keywordsMatch) {
      metadata.keywords = keywordsMatch[1]
        .split(',')
        .map((k) => k.trim());
    }

    // Extract Description
    const descriptionMatch = content.match(/\*\s+Description:\s*(.+)/);
    if (descriptionMatch) metadata.description = descriptionMatch[1].trim();

    // Extract Block Types
    const blockTypesMatch = content.match(/\*\s+Block Types:\s*(.+)/);
    if (blockTypesMatch) {
      metadata.blockTypes = blockTypesMatch[1]
        .split(',')
        .map((t) => t.trim());
    }

    // Extract Post Types
    const postTypesMatch = content.match(/\*\s+Post Types:\s*(.+)/);
    if (postTypesMatch) {
      metadata.postTypes = postTypesMatch[1]
        .split(',')
        .map((t) => t.trim());
    }

    // Extract Viewport Width
    const viewportMatch = content.match(/\*\s+Viewport width:\s*(\d+)/);
    if (viewportMatch) {
      metadata.viewportWidth = parseInt(viewportMatch[1], 10);
    }

    return metadata;
  }

  /**
   * Extract block content from PHP file
   */
  private extractBlockContent(content: string): string {
    // Find content after ?> or after the doc comment
    const phpCloseMatch = content.match(/\?>\s*\n([\s\S]+)/);
    if (phpCloseMatch) {
      return phpCloseMatch[1].trim();
    }

    // If no ?>, try to extract content after comment block
    const commentEndMatch = content.match(/\*\/\s*\n([\s\S]+)/);
    if (commentEndMatch) {
      return commentEndMatch[1].trim();
    }

    return content;
  }

  /**
   * Convert filename to title
   */
  private titleFromFilename(filename: string): string {
    return filename
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  /**
   * Parse all patterns in a directory
   */
  parsePatterns(patternsDir: string): ParsedPattern[] {
    const patterns: ParsedPattern[] = [];

    if (!fs.existsSync(patternsDir)) {
      return patterns;
    }

    const files = fs.readdirSync(patternsDir);

    for (const file of files) {
      if (file.endsWith('.php')) {
        const filePath = path.join(patternsDir, file);
        const pattern = this.parsePattern(filePath);
        if (pattern) {
          patterns.push(pattern);
        }
      }
    }

    this.logger.log(`Parsed ${patterns.length} patterns from ${patternsDir}`);
    return patterns;
  }
}
