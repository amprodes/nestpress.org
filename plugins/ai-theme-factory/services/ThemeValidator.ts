/**
 * Dynamic TypeScript/React Theme Validator
 * Validates generated theme files using TypeScript compiler API
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ThemeValidationReport,
  PluginAPI,
} from '../types';

export class ThemeValidator {
  private api: PluginAPI;

  constructor(api: PluginAPI) {
    this.api = api;
  }

  /**
   * Validate entire theme structure and all TypeScript files
   */
  async validateTheme(themeDir: string): Promise<ThemeValidationReport> {
    this.api.log('🔬 Starting theme validation...');
    
    const results: ValidationResult[] = [];
    
    // Find all .tsx files
    const files = this.findTsxFiles(themeDir);
    this.api.log(`Found ${files.length} TypeScript files to validate`);
    
    // Validate each file
    for (const file of files) {
      const result = await this.validateFile(file, themeDir);
      results.push(result);
    }
    
    // Generate report
    const validFiles = results.filter(r => r.valid).length;
    const invalidFiles = results.filter(r => !r.valid).length;
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
    
    const valid = invalidFiles === 0 && totalErrors === 0;
    
    let summary = '';
    if (valid) {
      summary = `✅ All ${files.length} files passed validation!`;
      if (totalWarnings > 0) {
        summary += ` (${totalWarnings} warnings)`;
      }
    } else {
      summary = `❌ ${invalidFiles}/${files.length} files have errors (${totalErrors} total errors, ${totalWarnings} warnings)`;
    }
    
    this.api.log(summary);
    
    return {
      valid,
      totalFiles: files.length,
      validFiles,
      invalidFiles,
      results,
      summary,
    };
  }

  /**
   * Validate single TypeScript file using TS compiler
   */
  public async validateFile(filePath: string, themeDir: string): Promise<ValidationResult> {
    const relativePath = path.relative(themeDir, filePath);
    this.api.log(`  Validating: ${relativePath}`);
    
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    try {
      const code = fs.readFileSync(filePath, 'utf-8');
      
      // TypeScript compiler options - focus on syntax, not type resolution
      const compilerOptions: ts.CompilerOptions = {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.React,
        strict: false, // Don't enforce strict checking during validation
        esModuleInterop: true,
        skipLibCheck: true, // Skip checking .d.ts files
        allowSyntheticDefaultImports: true,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        noResolve: true, // Don't resolve imports - just check syntax
        baseUrl: '.',
        paths: {
          '@/types': [path.join(__dirname, '../../../types.ts')],
        },
      };
      
      // Create source file
      const sourceFile = ts.createSourceFile(
        filePath,
        code,
        ts.ScriptTarget.ES2020,
        true,
        ts.ScriptKind.TSX
      );
      
      // Create program
      const host = ts.createCompilerHost(compilerOptions);
      const originalGetSourceFile = host.getSourceFile;
      
      host.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) => {
        if (fileName === filePath) {
          return sourceFile;
        }
        return originalGetSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
      };
      
      const program = ts.createProgram([filePath], compilerOptions, host);
      
      // Get diagnostics
      const diagnostics = [
        ...program.getSyntacticDiagnostics(sourceFile),
        ...program.getSemanticDiagnostics(sourceFile),
      ];
      
      // Process diagnostics
      for (const diagnostic of diagnostics) {
        if (diagnostic.file && diagnostic.start !== undefined) {
          const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
          const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
          
          // Filter out known acceptable errors
          if (this.shouldIgnoreError(message, diagnostic.code)) {
            continue;
          }
          
          errors.push({
            line: line + 1,
            column: character + 1,
            message,
            code: diagnostic.code,
          });
        }
      }
      
      // Additional custom validations
      this.performCustomValidations(code, warnings);
      
    } catch (error: any) {
      errors.push({
        line: 0,
        column: 0,
        message: `Validation failed: ${error.message}`,
        code: 0,
      });
    }
    
    const valid = errors.length === 0;
    
    if (valid) {
      this.api.log(`    ✅ ${relativePath}`);
    } else {
      this.api.log(`    ❌ ${relativePath} (${errors.length} errors)`);
    }
    
    return {
      valid,
      file: relativePath,
      errors,
      warnings,
    };
  }

  /**
   * Custom validations for React/JSX best practices
   */
  private performCustomValidations(code: string, warnings: ValidationWarning[]): void {
    // Check for React import format
    if (!code.includes("import * as React from 'react'")) {
      if (code.includes("import React from 'react'")) {
        warnings.push({
          type: 'missing-import',
          message: "Should use 'import * as React from \"react\"' for better compatibility",
          line: 1,
        });
      }
    }
    
    // Check for fragments
    const fragmentMatches = code.match(/<>|<\/>/g);
    if (fragmentMatches) {
      warnings.push({
        type: 'fragment-usage',
        message: `Found ${fragmentMatches.length} fragment tags - fragments not recommended`,
      });
    }
    
    // Check for class instead of className
    const classMatches = code.match(/\sclass=/g);
    if (classMatches) {
      warnings.push({
        type: 'style-issue',
        message: `Found ${classMatches.length} 'class=' attributes - should use 'className='`,
      });
    }
  }

  /**
   * Filter out known acceptable errors
   */
  private shouldIgnoreError(message: string, code: number): boolean {
    // Ignore module resolution errors during validation
    if (code === 2307 && message.includes("Cannot find module")) {
      return true;
    }
    
    // Ignore missing type definition files (TS7016)
    if (code === 7016 && message.includes("Could not find a declaration file")) {
      return true;
    }
    
    // Ignore JSX implicit any (TS7026) - expected without full type setup
    if (code === 7026 && message.includes("JSX element implicitly has type 'any'")) {
      return true;
    }
    
    // Ignore implicit any types (TS7006) during validation
    if (code === 7006 && message.includes("implicitly has an 'any' type")) {
      return true;
    }
    
    // Ignore cannot find name errors for globals
    if (code === 2304 && (message.includes("Cannot find name 'React'") || message.includes("Cannot find name 'JSX'") || message.includes("Cannot find name 'Date'"))) {
      return true;
    }
    
    // Ignore property does not exist on type '{}' - type inference limitation
    if (code === 2339 && message.includes("Property 'map' does not exist on type '{}'")) {
      return true;
    }
    
    return false;
  }

  /**
   * Find all .tsx files in theme directory
   */
  private findTsxFiles(dir: string): string[] {
    const files: string[] = [];
    
    const scan = (currentDir: string) => {
      if (!fs.existsSync(currentDir)) return;
      
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          scan(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    };
    
    scan(dir);
    return files;
  }

  /**
   * Quick validation - just check if files compile
   */
  async quickValidate(themeDir: string): Promise<boolean> {
    const report = await this.validateTheme(themeDir);
    return report.valid;
  }
}
