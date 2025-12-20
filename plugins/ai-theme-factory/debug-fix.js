const code = `export function Test() {
  return (
    <>
      <div>Content</div>
  );
}`;

console.log('Original code:');
console.log(code);
console.log('\nLast 30 chars:', JSON.stringify(code.slice(-30)));

// Strategy 1: Find the last </something> and insert </> before );
const lastTagIndex = code.lastIndexOf('</div>');
if (lastTagIndex >= 0) {
  const afterLastTag = code.substring(lastTagIndex + 6); // after </div>
  console.log('\nAfter last tag:', JSON.stringify(afterLastTag));
  
  // Find where to insert </>
  const lines = code.split('\n');
  console.log('\nLines:', lines.map((l, i) => `${i}: ${JSON.stringify(l)}`).join('\n'));
  
  // Find the line with </div>
  const divLineIndex = lines.findIndex(l => l.includes('</div>'));
  console.log('\n</div> is on line:', divLineIndex);
  
  // Insert </> on the next line
  const indent = lines[divLineIndex].match(/^(\s*)/)?.[1] || '  ';
  lines.splice(divLineIndex + 1, 0, indent + '</>');
  
  const fixed = lines.join('\n');
  console.log('\nFixed code:');
  console.log(fixed);
}
