/**
 * Phase 1: Theme Analyzer Service
 * 
 * Analyzes target website to extract:
 * - Design system (colors, fonts, spacing)
 * - Structure (navigation, widgets, layouts)
 * - Content (HTML snippets for templates)
 * - Resources (CSS, images, fonts, scripts)
 */

import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export interface ThemeBlueprint {
  url: string;
  siteTitle: string;
  designSystem: {
    colors: {
      primary: string;
      secondary: string;
      text: string;
      background: string;
      accent: string;
    };
    typography: {
      headingFont: string;
      bodyFont: string;
      sizes: Record<string, string>;
    };
    spacing: Record<string, string>;
    borderRadius: Record<string, string>;
  };
  structure: {
    navigation: Array<{
      location: string;
      items: Array<{ label: string; url: string }>;
    }>;
    widgets: Array<{
      id: string;
      title: string;
      location: string;
    }>;
    layout: {
      type: string;
      hasSidebar: boolean;
      headerStyle: string;
      footerStyle: string;
    };
  };
  htmlSnippets: {
    header: string;
    footer: string;
    sidebar?: string;
    homepage: string;
    templates: Record<string, string>;
  };
  resources: {
    stylesheets: string[];
    images: string[];
    fonts: string[];
    scripts: string[];
  };
  pages: Array<{ url: string; title: string; type: string }>;
  hasEcommerce: boolean;
  metadata?: {
    description?: string;
    screenshot?: Buffer;
  };
}

export class ThemeAnalyzer {
  private api: any;

  constructor(api: any) {
    this.api = api;
  }

  async analyze(url: string): Promise<ThemeBlueprint> {
    this.api.log(`[ThemeAnalyzer] Starting analysis of: ${url}`);
    
    let browser;
    try {
      this.api.sendProgress?.(11, 'Connecting to target website...', { type: 'phase', phase: 1 });
      
      browser = await puppeteer.launch({ 
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
      });
      const page = await browser.newPage();
      
      // Set User-Agent to avoid being blocked
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Navigate with increased timeout and less strict wait condition
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
      
      // Try to wait for network idle to ensure assets load, but don't fail if it times out
      try {
        await page.waitForNetworkIdle({ timeout: 30000 });
      } catch (e) {
        this.api.log('[ThemeAnalyzer] Network idle timeout (continuing anyway)', 'warn');
      }

      this.api.sendProgress?.(12, `Fetched ${Math.round((await page.content()).length/1024)}KB of HTML`, { type: 'phase', phase: 1 });

      const html = await page.content();
      const $ = cheerio.load(html);
      
      this.api.sendProgress?.(13, `Parsing ${$('*').length} HTML elements...`, { type: 'phase', phase: 1 });
      
      this.api.sendProgress?.(14, 'AI analyzing page layout...', { type: 'phase', phase: 1 });
      const layout = this.analyzeLayout($);
      this.api.sendProgress?.(15, 'Layout zones identified', { type: 'phase', phase: 1 });

      this.api.sendProgress?.(16, 'Extracting page structure...', { type: 'phase', phase: 1 });
      const structure = this.extractStructure($, url);
      this.api.sendProgress?.(17, `Found ${structure.navigation.length} menus`, { type: 'phase', phase: 1 });

      this.api.sendProgress?.(18, 'Analyzing colors and typography...', { type: 'phase', phase: 1 });
      const designSystem = await this.extractDesignSystem($, page);
      this.api.sendProgress?.(19, 'Design system extracted', { type: 'phase', phase: 1 });

      const resources = this.collectResources($, url);
      const htmlSnippets = this.extractHTMLSnippets($);
      this.api.log(`[ThemeAnalyzer] htmlSnippets created with keys: ${Object.keys(htmlSnippets).join(', ')}`);
      this.api.log(`[ThemeAnalyzer] homepage property exists: ${!!htmlSnippets.homepage}`);
      const pages = this.discoverPages($, url);
      const siteTitle = $('title').text() || new URL(url).hostname;
      const screenshot = await page.screenshot({ fullPage: false });

      await browser.close();

      this.api.log(`✓ Analysis complete: ${siteTitle}`);

      return {
        url,
        siteTitle,
        designSystem,
        structure: { ...structure, layout },
        htmlSnippets,
        resources,
        pages,
        hasEcommerce: this.detectEcommerce($),
        metadata: {
          description: $('meta[name="description"]').attr('content'),
          screenshot,
        },
      };
    } catch (error: any) {
      if (browser) await browser.close();
      this.api.log('Analysis failed: ' + error.message, 'error');
      throw error;
    }
  }

  private analyzeLayout($: cheerio.CheerioAPI): any {
    const hasSidebar = $('aside, [class*="sidebar"], [id*="sidebar"]').length > 0;
    const headerStyle = $('header').length > 0 ? 'modern' : 'classic';
    const footerStyle = $('footer').length > 0 ? 'modern' : 'classic';

    return {
      type: hasSidebar ? 'sidebar-layout' : 'full-width',
      hasSidebar,
      headerStyle,
      footerStyle,
    };
  }

