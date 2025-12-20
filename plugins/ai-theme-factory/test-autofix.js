#!/usr/bin/env node

/**
 * Test auto-fix functionality
 */

// Auto-fix test cases
const autoFixTests = [
  {
    name: 'Fix fragment_tag_mismatch',
    errorType: 'fragment_tag_mismatch',
    errorMessage: 'Fragment <> opened at line 3 but closed with </div> instead of </>',
    errorLine: 6,
    code: `export function Test() {
  return (
    <>
      <li>Item 1</li>
      <li>Item 2</li>
    </div>
  );
}`,
    expectedFix: `export function Test() {
  return (
    <>
      <li>Item 1</li>
      <li>Item 2</li>
    </>
  );
}`
  },
  {
    name: 'Fix wrong_property',
    errorType: 'wrong_property',
    errorMessage: 'Using header?.general?.siteTitle instead of header?.siteName',
    code: `export function Test({ header }) {
  return (
    <div>
      <h1>{header?.general?.siteTitle}</h1>
      <p>{header.general.siteTitle}</p>
    </div>
  );
}`,
    expectedFix: `export function Test({ header }) {
  return (
    <div>
      <h1>{header?.siteName}</h1>
      <p>{header.siteName}</p>
    </div>
  );
}`
  },
  {
    name: 'Fix tag_mismatch',
    errorType: 'tag_mismatch',
    errorMessage: 'Expected closing tag </div> (opened at line 4), but found </span>',
    errorLine: 5,
    code: `export function Test() {
  return (
    <div>
      <div>Content
      </span>
    </div>
  );
}`,
    expectedFix: `export function Test() {
  return (
    <div>
      <div>Content
      </div>
    </div>
  );
}`
  },
  {
    name: 'Fix unclosed_fragment',
    errorType: 'unclosed_fragment',
    errorMessage: 'Fragment <> opened at line 3 is never closed',
    errorLine: 3,
    code: `export function Test() {
  return (
    <>
      <div>Content</div>
  );
}`,
    expectedFix: `export function Test() {
  return (
    <>
      <div>Content</div>
    </>
  );
}`
  }
];

// Simulate autoFixJSXError method
function autoFixJSXError(code, error) {
  const errorLine = error.line || 0;
  console.log(`[AutoFix] Fixing ${error.type} at line ${errorLine}`);
  
  switch (error.type) {
    case 'wrong_property':
      code = code.replace(/header\?\.general\?\.siteTitle/g, 'header?.siteName');
      code = code.replace(/header\.general\.siteTitle/g, 'header.siteName');
      break;
      
    case 'fragment_tag_mismatch':
      const lines = code.split('\n');
      if (errorLine > 0 && errorLine <= lines.length) {
        const wrongTagMatch = error.message.match(/closed with <\/([\w.:-]+)>/);
        if (wrongTagMatch) {
          const wrongTag = wrongTagMatch[1];
          lines[errorLine - 1] = lines[errorLine - 1].replace(new RegExp(`</${wrongTag}>`), '</>');
          code = lines.join('\n');
        }
      }
      break;
      
    case 'tag_mismatch':
      const expectedMatch = error.message.match(/Expected closing tag <\/([\w.:-]+)>/);
      const foundMatch = error.message.match(/but found <\/([\w.:-]+)>/);
      if (expectedMatch && foundMatch && errorLine > 0) {
        const expected = expectedMatch[1];
        const found = foundMatch[1];
        const linesArray = code.split('\n');
        if (errorLine <= linesArray.length) {
          linesArray[errorLine - 1] = linesArray[errorLine - 1].replace(
            new RegExp(`</${found}>`), 
            `</${expected}>`
          );
          code = linesArray.join('\n');
        }
      }
      break;
      
    case 'unclosed_fragment':
    case 'unclosed_tag':
      console.log('[DEBUG] unclosed case - errorLine:', errorLine, 'message:', error.message);
      
      // Determine if it's a fragment or regular tag
      let tagName, closingTag;
      if (error.type === 'unclosed_fragment' || error.message.includes('Fragment')) {
        tagName = 'Fragment';
        closingTag = '</>';
      } else {
        const tagNameMatch = error.message.match(/Tag <([\w.:-]+)>/);
        if (!tagNameMatch) break;
        tagName = tagNameMatch[1];
        closingTag = `</${tagName}>`;
      }
      
      console.log('[DEBUG] Tag name:', tagName, 'closing:', closingTag);
        
      // Split into lines and find where to insert closing tag
      const codeLines = code.split('\n');
      console.log('[DEBUG] Total lines:', codeLines.length);
        
      // Find the line with the opening tag
      const openLineIndex = (errorLine || 1) - 1;
      console.log('[DEBUG] openLineIndex:', openLineIndex);
        
      if (openLineIndex >= 0 && openLineIndex < codeLines.length) {
        const indent = codeLines[openLineIndex].match(/^(\s*)/)?.[1] || '  ';
        console.log('[DEBUG] Indent length:', indent.length);
          
        // Find the return statement closing: );
        const closeParenIndex = codeLines.findIndex((l, i) => i > openLineIndex && l.trim().match(/^\);?/));
        console.log('[DEBUG] closeParenIndex:', closeParenIndex);
          
        if (closeParenIndex > 0) {
          // Insert closing tag before the );
          console.log('[DEBUG] Inserting at line', closeParenIndex);
          codeLines.splice(closeParenIndex, 0, indent + closingTag);
          code = codeLines.join('\n');
          console.log('[DEBUG] Done');
        }
      }
      break;
  }
  
  return code;
}

// Run tests
console.log('🔧 Testing Auto-Fix Functionality\n');
console.log('='.repeat(80) + '\n');

autoFixTests.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test.name}`);
  console.log('-'.repeat(80));
  console.log('Original code:');
  console.log(test.code);
  console.log('');
  
  const error = {
    type: test.errorType,
    message: test.errorMessage,
    line: test.errorLine
  };
  
  const fixed = autoFixJSXError(test.code, error);
  
  console.log('Fixed code:');
  console.log(fixed);
  console.log('');
  
  if (fixed.trim() === test.expectedFix.trim()) {
    console.log('✅ PASS: Code fixed correctly');
  } else {
    console.log('❌ FAIL: Fix did not match expected result');
    console.log('Expected:');
    console.log(test.expectedFix);
  }
  
  console.log('\n');
});

console.log('='.repeat(80));
console.log('✅ Auto-fix test suite complete!');
