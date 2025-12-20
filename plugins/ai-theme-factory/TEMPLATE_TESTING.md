# Template Testing & Fixing Tools

Quick validation and auto-fixing for JSX template files **during development** without running the full theme generation pipeline.

> ⚠️ **Note:** The full theme generation pipeline already includes these validation checks automatically via `AINestPressifier.validateAndFixCompilation()`. These standalone tools are for **quick testing during manual development** - useful when editing templates directly or debugging generated themes.

## Quick Start

```bash
# Test templates (shows errors) - DEVELOPMENT ONLY
npm run test:templates [theme-path]

# Auto-fix templates - DEVELOPMENT ONLY
npm run fix:templates [theme-path]

# Default theme path: themes/enfold-business-flat

# Full pipeline (includes validation automatically)
# Trigger via admin UI: Appearance → Themes → Install → URL
```

## Tools Overview

### 1. `test-templates.js` - Validator

Fast validation showing exactly what's wrong with each template file.

**Features:**
- ✅ Detects multiple root elements
- ✅ Validates JSX tag matching (open/close)
- ✅ Finds unclosed tags and fragments
- ✅ Shows code context around errors
- ✅ Line-by-line detailed reporting

**Example Output:**
```
🔍 Quick Template Validator
================================================================================
Found 12 files to validate

❌ Found 8 errors in 6 files

1. 404.tsx (template)
   1. [tag_mismatch] Expected </div> but found </a>
      Line: 34 (opened at line 29)
      Code context:
        32:   className="inline-flex items-center...
        33: >
      → 34:   Go Back Home</a>
        35: </div>
```

**Error Types Detected:**
- `multiple_root_elements` - JSX must have single parent element
- `tag_mismatch` - Opening tag doesn't match closing tag
- `fragment_tag_mismatch` - Fragment `<>` mixed with regular tags
- `unclosed_tag` - Tag opened but never closed
- `unclosed_fragment` - Fragment `<>` never closed with `</>`
- `unmatched_closing` - Closing tag with no opening tag

### 2. `fix-templates.js` - Auto-Fixer

Automatically fixes common JSX errors found by the validator.

**Features:**
- ✅ Fixes multiple root elements
- ✅ Moves sibling components into parent
- ✅ Removes empty fragments
- ✅ Shows what was changed

**Example Output:**
```
🔧 Quick Template Fixer
================================================================================
Found 12 files to fix

✅ archive.tsx
   1. Fixed root-level sibling components

✅ page-with-sidebar.tsx
   1. Fixed root-level sibling components

✨ Fixed 2 issues in 2 files
```

## Workflow

### Development Workflow

```bash
# 1. Generate or edit templates
# ... make changes ...

# 2. Quick validate
npm run test:templates themes/my-theme

# 3. Auto-fix common issues
npm run fix:templates themes/my-theme

# 4. Verify fixes
npm run test:templates themes/my-theme

# 5. Manually fix remaining issues
# ... edit files based on error reports ...
```

### Testing Specific Themes

```bash
# Test default theme
npm run test:templates

# Test specific theme
npm run test:templates themes/business-pro

# Test with absolute path
npm run test:templates /path/to/theme
```

## Common Fixes

### Multiple Root Elements

**❌ Wrong:**
```tsx
return (
  <><div>Content</div><Footer /></>
);
```

**✅ Correct:**
```tsx
return (
  <div>
    Content
    <Footer />
  </div>
);
```

### Tag Mismatch

**❌ Wrong:**
```tsx
<div>
  <span>Text
</div></span>
```

**✅ Correct:**
```tsx
<div>
  <span>Text</span>
</div>
```

### Unclosed Fragment

**❌ Wrong:**
```tsx
return (
  <>
    <div>Content</div>
  // Missing </>
);
```

**✅ Correct:**
```tsx
return (
  <>
    <div>Content</div>
  </>
);
```

## Integration with Theme Generation

**How Validation Works in Production:**

```
Theme Generation Pipeline (backend.ts):
1. Analyze website → ThemeAnalyzer
2. Clone resources → ResourceCloner  
3. Assemble structure → ThemeAssembler
4. NestPressify → AINestPressifier ⭐
   ├─ cleanJSX() - preprocess JSX
   ├─ detectJSXErrors() - find issues
   ├─ autoFixJSXError() - apply fixes
   └─ validateAndFixCompilation() - retry loop (max 100)
5. Package theme → ThemePackager
```

**The validation happens automatically in Phase 4** when `AINestPressifier.convertToNestPress()` is called. Every template file goes through:

1. **cleanJSX()** - Proactive fixes (fragments, multiple roots)
2. **detectJSXErrors()** - Find remaining issues
3. **autoFixJSXError()** - Apply targeted fixes
4. **Retry loop** - Up to 100 attempts per file

