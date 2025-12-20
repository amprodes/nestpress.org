#!/usr/bin/env node

/**
 * Quick Template Fixer
 * Auto-fixes common JSX errors in template files
 */

const fs = require('fs');
const path = require('path');

const themePath = process.argv[2] || path.join(__dirname, '../../themes/enfold-business-flat');

console.log('🔧 Quick Template Fixer');
console.log('='.repeat(80));
console.log(`Fixing templates in: ${themePath}\n`);

// Import validation from test script
function detectMultipleRootElements(code) {
  const errors = [];
  
  if (code.match(/return\s*\(\s*<>\s*<[a-zA-Z]/)) {
    errors.push({ type: 'multiple_root_elements', pattern: 1 });
  }
  
  const returnMatch = code.match(/return\s*\(([\s\S]*?)\n\s*\);/);
  if (returnMatch) {
    const returnContent = returnMatch[1];
    if (returnContent.match(/<\/[a-z]+>\s*<[A-Z][a-zA-Z]+/)) {
      errors.push({ type: 'multiple_root_elements', pattern: 2 });
    }
  }
  
  if (code.match(/<\/>\s*<[A-Z][a-zA-Z]/)) {
    errors.push({ type: 'multiple_root_elements', pattern: 3 });
  }
  
  return errors;
}

// Auto-fix functions
function fixMultipleRootElements(code) {
  let fixed = code;
  let changes = [];
  
  // Pattern 1: return (<><div>...</div><Footer /></>)
  const emptyFragmentPattern = /return\s*\(\s*<>\s*([\s\S]*?)<\/>\s*\)/g;
  const emptyFragmentMatch = emptyFragmentPattern.exec(fixed);
  
  if (emptyFragmentMatch) {
    const content = emptyFragmentMatch[1];
    
    // Extract the last closing tag
    const closingTagMatch = content.match(/(<\/[a-z]+>)(\s*<[A-Z][a-zA-Z]+[\s\S]*?)$/);
    
    if (closingTagMatch) {
      const closingTag = closingTagMatch[1];
      const afterClosing = closingTagMatch[2];
      
      // Move Footer inside parent div
      const beforeClosing = content.substring(0, closingTagMatch.index);
      const newContent = `${beforeClosing}${afterClosing}\n    ${closingTag}`;
      
      fixed = fixed.replace(emptyFragmentMatch[0], `return (\n    ${newContent}\n  )`);
      changes.push('Removed empty fragment and moved Footer inside parent div');
    }
  }
  
  // Pattern 2: </div><Footer...
  const siblingPattern = /(<\/div>)(\s*)(<[A-Z][a-zA-Z]+[^>]*(?:>[\s\S]*?<\/[A-Z][a-zA-Z]+>|\/\s*>))/g;
  if (fixed.match(siblingPattern)) {
    fixed = fixed.replace(siblingPattern, (match, closingDiv, whitespace, component) => {
      const indent = '      ';
      return `${component}\n${indent}${closingDiv}`;
    });
    changes.push('Moved sibling components inside parent div');
  }
  
  // Pattern 3: </><Footer...
  const fragmentPattern = /(<\/>)(\s*)(<[A-Z][a-zA-Z]+[^>]*(?:>[\s\S]*?<\/[A-Z][a-zA-Z]+>|\/\s*>))/g;
  if (fixed.match(fragmentPattern)) {
    fixed = fixed.replace(fragmentPattern, (match, closingFragment, whitespace, component) => {
      const indent = '      ';
      return `${component}\n${indent}${closingFragment}`;
    });
    changes.push('Moved components inside fragment');
  }
  
  return { code: fixed, changes };
}

function cleanJSX(code) {
  let fixed = code;
  let changes = [];
  
  // Step 1: Fix multiple root elements proactively
  const multiRootPattern = /return\s*\(\s*<>\s*(<[a-zA-Z][^>]*>[\s\S]*?<\/[a-zA-Z]+>)\s*(<[A-Z][a-zA-Z]+[^>]*(?:\/>|>[\s\S]*?<\/[A-Z][a-zA-Z]+>))\s*<\/>/g;
  if (fixed.match(multiRootPattern)) {
    fixed = fixed.replace(multiRootPattern, (match, parentDiv, footerComponent) => {
      const closingTagMatch = parentDiv.match(/<\/([a-zA-Z]+)>$/);
      if (closingTagMatch) {
        const closingTag = closingTagMatch[0];
        const contentBeforeClosing = parentDiv.substring(0, closingTagMatch.index);
        return `return (\n    ${contentBeforeClosing}\n      ${footerComponent}\n    ${closingTag}\n  )`;
      }
      return match;
    });
    changes.push('Fixed multiple root elements in return statement');
  }
  
  // Step 2: Fix root-level siblings
  const rootSiblingPattern = /(<\/[a-z]+>)(\s*)(<[A-Z][a-zA-Z]+[^>]*(?:\/>|>[\s\S]*?<\/[A-Z][a-zA-Z]+>))\s*\)/g;
  if (fixed.match(rootSiblingPattern)) {
    fixed = fixed.replace(rootSiblingPattern, (match, closingTag, whitespace, component) => {
      return `${component}\n    ${closingTag}\n  )`;
    });
    changes.push('Fixed root-level sibling components');
  }
  
  return { code: fixed, changes };
}

// Find all template files
function findTemplateFiles(dir) {
  const files = [];
  
  const templateDirs = [
    path.join(dir, 'templates'),
    path.join(dir, 'parts')
  ];
  
  for (const templateDir of templateDirs) {
    if (!fs.existsSync(templateDir)) continue;
    
    const dirFiles = fs.readdirSync(templateDir);
    for (const file of dirFiles) {
      if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        files.push({
          path: path.join(templateDir, file),
          name: file,
          type: templateDir.endsWith('templates') ? 'template' : 'part'
        });
      }
    }
  }
  
  return files;
}

// Main fixing
const files = findTemplateFiles(themePath);

if (files.length === 0) {
  console.log('❌ No template files found!');
  process.exit(1);
}

console.log(`Found ${files.length} files to fix\n`);

let totalFixed = 0;
let filesFixed = 0;

for (const file of files) {
  try {
    const originalCode = fs.readFileSync(file.path, 'utf-8');
    let code = originalCode;
    let allChanges = [];
    
    // Run fixes
    const cleanResult = cleanJSX(code);
    if (cleanResult.changes.length > 0) {
      code = cleanResult.code;
      allChanges.push(...cleanResult.changes);
    }
    
    const multiRootErrors = detectMultipleRootElements(code);
    if (multiRootErrors.length > 0) {
      const fixResult = fixMultipleRootElements(code);
      if (fixResult.changes.length > 0) {
        code = fixResult.code;
        allChanges.push(...fixResult.changes);
      }
    }
    
    // Write back if changed
    if (code !== originalCode) {
      fs.writeFileSync(file.path, code, 'utf-8');
      filesFixed++;
      totalFixed += allChanges.length;
      
      console.log(`✅ ${file.name}`);
      allChanges.forEach((change, i) => {
        console.log(`   ${i + 1}. ${change}`);
      });
      console.log('');
    }
    
  } catch (error) {
    console.log(`❌ Error fixing ${file.name}: ${error.message}`);
  }
}

console.log('='.repeat(80));
if (filesFixed === 0) {
  console.log('✨ No fixes needed - all files are valid!');
} else {
  console.log(`✨ Fixed ${totalFixed} issues in ${filesFixed} files`);
  console.log('\n💡 Run test-templates.js again to verify all fixes');
}

process.exit(0);
