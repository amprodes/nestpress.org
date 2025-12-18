import * as fs from 'fs';
import * as path from 'path';
import type {
  ErrorPattern,
  FixPattern,
  PatternMemoryData,
  PatternMemoryStats,
  ValidationError,
  PluginAPI,
} from '../types';

/**
 * Pattern Memory - Learns from AI fixes to improve boilerplate generation
 * Stores common error patterns and their fixes
 */

export class ThemePatternMemory {
  private memoryFile: string;
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private fixPatterns: FixPattern[] = [];
  private api: PluginAPI;

  constructor(api: PluginAPI, memoryFile?: string) {
    this.api = api;
    this.memoryFile = memoryFile || path.join(__dirname, '../.pattern-memory.json');
    this.loadMemory();
  }

  /**
   * Load memory from disk
   */
  private loadMemory(): void {
    if (fs.existsSync(this.memoryFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.memoryFile, 'utf-8'));
        
        // Load error patterns
        if (data.errorPatterns) {
          Object.entries(data.errorPatterns).forEach(([key, value]) => {
            this.errorPatterns.set(key, value as ErrorPattern);
          });
        }
        
        // Load fix patterns
        if (data.fixPatterns) {
          this.fixPatterns = data.fixPatterns;
        }
        
        this.api.log(`[PatternMemory] Loaded memory: ${this.errorPatterns.size} error patterns, ${this.fixPatterns.length} fix patterns`);
      } catch (error: any) {
        this.api.log(`[PatternMemory] Failed to load memory: ${error.message}`, 'warn');
      }
    } else {
      this.api.log(`[PatternMemory] No existing memory file - starting fresh`);
    }
  }

  /**
   * Save memory to disk
   */
  private saveMemory(): void {
    try {
      const data: PatternMemoryData = {
        errorPatterns: Object.fromEntries(this.errorPatterns),
        fixPatterns: this.fixPatterns,
        lastUpdated: new Date().toISOString(),
      };
      
      fs.writeFileSync(this.memoryFile, JSON.stringify(data, null, 2));
      this.api.log(`[PatternMemory] Memory saved successfully`);
    } catch (error: any) {
      this.api.log(`[PatternMemory] Failed to save memory: ${error.message}`, 'warn');
    }
  }

  /**
   * Record an error occurrence
   */
  recordError(error: ValidationError, fileType: 'template' | 'part', filename: string): void {
    const key = `${error.code}_${fileType}`;
    
    if (this.errorPatterns.has(key)) {
      const pattern = this.errorPatterns.get(key)!;
      pattern.occurrences++;
      pattern.lastSeen = new Date().toISOString();
    } else {
      this.errorPatterns.set(key, {
        errorCode: error.code,
        errorMessage: error.message,
        fileType,
        occurrences: 1,
        lastSeen: new Date().toISOString(),
      });
    }
  }

  /**
   * Learn from a successful AI fix
   */
  learnFromFix(
    originalCode: string, 
    fixedCode: string, 
    errors: ValidationError[], 
    fileType: 'template' | 'part'
  ): void {
    // Extract patterns by comparing original and fixed code
    const patterns = this.extractFixPatterns(originalCode, fixedCode);
    
    patterns.forEach(pattern => {
      // Only process patterns that have all required properties
      if (!pattern.pattern || !pattern.replacement || !pattern.description) {
        return;
      }
      
      const existing = this.fixPatterns.find(p => p.pattern === pattern.pattern);
      
      if (existing) {
        // Increase confidence for repeated successful fixes
        existing.confidence = Math.min(1, existing.confidence + 0.1);
      } else {
        this.fixPatterns.push({
          pattern: pattern.pattern,
          replacement: pattern.replacement,
          description: pattern.description,
          confidence: 0.5, // Start with medium confidence
        });
      }
    });
    
    // Record which errors were fixed
    errors.forEach(error => {
      this.recordError(error, fileType, '');
      const key = `${error.code}_${fileType}`;
      const pattern = this.errorPatterns.get(key);
      if (pattern) {
        // Store common fix example
        pattern.commonFix = fixedCode.substring(0, 200); // Store snippet
      }
    });
    
    this.saveMemory();
  }

  /**
   * Extract fix patterns by comparing original and fixed code
   */
  private extractFixPatterns(original: string, fixed: string): Partial<FixPattern>[] {
    const patterns: Partial<FixPattern>[] = [];
    
    // Common pattern: primaryMenu?.items.map vs primaryMenu?.items?.map
    if (original.includes('?.items.map') && fixed.includes('?.items?.map')) {
      patterns.push({
        pattern: /(\w+)\?\.items\.map/g,
        replacement: '$1?.items?.map',
        description: 'Add optional chaining to .items.map() to prevent type errors',
      } as any);
    }
    
    // Pattern: new Date() wrapped with window.Date or globalThis.Date
    if (original.includes('new Date(') && (fixed.includes('window.Date') || fixed.includes('globalThis.Date'))) {
      patterns.push({
        pattern: /new Date\(/g,
        replacement: 'new (globalThis.Date || Date)(',
        description: 'Use globalThis.Date for TypeScript validation compatibility',
      } as any);
    }
    
    // Pattern: Missing optional chaining on widget properties
    if (original.includes('widget.') && fixed.includes('widget?.')) {
      patterns.push({
        pattern: /widget\.(id|title|content)/g,
        replacement: 'widget?.$1',
        description: 'Add optional chaining to widget properties',
      } as any);
    }
    
    return patterns;
  }

  /**
   * Apply learned patterns to improve boilerplate
   */
  applyLearnedPatterns(code: string): string {
    let improved = code;
    
    // Apply high-confidence fix patterns
    this.fixPatterns
      .filter(p => p.confidence >= 0.7) // Only apply patterns with 70%+ confidence
      .forEach(pattern => {
        if (typeof pattern.pattern === 'string') {
          improved = improved.replace(new RegExp(pattern.pattern, 'g'), pattern.replacement);
        } else {
          improved = improved.replace(pattern.pattern, pattern.replacement);
        }
      });
    
    return improved;
  }

  /**
   * Get statistics about learned patterns
   */
  getStats(): PatternMemoryStats {
    const topErrors = Array.from(this.errorPatterns.entries())
      .sort((a, b) => b[1].occurrences - a[1].occurrences)
      .slice(0, 5);
    
    return {
      totalErrorPatterns: this.errorPatterns.size,
      totalFixPatterns: this.fixPatterns.length,
      highConfidencePatterns: this.fixPatterns.filter(p => p.confidence >= 0.7).length,
      topErrors: topErrors.map(([key, pattern]) => ({
        code: pattern.errorCode,
        message: pattern.errorMessage.substring(0, 80),
        occurrences: pattern.occurrences,
        fileType: pattern.fileType,
      })),
    };
  }

  /**
   * Get improvement suggestions for boilerplate
   */
  getSuggestions(): string[] {
    const suggestions: string[] = [];
    
    // Check for common errors that should be fixed in boilerplate
    this.errorPatterns.forEach((pattern, key) => {
      if (pattern.occurrences >= 3) { // If error happens 3+ times
        if (pattern.errorCode === 2304 && pattern.errorMessage.includes('Date')) {
          suggestions.push('Use globalThis.Date instead of Date in boilerplate');
        }
        
        if (pattern.errorCode === 2339 && pattern.errorMessage.includes('map')) {
          suggestions.push('Add optional chaining (?.) to all array operations in boilerplate');
        }
      }
    });
    
    return suggestions;
  }
}
