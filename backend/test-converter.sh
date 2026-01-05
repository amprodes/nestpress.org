#!/bin/bash

# Test Theme Converter
echo "Testing Theme Converter..."
echo ""

# Wait for server to be ready
sleep 2

# Test conversion endpoint
echo "Uploading Twenty Twenty-Five theme..."
curl -X POST http://localhost:4000/api/v1/theme-converter/convert \
  -F "theme=@../twentytwentyfive-test.zip" \
  -H "Accept: application/json" \
  2>&1 | jq '.'

echo ""
echo "Test complete!"
