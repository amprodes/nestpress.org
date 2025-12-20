#!/usr/bin/env node

/**
 * Quick Template Validator
 * Tests all template files for common JSX errors without running full theme generation
 */

const fs = require('fs');
const path = require('path');

// Get theme path from command line or use default
const themePath = process.argv[2] || path.join(__dirname, '../../themes/enfold-business-flat');

console.log('🔍 Quick Template Validator');
console.log('='.repeat(80));
console.log(`Testing templates in: ${themePath}\n`);

// Validation functions (simplified versions from AINestPressifier)
function detectMultipleRootElements(code, filePath) {
  const errors = [];
  
  // Pattern 1: return (<><div> or return (<>...<Footer/>
  if (code.match(/return\s*\(\s*<>\s*<[a-zA-Z]/)) {
    errors.push({
      type: 'multiple_root_elements',
      message: 'Empty fragment with sibling elements detected',
      pattern: 'return (<><div>...'
    });
  }
  
  // Pattern 2: DISABLED - too many false positives
  // Footer inside parent div looks like sibling due to indentation
  /*
  const returnMatch = code.match(/return\s*\(([\s\S]*?)\n\s*\);/);
  if (returnMatch) {
    const returnContent = returnMatch[1];
    if (returnContent.match(/<\/[a-z]+>\s*<[A-Z][a-zA-Z]+/)) {
      errors.push({
        type: 'multiple_root_elements',
        message: 'Multiple root elements (sibling components)',
        pattern: '</div><Footer...'
      });
    }
  }
  */
  
  // Pattern 3: </>...<Footer
  if (code.match(/<\/>\s*<[A-Z][a-zA-Z]/)) {
    errors.push({
      type: 'multiple_root_elements',
      message: 'Fragment closing followed by sibling component',
      pattern: '</><Footer...'
    });
  }
  
  return errors;
}

function validateJSXStructure(code, filePath) {
  const errors = [];
  
  // CRITICAL: Remove multi-line HTML inside attribute values FIRST
  let cleanedCode = code;
  cleanedCode = cleanedCode.replace(/=\s*'([^']*<[^']*)'(?=\s|>)/gs, '=""');
  cleanedCode = cleanedCode.replace(/=\s*"([^"]*<[^"]*)"(?=\s|>)/gs, '=""');
  
  const lines = cleanedCode.split('\n');
  const tagStack = [];
  
  const selfClosingTags = new Set([
    'img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 
    'embed', 'source', 'track', 'wbr', 'param'
  ]);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    const withoutExpressions = line
      .replace(/\{[^}]*\}/g, '')
      .replace(/\/\/.*$/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Handle fragments
    if (withoutExpressions.includes('<>')) {
      tagStack.push({ tag: 'Fragment', line: lineNum, isFragment: true });
    }
    if (withoutExpressions.includes('</>')) {
      const lastOpen = tagStack[tagStack.length - 1];
      if (!lastOpen) {
        errors.push({
          type: 'unmatched_closing',
          message: `Closing fragment </> has no matching opening <>`,
          line: lineNum
        });
      } else if (!lastOpen.isFragment) {
        errors.push({
          type: 'fragment_tag_mismatch',
          message: `Expected closing tag </${lastOpen.tag}> but found fragment </>`,
          line: lineNum,
          openLine: lastOpen.line
        });
      } else {
        tagStack.pop();
      }
    }
    
    // Regular tags
    const tagRegex = /<\/?[\w.:-]+(?:\s+[^>]*)?>/g;
    let match;
    
    while ((match = tagRegex.exec(withoutExpressions)) !== null) {
      const fullTag = match[0];
      
      if (fullTag.endsWith('/>')) continue;
      
      if (fullTag.startsWith('</')) {
        const tagName = fullTag.match(/<\/([\w.:-]+)/)?.[1];
        if (!tagName) continue;
        
        const lastOpen = tagStack[tagStack.length - 1];
        if (!lastOpen) {
          errors.push({
            type: 'unmatched_closing',
            message: `Closing tag </${tagName}> has no matching opening tag`,
            line: lineNum
          });
        } else if (lastOpen.isFragment) {
          errors.push({
            type: 'fragment_tag_mismatch',
            message: `Fragment <> opened at line ${lastOpen.line} but closed with </${tagName}>`,
            line: lineNum,
            openLine: lastOpen.line
          });
        } else if (lastOpen.tag !== tagName) {
          errors.push({
            type: 'tag_mismatch',
            message: `Expected </${lastOpen.tag}> but found </${tagName}>`,
            line: lineNum,
            openLine: lastOpen.line
          });
        } else {
          tagStack.pop();
        }
        continue;
      }
      
      const tagName = fullTag.match(/<([\w.:-]+)/)?.[1];
      if (!tagName || selfClosingTags.has(tagName.toLowerCase())) continue;
      
      tagStack.push({ tag: tagName, line: lineNum, isFragment: false });
    }
  }
  
  // Check for unclosed tags
  for (const unclosed of tagStack) {
    if (unclosed.isFragment) {
      errors.push({
        type: 'unclosed_fragment',
        message: `Fragment <> opened at line ${unclosed.line} is never closed`,
        line: unclosed.line
      });
    } else {
      errors.push({
        type: 'unclosed_tag',
        message: `Tag <${unclosed.tag}> opened at line ${unclosed.line} is never closed`,
        line: unclosed.line
      });
    }
  }
  
  return errors;
}

