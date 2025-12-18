/**
 * Phase 5: Theme Packager Service
 * 
 * Creates installable .zip archives with:
 * - Structure validation
 * - Manifest generation
 * - Installation instructions
 * - Checksum calculation
 */

import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import * as crypto from 'crypto';

export interface PackageResult {
  zipPath: string;
  filename: string;
  slug: string;
  size: number;
  checksum: string;
  themeName: string;
  manifest: any;
}

export class ThemePackager {
  private api: any;
  private tempDir: string;

  constructor(api: any, tempDir: string) {
    this.api = api;
    this.tempDir = tempDir;
  }

  async package(themeDir: string, themeName: string): Promise<PackageResult> {
    this.api.log(`[ThemePackager] Packaging theme: ${themeName}`);

    this.api.sendProgress?.(89, 'Validating theme structure...', { type: 'phase', phase: 5 });
    this.validateStructure(themeDir);
    this.api.sendProgress?.(91, 'Structure validated', { type: 'phase', phase: 5 });

    this.api.sendProgress?.(92, 'Generating manifest...', { type: 'phase', phase: 5 });
    const manifest = this.generateManifest(themeDir, themeName);
    fs.writeFileSync(path.join(themeDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
    
    // Read slug from theme.json (the source of truth)
    const themeJson = JSON.parse(fs.readFileSync(path.join(themeDir, 'theme.json'), 'utf-8'));
    const slug = themeJson.slug;
    
    this.api.sendProgress?.(93, 'Manifest created', { type: 'phase', phase: 5 });

    this.api.sendProgress?.(94, 'Writing INSTALL.md instructions...', { type: 'phase', phase: 5 });
    this.generateInstallInstructions(themeDir, themeName);
    this.api.sendProgress?.(95, 'Documentation written', { type: 'phase', phase: 5 });

    this.api.sendProgress?.(96, 'Creating .zip archive...', { type: 'phase', phase: 5 });
    const zipPath = await this.createZipArchive(themeDir, themeName);
    this.api.sendProgress?.(97, 'Archive created', { type: 'phase', phase: 5 });

    this.api.sendProgress?.(98, 'Calculating checksum...', { type: 'phase', phase: 5 });
    const stats = fs.statSync(zipPath);
    const checksum = this.calculateChecksum(zipPath);
    this.api.sendProgress?.(99, 'Package complete', { type: 'phase', phase: 5 });

    this.api.log(`✓ Theme packaged: ${(stats.size / 1024 / 1024).toFixed(2)} MB, checksum: ${checksum.substring(0, 8)}`);

    const filename = path.basename(zipPath);

    return {
      zipPath,
      filename,
      slug,
      size: stats.size,
      checksum,
      themeName,
      manifest,
    };
  }

  private validateStructure(themeDir: string): void {
    const required = [
      'theme.json',
      'templates',
      'parts',
    ];

    required.forEach(item => {
      const itemPath = path.join(themeDir, item);
      if (!fs.existsSync(itemPath)) {
        throw new Error(`Missing required file/directory: ${item}`);
      }
    });

    // Validate at least one template exists
    const templatesDir = path.join(themeDir, 'templates');
    const templateFiles = fs.readdirSync(templatesDir).filter(f => f.endsWith('.tsx'));
    if (templateFiles.length === 0) {
      throw new Error('No template files found in templates/ directory');
    }

    // Validate theme.json
    const themeJsonPath = path.join(themeDir, 'theme.json');
    const themeJson = JSON.parse(fs.readFileSync(themeJsonPath, 'utf-8'));
    
    if (!themeJson.version || !themeJson.title) {
      throw new Error('theme.json missing required fields: version, title');
    }

    this.api.log('✓ Theme structure validated');
  }

  private generateManifest(themeDir: string, themeName: string): any {
    const themeJson = JSON.parse(fs.readFileSync(path.join(themeDir, 'theme.json'), 'utf-8'));
    
    const files: string[] = [];
    const walkDir = (dir: string) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const relativePath = path.relative(themeDir, fullPath);
        
        if (fs.statSync(fullPath).isDirectory()) {
          walkDir(fullPath);
        } else {
          files.push(relativePath);
        }
      });
    };
    walkDir(themeDir);

