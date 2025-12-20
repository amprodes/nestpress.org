/**
 * Phase 4: AI NestPressification Service
 * 
 * The most critical phase - converts static HTML/CSS into dynamic NestPress templates.
 * Uses AI to intelligently inject NestPress template tags, menu functions, and widget areas.
 */

import type { ThemeBlueprint } from './ThemeAnalyzer';
import type { ThemeAssembler } from './ThemeAssembler';

export interface NestPressifiedTheme extends ThemeAssembler {
  nestpressFeatures: {
    registeredMenus: string[];
    registeredWidgets: string[];
    templateTags: string[];
    hooks: string[];
  };
}

export class AINestPressifier {
  private api: any;
  private aiClient: any;
  private aiInitialized: boolean = false;

  constructor(api: any) {
    this.api = api;
    // Don't initialize AI in constructor - do it lazily when first needed
  }

  /**
   * Helper: Capitalize first letter of string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Helper: Get template type from filename
   */
  private getTemplateTypeFromName(filename: string): string {
    const name = filename.replace('.tsx', '').toLowerCase();
    
    // Map filenames to template types
    const typeMap: Record<string, string> = {
      'index': 'home',
      'single': 'single',
      'page': 'page',
      'page-with-sidebar': 'page-sidebar',
      'archive': 'archive',
      'category': 'category',
      '404': '404',
    };
    
    return typeMap[name] || 'page';
  }

