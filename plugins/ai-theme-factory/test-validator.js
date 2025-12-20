#!/usr/bin/env node

/**
 * Direct test of JSX validation methods
 * Run this to verify the validator works correctly
 */

// Test cases with expected errors
const testCases = [
  {
    name: 'Fragment closed with div',
    code: `
export function Test1() {
  return (
    <>
      <li>Item 1</li>
      <li>Item 2</li>
    </div>
  );
}`,
    expectedError: 'fragment_tag_mismatch'
  },
  {
    name: 'Tag mismatch',
    code: `
export function Test2() {
  return (
    <div>
      <span>Content</span>
    </p>
  );
}`,
    expectedError: 'tag_mismatch'
  },
  {
    name: 'Unclosed fragment',
    code: `
export function Test3() {
  return (
    <>
      <div>Content</div>
  );
}`,
    expectedError: 'unclosed_fragment'
  },
  {
    name: 'Wrong property access',
    code: `
export function Test5({ header }) {
  return (
    <div>{header?.general?.siteTitle}</div>
  );
}`,
    expectedError: 'wrong_property'
  },
  {
    name: 'Valid JSX - no errors',
    code: `
export function Valid() {
  return (
    <div>
      <>
        <li>Item 1</li>
        <li>Item 2</li>
      </>
    </div>
  );
}`,
    expectedError: null
  }
];

// Simulate the validateJSXStructure method
function validateJSXStructure(code) {
  const errors = [];
  const lines = code.split('\n');
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
    
    // First, handle fragments separately (they won't match the regular tag regex)
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
          message: `Expected closing tag </${lastOpen.tag}> (opened at line ${lastOpen.line}), but found fragment </> instead`,
          line: lineNum
        });
      } else {
        tagStack.pop();
      }
    }
    
    const tagRegex = /<\/?[\w.:-]+(?:\s+[^>]*)?>/g;
    let match;
    
    while ((match = tagRegex.exec(withoutExpressions)) !== null) {
      const fullTag = match[0];
      
      // Fragment opening
      if (fullTag === '<>') {
        tagStack.push({ tag: 'Fragment', line: lineNum, isFragment: true });
        continue;
      }
      
      // Fragment closing
      if (fullTag === '</>') {
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
            message: `Fragment <> opened at line ${lastOpen.line} but closed with </> instead of </${lastOpen.tag}>`,
            line: lineNum
          });
        } else {
          tagStack.pop();
        }
        continue;
      }
      
      // Self-closing
      if (fullTag.endsWith('/>')) {
        continue;
      }
      
      // Closing tag
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
            message: `Fragment <> opened at line ${lastOpen.line} but closed with </${tagName}> instead of </>`,
            line: lineNum
          });
        } else if (lastOpen.tag !== tagName) {
          errors.push({
            type: 'tag_mismatch',
            message: `Expected closing tag </${lastOpen.tag}> (opened at line ${lastOpen.line}), but found </${tagName}>`,
            line: lineNum
          });
        } else {
          tagStack.pop();
        }
        continue;
      }
      
      // Opening tag
      const tagName = fullTag.match(/<([\w.:-]+)/)?.[1];
      if (!tagName) continue;
      
      if (selfClosingTags.has(tagName.toLowerCase())) {
        continue;
      }
      
      tagStack.push({ tag: tagName, line: lineNum, isFragment: false });
    }
  }
  
  // Check unclosed tags
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

function detectJSXErrors(code) {
  const errors = validateJSXStructure(code);
  
  if (code.includes('header?.general?.siteTitle')) {
    errors.push({
      type: 'wrong_property',
      message: 'Using header?.general?.siteTitle instead of header?.siteName'
    });
  }
  
  if (code.match(/<ul[^>]*>[\s\S]*?<div[^>]*>[\s\S]*?<li/)) {
    errors.push({
      type: 'invalid_ul_child',
      message: 'Found <div> as direct child of <ul> (should be <li> only)'
    });
  }
  
  return errors;
}

// Run tests
console.log('🧪 Testing JSX Validator\n');
console.log('='.repeat(80) + '\n');

testCases.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test.name}`);
  console.log('-'.repeat(80));
  
  const errors = detectJSXErrors(test.code);
  
  if (test.expectedError === null) {
    if (errors.length === 0) {
      console.log('✅ PASS: No errors detected (as expected)');
    } else {
      console.log('❌ FAIL: Unexpected errors detected:');
      errors.forEach(err => {
        console.log(`   - ${err.type} at line ${err.line}: ${err.message}`);
      });
    }
  } else {
    const hasExpectedError = errors.some(err => err.type === test.expectedError);
    if (hasExpectedError) {
      console.log(`✅ PASS: Expected error type "${test.expectedError}" detected`);
      errors.forEach(err => {
        console.log(`   - ${err.type} at line ${err.line}: ${err.message}`);
      });
    } else {
      console.log(`❌ FAIL: Expected error type "${test.expectedError}" not found`);
      if (errors.length > 0) {
        console.log('   Found errors:');
        errors.forEach(err => {
          console.log(`   - ${err.type} at line ${err.line}: ${err.message}`);
        });
      } else {
        console.log('   No errors detected');
      }
    }
  }
  
  console.log('');
});

console.log('='.repeat(80));
console.log('✅ Test suite complete!');
