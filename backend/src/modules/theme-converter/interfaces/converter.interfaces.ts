/**
 * Theme Converter Interfaces
 */

export interface WordPressBlock {
  blockName: string;
  attrs: Record<string, any>;
  innerHTML: string;
  innerContent: string[];
  innerBlocks: WordPressBlock[];
}

export interface ParsedPattern {
  slug: string;
  title: string;
  categories: string[];
  keywords: string[];
  description: string;
  blockTypes?: string[];
  postTypes?: string[];
  viewportWidth?: number;
  blocks: WordPressBlock[];
  rawContent: string;
}

export interface ParsedTheme {
  name: string;
  slug: string;
  version: string;
  author: string;
  authorUri?: string;
  description: string;
  themeUri?: string;
  requiresPhp?: string;
  requiresWP?: string;
  textDomain?: string;
  tags: string[];
  patterns: ParsedPattern[];
  parts: ParsedPart[];
  templates: ParsedTemplate[];
  themeJson: any;
  assets: ThemeAssets;
  styleVariations?: StyleVariation[];
}

export interface StyleVariation {
  path: string;
  content: any;
}

export interface ParsedPart {
  name: string;
  area?: string;
  title?: string;
  content: string;
  blocks: WordPressBlock[];
}

export interface ParsedTemplate {
  name: string;
  title?: string;
  content: string;
  blocks: WordPressBlock[];
}

export interface ThemeAssets {
  css: string[];
  js: string[];
  images: string[];
  fonts: string[];
}

export interface ConversionResult {
  success: boolean;
  themeId: string;
  themeName: string;
  outputPath: string;
  conversionLog: ConversionLogEntry[];
  warnings: string[];
  errors: string[];
  stats: ConversionStats;
}

export interface ConversionLogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  context?: string;
}

export interface ConversionStats {
  totalPatterns: number;
  convertedPatterns: number;
  totalBlocks: number;
  convertedBlocks: number;
  totalParts: number;
  convertedParts: number;
  assetsProcessed: number;
}

export interface BlockTransformResult {
  jsx: string;
  imports: Set<string>;
  warnings: string[];
}

export interface ComponentGenerationOptions {
  typescript: boolean;
  useTailwind: boolean;
  includeComments: boolean;
  formatCode: boolean;
}
