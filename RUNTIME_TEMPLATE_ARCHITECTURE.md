# NestPress Correct Architecture: Runtime Template Parsing

## ❌ **WRONG APPROACH (Current)**
Converting WordPress `.html` templates → `.tsx` React components at build time

## ✅ **CORRECT APPROACH (WordPress-Compatible)**
Keep WordPress `.html` templates → Parse and render dynamically at runtime

---

## Why This Matters

### WordPress Block Theme Architecture:
```
twentytwentyfive/
├── templates/
│   ├── index.html          ← Pure HTML with block comments
│   ├── page.html           ← Pure HTML with block comments
│   └── single.html         ← Pure HTML with block comments
├── parts/
│   ├── header.html         ← Pure HTML with block comments
│   └── footer.html         ← Pure HTML with block comments
├── styles/
│   └── *.json              ← Style variations
└── theme.json              ← Theme configuration
```

**WordPress does NOT convert templates to PHP at build time.**  
**WordPress parses HTML templates at RUNTIME and injects dynamic content.**

### Current NestPress (WRONG):
```
themes/twenty-twenty-five/
├── templates/
│   ├── index.tsx           ← ❌ WRONG - Pre-compiled React
│   ├── page.tsx            ← ❌ WRONG - Pre-compiled React
│   └── single.tsx          ← ❌ WRONG - Pre-compiled React
```

**Problem:**
- Templates are converted to hardcoded TSX components
- Cannot be edited without rebuilding
- Not compatible with WordPress block editor
- Causes infinite loops when dynamically loading

### Correct NestPress (RIGHT):
```
themes/twenty-twenty-five/
├── templates/
│   ├── index.html          ← ✅ CORRECT - WordPress block HTML
│   ├── page.html           ← ✅ CORRECT - WordPress block HTML
│   └── single.html         ← ✅ CORRECT - WordPress block HTML
├── parts/
│   ├── header.html         ← ✅ CORRECT - WordPress block HTML
│   └── footer.html         ← ✅ CORRECT - WordPress block HTML
├── styles/
│   └── *.json              ← ✅ Already correct
└── theme.json              ← ✅ Already correct
```

**How it works:**
1. Load `page.html` template (pure HTML)
2. Parse WordPress block comments at runtime
3. Dynamically inject `post.title`, `post.content`, etc.
4. Render as React components on-the-fly

---

## WordPress Template Example

### WordPress Template (`page.html`):
```html
<!-- wp:template-part {"slug":"header"} /-->

<!-- wp:group {"tagName":"main","style":{"spacing":{"margin":{"top":"var:preset|spacing|60"}}}} -->
<main class="wp-block-group" style="margin-top:var(--wp--preset--spacing--60)">
    <!-- wp:post-title {"level":1} /-->
    <!-- wp:post-content {"align":"full"} /-->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer"} /-->
```

### Runtime Parsing (NestPress):
```typescript
// 1. Load template HTML
const templateHTML = await loadTemplate('page.html');

// 2. Parse blocks
const blocks = parseBlockComment(templateHTML);

// 3. Render with context
renderTemplate(blocks, {
  post: { title: "My Page", content: "<p>Content here</p>" },
  primaryMenu: menus.primary,
  footerMenu: menus.footer
});
```

### Result (React output):
```tsx
<div className="wp-site-blocks">
  <header className="wp-block-template-part">
    {/* Header component with primaryMenu */}
  </header>
  
  <main className="wp-block-group" style={{marginTop: 'var(--wp--preset--spacing--60)'}}>
    <h1 className="wp-block-post-title">My Page</h1>
    <div className="wp-block-post-content alignfull" dangerouslySetInnerHTML={{__html: post.content}} />
  </main>
  
  <footer className="wp-block-template-part">
    {/* Footer component with footerMenu */}
  </footer>
</div>
```

---

## Implementation Plan