**When to Use Standalone Tools:**

✅ **USE these tools when:**
- Manually editing templates after generation
- Debugging a specific template file
- Quick iteration during theme customization
- Testing fixes before committing changes
- You want immediate feedback (seconds)

❌ **DON'T use these tools when:**
- Running full AI theme generation (validation is automatic)
- Pipeline already validates everything
- You need comprehensive validation (use full pipeline)

**Performance Comparison:**
- **Standalone tools:** ~50-100ms for 12 templates
- **Full pipeline:** 2-5 minutes (includes AI processing, cloning, etc.)
- **Validation in pipeline:** ~500ms for all files (runs once at end)

## Error Details

### Multiple Root Elements Error

This is the most common error. JSX expressions must have a single parent element.

**Patterns Detected:**

1. **Empty fragment with siblings:**
   ```tsx
   return (<><div>...</div><Footer /></>)
   ```

2. **Root-level siblings:**
   ```tsx
   return (
     </div><Footer />  // Footer outside parent
   )
   ```

3. **Fragment + sibling:**
   ```tsx
   return (
     </><Footer />  // Footer after fragment closing
   )
   ```

**Auto-Fix Strategy:**
- Removes empty fragment wrapper
- Moves sibling components inside parent element
- Preserves indentation and formatting

### Tag Mismatch Error

Opening and closing tags don't match.

**Example:**
```tsx
<div>       // Line 10
  <span>Text
</div>      // Line 12 - Expected </span>
</span>
```

**Fix:** Match closing tags to opening tags in correct order.

### Unclosed Tag Error

Tag opened but never closed before end of file.

**Example:**
```tsx
return (
  <div>
    <p>Text
    // Missing </p>
  </div>
);
```

**Fix:** Add closing tags for all opening tags.

## Performance

- **Validator:** ~50ms for 12 templates
- **Fixer:** ~100ms for 12 templates
- **Full Pipeline:** 2-5 minutes for complete theme

Use quick tools for rapid iteration during development.

## Limitations

These tools focus on **JSX syntax only**. They do NOT:

- ❌ Validate React component logic
- ❌ Check prop types or TypeScript types
- ❌ Verify component imports
- ❌ Test runtime behavior
- ❌ Check CSS/styling issues

For comprehensive validation, run the full theme generation pipeline.

## Troubleshooting

### "No template files found"

**Cause:** Invalid theme path or no `templates/` folder

**Fix:**
```bash
# Check theme structure
ls -la themes/my-theme/templates

# Use correct path
npm run test:templates themes/my-theme
```

### "Still have errors after fix"

**Cause:** Auto-fixer can't handle all error types

**Solution:** Use error report to manually fix remaining issues:

```bash
# Run validator to see errors
npm run test:templates

# Read error messages and code context
# Manually edit files
# Re-run validator to confirm
```

### Auto-fixer changes wrong code

**Cause:** Complex nested structures confuse regex patterns

**Solution:** Revert changes and manually fix:

```bash
# Restore from git
git checkout themes/my-theme/templates/problematic-file.tsx

# Manually fix based on error report
# Commit fixed version
```

## Examples

### Example 1: Fresh Theme Validation

```bash
$ npm run test:templates themes/new-theme

🔍 Quick Template Validator
Found 8 files to validate
✅ All files passed validation!
```

### Example 2: Fix and Verify

```bash
$ npm run test:templates
❌ Found 3 errors in 2 files

$ npm run fix:templates
✨ Fixed 2 issues in 2 files

$ npm run test:templates
❌ Found 1 error in 1 file
# Manual fix required for remaining error
```

### Example 3: Development Loop

```bash
# Edit template
vim themes/my-theme/templates/index.tsx

# Quick check
npm run test:templates themes/my-theme

# Auto-fix if needed
npm run fix:templates themes/my-theme

# Verify
npm run test:templates themes/my-theme
```

## Future Enhancements

Planned features:

- [ ] TypeScript type checking
- [ ] Component import validation
- [ ] Prop validation against theme.json
- [ ] CSS class validation
- [ ] Accessibility checks (a11y)
- [ ] Performance hints
- [ ] Watch mode for continuous validation
- [ ] VS Code extension integration

## Contributing

To add new validation rules:

1. Add detection logic in `test-templates.js`
2. Add auto-fix logic in `fix-templates.js`
3. Test with sample files
4. Update this documentation

## Related Files

- `AINestPressifier.ts` - Full validation pipeline (Lines 85-850)
- `test-validator.js` - Unit tests for validator
- `test-autofix.js` - Unit tests for auto-fixer
- `JSX_VALIDATION_COMPLETE.md` - Complete validation system docs
