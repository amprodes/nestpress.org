# Theme Converter - Quick Start Guide

## 🚀 Start Using the Theme Converter

### Step 1: Start the Backend

```bash
cd backend
npm run start:dev
```

Wait for: `[Nest] ... NestApplication - Listening on port 4000`

### Step 2: Convert a WordPress Theme

#### Option A: Using cURL

```bash
# Convert Twenty Twenty-Five (included)
curl -X POST http://localhost:4000/api/v1/theme-converter/convert \
  -F "theme=@../twentytwentyfive-test.zip"
```

#### Option B: Using the Test Script

```bash
cd backend
./test-converter.sh
```

#### Option C: Using any HTTP client (Postman, Insomnia, etc.)

- **Method**: POST
- **URL**: `http://localhost:4000/api/v1/theme-converter/convert`
- **Body**: `multipart/form-data`
- **Field name**: `theme`
- **File**: Select a WordPress theme ZIP

### Step 3: Check the Output

Converted themes appear in:
```
/themes/[theme-slug]/
```

Example for Twenty Twenty-Five:
```
/themes/twentytwentyfive/
├── index.tsx
├── theme.json
├── templates/
├── parts/
├── patterns/
└── assets/
```

### Step 4: Use the Converted Theme

The theme is automatically available in NestPress:

1. Go to Appearance section
2. Find the converted theme
3. Activate it
4. Preview on the frontend

## 📋 Quick Reference

### Supported Theme Requirements

- ✅ WordPress 5.0+ (Gutenberg block-based)
- ✅ Block themes (uses `theme.json`)
- ✅ Pattern-based themes
- ✅ ZIP format
- ✅ Max file size: 50MB

### Conversion Process

1. **Extracts** ZIP file
2. **Parses** theme metadata
3. **Converts** Gutenberg blocks to JSX
4. **Generates** React components
5. **Creates** NestPress theme structure
6. **Copies** assets (CSS, images, fonts)
7. **Cleans up** temporary files

### Response Example

```json
{
  "success": true,
  "themeId": "twentytwentyfive",
  "themeName": "Twenty Twenty-Five",
  "outputPath": "/path/to/themes/twentytwentyfive",
  "stats": {
    "totalPatterns": 95,
    "convertedPatterns": 95,
    "totalBlocks": 450,
    "convertedBlocks": 450
  }
}
```

## 🔍 Troubleshooting

### Server not running?
```bash
cd backend
npm run start:dev
```

### Port 4000 in use?
Change `PORT` in `backend/.env`

### Conversion failed?
Check `conversionLog` in the response for details

### Theme not appearing?
1. Check `/themes/[theme-slug]` exists
2. Restart backend to rescan themes
3. Check browser console for errors

## 📖 Full Documentation

- Module README: `backend/src/modules/theme-converter/README.md`
- Implementation Summary: `../THEME_CONVERTER.md`
- API Docs: `http://localhost:4000/api-docs` (when server running)

## 💡 Tips

- Start with simple block-based themes
- Review conversion warnings in the response
- Check generated components for manual tweaks
- Not all WordPress features convert automatically
- Custom Gutenberg blocks need manual handling

---

**Ready to convert themes!** 🎨