### 1. ✅ **Block Renderer (DONE)**
- File: `/utils/wordpress-block-renderer.tsx`
- Parses `<!-- wp:block-name -->` comments
- Converts blocks to React components dynamically
- Injects `post`, `menu`, `widget` data

### 2. **Update Theme Converter**
- **STOP converting** `.html` → `.tsx`
- **COPY** `.html` templates as-is
- Keep `parts/*.html` as-is
- Keep `styles/*.json` as-is (already done)

### 3. **Update Theme Loader**
- Load `.html` templates (not `.tsx`)
- Use `wordpress-block-renderer.tsx` to parse
- Pass context (`post`, `menus`, `widgets`)

### 4. **Update WebsiteFrontend**
- Fetch template HTML based on route
- Use block renderer to parse and render
- Fix infinite loop by removing TSX component imports

---

## Benefits of Runtime Parsing

### ✅ **WordPress Compatible**
- Templates remain as pure WordPress HTML
- Can be edited with WordPress block editor
- 100% compatible with WordPress themes

### ✅ **CMS Flexibility**
- Users can edit templates without rebuilding
- Theme changes are instant
- No compilation required

### ✅ **Performance**
- Templates are cached as HTML (small size)
- Parsing happens once per page load
- React components generated on-the-fly

### ✅ **No Infinite Loops**
- Templates don't trigger re-renders
- HTML is static, parsing is deterministic
- Context data flows one-way

---

## File Structure Changes

### Backend (Theme Converter):
```typescript
// OLD (WRONG):
async generateTemplates(parsed: ParsedTheme, outputDir: string) {
  for (const template of templates) {
    const code = this.generateTemplateFile(template, parsed); // ❌ TSX generation
    fs.writeFileSync(`${template}.tsx`, code); // ❌ Write .tsx file
  }
}

// NEW (CORRECT):
async generateTemplates(parsed: ParsedTheme, outputDir: string) {
  for (const template of parsed.templates) {
    // ✅ Copy HTML template as-is
    const sourceHTML = fs.readFileSync(template.path, 'utf-8');
    fs.writeFileSync(
      path.join(outputDir, 'templates', `${template.name}.html`),
      sourceHTML
    );
  }
}
```

### Frontend (Theme Loader):
```typescript
// OLD (WRONG):
import PageTemplate from './themes/default/templates/page'; // ❌ TSX component

// NEW (CORRECT):
const pageHTML = await fetch('/themes/default/templates/page.html').then(r => r.text());
const renderedPage = renderTemplate(pageHTML, { post, menus, widgets });
```

---

## Next Steps

1. **Update theme-generator.service.ts**:
   - Change `generateTemplates()` to copy `.html` instead of generating `.tsx`
   - Change `generateParts()` to copy `.html` instead of generating `.tsx`
   - Keep patterns as `.tsx` (they're reusable components, not templates)

2. **Update themeLoader.ts**:
   - Remove TSX template imports
   - Add HTML template loader
   - Integrate `wordpress-block-renderer.tsx`

3. **Update WebsiteFrontend.tsx**:
   - Remove template component imports
   - Use runtime block renderer
   - Fix infinite loop

4. **Test with Twenty Twenty-Five**:
   - Verify templates load as HTML
   - Verify dynamic content injection works
   - Verify no infinite loops

---

## The Real WordPress Way™

WordPress block themes work like this:
```
User visits page → WordPress finds template → Parses blocks → Injects content → Renders HTML
```

NestPress should work like this:
```
User visits page → NestPress finds template → Parses blocks → Injects content → Renders React
```

**NOT like this:**
```
Build time → Convert HTML to TSX → Hardcode everything → User can't change templates ❌
```

---

## Conclusion

We need to **stop pre-compiling templates** and start **parsing them at runtime** - just like WordPress does. This is the only way to achieve true WordPress compatibility and avoid infinite loops caused by dynamic component imports.

The block renderer is ready. Now we need to update the converter and frontend to use it.
