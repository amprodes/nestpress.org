#!/bin/bash

# Test script to convert Twenty Twenty-Five theme and verify styles folder
# This tests the complete WordPress block theme architecture support

echo "🚀 Testing Twenty Twenty-Five Theme Conversion"
echo "=============================================="
echo ""

# Backend URL
BACKEND_URL="http://localhost:4000/api/v1"

# WordPress theme source
WP_THEME="/home/sofyserver/Downloads/nestpress-cms/wordpress/wp-content/themes/twentytwentyfive"

# Check if theme exists
if [ ! -d "$WP_THEME" ]; then
  echo "❌ WordPress theme not found at: $WP_THEME"
  exit 1
fi

echo "📁 WordPress theme found: $WP_THEME"
echo ""

# Count WordPress theme files
echo "📊 WordPress Theme Structure:"
echo "  Templates: $(find "$WP_THEME/templates" -name "*.html" 2>/dev/null | wc -l) HTML files"
echo "  Parts: $(find "$WP_THEME/parts" -name "*.html" 2>/dev/null | wc -l) HTML files"
echo "  Patterns: $(find "$WP_THEME/patterns" -name "*.php" 2>/dev/null | wc -l) PHP files"
echo "  Styles: $(find "$WP_THEME/styles" -name "*.json" 2>/dev/null | wc -l) JSON files"
echo "  theme.json: $([ -f "$WP_THEME/theme.json" ] && echo "✓" || echo "✗")"
echo "  functions.php: $([ -f "$WP_THEME/functions.php" ] && echo "✓" || echo "✗")"
echo ""

# List style variations
echo "🎨 WordPress Style Variations:"
if [ -d "$WP_THEME/styles" ]; then
  for style in "$WP_THEME/styles"/*.json; do
    if [ -f "$style" ]; then
      basename "$style" .json | xargs -I {} echo "  - {}"
    fi
  done
else
  echo "  (none found)"
fi
echo ""

# Create temp directory for theme zip
TEMP_DIR=$(mktemp -d)
THEME_ZIP="$TEMP_DIR/twentytwentyfive.zip"

echo "📦 Creating theme package..."
cd "$WP_THEME/.." && zip -q -r "$THEME_ZIP" twentytwentyfive
echo "  ✓ Created: $THEME_ZIP ($(du -h "$THEME_ZIP" | cut -f1))"
echo ""

# Upload and convert theme
echo "🔄 Converting theme via API..."
RESPONSE=$(curl -s -X POST \
  -F "theme=@$THEME_ZIP" \
  "$BACKEND_URL/theme-converter/convert")

# Check if conversion was successful
if echo "$RESPONSE" | grep -q '"success":true'; then
  DOWNLOAD_URL=$(echo "$RESPONSE" | grep -o '"downloadUrl":"[^"]*"' | cut -d'"' -f4)
  echo "  ✅ Conversion successful!"
  echo "  📥 Download URL: $DOWNLOAD_URL"
  echo ""
  
  # Download converted theme
  echo "📥 Downloading converted theme..."
  CONVERTED_ZIP="$TEMP_DIR/converted-twentytwentyfive.zip"
  curl -s "$BACKEND_URL/$DOWNLOAD_URL" -o "$CONVERTED_ZIP"
  echo "  ✓ Downloaded: $(du -h "$CONVERTED_ZIP" | cut -f1)"
  echo ""
  
  # Extract and verify structure
  echo "🔍 Verifying NestPress Theme Structure..."
  EXTRACT_DIR="$TEMP_DIR/extracted"
  mkdir -p "$EXTRACT_DIR"
  unzip -q "$CONVERTED_ZIP" -d "$EXTRACT_DIR"
  
  THEME_DIR="$EXTRACT_DIR/twenty-twenty-five"
  if [ ! -d "$THEME_DIR" ]; then
    THEME_DIR=$(find "$EXTRACT_DIR" -maxdepth 1 -type d | tail -1)
  fi
  
  echo "  Templates: $(find "$THEME_DIR/templates" -name "*.tsx" 2>/dev/null | wc -l) TSX files"
  echo "  Parts: $(find "$THEME_DIR/parts" -name "*.tsx" 2>/dev/null | wc -l) TSX files"
  echo "  Patterns: $(find "$THEME_DIR/patterns" -name "*.tsx" 2>/dev/null | wc -l) TSX files"
  echo "  Styles: $(find "$THEME_DIR/styles" -name "*.json" 2>/dev/null | wc -l) JSON files"
  echo "  theme.json: $([ -f "$THEME_DIR/theme.json" ] && echo "✓" || echo "✗")"
  echo "  functions.ts: $([ -f "$THEME_DIR/functions.ts" ] && echo "✓" || echo "✗")"
  echo "  index.tsx: $([ -f "$THEME_DIR/index.tsx" ] && echo "✓" || echo "✗")"
  echo ""
  
  # Verify styles folder
  if [ -d "$THEME_DIR/styles" ]; then
    echo "🎨 NestPress Style Variations:"
    for style in "$THEME_DIR/styles"/*.json; do
      if [ -f "$style" ]; then
        basename "$style" .json | xargs -I {} echo "  - {}"
      fi
    done
    
    if [ -f "$THEME_DIR/styles/index.json" ]; then
      echo ""
      echo "  ✅ styles/index.json manifest created"
    fi
  else
    echo "  ❌ styles/ folder NOT created"
  fi
  echo ""
  
  # Check functions.ts content
  if [ -f "$THEME_DIR/functions.ts" ]; then
    echo "📄 functions.ts verification:"
    if grep -q "export const themeSetup" "$THEME_DIR/functions.ts"; then
      echo "  ✓ themeSetup exported"
    else
      echo "  ✗ themeSetup NOT found"
    fi
    
    if grep -q "export const blockStyles" "$THEME_DIR/functions.ts"; then
      echo "  ✓ blockStyles exported"
    else
      echo "  ✗ blockStyles NOT found"
    fi
  fi
  echo ""
  
  echo "✅ Conversion test completed successfully!"
  echo ""
  echo "📂 Extracted theme location: $THEME_DIR"
  
else
  echo "  ❌ Conversion failed!"
  echo ""
  echo "Response:"
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
fi

# Cleanup
rm -rf "$TEMP_DIR"
echo ""
echo "🧹 Cleanup complete"