  private extractStructure($: cheerio.CheerioAPI, baseUrl: string): any {
    const navigation: any[] = [];
    
    $('nav, [role="navigation"]').each((i, nav) => {
      const items: any[] = [];
      $(nav).find('a').each((j, link) => {
        const href = $(link).attr('href');
        const label = $(link).text().trim();
        if (href && label) {
          items.push({ label, url: this.resolveUrl(href, baseUrl) });
        }
      });
      
      if (items.length > 0) {
        navigation.push({
          location: i === 0 ? 'primary' : `menu-${i + 1}`,
          items,
        });
      }
    });

    const widgets: any[] = [];
    $('[class*="widget"], [class*="sidebar"] > div').each((i, widget) => {
      const title = $(widget).find('h1,h2,h3,h4').first().text().trim();
      widgets.push({
        id: `widget-${i + 1}`,
        title: title || `Widget ${i + 1}`,
        location: 'sidebar',
      });
    });

    return { navigation, widgets };
  }

  private async extractDesignSystem($: cheerio.CheerioAPI, page: any): Promise<any> {
    const colors = await page.evaluate(() => {
      const computedStyle = getComputedStyle(document.body);
      return {
        primary: computedStyle.getPropertyValue('--primary-color') || '#2563eb',
        secondary: computedStyle.getPropertyValue('--secondary-color') || '#64748b',
        text: computedStyle.color || '#1e293b',
        background: computedStyle.backgroundColor || '#ffffff',
        accent: computedStyle.getPropertyValue('--accent-color') || '#f59e0b',
      };
    });

    const typography = await page.evaluate(() => {
      const body = getComputedStyle(document.body);
      const heading = getComputedStyle(document.querySelector('h1') || document.body);
      return {
        headingFont: heading.fontFamily || 'Inter, sans-serif',
        bodyFont: body.fontFamily || 'Inter, sans-serif',
        sizes: {
          base: body.fontSize || '16px',
          h1: heading.fontSize || '2.5rem',
        },
      };
    });

    return {
      colors,
      typography,
      spacing: { base: '1rem', lg: '2rem' },
      borderRadius: { sm: '0.25rem', md: '0.5rem' },
    };
  }

  private extractHTMLSnippets($: cheerio.CheerioAPI): any {
    // Extract full body HTML as the homepage template
    const bodyHTML = $('body').html() || '';
    
    this.api.log(`[ThemeAnalyzer] Extracted homepage HTML: ${bodyHTML.length} characters`);
    
    return {
      header: $('header').html() || '<header><h1>Site Name</h1></header>',
      footer: $('footer').html() || '<footer><p>&copy; 2024</p></footer>',
      sidebar: $('aside, [class*="sidebar"]').first().html(),
      homepage: bodyHTML, // Full body HTML for homepage
      templates: {
        home: bodyHTML,
        single: $('main, [role="main"], article').first().html() || bodyHTML,
        page: bodyHTML,
      },
    };
  }

  private collectResources($: cheerio.CheerioAPI, baseUrl: string): any {
    const stylesheets: string[] = [];
    const images: string[] = [];
    const fonts: string[] = [];
    const scripts: string[] = [];

    $('link[rel="stylesheet"]').each((i, link) => {
      const href = $(link).attr('href');
      if (href) stylesheets.push(this.resolveUrl(href, baseUrl));
    });

    $('img').each((i, img) => {
      const src = $(img).attr('src');
      if (src) images.push(this.resolveUrl(src, baseUrl));
    });

    $('script[src]').each((i, script) => {
      const src = $(script).attr('src');
      if (src && !src.includes('google') && !src.includes('facebook')) {
        scripts.push(this.resolveUrl(src, baseUrl));
      }
    });

    return { stylesheets, images, fonts, scripts };
  }

  private discoverPages($: cheerio.CheerioAPI, baseUrl: string): any[] {
    const pages: any[] = [];
    const domain = new URL(baseUrl).hostname;

    $('a[href]').each((i, link) => {
      const href = $(link).attr('href');
      const text = $(link).text().trim();
      
      if (href && text) {
        const resolvedUrl = this.resolveUrl(href, baseUrl);
        try {
          const linkDomain = new URL(resolvedUrl).hostname;
          if (linkDomain === domain && !pages.find(p => p.url === resolvedUrl)) {
            pages.push({ url: resolvedUrl, title: text, type: 'page' });
          }
        } catch (e) {}
      }
    });

    return pages.slice(0, 10);
  }

  private detectEcommerce($: cheerio.CheerioAPI): boolean {
    const indicators = [
      '[class*="cart"]', '[class*="product"]', '[class*="price"]',
      '[class*="checkout"]', '[data-product-id]'
    ];
    return indicators.some(sel => $(sel).length > 0);
  }

  private resolveUrl(href: string, baseUrl: string): string {
    try {
      return new URL(href, baseUrl).href;
    } catch {
      return href;
    }
  }
}
