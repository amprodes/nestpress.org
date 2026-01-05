# Theme Converter Module

Converts WordPress themes (PHP/Gutenberg) to NestPress TSX themes.

## Features

- ✅ Parse WordPress Gutenberg blocks
- ✅ Convert block markup to React JSX
- ✅ Transform PHP template tags to TypeScript
- ✅ Generate NestPress-compatible theme structure
- ✅ Copy and process theme assets (CSS, images, fonts)
- ✅ Handle pattern composition
- ✅ Support template parts (Header, Footer, etc.)

## API Endpoints

### Convert Theme

**POST** `/api/v1/theme-converter/convert`

Upload a WordPress theme ZIP file and convert it to NestPress TSX format.

**Request:**
```bash
curl -X POST http://localhost:4000/api/v1/theme-converter/convert \
  -F "theme=@twentytwentyfive.zip"
```

**Response:**
```json
{
  "success": true,
  "themeId": "twentytwentyfive",
  "themeName": "Twenty Twenty-Five",
  "outputPath": "/path/to/nestpress/themes/twentytwentyfive",
  "conversionLog": [...],
  "warnings": [],
  "errors": [],
  "stats": {
    "totalPatterns": 95,
    "convertedPatterns": 95,
    "totalBlocks": 450,
    "convertedBlocks": 450,
    "totalParts": 7,
    "convertedParts": 7,
    "assetsProcessed": 23
  }
}
```

## Supported Blocks

### Core Blocks
- `wp:group` → `<div>` with classes
- `wp:heading` → `<h1>` - `<h6>`
- `wp:paragraph` → `<p>`
- `wp:image` → `<img>`
- `wp:button` / `wp:buttons` → `<button>` / button group
- `wp:cover` → Background div with image
- `wp:navigation` → `<nav>` with links
- `wp:site-title` → Site title component
- `wp:site-logo` → Site logo image
- `wp:site-tagline` → Site tagline text
- `wp:pattern` → Pattern component reference
- `wp:columns` / `wp:column` → Grid layout
- `wp:spacer` → Spacer div

### Custom Blocks
- Fallback to generic container for unknown blocks

## Conversion Process

1. **Extract ZIP** - Unzip WordPress theme
2. **Parse Metadata** - Extract theme info from `style.css` and `theme.json`
3. **Parse Patterns** - Convert pattern PHP files to React components
4. **Parse Parts** - Convert template parts (header, footer, etc.)
5. **Transform Blocks** - Convert Gutenberg blocks to JSX
6. **Generate Theme** - Create NestPress theme structure
7. **Copy Assets** - Copy CSS, images, and fonts
8. **Cleanup** - Remove temporary files

## Output Structure

```
themes/twentytwentyfive/
├── index.tsx              # Theme entry point
├── theme.json             # Theme metadata
├── templates/             # Page templates
│   ├── index.tsx
│   ├── single.tsx
│   ├── page.tsx
│   ├── archive.tsx
│   ├── category.tsx
│   ├── search.tsx
│   └── 404.tsx
├── parts/                 # Template parts
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Sidebar.tsx
├── patterns/              # Pattern components
│   ├── hero-full-width-image.tsx
│   ├── footer-columns.tsx
│   └── ...
└── assets/                # Theme assets
    ├── css/
    ├── images/
    └── fonts/
```

## Limitations

1. **Complex PHP Logic** - Only basic PHP template tags are converted
2. **Custom Gutenberg Blocks** - Third-party blocks need manual review
3. **Dynamic Content** - WordPress queries require manual adaptation
4. **Plugin Dependencies** - Theme plugin dependencies are not converted

## Usage Example

### From Frontend (Coming Soon)

```typescript
// Upload theme ZIP
const formData = new FormData();
formData.append('theme', themeFile);

const result = await api.post('/theme-converter/convert', formData);

console.log(`Converted: ${result.themeName}`);
console.log(`Theme ID: ${result.themeId}`);
```

### From Command Line

```bash
# Upload and convert Twenty Twenty-Five theme
curl -X POST http://localhost:4000/api/v1/theme-converter/convert \
  -F "theme=@twentytwentyfive.zip" \
  -H "Accept: application/json"
```

## Development

### Adding New Block Transformers

Edit `transformers/block-transformer.service.ts`:

```typescript
case 'your-block':
  jsx = this.transformYourBlock(block);
  break;

private transformYourBlock(block: WordPressBlock): string {
  // Your transformation logic
  return `<YourComponent />`;
}
```

### Testing Conversion

1. Download a WordPress theme
2. Upload via API endpoint
3. Check output in `../themes/[theme-id]`
4. Review conversion log for warnings

## Future Enhancements

- [ ] Support for classic WordPress themes (non-block)
- [ ] Better CSS transformation (Tailwind conversion)
- [ ] Interactive pattern selection
- [ ] Theme preview before installation
- [ ] Batch conversion support
- [ ] Custom block mapping configuration
- [ ] Advanced PHP to TS transformation