function showCodeContext(code, lineNum, contextLines = 2) {
  const lines = code.split('\n');
  const lineIndex = lineNum - 1;
  const startLine = Math.max(0, lineIndex - contextLines);
  const endLine = Math.min(lines.length - 1, lineIndex + contextLines);
  
  console.log('      Code context:');
  for (let i = startLine; i <= endLine; i++) {
    const marker = i === lineIndex ? '→' : ' ';
    const lineContent = lines[i].substring(0, 100); // Truncate long lines
    console.log(`      ${marker} ${i + 1}: ${lineContent}`);
  }
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

// Main validation
const files = findTemplateFiles(themePath);

if (files.length === 0) {
  console.log('❌ No template files found!');
  console.log(`   Check path: ${themePath}`);
  process.exit(1);
}

console.log(`Found ${files.length} files to validate\n`);

let totalErrors = 0;
let filesWithErrors = 0;
const results = [];

for (const file of files) {
  try {
    const code = fs.readFileSync(file.path, 'utf-8');
    
    // Run validations
    const multiRootErrors = detectMultipleRootElements(code, file.path);
    const structureErrors = validateJSXStructure(code, file.path);
    
    const allErrors = [...multiRootErrors, ...structureErrors];
    
    if (allErrors.length > 0) {
      filesWithErrors++;
      totalErrors += allErrors.length;
      
      results.push({
        file: file.name,
        type: file.type,
        path: file.path,
        errors: allErrors,
        code
      });
    }
  } catch (error) {
    console.log(`❌ Error reading ${file.name}: ${error.message}`);
  }
}

// Display results
if (filesWithErrors === 0) {
  console.log('✅ All files passed validation!');
  console.log('='.repeat(80));
  process.exit(0);
}

console.log(`❌ Found ${totalErrors} errors in ${filesWithErrors} files\n`);
console.log('='.repeat(80));

results.forEach((result, index) => {
  console.log(`\n${index + 1}. ${result.file} (${result.type})`);
  console.log('   ' + '-'.repeat(76));
  
  result.errors.forEach((error, errIndex) => {
    console.log(`   ${errIndex + 1}. [${error.type}] ${error.message}`);
    if (error.line) {
      console.log(`      Line: ${error.line}${error.openLine ? ` (opened at line ${error.openLine})` : ''}`);
      if (error.pattern) {
        console.log(`      Pattern: ${error.pattern}`);
      }
      showCodeContext(result.code, error.line);
    } else if (error.pattern) {
      console.log(`      Pattern: ${error.pattern}`);
    }
    console.log('');
  });
});

console.log('='.repeat(80));
console.log('\n💡 Quick Fixes:');
console.log('   • Multiple root elements: Wrap all content in single parent <div>');
console.log('   • Fragment mismatch: Replace </div> with </> or vice versa');
console.log('   • Unclosed tags: Add missing closing tag before return )');
console.log('   • Unmatched closing: Remove extra closing tag or add opening tag');
console.log('\n📝 To auto-fix: Run the full theme generation pipeline');
console.log('   The validator will automatically fix most of these issues\n');

process.exit(1);
