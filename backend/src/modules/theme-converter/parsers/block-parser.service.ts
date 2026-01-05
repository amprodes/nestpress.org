import { Injectable, Logger } from '@nestjs/common';
import { WordPressBlock } from '../interfaces/converter.interfaces';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Block Parser Service
 * Parses WordPress Gutenberg block markup into structured data
 */
@Injectable()
export class BlockParserService {
  private readonly logger = new Logger(BlockParserService.name);
  private debugLog: string[] = [];

  /**
   * Parse WordPress block markup
   * Format: <!-- wp:blockname {"attr":"value"} -->content<!-- /wp:blockname -->
   */
  parseBlocks(content: string, sourceName: string = 'unknown'): WordPressBlock[] {
    this.debugLog = [];
    this.debugLog.push(`\n========== Parsing: ${sourceName} ==========`);
    const blocks: WordPressBlock[] = [];
    const lines = content.split('\n');
    let i = 0;

    while (i < lines.length) {
      const result = this.parseBlock(lines, i);
      if (result.block) {
        this.debugLog.push(`Root block found: ${result.block.blockName} with ${result.block.innerBlocks.length} inner blocks`);
        blocks.push(result.block);
      }
      i = result.nextIndex;
    }

    this.debugLog.push(`========== parseBlocks complete (${sourceName}): ${blocks.length} root blocks ==========\n`);
    
    // Write debug log to file
    const debugPath = path.join(process.cwd(), 'temp', 'parser-debug.log');
    try {
      fs.mkdirSync(path.dirname(debugPath), { recursive: true });
      fs.appendFileSync(debugPath, this.debugLog.join('\n'));
    } catch (e) {
      this.logger.error('Failed to write debug log');
    }

    return blocks;
  }

  private parseBlock(
    lines: string[],
    startIndex: number,
  ): { block: WordPressBlock | null; nextIndex: number } {
    const line = lines[startIndex]?.trim();

    if (!line || !line.startsWith('<!--')) {
      return { block: null, nextIndex: startIndex + 1 };
    }

    // Match block opening: <!-- wp:blockname {"attrs"} -->
    // Extract blockname first
    const blockNameMatch = line.match(/<!--\s+wp:([^\s{]+)/);
    if (!blockNameMatch) {
      return { block: null, nextIndex: startIndex + 1 };
    }

    // Check if self-closing (support both WordPress /-- > and XML-style />)
    const isSelfClosing = line.includes('/-->') || line.includes('/>');

    // Extract JSON attributes (handle nested braces)
    let attrs: Record<string, any> = {};
    const attrsStart = line.indexOf('{');
    const attrsEnd = line.lastIndexOf('}');
    
    if (attrsStart !== -1 && attrsEnd !== -1 && attrsEnd > attrsStart) {
      const attrsJson = line.substring(attrsStart, attrsEnd + 1);
      try {
        attrs = JSON.parse(attrsJson);
      } catch (e) {
        this.logger.warn(`Failed to parse block attrs for ${blockNameMatch[1]}: ${attrsJson.substring(0, 100)}`);
      }
    }

    const blockName = `core/${blockNameMatch[1]}`;

    // Log query block detection
    if (blockName === 'core/query') {
      this.logger.log(`📦 BLOCK PARSER: Found query block at line ${startIndex}`);
    }

    // Log block start
    this.debugLog.push(`\nParsing block at line ${startIndex}: ${blockNameMatch[1]}`);
    this.debugLog.push(`  Self-closing: ${isSelfClosing}`);

    if (isSelfClosing) {
      return {
        block: {
          blockName,
          attrs,
          innerHTML: '',
          innerContent: [],
          innerBlocks: [],
        },
        nextIndex: startIndex + 1,
      };
    }

    // Find matching closing tag
    const closingTag = `<!-- /wp:${blockNameMatch[1]} -->`;
    this.debugLog.push(`  Looking for closing tag: "${closingTag}"`);
    let innerHTML = '';
    const innerContent: string[] = [];
    const innerBlocks: WordPressBlock[] = [];
    let currentIndex = startIndex + 1;
    let depth = 1;

    while (currentIndex < lines.length && depth > 0) {
      const currentLine = lines[currentIndex];
      const trimmedLine = currentLine.trim();
      
      // Log every line being processed for main group only (to avoid spam)
      if (blockNameMatch[1] === 'group' && attrs?.tagName === 'main') {
        this.debugLog.push(`  [MAIN Line ${currentIndex}] "${trimmedLine.substring(0, 60)}${trimmedLine.length > 60 ? '...' : ''}"`);
      }

      // Check for closing tag FIRST (before nested block check)
      if (trimmedLine === closingTag.trim()) {
        this.debugLog.push(`  [Line ${currentIndex}] Found closing tag for ${blockNameMatch[1]}, depth: ${depth} -> ${depth - 1}`);
        depth--;
        if (depth === 0) {
          this.debugLog.push(`  [Line ${currentIndex}] Depth is 0, breaking parse loop for ${blockNameMatch[1]}`);
          this.debugLog.push(`  ${blockNameMatch[1]} has ${innerBlocks.length} inner blocks`);
          break;
        }
        innerHTML += currentLine + '\n';
        innerContent.push(currentLine);
        currentIndex++;
        continue;
      }

      // Check for nested blocks (any type) - includes self-closing
      const nestedBlockMatch = currentLine.match(/<!--\s+wp:([^\s{]+)/);
      if (nestedBlockMatch) {
        this.debugLog.push(`  [Line ${currentIndex}] Found nested block: ${nestedBlockMatch[1]} (parent: ${blockNameMatch[1]}, depth: ${depth})`);
        const nestedResult = this.parseBlock(lines, currentIndex);
        if (nestedResult.block) {
          this.debugLog.push(`  Adding ${nestedResult.block.blockName} to innerBlocks of ${blockName}`);
          innerBlocks.push(nestedResult.block);
          currentIndex = nestedResult.nextIndex;
          this.debugLog.push(`  After parsing nested block, currentIndex is now ${currentIndex}`);
          continue;
        }
      }

      // Accumulate HTML content (non-block lines)
      innerHTML += currentLine + '\n';
      innerContent.push(currentLine);
      currentIndex++;
    }

    return {
      block: {
        blockName,
        attrs,
        innerHTML: innerHTML.trim(),
        innerContent,
        innerBlocks,
      },
      nextIndex: currentIndex + 1,
    };
  }

  /**
   * Extract block content without block comments
   */
  extractInnerHTML(content: string): string {
    // Remove block comments
    return content
      .replace(/<!--\s+wp:[^>]+-->/g, '')
      .replace(/<!--\s+\/wp:[^>]+-->/g, '')
      .trim();
  }

  /**
   * Get block attribute value
   */
  getBlockAttr(block: WordPressBlock, key: string, defaultValue: any = null): any {
    return block.attrs[key] ?? defaultValue;
  }

  /**
   * Check if block is of specific type
   */
  isBlockType(block: WordPressBlock, type: string): boolean {
    const fullType = type.startsWith('core/') ? type : `core/${type}`;
    return block.blockName === fullType;
  }

  /**
   * Find all blocks of a specific type
   */
  findBlocksByType(blocks: WordPressBlock[], type: string): WordPressBlock[] {
    const results: WordPressBlock[] = [];
    
    for (const block of blocks) {
      if (this.isBlockType(block, type)) {
        results.push(block);
      }
      if (block.innerBlocks.length > 0) {
        results.push(...this.findBlocksByType(block.innerBlocks, type));
      }
    }

    return results;
  }
}