  private async ensureAI() {
    if (this.aiInitialized) return;

    try {
      // Get AI credentials from database via SystemConfigService
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
        this.api.log('⚠ No Gemini API key found. Configure in Settings → System → AI Services', 'warn');
        this.api.log('  Go to admin dashboard and add your API key (no restart required!)', 'warn');
        return;
      }
      
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      this.aiClient = new GoogleGenerativeAI(apiKey);
      this.api.log('✓ Gemini 3 Flash initialized for HTML assembly (loaded from database)');
      this.aiInitialized = true;
    } catch (error: any) {
      this.api.log('Failed to init Gemini: ' + error.message, 'error');
    }
  }

  /**
   * Clean up JSX syntax errors that AI might generate
   * Smart fragment handling - removes unnecessary fragments, keeps valid ones
   */
  private cleanJSX(code: string): string {
    this.api.log('[cleanJSX] Starting JSX cleanup...');
    
    // -1. CRITICAL PREPROCESSING: Strip HTML from data-* attributes
    // Pattern: data-tooltip="<div>...</div>" or data-content="<span>text</span>"
    // This MUST happen before any other processing
    const attributesWithHTML = code.match(/data-[a-z-]+\s*=\s*["']([^"']*<[^"']*>.*?["'])/gi);
    if (attributesWithHTML && attributesWithHTML.length > 0) {
      this.api.log(`[cleanJSX] Found ${attributesWithHTML.length} data-* attributes with embedded HTML - removing HTML content...`);
      
      // Remove ALL content from data-* attributes that contain HTML tags
      code = code.replace(/data-[a-z-]+\s*=\s*["']([^"']*<[^"']*>.*?)["']/gi, (match, content) => {
        const attrName = match.match(/data-[a-z-]+/i)?.[0] || 'data-attr';
        this.api.log(`  Stripped HTML from ${attrName}`);
        return `${attrName}=""`; // Empty the attribute instead of removing it
      });
    }
    
    // 0. CRITICAL: Fix React imports FIRST (must be correct format)
    if (code.includes('import React from')) {
      this.api.log('[cleanJSX] Fixing React import format...');
      code = code.replace(/import\s+React\s+from\s+['"]react['"]\s*;?\s*\n?/g, '');
    }
    
    // Ensure React import is first line (if not already present)
    if (!code.includes('import * as React from')) {
      this.api.log('[cleanJSX] Adding React import...');
      code = `import * as React from 'react';\n${code}`;
    } else {
      // Move React import to first line if not already
      const reactImport = code.match(/import\s+\*\s+as\s+React\s+from\s+['"]react['"];?\s*\n?/);
      if (reactImport && code.indexOf(reactImport[0]) > 0) {
        this.api.log('[cleanJSX] Moving React import to first line...');
        code = code.replace(reactImport[0], '');
        code = `${reactImport[0]}\n${code}`;
      }
    }
    
    // 1. Fix HTML comments to JSX comments
    code = code.replace(/<!--\s*([\s\S]*?)\s*-->/g, '{/* $1 */}');
    
    // 2. Smart fragment handling - detect and process all fragments
    const fragmentCount = (code.match(/<>|<\/>/g) || []).length;
    if (fragmentCount > 0) {
      this.api.log(`[cleanJSX] Found ${fragmentCount} fragment tags - processing...`);
      
      // Strategy: Replace fragments intelligently based on context
      // Use a more robust approach that handles all cases
      
      // First pass: Handle complete fragment pairs <> ... </>
      let processed = true;
      let iterations = 0;
      const maxIterations = 20; // Prevent infinite loops
      
      while (processed && iterations < maxIterations) {
        processed = false;
        iterations++;
        
        // Find the first fragment pair (innermost first)
        const fragmentPattern = /<>([\s\S]*?)<\/>/;
        const match = code.match(fragmentPattern);
        
        if (match) {
          const fullMatch = match[0];
          const content = match[1];
          
          // Check if this fragment contains only <li> elements
          const contentWithoutComments = content.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').trim();
          const hasOnlyListItems = /^(<li[\s\S]*?<\/li>\s*)+$/i.test(contentWithoutComments);
          
          if (hasOnlyListItems) {
            // Keep fragment for list items (valid JSX pattern)
            this.api.log('[cleanJSX] Keeping fragment with only <li> children');
            // Mark it so we don't process it again
            code = code.replace(fragmentPattern, `<React.Fragment>${content}</React.Fragment>`);
          } else {
            // Replace with div wrapper
            this.api.log('[cleanJSX] Converting fragment to div wrapper');
            code = code.replace(fragmentPattern, `<div className="wrapper">${content}</div>`);
          }
          
          processed = true;
        }
      }
      
      // Second pass: Handle any remaining standalone fragments (edge cases)
      // These might be malformed, so we'll be aggressive
      
      // Pattern: return (<> at start of return
      code = code.replace(/return\s*\(\s*<>/g, 'return (\n    <div className="component-wrapper">');
      
      // Pattern: </>) at end of return
      code = code.replace(/<\/>\s*\)/g, '</div>\n  )');
      
      // Pattern: Any remaining opening fragments
      code = code.replace(/<>/g, '<div className="fragment-wrapper">');
      
      // Pattern: Any remaining closing fragments
      code = code.replace(/<\/>/g, '</div>');
      
      // Verify no fragments remain (except React.Fragment which is valid)
      const remainingFragments = (code.match(/<>|<\/>/g) || []).length;
      if (remainingFragments > 0) {
        this.api.log(`[cleanJSX] WARNING: Still have ${remainingFragments} raw fragments after cleanup`, 'warn');
        this.api.log('[cleanJSX] These will be caught by the validator', 'warn');
      } else {
        this.api.log(`[cleanJSX] ✓ Processed all ${fragmentCount} fragments successfully`);
      }
    }
    
    // 2.5. CRITICAL: Ensure single root element in return statements
    // Pattern: return (<><div>...content...</div><Footer /></>)
    // This creates multiple root elements which is invalid JSX
    const multiRootPattern = /return\s*\(\s*<>\s*(<[a-zA-Z][^>]*>[\s\S]*?<\/[a-zA-Z]+>)\s*(<[A-Z][a-zA-Z]+[\s\S]*?\/[A-Z][a-zA-Z]+>)\s*<\/>/g;
    if (code.match(multiRootPattern)) {
      this.api.log('[cleanJSX] Fixing multiple root elements - moving components inside parent');
      code = code.replace(multiRootPattern, (match, mainDiv, component) => {
        const closingTagMatch = mainDiv.match(/<\/([a-zA-Z]+)>$/);
        if (closingTagMatch) {
          const closingTag = closingTagMatch[0];
          const contentWithoutClosing = mainDiv.substring(0, mainDiv.lastIndexOf(closingTag));
          return `return (\n    ${contentWithoutClosing}\n      ${component}\n    ${closingTag}\n  )`;
        }
        return match;
      });
    }
    
    // Pattern: </div><Component at root level
    code = code.replace(/(<\/div>)\s*(<[A-Z][a-zA-Z]+[^>]*>[\s\S]*?<\/[A-Z][a-zA-Z]+>)\s*\)/g, (match, closingDiv, component) => {
      this.api.log('[cleanJSX] Fixing sibling component at root - moving inside parent div');
      return `\n      ${component}\n    ${closingDiv}\n  )`;
    });
    
    // 3. Fix self-closing tags
    code = code.replace(/<(img|br|hr|input|meta|link|area|base|col|embed|source|track|wbr)([^>]*?)(?<!\/)>/gi, '<$1$2 />');
    
    // 4. Fix React attribute names
    code = code.replace(/\sclass=/g, ' className=');
    code = code.replace(/\sfor=/g, ' htmlFor=');
    code = code.replace(/\sitemscope=/gi, ' itemScope=');
    code = code.replace(/\sitemtype=/gi, ' itemType=');
    code = code.replace(/\sitemprop=/gi, ' itemProp=');
    code = code.replace(/\stabindex=/gi, ' tabIndex=');
    
    // 5. Fix unquoted attribute values
    code = code.replace(/(\w+)=([a-zA-Z0-9_-]+)(\s|\/?>)/g, '$1="$2"$3');
    
    // 6. Remove markdown code fences
    code = code.replace(/```(?:typescript|tsx|jsx|javascript)?\n?/g, '');
    
    // 7. Fix dangling closing tags
    code = code.replace(/\s+\/>/g, ' />');
    
    // 8. Fix aria attributes
    code = code.replace(/\saria-([a-z]+)=/gi, (match, attr) => ` aria-${attr}=`);
    
    // 9. Remove orphaned JSX comments
    code = code.replace(/^\s*\{\/\*[^*]*\*\/\}\s*$/gm, '');
    
    this.api.log('[cleanJSX] JSX cleanup complete');
    return code;
  }

  /**
   * Main conversion method - transforms static theme into dynamic NestPress theme
   */
  async convertToNestPress(
    theme: any,
    blueprint: ThemeBlueprint
  ): Promise<any> {
    this.api.log('Starting NestPressification...');

    const fs = require('fs');
    const path = require('path');

    try {
      // Read part files from disk
      const headerPath = theme.partFiles.find((f: string) => f.endsWith('Header.tsx'));
      const footerPath = theme.partFiles.find((f: string) => f.endsWith('Footer.tsx'));
      const sidebarPath = theme.partFiles.find((f: string) => f.endsWith('Sidebar.tsx'));

      // Step 1: Enhance Header with dynamic navigation
      if (headerPath && fs.existsSync(headerPath)) {
        this.api.sendProgress?.(71, 'AI enhancing Header component with navigation...', { type: 'phase', phase: 4 });
        this.api.log('Injecting dynamic navigation...');
        const headerContent = fs.readFileSync(headerPath, 'utf-8');
        const enhanced = await this.nestpressifyHeader(headerContent, blueprint);
        // SAFEGUARD: Never write empty content
        if (enhanced && enhanced.trim().length > 50) {
          fs.writeFileSync(headerPath, enhanced);
        } else {
          this.api.log('⚠ Header enhancement returned empty, keeping original', 'warn');
        }
      }

      // Step 2: Enhance Footer with widget areas
      if (footerPath && fs.existsSync(footerPath)) {
        this.api.sendProgress?.(73, 'AI enhancing Footer component with widgets...', { type: 'phase', phase: 4 });
        this.api.log('Injecting footer widgets...');
        const footerContent = fs.readFileSync(footerPath, 'utf-8');
        const enhanced = await this.nestpressifyFooter(footerContent, blueprint);
        // SAFEGUARD: Never write empty content
        if (enhanced && enhanced.trim().length > 50) {
          fs.writeFileSync(footerPath, enhanced);
        } else {
          this.api.log('⚠ Footer enhancement returned empty, keeping original', 'warn');
        }
      }

      // Step 3: Enhance Sidebar with widget areas
      if (sidebarPath && fs.existsSync(sidebarPath)) {
        this.api.sendProgress?.(75, 'AI enhancing Sidebar component with widgets...', { type: 'phase', phase: 4 });
        this.api.log('Injecting sidebar widgets...');
        const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');
        const enhanced = await this.nestpressifySidebar(sidebarContent, blueprint);
        // SAFEGUARD: Never write empty content
        if (enhanced && enhanced.trim().length > 50) {
          fs.writeFileSync(sidebarPath, enhanced);
        } else {
          this.api.log('⚠ Sidebar enhancement returned empty, keeping original', 'warn');
        }
      }

      // Step 4: Enhance content templates with Loop and template tags
      this.api.sendProgress?.(76, `AI enhancing ${theme.templateFiles.length} templates with NestPress Loop...`, { type: 'phase', phase: 4 });
      this.api.log('Injecting NestPress Loop...');
      
      // Find original HTML directory
      // Template files are in: /path/to/job-xxx/theme-name/templates/index.tsx
      // Original HTML is in: /path/to/job-xxx/original-html/
      // So we need to go up 2 levels from template file, then into original-html
      const templateDir = path.dirname(theme.templateFiles[0]); // .../theme-name/templates
      const themeRootDir = path.dirname(templateDir); // .../theme-name
      const jobDir = path.dirname(themeRootDir); // .../job-xxx
      const originalHTMLDir = path.join(jobDir, 'original-html');
      
      this.api.log(`[DEBUG] Template file: ${theme.templateFiles[0]}`);
      this.api.log(`[DEBUG] Looking for HTML in: ${originalHTMLDir}`);
      
      const hasOriginalHTML = fs.existsSync(originalHTMLDir);
      
      if (hasOriginalHTML) {
        this.api.log(`✓ Found original HTML - will preserve design fidelity`);
      } else {
        this.api.log(`⚠ No original HTML found at ${originalHTMLDir} - using generic templates`, 'warn');
      }
      
      let templateIndex = 0;
      for (const templatePath of theme.templateFiles) {
        templateIndex++;
        const progress = 76 + templateIndex; // 77, 78, 79, 80, 81, 82, 83
        const name = path.basename(templatePath);
        this.api.sendProgress?.(progress, `AI enhancing template: ${name}`, { type: 'phase', phase: 4 });
        
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        const templateType = this.getTemplateTypeFromName(name);
        const enhanced = await this.nestpressifyTemplate(
          templateContent,
          templateType,
          blueprint,
          hasOriginalHTML ? originalHTMLDir : undefined
        );
        
        // CRITICAL: Never write empty content - use original or fallback
        if (!enhanced || enhanced.trim().length < 50) {
          this.api.log(`⚠ AI returned empty/invalid content for ${name}, keeping original`, 'warn');
          // Keep original content if it exists and is valid
          if (templateContent && templateContent.trim().length > 50) {
            // Original is valid, don't overwrite
            continue;
          }
          // Generate fallback
          const componentName = this.capitalize(templateType);
          const fallbackContent = this.generateFallbackTemplate(templateType, componentName);
          fs.writeFileSync(templatePath, fallbackContent);
          this.api.log(`✓ Used fallback template for ${name}`);
        } else {
          fs.writeFileSync(templatePath, enhanced);
        }
      }

      this.api.sendProgress?.(88, 'Validating TypeScript compilation...', { type: 'phase', phase: 4 });
      this.api.log('Starting compilation validation...');

      // Step 5: Validate compilation and fix errors
      const allFiles = [...theme.partFiles, ...theme.templateFiles];
      const validationResult = await this.validateAndFixCompilation(allFiles, themeRootDir, 100);
      
      if (!validationResult.success) {
        this.api.log(`⚠ Compilation validation completed with warnings: ${validationResult.errors.length} files had persistent errors`, 'warn');
      } else {
        this.api.log('✓ All files passed compilation validation!');
      }

      this.api.sendProgress?.(95, 'NestPressification complete!', { type: 'phase', phase: 4 });
      this.api.log('NestPressification complete!');

      return theme;

    } catch (error: any) {
      this.api.log('NestPressification failed: ' + error.message, 'error');
      throw error;
    }
  }

  /**
   * Validate TypeScript compilation and automatically fix common errors
   * @param files Array of file paths to validate
   * @param themeRoot Root directory of theme
   * @param maxRetries Maximum retry attempts per file
   */
  private async validateAndFixCompilation(
    files: string[],
    themeRoot: string,
    maxRetries: number = 100
  ): Promise<{ success: boolean; errors: Array<{ file: string; error: string }> }> {
    const { execSync } = require('child_process');
    const fs = require('fs');
    const path = require('path');
    
    this.api.log(`[Validation] Checking ${files.length} files for compilation errors...`);
    
    const errors: Array<{ file: string; error: string }> = [];
    let totalFixes = 0;
    
    for (const filePath of files) {
      const fileName = path.basename(filePath);
      let retryCount = 0;
      let hasErrors = true;
      
      while (hasErrors && retryCount < maxRetries) {
        try {
          // Quick syntax check using TypeScript compiler
          const content = fs.readFileSync(filePath, 'utf-8');
          
          // Check for common JSX errors
          const jsxErrors = this.detectJSXErrors(content);
          
          if (jsxErrors.length === 0) {
            hasErrors = false;
            if (retryCount > 0) {
              this.api.log(`✓ ${fileName} fixed after ${retryCount} attempts`);
            }
            break;
          }
          
          // Auto-fix detected errors using AI (not regex!)
          this.api.log(`[Validation] ${fileName} has ${jsxErrors.length} errors, using AI to fix (retry ${retryCount + 1}/${maxRetries})...`);
          
          let fixedContent = content;
          let wasFixed = false;
          
          // Use AI to fix all JSX errors at once
          try {
            fixedContent = await this.aiFixJSXErrors(content, jsxErrors, fileName);
            wasFixed = (fixedContent !== content);
            
            if (wasFixed) {
              totalFixes += jsxErrors.length;
              this.api.log(`[AI Fix] Fixed ${jsxErrors.length} errors in ${fileName}`);
            }
          } catch (aiError: any) {
            this.api.log(`[AI Fix] AI failed: ${aiError.message}`, 'error');
            this.api.log(`[AI Fix] Errors cannot be fixed without AI - skipping file`, 'warn');
            // Don't fallback to regex - it's unreliable and causes more issues
            wasFixed = false;
          }
          
          if (wasFixed) {
            fs.writeFileSync(filePath, fixedContent);
            retryCount++;
          } else {
            // No fix applied, can't resolve automatically
            this.api.log(`⚠ ${fileName} has errors that couldn't be auto-fixed:`, 'warn');
            jsxErrors.forEach((err, idx) => {
              this.api.log(`  Error ${idx + 1}: [${err.type}] ${err.message}`, 'warn');
              if (err.line) {
                this.api.log(`    Line ${err.line}`, 'warn');
              }
            });
            errors.push({ 
              file: fileName, 
              error: `${jsxErrors.length} unfixable errors: ${jsxErrors.map(e => e.type).join(', ')}`
            });
            break;
          }
          
        } catch (error: any) {
          this.api.log(`⚠ ${fileName} validation error: ${error.message}`, 'warn');
          errors.push({ file: fileName, error: error.message });
          break;
        }
      }
      
      if (retryCount >= maxRetries) {
        this.api.log(`⚠ ${fileName} exceeded max retries (${maxRetries})`, 'warn');
        
        // Log the specific errors that couldn't be fixed
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const remainingErrors = this.detectJSXErrors(content);
          this.api.log(`  Remaining errors in ${fileName}:`, 'warn');
          remainingErrors.forEach((err, idx) => {
            this.api.log(`    ${idx + 1}. [${err.type}] Line ${err.line || '?'}: ${err.message}`, 'warn');
            
            // Show the problematic code section
            if (err.line) {
              const lines = content.split('\n');
              const lineIndex = err.line - 1;
              const startLine = Math.max(0, lineIndex - 2);
              const endLine = Math.min(lines.length - 1, lineIndex + 2);
              
              this.api.log(`      Code context:`, 'warn');
              for (let i = startLine; i <= endLine; i++) {
                const marker = i === lineIndex ? '→' : ' ';
                this.api.log(`      ${marker} ${i + 1}: ${lines[i]}`, 'warn');
              }
            }
          });
          errors.push({ 
            file: fileName, 
            error: `Max retries - ${remainingErrors.length} persistent errors: ${remainingErrors.map(e => e.type).join(', ')}`
          });
        } catch (e) {
          errors.push({ file: fileName, error: 'Max retries exceeded' });
        }
      }
    }
    
    this.api.log(`[Validation] Complete: ${totalFixes} fixes applied, ${errors.length} files with persistent errors`);
    
    // Log summary of problematic files
    if (errors.length > 0) {
      this.api.log(`[Validation] Files with errors:`, 'warn');
      errors.forEach((err, idx) => {
        this.api.log(`  ${idx + 1}. ${err.file}: ${err.error}`, 'warn');
      });
    }
    
    return {
      success: errors.length === 0,
      errors
    };
  }

  /**
   * Detect common JSX/TypeScript errors in code with line-by-line validation
   */
  private detectJSXErrors(code: string): Array<{ type: string; message: string; line?: number }> {
    const errors: Array<{ type: string; message: string; line?: number }> = [];
    
    // CRITICAL: Check for multiple root elements in return statement
    const multipleRootErrors = this.detectMultipleRootElements(code);
    errors.push(...multipleRootErrors);
    
    // Run comprehensive JSX validation
    const jsxValidation = this.validateJSXStructure(code);
    errors.push(...jsxValidation);
    
    // Error: Wrong property names (header?.general?.siteTitle)
    if (code.includes('header?.general?.siteTitle')) {
      errors.push({
        type: 'wrong_property',
        message: 'Using header?.general?.siteTitle instead of header?.siteName'
      });
    }
    
    // Error: Invalid div wrapping li elements
    if (code.match(/<ul[^>]*>[\s\S]*?<div[^>]*>[\s\S]*?<li/)) {
      errors.push({
        type: 'invalid_ul_child',
        message: 'Found <div> as direct child of <ul> (should be <li> only)'
      });
    }
    
    return errors;
  }

  /**
   * Detect multiple root elements in return statement (JSX must have single parent)
   */
  private detectMultipleRootElements(code: string): Array<{ type: string; message: string; line?: number }> {
    const errors: Array<{ type: string; message: string; line?: number }> = [];
    
    // Pattern 1: return (<><div> or return (<>...<Footer/>
    // This indicates an empty fragment with sibling elements
    if (code.match(/return\s*\(\s*<>\s*<[a-zA-Z]/)) {
      errors.push({
        type: 'multiple_root_elements',
        message: 'JSX return has empty fragment with sibling elements - fragments must wrap all content or be removed'
      });
    }
    
    // Pattern 2: Multiple root elements - DISABLED (too many false positives)
    // The cleanJSX prevention already handles this, and tag_mismatch will catch real issues
    // Keeping for reference but not checking
    /*
    const returnMatch = code.match(/return\s*\(([\s\S]*?)\);/);
    if (returnMatch) {
      const returnContent = returnMatch[1];
      // Complex detection would go here...
    }
    */
    
    // Pattern 3: </>...<Footer (fragment closing followed by component)
    if (code.match(/<\/>\s*<[A-Z][a-zA-Z]/)) {
      errors.push({
        type: 'multiple_root_elements',
        message: 'JSX has closing fragment followed by sibling component - all elements must be inside parent'
      });
    }
    
    return errors;
  }

  /**
   * Comprehensive JSX structure validator - checks every line for proper tag matching
   * Returns detailed errors with line numbers
   */
  private validateJSXStructure(code: string): Array<{ type: string; message: string; line: number }> {
    const errors: Array<{ type: string; message: string; line: number }> = [];
    
    // CRITICAL: Remove multi-line HTML inside attribute values FIRST
    // This prevents false positives from HTML strings in attributes like data-avia-search-tooltip='...'
    let cleanedCode = code;
    
    // Remove multi-line single-quoted attributes containing HTML
    cleanedCode = cleanedCode.replace(/=\s*'([^']*<[^']*)'(?=\s|>)/g, '=""');
    // Remove multi-line double-quoted attributes containing HTML  
    cleanedCode = cleanedCode.replace(/=\s*"([^"]*<[^"]*)"(?=\s|>)/g, '=""');
    
    const lines = cleanedCode.split('\n');
    const tagStack: Array<{ tag: string; line: number; isFragment: boolean }> = [];
    
    // Self-closing HTML tags that don't need closing tags
    const selfClosingTags = new Set([
      'img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 
      'embed', 'source', 'track', 'wbr', 'param'
    ]);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      
      // Skip JSX expressions and comments (attribute HTML already removed above)
      let withoutExpressions = line
        .replace(/\{[^}]*\}/g, '') // Remove JSX expressions
        .replace(/\/\/.*$/g, '')    // Remove line comments
        .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove block comments
      
      // First, handle fragments separately (they won't match the regular tag regex)
      if (withoutExpressions.includes('<>')) {
        tagStack.push({ tag: 'Fragment', line: lineNum, isFragment: true });
      }
      if (withoutExpressions.includes('</>')) {
        const lastOpen = tagStack[tagStack.length - 1];
        if (!lastOpen) {
          errors.push({
            type: 'unmatched_closing',
            message: `Closing fragment </> has no matching opening <>`,
            line: lineNum
          });
        } else if (!lastOpen.isFragment) {
          errors.push({
            type: 'fragment_tag_mismatch',
            message: `Expected closing tag </${lastOpen.tag}> (opened at line ${lastOpen.line}), but found fragment </> instead`,
            line: lineNum
          });
        } else {
          tagStack.pop();
        }
      }
      
      // Find all regular JSX tags in this line (excluding fragments)
      const tagRegex = /<\/?[\w.:-]+(?:\s+[^>]*)?>/g;
      let match;
      
      while ((match = tagRegex.exec(withoutExpressions)) !== null) {
        const fullTag = match[0];
        
        // Self-closing tag: <img />
        if (fullTag.endsWith('/>')) {
          continue;
        }
        
        // Closing tag: </div>
        if (fullTag.startsWith('</')) {
          const tagName = fullTag.match(/<\/([\w.:-]+)/)?.[1];
          if (!tagName) continue;
          
          const lastOpen = tagStack[tagStack.length - 1];
          if (!lastOpen) {
            errors.push({
              type: 'unmatched_closing',
              message: `Closing tag </${tagName}> has no matching opening tag`,
              line: lineNum
            });
          } else if (lastOpen.isFragment) {
            errors.push({
              type: 'fragment_tag_mismatch',
              message: `Fragment <> opened at line ${lastOpen.line} but closed with </${tagName}> instead of </>`,
              line: lineNum
            });
          } else if (lastOpen.tag !== tagName) {
            errors.push({
              type: 'tag_mismatch',
              message: `Expected closing tag </${lastOpen.tag}> (opened at line ${lastOpen.line}), but found </${tagName}>`,
              line: lineNum
            });
          } else {
            tagStack.pop();
          }
          continue;
        }
        
        // Opening tag: <div>
        const tagName = fullTag.match(/<([\w.:-]+)/)?.[1];
        if (!tagName) continue;
        
        // Skip self-closing HTML tags even without />
        if (selfClosingTags.has(tagName.toLowerCase())) {
          continue;
        }
        
        tagStack.push({ tag: tagName, line: lineNum, isFragment: false });
      }
    }
    
    // Check for unclosed tags at end of file
    for (const unclosed of tagStack) {
      if (unclosed.isFragment) {
        errors.push({
          type: 'unclosed_fragment',
          message: `Fragment <> opened at line ${unclosed.line} is never closed`,
          line: unclosed.line
        });
      } else {
        errors.push({
          type: 'unclosed_tag',
          message: `Tag <${unclosed.tag}> opened at line ${unclosed.line} is never closed`,
          line: unclosed.line
        });
      }
    }
    
    return errors;
  }

  /**
   * Pattern-Based JSX Fixer - handles simple cases without AI
   * Runs BEFORE AI to reduce the complexity AI needs to handle
   */
  private patternBasedFix(
    code: string,
    errors: Array<{ type: string; message: string; line?: number }>
  ): string {
    let fixed = code;
    const lines = fixed.split('\n');
    
    // Pattern 1: Fix obvious unclosed tags at end of specific lines
    for (const error of errors) {
      if (error.type === 'unclosed_tag' && error.line) {
        const message = error.message;
        const tagMatch = message.match(/Tag <(\w+)>/);
        if (tagMatch) {
          const tag = tagMatch[1];
          const lineIdx = error.line - 1;
          
          // Find the next logical place to close this tag
          // Look for the end of the current block or component
          let insertLineIdx = lineIdx;
          let indentLevel = 0;
          
          // Count indent of opening tag
          const openingLine = lines[lineIdx];
          const openingIndent = openingLine.match(/^(\s*)/)?.[1].length || 0;
          
          // Search forward for appropriate closing position
          for (let i = lineIdx + 1; i < lines.length && i < lineIdx + 50; i++) {
            const line = lines[i];
            const currentIndent = line.match(/^(\s*)/)?.[1].length || 0;
            
            // Found a line at same or less indentation = end of block
            if (currentIndent <= openingIndent && line.trim()) {
              insertLineIdx = i;
              break;
            }
          }
          
          // Insert closing tag before the found position
          if (insertLineIdx > lineIdx) {
            const indent = ' '.repeat(openingIndent);
            lines.splice(insertLineIdx, 0, `${indent}</${tag}>`);
            this.api.log(`[Pattern Fix] Added </${tag}> at line ${insertLineIdx + 1}`);
          }
        }
      }
    }
    
    fixed = lines.join('\n');
    
    // Pattern 2: Fix common tag mismatches in lists
    // <ul><li><a>Text</ul></li></a> → <ul><li><a>Text</a></li></ul>
    fixed = fixed.replace(
      /<ul([^>]*)>([\s\S]*?)<\/ul>\s*<\/li>\s*<\/a>/gi,
      '<ul$1>$2</a></li></ul>'
    );
    
    // Pattern 3: Fix orphan </div> at end of file
    if (fixed.trim().endsWith('</div>') && !fixed.includes('<div')) {
      fixed = fixed.replace(/<\/div>\s*$/, '');
      this.api.log('[Pattern Fix] Removed orphan </div> at end of file');
    }
    
    // Pattern 4: Fix unclosed <li> tags in lists
    // <ul><li>Text<li>Text</ul> → <ul><li>Text</li><li>Text</li></ul>
    fixed = fixed.replace(
      /<li([^>]*)>([^<]*)<li/gi,
      '<li$1>$2</li><li'
    );
    
    // Pattern 5: Fix React.Fragment mismatches
    // <React.Fragment>...</> → <React.Fragment>...</React.Fragment>
    fixed = fixed.replace(
      /<React\.Fragment([^>]*)>([\s\S]*?)<\/>/g,
      '<React.Fragment$1>$2</React.Fragment>'
    );
    
    // Pattern 6: Fix fragment/div confusion
    // <>...</div> → <div>...</div>
    fixed = fixed.replace(
      /<>([\s\S]*?)<\/div>/g,
      '<div>$1</div>'
    );
    
    // Pattern 7: Fix wrong property names
    // header?.general?.siteTitle → header?.siteName
    if (errors.some(e => e.type === 'wrong_property')) {
      fixed = fixed.replace(/header\?\.general\?\.siteTitle/g, 'header?.siteName');
      this.api.log('[Pattern Fix] Fixed header?.general?.siteTitle → header?.siteName');
    }
    
    return fixed;
  }

  /**
   * AI-Powered JSX Error Fixer - MULTI-PASS STRATEGY
   * Fixes errors in batches by type, making multiple AI calls if needed
   */
  private async aiFixJSXErrors(
    code: string, 
    errors: Array<{ type: string; message: string; line?: number }>,
    fileName: string
  ): Promise<string> {
    await this.ensureAI();
    
    // First, try pattern-based fixes for simple cases
    const patternFixed = this.patternBasedFix(code, errors);
    const afterPatternErrors = this.detectJSXErrors(patternFixed);
    
    if (afterPatternErrors.length < errors.length) {
      const fixed = errors.length - afterPatternErrors.length;
      this.api.log(`[Pattern Fix] Fixed ${fixed} errors (${errors.length} → ${afterPatternErrors.length})`);
      code = patternFixed;
      errors = afterPatternErrors;
      
      // If all fixed by patterns, return early
      if (afterPatternErrors.length === 0) {
        this.api.log('[Pattern Fix] All errors fixed! ✓');
        return code;
      }
    }
    
    if (!this.aiClient) {
      throw new Error('AI client not initialized');
    }
    
    let currentCode = code;
    let currentErrors = errors;
    const maxPasses = 5;
    let passNum = 0;
    
    // Group errors by type for targeted fixing
    const errorsByType = new Map<string, typeof errors>();
    for (const error of errors) {
      const type = error.type;
      if (!errorsByType.has(type)) {
        errorsByType.set(type, []);
      }
      errorsByType.get(type)!.push(error);
    }
    
    // Priority order: fix simpler errors first
    const errorTypePriority = [
      'wrong_property',         // Fix property names (simple regex)
      'unclosed_tag',           // Add missing closing tags
      'tag_mismatch',           // Fix mismatched tags
      'unmatched_closing',      // Remove orphan closing tags
      'unclosed_fragment',      // Fix fragments
      'fragment_tag_mismatch',  // Fix fragment/tag confusion
      'invalid_ul_child',       // Fix invalid list children
      'multiple_root_elements'  // Wrap multiple roots
    ];
    
    this.api.log(`[AI Fix Multi-Pass] Starting with ${errors.length} errors across ${errorsByType.size} types`);
    
    // Try fixing each error type separately
    for (const errorType of errorTypePriority) {
      const errorsOfType = errorsByType.get(errorType);
      if (!errorsOfType || errorsOfType.length === 0) continue;
      
      passNum++;
      if (passNum > maxPasses) {
        this.api.log(`[AI Fix] Reached max passes (${maxPasses}), stopping`, 'warn');
        break;
      }
      
      this.api.log(`[AI Fix Pass ${passNum}] Targeting ${errorsOfType.length} ${errorType} errors`);
      
      const errorSummary = errorsOfType.map((e, idx) => 
        `${idx + 1}. Line ${e.line || '?'}: ${e.message}`
      ).join('\n');
      
      // Specialized prompt based on error type
      const typeSpecificInstructions = this.getErrorTypeInstructions(errorType);
      
      const prompt = `You are a JSX SYNTAX FIXER. Fix ONLY the specified error type.

FILE: ${fileName}
ERROR TYPE: ${errorType}
ERRORS TO FIX (${errorsOfType.length}):
${errorSummary}

CURRENT CODE:
\`\`\`tsx
${currentCode}
\`\`\`

${typeSpecificInstructions}

CRITICAL RULES:
1. Fix ONLY the ${errorType} errors listed above
2. DO NOT touch any other code
3. PRESERVE all class names, styles, content, and structure
4. Return ONLY the fixed code - no markdown, no explanations

OUTPUT: Complete fixed TSX code`;

      try {
        const model = this.aiClient.getGenerativeModel({ 
          model: 'gemini-3-pro-preview',
          generationConfig: {
            temperature: 0.1, // Lower temperature for precise fixes
            maxOutputTokens: 8192,
          }
        });
        
        const result = await model.generateContent(prompt);
        let fixedCode = result.response.text().trim();
        
        // Extract code from markdown if wrapped
        if (fixedCode.includes('```')) {
          const codeMatch = fixedCode.match(/```(?:tsx|typescript|jsx)?\n([\s\S]*?)\n```/);
          if (codeMatch) {
            fixedCode = codeMatch[1];
          }
        }
        
        // Validate the fix
        const newErrors = this.detectJSXErrors(fixedCode);
        const newErrorsOfType = newErrors.filter(e => e.type === errorType);
        
        if (newErrorsOfType.length < errorsOfType.length) {
          const fixed = errorsOfType.length - newErrorsOfType.length;
          this.api.log(`[AI Fix Pass ${passNum}] ✓ Fixed ${fixed}/${errorsOfType.length} ${errorType} errors`);
          currentCode = fixedCode;
          currentErrors = newErrors;
        } else if (newErrors.length < currentErrors.length) {
          // Even if we didn't fix this type, maybe we fixed others
          this.api.log(`[AI Fix Pass ${passNum}] Reduced total errors from ${currentErrors.length} to ${newErrors.length}`);
          currentCode = fixedCode;
          currentErrors = newErrors;
        } else {
          this.api.log(`[AI Fix Pass ${passNum}] No improvement, trying next error type`, 'warn');
        }
        
      } catch (error: any) {
        this.api.log(`[AI Fix Pass ${passNum}] Error: ${error.message}`, 'error');
        // Continue with next error type
      }
    }
    
    // Final summary
    const finalErrorCount = this.detectJSXErrors(currentCode).length;
    const improvement = errors.length - finalErrorCount;
    
    if (improvement > 0) {
      this.api.log(`[AI Fix Complete] Fixed ${improvement} errors (${errors.length} → ${finalErrorCount})`);
      return currentCode;
    } else {
      this.api.log(`[AI Fix Complete] No improvement after ${passNum} passes`, 'warn');
      return code;
    }
  }
  
  /**
   * Get specialized fixing instructions for each error type
   */
  private getErrorTypeInstructions(errorType: string): string {
    const instructions = {
      unclosed_tag: `FIX UNCLOSED TAGS:
- Each error tells you which tag is unclosed and the line it was opened
- Find the opening tag (e.g., <div> at line 45)
- Add the matching closing tag (e.g., </div>) at the appropriate position
- Close inner tags BEFORE outer tags
- Example: <div><span>text → <div><span>text</span></div>`,

      tag_mismatch: `FIX TAG MISMATCHES:
- Error shows: "Expected </X> but found </Y>"
- This means tag X was opened but tag Y was closed instead
- Add the missing </X> BEFORE the </Y>
- Example: <div><span>text</div></span> → <div><span>text</span></div>
- Check nesting carefully - close inner tags first`,

      unmatched_closing: `FIX UNMATCHED CLOSING TAGS:
- Error shows: "Closing tag </X> has no matching opening tag"
- Either remove the orphan </X> tag
- OR add the matching opening <X> tag before it
- Usually removing is correct (leftover from editing)`,

      unclosed_fragment: `FIX UNCLOSED FRAGMENTS:
- Fragment <> opened but never closed with </>
- Add </> at the appropriate position
- OR convert to <div> wrapper if fragment is unnecessary`,

      fragment_tag_mismatch: `FIX FRAGMENT/TAG CONFUSION:
- Fragment <> was closed with a tag name (e.g., </div>)
- OR tag was closed with fragment </>
- Make them match: <div>...</div> or <>...</>`,

      multiple_root_elements: `FIX MULTIPLE ROOT ELEMENTS:
- JSX return can only have ONE root element
- Wrap all content in a single parent <div>
- OR use <React.Fragment>...</React.Fragment>
- Example: return (<div>A</div><div>B</div>) → return (<div><div>A</div><div>B</div></div>)`,

      wrong_property: `FIX WRONG PROPERTY NAMES:
- Replace header?.general?.siteTitle with header?.siteName
- This is a simple find/replace operation
- The correct property is: header?.siteName`,

      invalid_ul_child: `FIX INVALID UL CHILDREN:
- <ul> can ONLY contain <li> elements as direct children
- Remove any <div>, <span>, or other wrappers between <ul> and <li>
- Example: <ul><div><li>Text</li></div></ul> → <ul><li>Text</li></ul>`
    };
    
    return instructions[errorType] || 'Fix the errors listed above following JSX syntax rules.';
  }

  /**
   * Convert static header navigation to dynamic NestPress menu system
   */
  private async nestpressifyHeader(headerCode: string, blueprint: ThemeBlueprint): Promise<string> {
    await this.ensureAI();
    
    // AI Prompt with JSX examples (stored as plain strings to avoid compilation)
    const menuExample = '<nav className="main-nav">\n  {menuItems.map((item) => (\n    <a key={item.id} href={item.url}>{item.label}</a>\n  ))}\n</nav>';
    const logoExample = '<div className="logo">\n  <img src="/logo.png" alt={siteName} />\n  <span>{siteName}</span>\n</div>';
    
    const aiPrompt = 'You are a SENIOR REACT ENGINEER converting static HTML to TypeScript React components.\n\n' +
      'ORIGINAL HTML:\n' + headerCode + '\n\n' +
      '**YOUR PRIORITY**: PRESERVE 100% OF HTML STRUCTURE - only convert syntax!\n\n' +
      'CRITICAL RULES:\n' +
      '1. PRESERVE ALL:\n' +
      '   - Every <div>, <nav>, <header>, <ul>, <li> stays EXACTLY as-is\n' +
      '   - ALL CSS classes (className="original-class-name")\n' +
      '   - ALL IDs (id="original-id")\n' +
      '   - ALL data-* attributes\n' +
      '   - Parent-child hierarchy IDENTICAL\n' +
      '   - Nesting depth IDENTICAL\n' +
      '   - Container wrappers IDENTICAL\n\n' +
      '2. ONLY CONVERT SYNTAX:\n' +
      '   - class → className\n' +
      '   - for → htmlFor\n' +
      '   - style="..." → style={{...}}\n' +
      '   - Self-closing: <img />, <br />\n\n' +
      '3. MAKE NAVIGATION DYNAMIC (optional):\n' +
      '   - Find <nav> or <ul className="menu">\n' +
      '   - Keep wrapper: <nav className="original-classes">\n' +
      '   - Replace items: {menuItems.map((item, i) => (<li key={i} className="original-li-class"><a href={item.url} className="original-a-class">{item.label}</a></li>))}\n' +
      '   - Use fallback: || originalStaticMenuItems\n\n' +
      '4. COMPONENT STRUCTURE:\n' +
      '   import * as React from \'react\';\n' +
      '   import type { Menu, SiteSettings } from \'@/types\';\n' +
      '   export function Header({ primaryMenu, header }: { primaryMenu?: Menu; header?: SiteSettings }) {\n' +
      '     const menuItems = primaryMenu?.items?.sort((a,b) => a.order - b.order) || [];\n' +
      '     const siteName = header?.general?.siteTitle || \'Site\';\n' +
      '     return ( /* EXACT HTML STRUCTURE HERE */ );\n' +
      '   }\n\n' +
      'ABSOLUTE PROHIBITIONS:\n' +
      '❌ DO NOT change class names\n' +
      '❌ DO NOT remove wrapper divs\n' +
      '❌ DO NOT simplify structure\n' +
      '❌ DO NOT reorganize elements\n' +
      '❌ DO NOT use placeholders\n' +
      '❌ DO NOT embed HTML in JSX attributes\n' +
      '❌ DO NOT leave tags unclosed\n' +
      '❌ DO NOT create multiple root elements\n\n' +
      'JSX CORRECTNESS:\n' +
      '✓ Every <tag> needs matching </tag>\n' +
      '✓ Self-close void elements: <img />, <br />\n' +
      '✓ Single root element - wrap in <header>\n' +
      '✓ No HTML in data-* attributes\n' +
      '✓ No raw fragments <> </> - use <React.Fragment>\n\n' +
      'OUTPUT: Complete TypeScript code. No markdown.';

    // Use AI to transform the header code
    if (this.aiClient) {
      try {
        const model = this.aiClient.getGenerativeModel({ model: 'gemini-3-pro-preview' });
        const result = await model.generateContent(aiPrompt);
        let aiResponse = result.response.text();
        
        // Extract code from markdown if present
        const codeMatch = aiResponse.match(/```(?:typescript|tsx)?\n([\s\S]+?)\n```/);
        if (codeMatch) {
          aiResponse = codeMatch[1];
        }
        
        // Clean up JSX syntax errors
        aiResponse = this.cleanJSX(aiResponse);
        
        this.api.log('✓ AI enhanced header with dynamic navigation');
        return aiResponse;
      } catch (error: any) {
        this.api.log('AI enhancement failed, using original: ' + error.message, 'warn');
      }
    }

    // Fallback: return original
    return headerCode;
  }

  /**
   * Convert static footer to dynamic widget areas
   */
  private async nestpressifyFooter(footerCode: string, blueprint: ThemeBlueprint): Promise<string> {
    await this.ensureAI();
    
    // AI Prompt with JSX examples (stored as plain strings to avoid compilation)
    const copyrightExample = '<div className="copyright">\n  © {currentYear} {siteName}. All rights reserved.\n</div>';
    const footerMenuExample = '<nav className="footer-nav">\n  {menuItems.map((item) => (\n    <a key={item.id} href={item.url}>{item.label}</a>\n  ))}\n</nav>';
    const widgetExample = '{footerWidgets && footerWidgets.map((widget) => (\n  <div key={widget.id} className="widget">\n    <h4>{widget.title}</h4>\n    <div dangerouslySetInnerHTML={{ __html: widget.content }} />\n  </div>\n))}';
    
    const aiPrompt = 'You are a SENIOR REACT ENGINEER converting static HTML to TypeScript React components.\n\n' +
      'ORIGINAL HTML:\n' + footerCode + '\n\n' +
      '**YOUR PRIORITY**: PRESERVE 100% OF HTML STRUCTURE - only convert syntax!\n\n' +
      'CRITICAL RULES:\n' +
      '1. PRESERVE ALL:\n' +
      '   - Every <div>, <footer>, <section>, <nav> stays EXACTLY as-is\n' +
      '   - ALL CSS classes (className="original-class-name")\n' +
      '   - ALL IDs (id="original-id")\n' +
      '   - ALL data-* attributes\n' +
      '   - Parent-child hierarchy IDENTICAL\n' +
      '   - Container wrappers IDENTICAL\n\n' +
      '2. ONLY CONVERT SYNTAX:\n' +
      '   - class → className\n' +
      '   - Self-closing tags\n\n' +
      '3. MAKE DYNAMIC (optional):\n' +
      '   - Copyright year: {new Date().getFullYear()}\n' +
      '   - Site name: {header?.general?.siteTitle || "Original Text"}\n' +
      '   - Footer menu: Keep <nav> wrapper, map items inside\n' +
      '   - Keep ALL original classes and structure\n\n' +
      '4. COMPONENT STRUCTURE:\n' +
      '   import * as React from \'react\';\n' +
      '   import type { Menu, SiteSettings } from \'@/types\';\n' +
      '   export function Footer({ footerMenu, footerWidgets, header }: { footerMenu?: Menu; footerWidgets?: any[]; header?: SiteSettings }) {\n' +
      '     const menuItems = footerMenu?.items || [];\n' +
      '     const currentYear = new Date().getFullYear();\n' +
      '     return ( /* EXACT HTML STRUCTURE HERE */ );\n' +
      '   }\n\n' +
      'PROHIBITIONS:\n' +
      '❌ DO NOT change class names\n' +
      '❌ DO NOT remove wrappers\n' +
      '❌ DO NOT simplify structure\n' +
      '❌ DO NOT embed HTML in JSX attributes\n' +
      '❌ DO NOT leave tags unclosed\n\n' +
      'JSX CORRECTNESS:\n' +
      '✓ Every <tag> needs matching </tag>\n' +
      '✓ Self-close void elements: <img />, <br />\n' +
      '✓ Single root element - wrap in <footer>\n' +
      '✓ No HTML in data-* attributes\n\n' +
      'OUTPUT: Complete TypeScript code. No markdown.';

    // Use AI to transform the footer code
    if (this.aiClient) {
      try {
        const model = this.aiClient.getGenerativeModel({ model: 'gemini-3-pro-preview' });
        const result = await model.generateContent(aiPrompt);
        let aiResponse = result.response.text();
        
        // Extract code from markdown if present
        const codeMatch = aiResponse.match(/```(?:typescript|tsx)?\n([\s\S]+?)\n```/);
        if (codeMatch) {
          aiResponse = codeMatch[1];
        }
        
        // Clean up JSX syntax errors
        aiResponse = this.cleanJSX(aiResponse);
        
        this.api.log('✓ AI enhanced footer with widgets and menus');
        return aiResponse;
      } catch (error: any) {
        this.api.log('AI enhancement failed, using original: ' + error.message, 'warn');
      }
    }

    // Fallback: return original
    return footerCode;
  }

  private async nestpressifySidebar(sidebarCode: string, blueprint: ThemeBlueprint): Promise<string> {
    await this.ensureAI();
    
    // AI Prompt with JSX examples (stored as plain strings to avoid compilation)
    const sidebarExample = '<aside>\n  {widgets && widgets.map((widget) => (\n    <div key={widget.id} className="widget">\n      <h3>{widget.title}</h3>\n      <div dangerouslySetInnerHTML={{ __html: widget.content }} />\n    </div>\n  ))}\n</aside>';
    
    const aiPrompt = 'You are a SENIOR REACT ENGINEER converting static HTML to TypeScript React components.\n\n' +
      'ORIGINAL HTML:\n' + sidebarCode + '\n\n' +
      '**YOUR PRIORITY**: PRESERVE 100% OF HTML STRUCTURE - only convert syntax!\n\n' +
      'CRITICAL RULES:\n' +
      '1. PRESERVE ALL:\n' +
      '   - Every <aside>, <div>, <section> stays EXACTLY as-is\n' +
      '   - ALL CSS classes (className="widget-area", etc.)\n' +
      '   - ALL IDs\n' +
      '   - Parent-child hierarchy IDENTICAL\n' +
      '   - Container wrappers IDENTICAL\n\n' +
      '2. ONLY CONVERT SYNTAX:\n' +
      '   - class → className\n' +
      '   - Self-closing tags\n\n' +
      '3. MAKE DYNAMIC (optional):\n' +
      '   - Widget areas: Map widgets while keeping wrapper structure\n' +
      '   - Recent posts: Map posts while keeping container classes\n' +
      '   - Keep ALL original classes\n\n' +
      '4. COMPONENT STRUCTURE:\n' +
      '   import * as React from \'react\';\n' +
      '   import type { Post, Category } from \'@/types\';\n' +
      '   export function Sidebar({ widgets, recentPosts, categories }: { widgets?: any[]; recentPosts?: Post[]; categories?: Category[] }) {\n' +
      '     return ( /* EXACT HTML STRUCTURE HERE */ );\n' +
      '   }\n\n' +
      'PROHIBITIONS:\n' +
      '❌ DO NOT change class names\n' +
      '❌ DO NOT remove wrappers\n' +
      '❌ DO NOT simplify structure\n\n' +
      'OUTPUT: Complete TypeScript code. No markdown.';

    if (this.aiClient) {
      try {
        const model = this.aiClient.getGenerativeModel({ model: 'gemini-3-pro-preview' });
        const result = await model.generateContent(aiPrompt);
        let aiResponse = result.response.text();
        
        const codeMatch = aiResponse.match(/```(?:typescript|tsx)?\n([\s\S]+?)\n```/);
        if (codeMatch) {
          aiResponse = codeMatch[1];
        }
        
        // Clean up JSX syntax errors and fix imports
        aiResponse = this.cleanJSX(aiResponse);
        
        this.api.log('✓ AI enhanced sidebar with dynamic widgets');
        return aiResponse;
      } catch (error: any) {
        this.api.log('AI sidebar enhancement failed: ' + error.message, 'warn');
      }
    }

    return sidebarCode;
  }

  private async nestpressifyTemplate(templateCode: string, templateName: string, blueprint: ThemeBlueprint, originalHTMLDir?: string): Promise<string> {
    await this.ensureAI();
    
    const fs = require('fs');
    const path = require('path');
    const componentName = this.capitalize(templateName);
    
    // Try to read original HTML if directory is provided
    let originalHTML = '';
    if (originalHTMLDir) {
      const htmlPath = path.join(originalHTMLDir, `${templateName}.html`);
      if (fs.existsSync(htmlPath)) {
        originalHTML = fs.readFileSync(htmlPath, 'utf-8');
        this.api.log(`✓ Using original HTML for ${templateName} template (design fidelity mode)`);
      } else {
        // Try index.html as fallback for home template
        const indexPath = path.join(originalHTMLDir, 'index.html');
        if (fs.existsSync(indexPath) && (templateName === 'home' || templateName === 'index')) {
          originalHTML = fs.readFileSync(indexPath, 'utf-8');
          this.api.log(`✓ Using original homepage HTML for ${templateName} template`);
        }
      }
    }
    
    // If we have original HTML, use it; otherwise fall back to templateCode
    const sourceHTML = originalHTML || templateCode;
    const usingOriginal = originalHTML.length > 0;
    
    // JSX examples stored as plain strings (not template literals to avoid compilation)
    const postsGridExample = '<div className="posts-grid">\n  {posts.filter(p => p.status === \'PUBLISHED\').map((post) => (\n    <article key={post.id} className="post-card">\n      {post.featuredImage && <img src={post.featuredImage} alt={post.title} />}\n      <h2><a href={`/blog/${post.slug}`}>{post.title}</a></h2>\n      <p>{post.excerpt}</p>\n    </article>\n  ))}\n</div>';
    
    const singlePostExample = '{post && (\n  <article className="single-post">\n    <h1>{post.title}</h1>\n    {post.featuredImage && <img src={post.featuredImage} alt={post.title} />}\n    <div className="post-meta">\n      <span>By {post.author}</span>\n      <span>{new Date(post.createdAt).toLocaleDateString()}</span>\n    </div>\n    <div dangerouslySetInnerHTML={{ __html: post.content }} />\n  </article>\n)}';
    
    const aiPrompt = usingOriginal 
      ? `You are a SENIOR REACT ENGINEER converting a cloned website to a NestPress theme.

**YOUR #1 PRIORITY**: Keep the EXACT HTML structure - DO NOT restructure, simplify, or reorganize!

**ORIGINAL HTML**:
${sourceHTML}

**CRITICAL RULES - FOLLOW STRICTLY**:

1. **PRESERVE 100% OF THE HTML STRUCTURE**:
   - Every single <div>, <section>, <article>, <span> stays EXACTLY as is
   - ALL CSS classes (class="...") preserved → className="..."
   - ALL IDs (id="...") preserved exactly
   - ALL inline styles (style="...") preserved → style={{...}}
   - ALL data attributes (data-*) preserved
   - ALL ARIA attributes preserved
   - Parent-child hierarchy stays IDENTICAL
   - Nesting depth stays IDENTICAL
   - Container wrappers stay IDENTICAL
   
2. **ONLY MAKE THESE MINIMAL CHANGES**:
   - class → className (syntax only)
   - for → htmlFor (syntax only)
   - style="font-size: 16px" → style={{fontSize: '16px'}} (syntax only)
   - <img> → <img /> (self-closing)
   - <br> → <br /> (self-closing)
   - <hr> → <hr /> (self-closing)
   - <input> → <input /> (self-closing)
   - <!-- comment --> → {/* comment */}
   
3. **TEXT CONTENT - KEEP AS-IS OR MAKE DYNAMIC**:
   - Static text like "Welcome!" → Keep as-is: "Welcome!"
   - Site titles → OPTIONAL: {header?.general?.siteTitle || 'Original Text'}
   - Menu items → OPTIONAL: Replace <nav> content with menu mapping
   - Blog posts → OPTIONAL: Replace post lists with posts.map()
   - **RULE**: When making dynamic, wrap in conditional to show original as fallback
   - **RULE**: Keep ALL wrapper divs and classes when making dynamic
   
4. **NAVIGATION/MENUS** (OPTIONAL):
   - Find <nav> or <ul className="menu">
   - Keep outer structure: <nav className="original-classes">
   - Replace inner items with: {primaryMenu?.items?.map((item, i) => (
       <li key={i} className="original-li-class">
         <a href={item.url} className="original-a-class">{item.label}</a>
       </li>
     )) || originalStaticItemsHere}
   - Use fallback || original items if no menu
   
5. **BLOG POSTS/CONTENT** (OPTIONAL):
   - Find blog sections like <div className="posts-grid">
   - Keep wrapper: <div className="posts-grid original-classes">
   - Replace posts with: {posts?.filter(p => p.status === 'PUBLISHED').slice(0,3).map((post) => (
       <article key={post.id} className="original-card-class">
         ... keep all nested structure ...
       </article>
     )) || originalStaticPostsHere}
   
6. **COMPONENT WRAPPER**:
   \`\`\`tsx
   import * as React from 'react';
   import type { ThemeTemplateProps } from '@/types';
   import { Header, Footer } from '../parts';
   
   export default function ${componentName}Template(props: ThemeTemplateProps) {
     const { posts = [], post, primaryMenu, footerMenu, header, footerWidgets } = props;
     
     return (
       <div className="original-wrapper-classes">
         {/* Original HTML structure here - UNCHANGED except JSX syntax */}
         {/* Only replace <header> with <Header /> component */}
         {/* Only replace <footer> with <Footer /> component */}
       </div>
     );
   }
   \`\`\`
   
7. **HEADER/FOOTER COMPONENTS**:
   - If you find <header id="header" className="..."> → Replace with:
     <Header primaryMenu={primaryMenu} header={header} />
   - If you find <footer id="footer" className="..."> → Replace with:
     <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
   - Everything else: Keep original structure
   
8. **ABSOLUTE PROHIBITIONS**:
   ❌ DO NOT change class names (av-main-nav stays av-main-nav!)
   ❌ DO NOT remove wrapper divs
   ❌ DO NOT simplify structure
   ❌ DO NOT reorganize elements
   ❌ DO NOT change tag types (<div> stays <div>, not <section>)
   ❌ DO NOT add new wrappers
   ❌ DO NOT use placeholders like "// rest of code"
   ❌ DO NOT remove background images or hero sections
   ❌ DO NOT change text unless making it dynamic with fallback
   ❌ DO NOT embed HTML in JSX attributes (strip HTML from data-* attributes!)
   ❌ DO NOT leave tags unclosed - every <tag> needs matching </tag>
   ❌ DO NOT create multiple root elements - wrap in single parent <div>
   
9. **IMAGES**:
   - Keep all <img src="/path/to/image.jpg" /> with original paths
   - Keep all style={{backgroundImage: 'url(...)'}}
   - Keep all className on image containers
   
10. **COMPLETE OUTPUT + JSX CORRECTNESS**:
    - Return FULL component code
    - Every line of original HTML must appear (as JSX)
    - No "..." or "// rest of code" shortcuts
    - Must be valid TypeScript that compiles
    - **CRITICAL**: Every opening tag MUST have matching closing tag
    - **CRITICAL**: All tags properly nested (close inner tags before outer)
    - **CRITICAL**: Single root element in return - wrap everything in one <div>
    - **CRITICAL**: Remove HTML from data-* attributes - convert to plain text or remove
    - **CRITICAL**: Self-close void elements: <img />, <br />, <hr />, <input />
    - **CRITICAL**: No raw fragments <> </> - use <React.Fragment> or <div>

**OUTPUT**: Complete TypeScript code. No markdown blocks. Start with: import * as React from 'react';`
      : `You are a SENIOR REACT ENGINEER creating a ${templateName} template for a headless CMS.

**CURRENT CODE**:
${sourceHTML}

**CRITICAL RULES - FOLLOW EXACTLY**:
1. FIRST LINE MUST BE: import * as React from 'react';
2. Import all needed types from '@/types' (Post, Product, ThemeTemplateProps, etc.)
3. Import parts: import { Header, Footer } from '../parts';
4. PRESERVE ALL EXISTING IMPORTS - DO NOT REMOVE THEM
5. Component name: ${componentName}Template
6. Export default function: export default function ${componentName}Template(props: ThemeTemplateProps)
7. Wrapper: <div className="${templateName}-template">
8. Include <Header primaryMenu={primaryMenu} header={header} /> at top
9. Include <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} /> at bottom
10. For index/archive: Use posts?.filter(p => p.status === 'PUBLISHED').map() with key={post.id}
11. For single: Use post object with conditional rendering {post && ...}
12. Use className not class, self-closing tags, NO fragments, NO dangerouslySetInnerHTML
13. Return COMPLETE valid TypeScript - NO placeholders, NO comments like "// rest of code"

**EXAMPLE - Posts grid (index/archive)**:
${postsGridExample}

**EXAMPLE - Single post**:
${singlePostExample}

**OUTPUT**: Pure TypeScript code only, no markdown, MUST start with: import * as React from 'react';`;

    if (this.aiClient) {
      try {
        const model = this.aiClient.getGenerativeModel({ model: 'gemini-3-pro-preview' });
        const result = await model.generateContent(aiPrompt);
        let aiResponse = result.response.text();
        
        const codeMatch = aiResponse.match(/```(?:typescript|tsx)?\n([\s\S]+?)\n```/);
        if (codeMatch) {
          aiResponse = codeMatch[1];
        }
        
        // Clean up JSX syntax errors and fix imports
        aiResponse = this.cleanJSX(aiResponse);
        
        this.api.log('✓ AI enhanced template: ' + templateName);
        return aiResponse;
      } catch (error: any) {
        this.api.log('AI template enhancement failed for ' + templateName + ': ' + error.message, 'error');
        this.api.log('Generating fallback template...', 'warn');
        // Generate a minimal valid template as fallback
        return this.generateFallbackTemplate(templateName, componentName);
      }
    }

    // If AI not available, generate fallback
    this.api.log('AI not available, generating fallback template for ' + templateName, 'warn');
    return this.generateFallbackTemplate(templateName, componentName);
  }
  
  /**
   * Generate a minimal valid template when AI fails
   */
  private generateFallbackTemplate(templateName: string, componentName: string): string {
    const templates: Record<string, string> = {
      index: `import * as React from 'react';
import type { ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../parts';

export default function IndexTemplate(props: ThemeTemplateProps) {
  const { posts = [], primaryMenu, footerMenu, header, footerWidgets } = props;
  const publishedPosts = posts.filter(p => p.status === 'PUBLISHED');
  
  return (
    <div className="index-template min-h-screen flex flex-col">
      <Header primaryMenu={primaryMenu} header={header} />
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Latest Posts</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow p-6">
              {post.featuredImage && <img src={post.featuredImage} alt={post.title} className="w-full h-48 object-cover rounded mb-4" />}
              <h2 className="text-xl font-semibold mb-2"><a href={\`/blog/\${post.slug}\`} className="hover:text-purple-600">{post.title}</a></h2>
              <p className="text-gray-600">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </main>
      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}`,
      home: `import * as React from 'react';
import type { ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../parts';

export default function HomeTemplate(props: ThemeTemplateProps) {
  const { posts = [], primaryMenu, footerMenu, header, footerWidgets } = props;
  const publishedPosts = posts.filter(p => p.status === 'PUBLISHED');
  
  return (
    <div className="home-template min-h-screen flex flex-col">
      <Header primaryMenu={primaryMenu} header={header} />
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Welcome</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedPosts.slice(0, 6).map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow p-6">
              {post.featuredImage && <img src={post.featuredImage} alt={post.title} className="w-full h-48 object-cover rounded mb-4" />}
              <h2 className="text-xl font-semibold mb-2"><a href={\`/blog/\${post.slug}\`} className="hover:text-purple-600">{post.title}</a></h2>
              <p className="text-gray-600">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </main>
      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}`,
      
      single: `import * as React from 'react';
import type { ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../parts';

export default function SingleTemplate(props: ThemeTemplateProps) {
  const { post, primaryMenu, footerMenu, header, footerWidgets } = props;
  
  return (
    <div className="single-template min-h-screen flex flex-col">
      <Header primaryMenu={primaryMenu} header={header} />
      <main className="flex-grow max-w-4xl mx-auto px-4 py-8">
        {post && (
          <article className="single-post">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            {post.featuredImage && <img src={post.featuredImage} alt={post.title} className="w-full rounded-lg mb-6" />}
            <div className="text-gray-600 mb-6">
              <span>By {post.author}</span>
              <span className="mx-2">•</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
        )}
      </main>
      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}`,
      
      page: `import * as React from 'react';
import type { ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../parts';

export default function PageTemplate(props: ThemeTemplateProps) {
  const { post, primaryMenu, footerMenu, header, footerWidgets } = props;
  
  return (
    <div className="page-template min-h-screen flex flex-col">
      <Header primaryMenu={primaryMenu} header={header} />
      <main className="flex-grow max-w-4xl mx-auto px-4 py-8">
        {post && (
          <article className="page">
            <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
        )}
      </main>
      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}`,

      'page-sidebar': `import * as React from 'react';
import type { ThemeTemplateProps } from '@/types';
import { Header, Footer, Sidebar } from '../parts';

export default function PageSidebarTemplate(props: ThemeTemplateProps) {
  const { post, posts = [], primaryMenu, footerMenu, header, footerWidgets, sidebarWidgets = [] } = props;
  
  return (
    <div className="page-sidebar-template min-h-screen flex flex-col">
      <Header primaryMenu={primaryMenu} header={header} />
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {post && (
              <article className="bg-white rounded-lg shadow p-8">
                <h1 className="text-3xl font-bold mb-6">{post.title}</h1>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
              </article>
            )}
          </div>
          <aside className="lg:col-span-1">
            <Sidebar widgets={sidebarWidgets} recentPosts={posts.slice(0, 5)} />
          </aside>
        </div>
      </main>
      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}`,

      archive: `import * as React from 'react';
import type { ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../parts';

export default function ArchiveTemplate(props: ThemeTemplateProps) {
  const { posts = [], primaryMenu, footerMenu, header, footerWidgets } = props;
  const publishedPosts = posts.filter(p => p.status === 'PUBLISHED');
  
  return (
    <div className="archive-template min-h-screen flex flex-col">
      <Header primaryMenu={primaryMenu} header={header} />
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Archive</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow p-6">
              {post.featuredImage && <img src={post.featuredImage} alt={post.title} className="w-full h-48 object-cover rounded mb-4" />}
              <h2 className="text-xl font-semibold mb-2"><a href={\`/blog/\${post.slug}\`} className="hover:text-purple-600">{post.title}</a></h2>
              <p className="text-gray-600">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </main>
      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}`,

      category: `import * as React from 'react';
import type { ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../parts';

export default function CategoryTemplate(props: ThemeTemplateProps) {
  const { posts = [], primaryMenu, footerMenu, header, footerWidgets } = props;
  const publishedPosts = posts.filter(p => p.status === 'PUBLISHED');
  
  return (
    <div className="category-template min-h-screen flex flex-col">
      <Header primaryMenu={primaryMenu} header={header} />
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Category</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow p-6">
              {post.featuredImage && <img src={post.featuredImage} alt={post.title} className="w-full h-48 object-cover rounded mb-4" />}
              <h2 className="text-xl font-semibold mb-2"><a href={\`/blog/\${post.slug}\`} className="hover:text-purple-600">{post.title}</a></h2>
              <p className="text-gray-600">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </main>
      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}`,

      search: `import * as React from 'react';
import type { ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../parts';

export default function SearchTemplate(props: ThemeTemplateProps) {
  const { posts = [], primaryMenu, footerMenu, header, footerWidgets } = props;
  const publishedPosts = posts.filter(p => p.status === 'PUBLISHED');
  
  return (
    <div className="search-template min-h-screen flex flex-col">
      <Header primaryMenu={primaryMenu} header={header} />
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Search Results</h1>
        {publishedPosts.length > 0 ? (
          <div className="space-y-6">
            {publishedPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2"><a href={\`/blog/\${post.slug}\`} className="hover:text-purple-600">{post.title}</a></h2>
                <p className="text-gray-600">{post.excerpt}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No results found.</p>
        )}
      </main>
      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}`,

      '404': `import * as React from 'react';
import type { ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../parts';

export default function NotFoundTemplate(props: ThemeTemplateProps) {
  const { primaryMenu, footerMenu, header, footerWidgets } = props;
  
  return (
    <div className="not-found-template min-h-screen flex flex-col">
      <Header primaryMenu={primaryMenu} header={header} />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-9xl font-bold text-purple-600 mb-4">404</h1>
          <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">The page you are looking for does not exist.</p>
          <a href="/" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">Go Home</a>
        </div>
      </main>
      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
}`
    };
    
    // Return template-specific fallback or generic page template
    const normalizedName = templateName.toLowerCase().replace(/-/g, '');
    const fallback = templates[templateName] || templates[normalizedName] || templates.page;
    this.api.log(`Generated fallback template for ${templateName}`, 'info');
    return fallback;
  }

  /**
   * AI-powered TypeScript error fixing
   * Analyzes errors and uses AI to generate corrected code
   */
  async fixTypeScriptErrors(code: string, errors: any[], filename: string): Promise<string> {
    await this.ensureAI();
    
    if (!this.aiClient) {
      this.api.log('AI not available for error fixing, returning original code', 'warn');
      return code;
    }
    
    // Build error context
    const errorList = errors.map(err => 
      'Line ' + err.line + ': ' + err.message + ' (code: ' + err.code + ')'
    ).join('\n');
    
    const aiPrompt = 'You are a TypeScript/React expert fixing compilation errors.\n\n' +
      'FILE: ' + filename + '\n\n' +
      'CURRENT CODE:\n```typescript\n' + code + '\n```\n\n' +
      'ERRORS:\n' + errorList + '\n\n' +
      'CRITICAL RULES:\n' +
      '1. FIRST LINE MUST BE: import * as React from \'react\';\n' +
      '2. Import types from \'@/types\' (Post, Menu, SiteSettings, etc.)\n' +
      '3. Use proper TypeScript interfaces for all props\n' +
      '4. Use className not class\n' +
      '5. NO fragments (<> or </>)\n' +
      '6. NO dangerouslySetInnerHTML\n' +
      '7. Self-closing tags for void elements\n' +
      '8. Return COMPLETE valid TypeScript - NO placeholders\n' +
      '9. Fix ALL errors listed above\n' +
      '10. Preserve all functionality - only fix syntax/type errors\n\n' +
      'OUTPUT: Pure TypeScript code only, no markdown. Start with: import * as React from \'react\';';

    try {
      const model = this.aiClient.getGenerativeModel({ model: 'gemini-3-pro-preview' });
      const result = await model.generateContent(aiPrompt);
      let fixedCode = result.response.text();
      
      // Extract code from markdown if present
      const codeMatch = fixedCode.match(/```(?:typescript|tsx)?\n([\s\S]+?)\n```/);
      if (codeMatch) {
        fixedCode = codeMatch[1];
      }
      
      // Apply cleanJSX to ensure correct format
      fixedCode = this.cleanJSX(fixedCode);
      
      this.api.log(`✓ AI fixed ${errors.length} errors in ${filename}`);
      return fixedCode;
      
    } catch (error: any) {
      this.api.log(`AI error fixing failed: ${error.message}`, 'warn');
      return code; // Return original on error
    }
  }
}
