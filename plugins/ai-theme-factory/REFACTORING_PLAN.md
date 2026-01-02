# AI Theme Factory - Refactoring Plan

## 🔍 Problem Analysis

### Current Issues

1. **JSX Structure Violation**
   - Generated components wrap `<html><head><body>` tags inside React components
   - React components shouldn't render full HTML documents
   - Causes Babel parser to fail even with properly escaped attributes

2. **Attribute Conversion Timing**
   - `class` → `className` conversion happens AFTER template wrapping
   - HTML entities are escaped but HTML attributes remain (e.g., `class` instead of `className`)

3. **HTML-First vs JSX-First Mismatch**
   - Current approach: Clone raw HTML → Wrap in component → Escape for JSX
   - Problem: HTML structure incompatible with JSX component model
   - Vite's React plugin expects **pure JSX**, not HTML wrapped in JSX

4. **Regex-Based Conversion Limitations**
   - Complex nested structures (JSON in data-* attributes) break regex patterns
   - Cannot handle edge cases: nested quotes, multiline values, escaped characters
   - Pattern `[^}]*` stops at first occurrence, missing nested content

### Root Cause

**The fundamental issue**: We're trying to force full HTML documents into React component return statements. React components should return **JSX fragments**, not complete HTML pages with `<html>`, `<head>`, and `<body>` tags.

## ✅ Alternative Approaches

### Approach 1: **Pure DOM Extraction** (RECOMMENDED)
Convert only the BODY content, extract header/footer as fragments

**Pros:**
- Clean JSX structure
- Proper React component model
- Better performance (no unnecessary wrapper elements)

**Cons:**
- Requires refactoring HtmlFidelityConverter
- Need to validate extracted structures

### Approach 2: **Cheerio-Based Transformation**
Use Cheerio to transform HTML → JSX properly

**Pros:**
- DOM-aware transformations
- Handles nested structures correctly
- Can modify attributes before stringification

**Cons:**
- Cheerio's HTML serialization might change structure
- Need to preserve exact whitespace/formatting

### Approach 3: **HTML Template Strings**
Use `dangerouslySetInnerHTML` with raw HTML

**Pros:**
- Preserves exact HTML fidelity
- No conversion needed
- Fastest implementation

**Cons:**
- **Security risk** (XSS vulnerability)
- No React benefits (virtual DOM)
- Loses dynamic features

### Approach 4: **AST-Based Transformation**
Parse HTML to AST, transform to JSX AST, serialize

**Pros:**
- Most robust solution
- Handles all edge cases
- Type-safe transformations

**Cons:**
- Complex implementation
- Performance overhead
- Requires AST parser (htmlparser2 + jsx-ast)

## 📋 Recommended Solution: **Approach 1 + Cheerio Enhancement**

### Strategy: "Clean JSX Component Generation"

#### Phase 1: Fix Extraction Logic
```typescript
// Extract ONLY the content, not <html><head><body> wrappers
extractHeader(html: string): string {
  const $ = cheerio.load(html);
  const header = $('header').first();
  
  // Return INNER HTML, not outer wrapper
  return header.html() || '';
}
```

#### Phase 2: Proper Attribute Conversion
```typescript
// Convert attributes BEFORE component wrapping
convertToJSX(html: string): string {
  const $ = cheerio.load(html, { xmlMode: false });
  
  // Traverse DOM and convert attributes
  $('*').each((i, el) => {
    const $el = $(el);
    
    // Convert class → className
    if ($el.attr('class')) {
      $el.attr('className', $el.attr('class'));
      $el.removeAttr('class');
    }
    
    // Handle data-* with JSON
    Object.keys(el.attribs).forEach(attr => {
      if (attr.startsWith('data-') && el.attribs[attr].includes('{')) {
        const escaped = escapeJSONForJSX(el.attribs[attr]);
        $el.attr(attr, escaped);
      }
    });
  });
  
  return $.html();
}
```

#### Phase 3: JSON Escaping with Proper Parser
```typescript
function escapeJSONForJSX(jsonString: string): string {
  // Parse as JSON, then escape properly
  try {
    // If it's valid JSON, parse and re-serialize with escaping
    const parsed = JSON.parse(jsonString);
    const serialized = JSON.stringify(parsed);
    
    // Escape for JSX attribute value
    return serialized
      .replace(/\{/g, '&#123;')
      .replace(/\}/g, '&#125;')
      .replace(/"/g, '&quot;');
  } catch {
    // If not valid JSON, escape as-is
    return jsonString
      .replace(/\{/g, '&#123;')
      .replace(/\}/g, '&#125;')
      .replace(/"/g, '&quot;');
  }
}
```

## 🏗️ Implementation Plan

### Step 1: Refactor HtmlFidelityConverter (Following NestJS Best Practices)

