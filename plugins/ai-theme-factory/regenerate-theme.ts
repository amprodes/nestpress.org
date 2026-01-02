#!/usr/bin/env node
/**
 * Theme Regenerator Script
 * 
 * Regenerates React templates from original HTML with 100% visual fidelity.
 * Usage: npx ts-node regenerate-theme.ts <theme-slug>
 */

import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import HtmlFidelityConverter from './services/HtmlFidelityConverter';

const THEMES_DIR = path.join(__dirname, '../../themes');

interface ThemeConfig {
  slug: string;
  sourceUrl: string;
}

// Get theme config from theme.json or infer from original HTML
function getThemeConfig(themeSlug: string): ThemeConfig {
  const themePath = path.join(THEMES_DIR, themeSlug);
  const themeJsonPath = path.join(themePath, 'theme.json');
  
  let sourceUrl = '';
  
  // Try to read from theme.json
  if (fs.existsSync(themeJsonPath)) {
    const themeJson = JSON.parse(fs.readFileSync(themeJsonPath, 'utf-8'));
    sourceUrl = themeJson.sourceUrl || '';
  }
  
  // If not in theme.json, try to infer from original HTML
  if (!sourceUrl) {
    const originalHtmlPath = path.join(themePath, 'original-html/index.html');
    if (fs.existsSync(originalHtmlPath)) {
      const html = fs.readFileSync(originalHtmlPath, 'utf-8');
      // Look for URLs in the HTML
      const urlMatch = html.match(/https?:\/\/[^"'\s]+/);
      if (urlMatch) {
        // Extract base URL
        const url = new URL(urlMatch[0]);
        sourceUrl = `${url.protocol}//${url.host}${url.pathname.split('/').slice(0, 2).join('/')}`;
      }
    }
  }
  
  return { slug: themeSlug, sourceUrl };
}

function generateHeader(converter: HtmlFidelityConverter, html: string, themePath: string): void {
  const $ = cheerio.load(html);
  
  // Find header with multiple selectors
  let headerHtml = '';
  const headerEl = $('header.header-area, header, .header-area, .site-header').first();
  
  if (headerEl.length) {
    headerHtml = $.html(headerEl);
  }
  
  if (!headerHtml) {
    console.log('⚠ No header found in original HTML');
    return;
  }
  
  // Convert to JSX
  const jsxContent = converter.convert(headerHtml);
  
  const headerComponent = `import * as React from 'react';
import type { ThemeTemplateProps } from '@/types';

export function Header(props: ThemeTemplateProps) {
  return (
    <>
      ${jsxContent}
    </>
  );
}
`;

  const headerPath = path.join(themePath, 'parts/Header.tsx');
  fs.writeFileSync(headerPath, headerComponent);
  console.log('✓ Generated Header.tsx from original HTML');
}

function generateFooter(converter: HtmlFidelityConverter, html: string, themePath: string): void {
  const $ = cheerio.load(html);
  
  // Find footer
  let footerHtml = '';
  const footerEl = $('footer.footer-area, footer, .footer-area, .site-footer').last();
  
  if (footerEl.length) {
    footerHtml = $.html(footerEl);
  }
  
  if (!footerHtml) {
    console.log('⚠ No footer found in original HTML');
    return;
  }
  
  // Convert to JSX
  const jsxContent = converter.convert(footerHtml);
  
  const footerComponent = `import * as React from 'react';
import type { ThemeTemplateProps } from '@/types';

export function Footer(props: ThemeTemplateProps) {
  return (
    <>
      ${jsxContent}
    </>
  );
}
`;

  const footerPath = path.join(themePath, 'parts/Footer.tsx');
  fs.writeFileSync(footerPath, footerComponent);
  console.log('✓ Generated Footer.tsx from original HTML');
}

function generateIndexTemplate(converter: HtmlFidelityConverter, html: string, themePath: string): void {
  const $ = cheerio.load(html);
  
  // Remove header and footer - they're separate components
  $('header.header-area, header, .header-area, .site-header').remove();
  $('footer.footer-area, footer, .footer-area, .site-footer').remove();
  
  // Remove scripts, noscript, stylesheet links (CSS is loaded by theme system)
  $('script').remove();
  $('noscript').remove();
  $('link[rel="stylesheet"]').remove();
  $('style').remove();
  
  // Get remaining body content
  let mainContent = $('body').html() || '';
  
  // Clean up HTML wrapper tags
  mainContent = mainContent
    .replace(/<html[^>]*>/gi, '')
    .replace(/<\/html>/gi, '')
    .trim();
  
  // Convert to JSX
  const jsxContent = converter.convert(mainContent);
  
  const indexTemplate = `import * as React from 'react';
import type { ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../index';

export default function IndexTemplate(props: ThemeTemplateProps) {
  return (
    <>
      <Header {...props} />
      ${jsxContent}
      <Footer {...props} />
    </>
  );
}
`;

  const indexPath = path.join(themePath, 'templates/index.tsx');
  fs.writeFileSync(indexPath, indexTemplate);
  console.log('✓ Generated index.tsx from original HTML');
}

async function regenerateTheme(themeSlug: string): Promise<void> {
  console.log(`\n🔄 Regenerating theme: ${themeSlug}\n`);
  
  const themePath = path.join(THEMES_DIR, themeSlug);
  const originalHtmlPath = path.join(themePath, 'original-html/index.html');
  
  // Check if theme exists
  if (!fs.existsSync(themePath)) {
    console.error(`❌ Theme not found: ${themePath}`);
    process.exit(1);
  }
  
  // Check if original HTML exists
  if (!fs.existsSync(originalHtmlPath)) {
    console.error(`❌ Original HTML not found: ${originalHtmlPath}`);
    console.log('   Please clone the WordPress theme first.');
    process.exit(1);
  }
  
  // Get theme config
  const config = getThemeConfig(themeSlug);
  console.log(`📍 Source URL: ${config.sourceUrl || '(not detected)'}`);
  
  // Read original HTML
  const html = fs.readFileSync(originalHtmlPath, 'utf-8');
  console.log(`📄 Read ${html.length} bytes from original HTML`);
  
  // Create converter
  const converter = new HtmlFidelityConverter({
    themeSlug: config.slug,
    sourceUrl: config.sourceUrl || 'https://example.com'
  });
  
  // Generate components
  generateHeader(converter, html, themePath);
  generateFooter(converter, html, themePath);
  generateIndexTemplate(converter, html, themePath);
  
  console.log('\n✅ Theme regeneration complete!\n');
}

// Main execution
const themeSlug = process.argv[2] || 'redox-dark';
regenerateTheme(themeSlug).catch(console.error);
