# WordPress Block Theme Architecture vs NestPress

## 🎯 Discovery: WordPress Block Themes Structure

After examining WordPress Twenty Twenty-Five theme, we discovered that **WordPress block themes** (FSE - Full Site Editing) have a different architecture than classic themes:

### WordPress Block Theme Structure

```
twentytwentyfive/
├── theme.json               ← Theme settings (WordPress v3 schema)
├── style.css                ← Main stylesheet with header
├── functions.php            ← PHP theme functions
├── templates/               ← HTML templates (not PHP!)
│   ├── index.html
│   ├── single.html
│   ├── page.html
│   ├── archive.html
│   ├── search.html
│   └── 404.html
├── parts/                   ← HTML template parts
│   ├── header.html
│   ├── footer.html
│   └── sidebar.html
├── patterns/                ← PHP files (block patterns)
│   ├── hero.php
│   └── posts-grid.php
├── styles/                  ← JSON style variations (NEW!)
│   ├── 01-evening.json
│   ├── 02-noon.json
│   ├── colors/
│   │   ├── 01-evening.json
│   │   └── 02-noon.json
│   ├── typography/
│   │   ├── typography-preset-1.json
│   │   └── typography-preset-2.json
│   ├── sections/
│   │   └── section-1.json
│   └── blocks/
│       ├── 01-display.json
│       └── 02-subtitle.json
└── assets/
    ├── css/
    ├── images/
    └── fonts/
```

### Key Differences from Classic WordPress Themes:

| Feature | Classic Theme | Block Theme (FSE) | NestPress Current | NestPress Target |
|---------|--------------|-------------------|-------------------|------------------|
| **Templates** | `.php` files | `.html` files | `.tsx` files | `.tsx` files (converted from .html) |
| **Parts** | `.php` files | `.html` files | `.tsx` files | `.tsx` files (converted from .html) |
| **Patterns** | `.php` files | `.php` files | `.tsx` files | `.tsx` files (converted from .php) |
| **Functions** | `functions.php` | `functions.php` | `functions.tsx` | `functions.ts` (converted from .php) |
| **Styles** | ❌ N/A | ✅ `styles/` folder with JSON | ❌ Missing | ✅ Copy `styles/` folder as-is |
| **Style Variations** | CSS only | JSON files | ❌ Missing | ✅ Load from `styles/` JSON |

---

## 📂 What is the `styles/` Folder?

WordPress Block Themes (FSE) introduced **style variations** - alternate color schemes, typography, and block styles that users can switch between without changing themes.

### Example: `styles/01-evening.json`

```json
{
  "$schema": "https://schemas.wp.org/wp/6.7/theme.json",
  "version": 3,
  "title": "Evening",
  "settings": {
    "color": {
      "palette": [
        { "color": "#1B1B1B", "name": "Base", "slug": "base" },
        { "color": "#F0F0F0", "name": "Contrast", "slug": "contrast" },
        { "color": "#786D0A", "name": "Accent 1", "slug": "accent-1" }
      ]
    },
    "typography": {
      "fontSizes": [
        { "size": "0.875rem", "slug": "small", "name": "Small" }
      ]
    }
  },
  "styles": {
    "color": {
      "background": "var(--wp--preset--color--base)",
      "text": "var(--wp--preset--color--contrast)"
    }
  }
}
```

### Types of Style Variations:

1. **Root-level variations** (`styles/*.json`) - Complete style themes
2. **Color variations** (`styles/colors/*.json`) - Color palettes only
3. **Typography variations** (`styles/typography/*.json`) - Font settings only
4. **Section variations** (`styles/sections/*.json`) - Section-specific styles
5. **Block variations** (`styles/blocks/*.json`) - Block-specific styles

---

## 🔧 What Our Converter Was Doing Wrong

### ❌ Previous Approach:

1. Convert **all** HTML templates to TSX components
2. Convert **all** template parts to TSX components  
3. Convert patterns to TSX
4. Convert functions.php to functions.tsx
5. **Ignore `styles/` folder completely** ← MISSING

### ✅ Correct Approach (WordPress-Compliant):