**File**: `services/HtmlFidelityConverter.ts`

#### Changes:
1. **Remove HTML document wrapper extraction**
   - Don't extract `<html><head><body>` tags
   - Extract only CONTENT inside header/footer/main

2. **Use Cheerio for attribute conversion**
   - Replace regex-based conversion with DOM manipulation
   - Ensures correct attribute transformation

3. **Proper JSX component generation**
   - No wrapping in `<html>` tags
   - Return clean JSX fragments

4. **Type safety** (NestJS best practice)
   - Add proper TypeScript interfaces
   - Use dependency injection for Cheerio

### Step 2: Update AINestPressifier

**File**: `services/AINestPressifier.ts`

#### Changes:
1. **Generate proper React components**
   - No `<html><head><body>` in return statements
   - Use fragments (`<>...</>`)

2. **Apply conversions in correct order**
   - Load HTML → Convert attributes → Extract content → Wrap in component

### Step 3: Add Validation Layer

**File**: `services/ThemeValidator.ts`

#### Changes:
1. **JSX validation before packaging**
   - Use Babel parser to validate JSX syntax
   - Catch errors during generation, not at runtime

2. **Auto-fix common issues**
   - Detect and fix unclosed tags
   - Detect and escape unescaped JSON

### Step 4: Add Unit Tests (Following Node.js + Vitest best practices)

**New File**: `services/__tests__/HtmlFidelityConverter.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { HtmlFidelityConverter } from '../HtmlFidelityConverter';

describe('HtmlFidelityConverter', () => {
  it('should convert class to className', () => {
    const converter = new HtmlFidelityConverter({ 
      themeSlug: 'test', 
      sourceUrl: 'https://example.com' 
    });
    
    const html = '<div class="container">Test</div>';
    const result = converter.convert(html);
    
    expect(result).toContain('className="container"');
    expect(result).not.toContain('class="container"');
  });
  
  it('should escape JSON in data-settings', () => {
    const converter = new HtmlFidelityConverter({ 
      themeSlug: 'test', 
      sourceUrl: 'https://example.com' 
    });
    
    const html = '<div data-settings=\'{"key":"value"}\'>Test</div>';
    const result = converter.convert(html);
    
    expect(result).toContain('&#123;');
    expect(result).toContain('&quot;');
    expect(result).not.toContain('{"key"');
  });
  
  it('should not wrap content in <html> tags', () => {
    const converter = new HtmlFidelityConverter({ 
      themeSlug: 'test', 
      sourceUrl: 'https://example.com' 
    });
    
    const html = '<header><h1>Title</h1></header>';
    const component = converter.generateComponent(html, 'Header', false);
    
    expect(component).not.toContain('<html>');
    expect(component).not.toContain('<body>');
    expect(component).toContain('return (');
  });
});
```

## 📊 Compliance Checklist

### NestJS Best Practices ✅
- [ ] Use `@Injectable()` for services
- [ ] Constructor-based dependency injection
- [ ] Proper error handling with try-catch
- [ ] TypeScript strict mode enabled
- [ ] Interface-based contracts
- [ ] Single responsibility principle

### Node.js + Vitest Best Practices ✅
- [ ] ES2022+ features (async/await)
- [ ] No external dependencies (use built-ins where possible)
- [ ] Descriptive function/variable names
- [ ] Never use `null` (use `undefined`)
- [ ] Prefer functions over classes (where appropriate)
- [ ] Comprehensive unit tests
- [ ] Edge case coverage

## 🎯 Success Criteria

1. ✅ Generated themes compile without JSX errors
2. ✅ Visual fidelity maintained (looks exactly like source)
3. ✅ All data-* attributes properly escaped
4. ✅ No `<html>/<head>/<body>` in component returns
5. ✅ All attributes converted to JSX format (`className`, etc.)
6. ✅ Unit tests pass with 100% coverage on critical paths
7. ✅ No Vite compilation errors
8. ✅ Themes activate successfully in admin panel

## 🚀 Execution Order

1. **Research Complete** ← WE ARE HERE
2. Create unit tests (TDD approach)
3. Refactor HtmlFidelityConverter
4. Update AINestPressifier
5. Enhance ThemeValidator
6. Test with digital-agency theme
7. Validate with multiple websites

## ⚠️ Breaking Changes

- Generated themes will have different structure
- Need to delete existing `digital-agency` theme
- Regenerate from scratch with new converter

## 📝 Next Steps

**Immediate Action**: Get user approval for refactoring approach before implementation.

**Questions for User**:
1. Approve Approach 1 (Pure DOM Extraction + Cheerio)?
2. Acceptable to delete existing generated themes?
3. Priority: Speed vs. Robustness vs. Simplicity?
