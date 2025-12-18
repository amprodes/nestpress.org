/**
 * AI Theme Factory - TypeScript Interfaces
 * Professional type definitions for all services
 */

// ============================================================================
// Core Types
// ============================================================================

export interface ThemeBlueprint {
  url: string;
  siteTitle: string;
  description: string;
  pages: PageInfo[];
  hasEcommerce: boolean;
  designSystem: DesignSystem;
  structure: SiteStructure;
  assets: AssetInfo;
}

export interface PageInfo {
  url: string;
  title: string;
  type: 'home' | 'about' | 'services' | 'contact' | 'blog' | 'product' | 'other';
  hasHero: boolean;
  hasCTA: boolean;
  layout: string;
}

export interface DesignSystem {
  colors: ColorPalette;
  typography: Typography;
  spacing: SpacingSystem;
  layout: LayoutSystem;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

export interface Typography {
  fontFamily: string;
  headingFont: string;
  bodyFont: string;
  sizes: FontSizes;
  weights: FontWeights;
  lineHeights: LineHeights;
}

export interface FontSizes {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface FontWeights {
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
}

export interface LineHeights {
  tight: number;
  normal: number;
  relaxed: number;
}

export interface SpacingSystem {
  unit: number;
  scale: number[];
}

export interface LayoutSystem {
  maxWidth: string;
  containerPadding: string;
  gridColumns: number;
  gridGap: string;
}

export interface SiteStructure {
  navigation: NavigationStructure;
  footer: FooterStructure;
  sidebar: SidebarStructure;
}

export interface NavigationStructure {
  type: 'horizontal' | 'vertical' | 'mega';
  position: 'top' | 'side' | 'sticky';
  items: NavigationItem[];
}

export interface NavigationItem {
  label: string;
  url: string;
  children?: NavigationItem[];
}

export interface FooterStructure {
  columns: number;
  widgets: string[];
  hasSocial: boolean;
  hasCopyright: boolean;
}

export interface SidebarStructure {
  position: 'left' | 'right' | 'none';
  widgets: string[];
}

export interface AssetInfo {
  images: string[];
  fonts: string[];
  icons: string[];
  scripts: string[];
  styles: string[];
}

// ============================================================================
// Theme Structure
// ============================================================================

export interface ThemeStructure {
  rootDir: string;
  directories: ThemeDirectories;
  files: ThemeFiles;
  metadata: ThemeMetadata;
}

export interface ThemeDirectories {
  templatesDir: string;
  partsDir: string;
  patternsDir: string;
  stylesDir: string;
  assetsDir: string;
}

export interface ThemeFiles {
  templates: string[];
  parts: string[];
  patterns: string[];
  styles: string[];
  themeJson: string;
  indexTs: string;
  readme: string;
}

export interface ThemeMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  sourceUrl: string;
  generatedAt: string;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  file: string;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  line: number;
  column: number;
  message: string;
  code: number;
}

export interface ValidationWarning {
  type: 'missing-import' | 'fragment-usage' | 'style-issue';
  message: string;
  line?: number;
}

export interface ThemeValidationReport {
  valid: boolean;
  totalFiles: number;
  validFiles: number;
  invalidFiles: number;
  results: ValidationResult[];
  summary: string;
}

// ============================================================================
// Pattern Memory Types
// ============================================================================

export interface ErrorPattern {
  errorCode: number;
  errorMessage: string;
  fileType: 'template' | 'part';
  occurrences: number;
  lastSeen: string;
  commonFix?: string;
  example?: string;
}

export interface FixPattern {
  pattern: string | RegExp;
  replacement: string;
  description: string;
  confidence: number;
}

export interface PatternMemoryData {
  errorPatterns: Record<string, ErrorPattern>;
  fixPatterns: FixPattern[];
  lastUpdated: string;
}

export interface PatternMemoryStats {
  totalErrorPatterns: number;
  totalFixPatterns: number;
  highConfidencePatterns: number;
  topErrors: TopErrorInfo[];
}

export interface TopErrorInfo {
  code: number;
  message: string;
  occurrences: number;
  fileType: 'template' | 'part';
}

// ============================================================================
// API Types
// ============================================================================

export interface PluginAPI {
  log: (message: string, level?: 'info' | 'warn' | 'error') => void;
  error: (message: string) => void;
  warn: (message: string) => void;
  sendProgress?: (progress: number, message: string, data?: ProgressData) => void;
  progressStreams?: Map<string, ProgressStreamFunction>;
}

export interface ProgressData {
  type?: 'phase' | 'complete' | 'error';
  phase?: number;
  [key: string]: unknown;
}

export type ProgressStreamFunction = (progress: number, message: string, data?: ProgressData) => void;

// ============================================================================
// AI Service Types
// ============================================================================

export interface AIGenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export interface AIFixRequest {
  code: string;
  errors: ValidationError[];
  filename: string;
  fileType: 'template' | 'part';
  context?: string;
}

export interface AIFixResponse {
  fixedCode: string;
  explanation: string;
  confidence: number;
}

// ============================================================================
// Template Types
// ============================================================================

export interface TemplateConfig {
  name: string;
  type: 'home' | 'single' | 'page' | 'page-sidebar' | 'archive' | 'category' | 'search' | '404';
  hasHero: boolean;
  hasSidebar: boolean;
  sections: TemplateSection[];
}

export interface TemplateSection {
  type: 'hero' | 'content' | 'sidebar' | 'footer';
  content: string;
  props: Record<string, unknown>;
}

export interface PartConfig {
  name: string;
  component: 'Header' | 'Footer' | 'Sidebar' | 'PostMeta';
  props: string[];
  dependencies: string[];
}

// ============================================================================
// Package Types
// ============================================================================

export interface PackageResult {
  slug: string;
  filename: string;
  path: string;
  size: number;
}

export interface InstallResult {
  success: boolean;
  slug: string;
  message: string;
}

// ============================================================================
// Generation Job Types
// ============================================================================

export interface GenerationJob {
  id: string;
  url: string;
  themeName: string;
  status: 'pending' | 'analyzing' | 'cloning' | 'assembling' | 'nestpressifying' | 'packaging' | 'complete' | 'error';
  progress: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
  result?: GenerationResult;
}

export interface GenerationResult {
  themeName: string;
  slug: string;
  filename: string;
  downloadUrl: string;
  blueprint: Partial<ThemeBlueprint>;
  stats: GenerationStats;
}

export interface GenerationStats {
  totalFiles: number;
  fileSize: string;
  generatedAt: string;
  duration?: number;
  errorsFixed?: number;
  patternsLearned?: number;
}