1. **Templates** (`templates/*.html`) → Convert to TSX components (React needs components, not HTML)
2. **Parts** (`parts/*.html`) → Convert to TSX components (reusable React components)
3. **Patterns** (`patterns/*.php`) → Convert to TSX components (block patterns as React)
4. **Functions** (`functions.php`) → Convert to `functions.ts` (WordPress hooks → TypeScript)
5. **Styles** (`styles/` folder) → **Copy as-is** (JSON files don't need conversion)
6. **Theme.json** → Keep + enhance with NestPress metadata

---

## 🎨 How to Use Style Variations in NestPress

### 1. Copy `styles/` Folder

```
nestpress-theme/
├── styles/                  ← Copied from WordPress theme
│   ├── 01-evening.json
│   ├── 02-noon.json
│   ├── colors/
│   ├── typography/
│   ├── sections/
│   └── blocks/
```

### 2. Load Style Variations in Frontend

```typescript
// utils/styleVariations.ts
export interface StyleVariation {
  title: string;
  settings: any;
  styles: any;
}

export async function loadStyleVariations(themeId: string): Promise<StyleVariation[]> {
  const response = await fetch(`/themes/${themeId}/styles/index.json`);
  const variations = await response.json();
  
  return Promise.all(
    variations.map(async (file: string) => {
      const res = await fetch(`/themes/${themeId}/styles/${file}`);
      return await res.json();
    })
  );
}

// Apply style variation
export function applyStyleVariation(variation: StyleVariation) {
  const root = document.documentElement;
  
  // Apply color palette
  variation.settings?.color?.palette?.forEach(color => {
    root.style.setProperty(`--wp--preset--color--${color.slug}`, color.color);
  });
  
  // Apply typography
  variation.settings?.typography?.fontSizes?.forEach(size => {
    root.style.setProperty(`--wp--preset--font-size--${size.slug}`, size.size);
  });
  
  // Apply global styles
  if (variation.styles?.color?.background) {
    document.body.style.backgroundColor = variation.styles.color.background;
  }
}
```

### 3. UI for Style Switcher

```tsx
import { useState, useEffect } from 'react';
import { loadStyleVariations, applyStyleVariation } from '@/utils/styleVariations';

export const StyleVariationSwitcher = ({ themeId }) => {
  const [variations, setVariations] = useState([]);
  const [activeVariation, setActiveVariation] = useState(null);
  
  useEffect(() => {
    loadStyleVariations(themeId).then(setVariations);
  }, [themeId]);
  
  const handleSwitch = (variation) => {
    applyStyleVariation(variation);
    setActiveVariation(variation.title);
  };
  
  return (
    <div className="style-variation-switcher">
      <h3>Style Variations</h3>
      {variations.map(v => (
        <button
          key={v.title}
          onClick={() => handleSwitch(v)}
          className={activeVariation === v.title ? 'active' : ''}
        >
          {v.title}
        </button>
      ))}
    </div>
  );
};
```

---

## 🔄 Updated Converter Architecture

### Phase 1: Parse WordPress Theme

```typescript
// backend/src/modules/theme-converter/theme-converter.service.ts
private async parseTheme(themeRoot: string): Promise<ParsedTheme> {
  return {
    // Existing parsing...
    
    // NEW: Parse styles folder
    styleVariations: this.parseStyleVariations(themeRoot),
  };
}

private parseStyleVariations(themeRoot: string): any[] {
  const stylesDir = path.join(themeRoot, 'styles');
  if (!fs.existsSync(stylesDir)) return [];
  
  const variations = [];
  const files = this.getJsonFilesRecursive(stylesDir);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = path.relative(stylesDir, file);
    variations.push({
      path: relativePath,
      content: JSON.parse(content),
    });
  }
  
  return variations;
}
```

### Phase 2: Generate NestPress Theme

```typescript
// backend/src/modules/theme-converter/generators/theme-generator.service.ts
async generateTheme(parsed: ParsedTheme, outputDir: string): Promise<void> {
  // Create theme structure
  this.createThemeStructure(outputDir);
  
  // Generate theme.json
  await this.generateThemeJson(parsed, outputDir);
  
  // Generate index.tsx
  await this.generateIndexFile(parsed, outputDir);
  
  // Generate functions.ts (from functions.php)
  await this.generateFunctionsFile(parsed, outputDir);
  
  // Convert templates (HTML → TSX)
  await this.generateTemplates(parsed, outputDir);
  
  // Convert parts (HTML → TSX)
  await this.generateParts(parsed, outputDir);
  
  // Convert patterns (PHP → TSX)
  await this.generatePatterns(parsed, outputDir);
  
  // NEW: Copy styles folder (JSON → JSON)
  await this.copyStyleVariations(parsed, outputDir);
  
  // Copy assets
  await this.copyAssets(parsed, outputDir);
}

private async copyStyleVariations(parsed: ParsedTheme, outputDir: string): Promise<void> {
  const stylesDir = path.join(outputDir, 'styles');
  fs.mkdirSync(stylesDir, { recursive: true });
  
  // Copy all JSON files maintaining directory structure
  for (const variation of parsed.styleVariations) {
    const targetPath = path.join(stylesDir, variation.path);
    const targetDir = path.dirname(targetPath);
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    fs.writeFileSync(targetPath, JSON.stringify(variation.content, null, 2));
  }
  
  // Create index.json for easy loading
  const index = parsed.styleVariations.map(v => v.path);
  fs.writeFileSync(
    path.join(stylesDir, 'index.json'),
    JSON.stringify(index, null, 2)
  );
  
  this.logger.log(`Copied ${parsed.styleVariations.length} style variations`);
}
```

---

## 📋 Theme Converter Checklist

### ✅ Already Working:
- [x] Parse theme.json
- [x] Parse style.css header
- [x] Parse templates (HTML files)
- [x] Parse template parts (HTML files)
- [x] Parse patterns (PHP files)
- [x] Parse functions.php
- [x] Convert templates to TSX
- [x] Convert parts to TSX
- [x] Convert patterns to TSX
- [x] Generate functions.tsx with WordPress functions
- [x] Generate global-styles.css from theme.json
- [x] Copy assets (CSS, images, fonts)

### ⏳ TODO (Styles Folder):
- [ ] Parse `styles/` folder (JSON files)
- [ ] Copy `styles/` folder to output theme
- [ ] Create `styles/index.json` manifest
- [ ] Update theme.json to reference style variations
- [ ] Create React hook for loading style variations
- [ ] Create UI component for style variation switcher
- [ ] Test style variation switching in frontend

---

## 🚀 Implementation Plan

### Step 1: Update Theme Converter Service (15 min)

Add `parseStyleVariations()` method to parse `styles/` folder and collect all JSON files recursively.

### Step 2: Update Theme Generator Service (15 min)

Add `copyStyleVariations()` method to copy JSON files maintaining directory structure and create `styles/index.json`.

### Step 3: Create Style Variations Utils (20 min)

Create `/utils/styleVariations.ts` with:
- `loadStyleVariations()` - Load all style variations from theme
- `applyStyleVariation()` - Apply variation CSS variables to DOM
- `getActiveStyleVariation()` - Get currently active variation
- `saveStyleVariation()` - Save user's preference

### Step 4: Create Style Variation Switcher Component (15 min)

Create `/components/appearance/StyleVariationSwitcher.tsx` for Appearance settings.

### Step 5: Integrate with WebsiteFrontend (10 min)

Load and apply style variations in WebsiteFrontend based on user preference or default.

### Step 6: Test with Twenty Twenty-Five (15 min)

Convert WordPress Twenty Twenty-Five theme and verify:
- All 8 style variations copied
- Style switcher works in Appearance
- CSS variables applied correctly
- Frontend renders with selected variation

**Total Time: ~90 minutes**

---

## 🎯 Expected Result

After implementation, NestPress themes will have **100% WordPress Block Theme parity**:

```
nestpress-theme/
├── theme.json               ← WordPress v3 schema
├── style.css                ← WordPress header
├── functions.ts             ← WordPress functions.php → TypeScript
├── templates/               ← WordPress HTML → TSX components
│   ├── index.tsx
│   ├── single.tsx
│   └── page.tsx
├── parts/                   ← WordPress HTML → TSX components
│   ├── Header.tsx
│   └── Footer.tsx
├── patterns/                ← WordPress PHP → TSX components
│   ├── HeroBanner.tsx
│   └── PostsGrid.tsx
├── styles/                  ← WordPress JSON → JSON (COPIED AS-IS) ✨
│   ├── 01-evening.json
│   ├── 02-noon.json
│   ├── index.json           ← Generated manifest
│   ├── colors/
│   ├── typography/
│   ├── sections/
│   └── blocks/
└── assets/
    ├── css/
    │   ├── global-styles.css   ← Generated from theme.json
    │   └── accessibility.css
    ├── images/
    └── fonts/
```

Users can switch between "Evening", "Noon", "Dusk" color schemes just like in WordPress!