    return {
      name: themeName,
      version: themeJson.version || '1.0.0',
      title: themeJson.title,
      description: themeJson.description,
      author: themeJson.author || 'AI Theme Factory',
      requires: themeJson.requires || '1.0.0',
      created: new Date().toISOString(),
      files: files.filter(f => !f.includes('manifest.json')),
      fileCount: files.length,
      templates: fs.readdirSync(path.join(themeDir, 'templates')).filter(f => f.endsWith('.tsx')),
      parts: fs.readdirSync(path.join(themeDir, 'parts')).filter(f => f.endsWith('.tsx')),
      patterns: fs.existsSync(path.join(themeDir, 'patterns')) 
        ? fs.readdirSync(path.join(themeDir, 'patterns')).filter(f => f.endsWith('.tsx'))
        : [],
    };
  }

  private generateInstallInstructions(themeDir: string, themeName: string): void {
    const instructions = `# Installation Instructions

## Automatic Installation (Recommended)

1. Go to your NestPress admin dashboard
2. Navigate to **Appearance → Themes**
3. Click **Add New Theme**
4. Upload \`${themeName}.zip\`
5. Click **Activate**

## Manual Installation

1. Extract \`${themeName}.zip\`
2. Copy the \`${themeName}\` folder to \`/themes/\`
3. Go to **Appearance → Themes** in admin
4. Find **${themeName}** and click **Activate**

## Requirements

- NestPress CMS >= 1.0.0
- Node.js >= 18.0.0
- React >= 19.0.0

## Theme Structure

\`\`\`
${themeName}/
├── theme.json          # Theme configuration (WordPress v3 schema)
├── index.tsx           # Main entry point
├── templates/          # Page templates (7 core templates)
│   ├── index.tsx       # Home page
│   ├── single.tsx      # Single post
│   ├── page.tsx        # Static page
│   ├── archive.tsx     # Blog archive
│   └── ...
├── parts/              # Reusable template parts
│   ├── Header.tsx      # Site header
│   ├── Footer.tsx      # Site footer
│   └── Sidebar.tsx     # Sidebar widgets
├── patterns/           # Content patterns (optional)
│   └── ...
└── assets/             # Theme assets (CSS, images, fonts)
    └── ...
\`\`\`

## Customization

After activation, customize your theme:

1. **Appearance → Customize** - Live theme customizer
2. **Appearance → Menus** - Configure navigation menus
3. **Appearance → Widgets** - Add/edit sidebar widgets
4. **Appearance → Header** - Customize header settings

## Support

This theme was generated by the AI Theme Factory plugin.

- Documentation: See README.md
- Report issues: Contact your NestPress administrator

---

**Generated**: ${new Date().toISOString()}
**Tool**: AI Theme Factory v1.0.0
`;

    fs.writeFileSync(path.join(themeDir, 'INSTALL.md'), instructions);
  }

  private async createZipArchive(themeDir: string, themeName: string): Promise<string> {
    const zip = new AdmZip();
    
    // Add all files recursively
    const addDirectory = (dirPath: string, zipPath: string = '') => {
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const zipItemPath = path.join(zipPath, item);
        
        if (fs.statSync(fullPath).isDirectory()) {
          addDirectory(fullPath, zipItemPath);
        } else {
          zip.addLocalFile(fullPath, zipPath);
        }
      });
    };

    addDirectory(themeDir, themeName);

    // Save to backend downloads directory
    const backendDir = path.join(process.cwd(), 'public', 'downloads');
    fs.mkdirSync(backendDir, { recursive: true });
    
    const zipPath = path.join(backendDir, `${themeName}.zip`);
    zip.writeZip(zipPath);

    this.api.log(`✓ ZIP created: ${zipPath}`);
    return zipPath;
  }

  private calculateChecksum(filePath: string): string {
    const buffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
}
