/**
 * CSS Consolidator - Smart CSS merging and deduplication
 * 
 * Features:
 * - Removes duplicate CSS rules
 * - Preserves media queries and @-rules
 * - Maintains specificity order
 * - Minifies output
 * - Creates consolidated bundles
 * - AI-powered syntax validation and fixing
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ConsolidatedCSS {
  main: string;
  vendor?: string;
  critical?: string;
}

export class CSSConsolidator {
  private api: any;
  private genai: any;
  private model: any;

  constructor(api: any) {
    this.api = api;
  }

  /**
   * Initialize AI model for CSS validation
   */
  private async initAI(): Promise<void> {
    if (this.model) return; // Already initialized

    try {
      // Get AI credentials from database via SystemConfigService (same as AINestPressifier)
      let apiKey: string | undefined;
      let provider: string = 'gemini';

      if (this.api.systemConfigService) {
        const credentials = await this.api.systemConfigService.getAICredentials();
        if (credentials) {
          apiKey = credentials.apiKey;
          provider = credentials.provider;
          this.api.log(`✓ Loaded AI credentials from database: ${provider}`);
        }
      }
      
      if (!apiKey) {
        this.api.log('⚠ No AI API key found. CSS validation will use basic fixes only');
        this.model = null;
        return;
      }

      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      this.genai = new GoogleGenerativeAI(apiKey);
      this.model = this.genai.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: 0.1, // Low temperature for precise syntax fixing
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        },
      });

      this.api.log('✓ AI CSS validator initialized (Gemini 2.0 Flash)');
    } catch (error) {
      this.api.log(`⚠ AI validator unavailable: ${error.message}`);
      this.model = null;
    }
  }

  /**
   * Consolidate multiple CSS files into optimized bundles
   */
  async consolidate(stylesheets: any[], outputDir: string): Promise<string[]> {
    this.api.log('[CSSConsolidator] Starting CSS consolidation...');

    if (stylesheets.length === 0) {
      this.api.log('[CSSConsolidator] No stylesheets to consolidate');
      return [];
    }

    // Separate CSS by type
    const categorized = this.categorizeStylesheets(stylesheets);
    
    // Deduplicate and merge
    const mainCSS = this.deduplicateAndMerge(categorized.custom);
    const vendorCSS = categorized.vendor.length > 0 
      ? this.deduplicateAndMerge(categorized.vendor)
      : null;

    // Write consolidated files
    const results: string[] = [];

    // Main CSS (theme-specific styles)
    if (mainCSS) {
      const mainPath = path.join(outputDir, 'css', 'main.css');
      let mainContent = this.addHeader('Theme Styles', mainCSS);
      
      // Validate and fix CSS syntax
      const validationResult = this.validateCSS(mainContent);
      if (!validationResult.valid) {
        this.api.log(`⚠ CSS validation found ${validationResult.errors.length} errors in main.css`);
        mainContent = await this.fixCSSErrors(mainContent, validationResult.errors);
      }
      
      fs.writeFileSync(mainPath, mainContent);
      results.push('assets/css/main.css');
      this.api.log(`✓ Created main.css (${(mainContent.length / 1024).toFixed(1)} KB)`);
    }

    // Vendor CSS (external libraries)
    if (vendorCSS) {
      const vendorPath = path.join(outputDir, 'css', 'vendor.css');
      let vendorContent = this.addHeader('Vendor/Library Styles', vendorCSS);
      
      // Validate and fix CSS syntax
      const validationResult = this.validateCSS(vendorContent);
      if (!validationResult.valid) {
        this.api.log(`⚠ CSS validation found ${validationResult.errors.length} errors in vendor.css`);
        vendorContent =  await this.fixCSSErrors(vendorContent, validationResult.errors);
      }
      
      fs.writeFileSync(vendorPath, vendorContent);
      results.push('assets/css/vendor.css');
      this.api.log(`✓ Created vendor.css (${(vendorContent.length / 1024).toFixed(1)} KB)`);
    }

    this.api.log(`[CSSConsolidator] Consolidated ${stylesheets.length} files into ${results.length} optimized bundle(s)`);
    
    return results;
  }

  /**
   * Categorize stylesheets by type (vendor vs custom)
   */
  private categorizeStylesheets(stylesheets: any[]): { vendor: string[]; custom: string[] } {
    const vendor: string[] = [];
    const custom: string[] = [];

    for (const sheet of stylesheets) {
      const isVendor = 
        sheet.originalUrl.includes('cdn') ||
        sheet.originalUrl.includes('googleapis') ||
        sheet.originalUrl.includes('bootstrap') ||
        sheet.originalUrl.includes('fontawesome') ||
        sheet.originalUrl.includes('jquery') ||
        sheet.originalUrl.includes('normalize');

      if (isVendor) {
        vendor.push(sheet.content);
      } else {
        custom.push(sheet.content);
      }
    }

    return { vendor, custom };
  }

  /**
   * Deduplicate and merge CSS content
   */
  private deduplicateAndMerge(cssArray: string[]): string {
    if (cssArray.length === 0) return '';

    const seenRules = new Set<string>();
    const mediaQueries = new Map<string, Set<string>>();
    const keyframes = new Map<string, string>();
    const regularRules: string[] = [];
    const importRules: string[] = [];

    for (const css of cssArray) {
      this.processCSS(css, seenRules, mediaQueries, keyframes, regularRules, importRules);
    }

    // Reconstruct CSS in proper order
    const parts: string[] = [];

    // 1. @import rules first
    if (importRules.length > 0) {
      parts.push(importRules.join('\n'));
    }

    // 2. @keyframes
    if (keyframes.size > 0) {
      parts.push(Array.from(keyframes.values()).join('\n\n'));
    }

    // 3. Regular rules
    if (regularRules.length > 0) {
      parts.push(regularRules.join('\n'));
    }

    // 4. Media queries at the end
    if (mediaQueries.size > 0) {
      for (const [query, rules] of mediaQueries) {
        parts.push(`${query} {\n${Array.from(rules).join('\n')}\n}`);
      }
    }

    return parts.join('\n\n');
  }

  /**
   * Process CSS and extract rules by type
   */
  private processCSS(
    css: string,
    seenRules: Set<string>,
    mediaQueries: Map<string, Set<string>>,
    keyframes: Map<string, string>,
    regularRules: string[],
    importRules: string[]
  ): void {
    // Handle @import
    const importRegex = /@import\s+[^;]+;/g;
    let match;
    while ((match = importRegex.exec(css)) !== null) {
      const importRule = match[0];
      if (!importRules.includes(importRule)) {
        importRules.push(importRule);
      }
    }

    // Handle @keyframes (with proper nested brace matching)
    const keyframesRegex = /@(?:-webkit-|-moz-|-ms-)?keyframes\s+(\w+)/g;
    while ((match = keyframesRegex.exec(css)) !== null) {
      const name = match[1];
      const startIndex = match.index;
      
      // Find the complete keyframes block by counting braces
      let braceCount = 0;
      let endIndex = startIndex;
      let foundStart = false;
      
      for (let i = startIndex; i < css.length; i++) {
        if (css[i] === '{') {
          braceCount++;
          foundStart = true;
        } else if (css[i] === '}') {
          braceCount--;
          if (foundStart && braceCount === 0) {
            endIndex = i + 1;
            break;
          }
        }
      }
      
      if (!keyframes.has(name) && endIndex > startIndex) {
        const keyframeBlock = css.substring(startIndex, endIndex);
        
        // Verify closing brace
        if (!keyframeBlock.trim().endsWith('}')) {
          this.api.log(`⚠ Keyframes ${name} missing closing brace, adding it`);
          keyframes.set(name, keyframeBlock + '\n}');
        } else {
          keyframes.set(name, keyframeBlock);
        }
      }
    }

    // Handle @media queries (with proper nested brace matching)
    const mediaRegex = /@media[^{]+/g;
    while ((match = mediaRegex.exec(css)) !== null) {
      const startIndex = match.index;
      const queryText = match[0];
      
      // Find the complete media query block by counting braces
      let braceCount = 0;
      let endIndex = startIndex;
      let foundStart = false;
      let contentStart = -1;
      
      for (let i = startIndex; i < css.length; i++) {
        if (css[i] === '{') {
          braceCount++;
          foundStart = true;
          if (braceCount === 1) {
            contentStart = i + 1;
          }
        } else if (css[i] === '}') {
          braceCount--;
          if (foundStart && braceCount === 0) {
            endIndex = i;
            break;
          }
        }
      }
      
      if (contentStart > 0 && endIndex > contentStart) {
        const query = queryText + ' {';
        const content = css.substring(contentStart, endIndex);
        
        if (!mediaQueries.has(query)) {
          mediaQueries.set(query, new Set());
        }
        
        const rules = this.extractRules(content);
        rules.forEach(rule => {
          const normalized = this.normalizeRule(rule);
          if (!seenRules.has(normalized) && rule.trim()) {
            mediaQueries.get(query)!.add(rule);
            seenRules.add(normalized);
          }
        });
      }
    }

    // Handle regular rules - remove @import, @keyframes, and @media
    let cleanedCSS = css.replace(importRegex, '');
    
    // Remove all keyframes blocks
    const keyframesRemovalRegex = /@(?:-webkit-|-moz-|-ms-)?keyframes\s+\w+\s*\{/g;
    let kfMatch;
    while ((kfMatch = keyframesRemovalRegex.exec(cleanedCSS)) !== null) {
      const startIdx = kfMatch.index;
      let braceCount = 0;
      let endIdx = startIdx;
      let foundStart = false;
      
      for (let i = startIdx; i < cleanedCSS.length; i++) {
        if (cleanedCSS[i] === '{') {
          braceCount++;
          foundStart = true;
        } else if (cleanedCSS[i] === '}') {
          braceCount--;
          if (foundStart && braceCount === 0) {
            endIdx = i + 1;
            break;
          }
        }
      }
      
      cleanedCSS = cleanedCSS.substring(0, startIdx) + cleanedCSS.substring(endIdx);
      keyframesRemovalRegex.lastIndex = 0; // Reset regex
    }
    
    // Remove all @media blocks
    const mediaRemovalRegex = /@media[^{]+\{/g;
    let mqMatch;
    while ((mqMatch = mediaRemovalRegex.exec(cleanedCSS)) !== null) {
      const startIdx = mqMatch.index;
      let braceCount = 0;
      let endIdx = startIdx;
      let foundStart = false;
      
      for (let i = startIdx; i < cleanedCSS.length; i++) {
        if (cleanedCSS[i] === '{') {
          braceCount++;
          foundStart = true;
        } else if (cleanedCSS[i] === '}') {
          braceCount--;
          if (foundStart && braceCount === 0) {
            endIdx = i + 1;
            break;
          }
        }
      }
      
      cleanedCSS = cleanedCSS.substring(0, startIdx) + cleanedCSS.substring(endIdx);
      mediaRemovalRegex.lastIndex = 0; // Reset regex
    }

    const rules = this.extractRules(cleanedCSS);
    for (const rule of rules) {
      const normalized = this.normalizeRule(rule);
      if (!seenRules.has(normalized) && rule.trim()) {
        seenRules.add(normalized);
        regularRules.push(rule);
      }
    }
  }

  /**
   * Extract individual CSS rules from text
   */
  private extractRules(css: string): string[] {
    const rules: string[] = [];
    let braceCount = 0;
    let currentRule = '';

    for (let i = 0; i < css.length; i++) {
      const char = css[i];
      currentRule += char;

      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0 && currentRule.trim()) {
          rules.push(currentRule.trim());
          currentRule = '';
        }
      }
    }

    return rules;
  }

  /**
   * Normalize CSS rule for comparison (remove whitespace variations)
   */
  private normalizeRule(rule: string): string {
    return rule
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}:;,])\s*/g, '$1')
      .trim();
  }

  /**
   * Add header comment to CSS file
   */
  private addHeader(title: string, content: string): string {
    return `/**
 * ${title}
 * Auto-consolidated by AI Theme Factory
 * Generated: ${new Date().toISOString()}
 */

${content}`;
  }

  /**
   * Validate CSS syntax
   */
  private validateCSS(css: string): { valid: boolean; errors: Array<{ line: number; message: string; content: string }> } {
    const errors: Array<{ line: number; message: string; content: string }> = [];
    const lines = css.split('\n');
    let braceStack: Array<{ type: string; line: number }> = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      
      // Check for double opening braces
      if (line.includes('{{')) {
        errors.push({
          line: lineNum,
          message: 'Double opening brace',
          content: line.trim()
        });
      }
      
      // Check for double closing braces
      if (line.includes('}}')) {
        errors.push({
          line: lineNum,
          message: 'Double closing brace',
          content: line.trim()
        });
      }
      
      // Track brace balance
      for (const char of line) {
        if (char === '{') {
          braceStack.push({ type: '{', line: lineNum });
        } else if (char === '}') {
          if (braceStack.length === 0) {
            errors.push({
              line: lineNum,
              message: 'Unexpected closing brace',
              content: line.trim()
            });
          } else {
            braceStack.pop();
          }
        }
      }
    }
    
    // Check for unclosed braces
    if (braceStack.length > 0) {
      errors.push({
        line: braceStack[0].line,
        message: `${braceStack.length} unclosed brace(s)`,
        content: lines[braceStack[0].line - 1]?.trim() || ''
      });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Fix common CSS syntax errors
   */
  private async fixCSSErrors(css: string, errors: Array<{ line: number; message: string; content: string }>): Promise<string> {
    let fixed = css;
    
    // Fix double opening braces
    fixed = fixed.replace(/\{\s*\{/g, '{');
    
    // Fix double closing braces
    fixed = fixed.replace(/\}\s*\}/g, '}');
    
    // Fix unclosed braces - count and add missing closing braces
    let openCount = (fixed.match(/\{/g) || []).length;
    let closeCount = (fixed.match(/\}/g) || []).length;
    
    if (openCount > closeCount) {
      const missing = openCount - closeCount;
      this.api.log(`⚠ Adding ${missing} missing closing brace(s)`);
      fixed += '\n' + '}'.repeat(missing);
    }
    
    // Re-validate after fixes
    const revalidation = this.validateCSS(fixed);
    if (revalidation.valid) {
      this.api.log('✓ CSS syntax errors fixed automatically');
      return fixed;
    }
    
    // If automatic fixes didn't work, try AI validation
    this.api.log(`⚠ ${revalidation.errors.length} CSS errors remain after automatic fixes`);
    revalidation.errors.slice(0, 5).forEach(err => {
      this.api.log(`  ERROR Line ${err.line}: ${err.message} - ${err.content}`);
    });
    
    // Try AI-powered fixing
    const aiFixed = await this.aiFixCSS(fixed, revalidation.errors);
    if (aiFixed) {
      return aiFixed;
    }
    
    return fixed;
  }

  /**
   * Use AI to fix CSS syntax errors
   */
  private async aiFixCSS(css: string, errors: Array<{ line: number; message: string; content: string }>): Promise<string | null> {
    try {
      await this.initAI();
      
      if (!this.model) {
        this.api.log('⚠ AI validator not available, skipping AI fixes');
        return null;
      }

      this.api.log('🤖 Using AI to fix CSS syntax errors...');

      const errorSummary = errors.slice(0, 10).map(e => 
        `Line ${e.line}: ${e.message} - ${e.content}`
      ).join('\n');

      const prompt = `You are a CSS syntax expert. Fix the following CSS syntax errors while preserving ALL the original styling and selectors.

CRITICAL RULES:
1. ONLY fix syntax errors (missing braces, double braces, malformed rules)
2. DO NOT change any selectors, properties, or values
3. DO NOT remove or modify any CSS rules
4. DO NOT add any new styles
5. Return ONLY the fixed CSS, no explanations

Detected Errors:
${errorSummary}

CSS to fix:
\`\`\`css
${css}
\`\`\`

Return the fixed CSS:`;

      const result = await this.model.generateContent(prompt);
      const fixedCSS = result.response.text();
      
      // Extract CSS from markdown code blocks if present
      let cleaned = fixedCSS.trim();
      if (cleaned.startsWith('```css')) {
        cleaned = cleaned.replace(/^```css\n/, '').replace(/\n```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      // Validate the AI-fixed CSS
      const finalValidation = this.validateCSS(cleaned);
      if (finalValidation.valid) {
        this.api.log('✓ AI successfully fixed all CSS syntax errors');
        return cleaned;
      } else {
        this.api.log(`⚠ AI fixes didn't resolve all errors (${finalValidation.errors.length} remain)`);
        return null;
      }
    } catch (error) {
      this.api.log(`❌ AI CSS fixing failed: ${error.message}`);
      return null;
    }
  }
}
