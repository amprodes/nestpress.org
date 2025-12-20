const code = `export function Test() {
  return (
    <>
      <div>Content</div>
  );
}`;

const errorLine = 3; // Line where <> opens (1-indexed)
const lines = code.split('\n');

console.log('Lines:');
lines.forEach((l, i) => console.log(`${i}: "${l}"`));

const openLineIndex = errorLine - 1; // Convert to 0-indexed
console.log(`\nOpen line index: ${openLineIndex}`);
console.log(`Line content: "${lines[openLineIndex]}"`);

const indent = lines[openLineIndex].match(/^(\s*)/)?.[1] || '  ';
console.log(`Indent: "${indent}" (length: ${indent.length})`);

// Find the closing paren
const closeParenIndex = lines.findIndex((l, i) => {
  const isAfterOpen = i > openLineIndex;
  const hasParen = l.trim().match(/^\);?/);
  console.log(`  Line ${i}: after=${isAfterOpen}, hasParen=${!!hasParen}, content="${l.trim()}"`);
  return isAfterOpen && hasParen;
});

console.log(`\nClose paren index: ${closeParenIndex}`);

if (closeParenIndex > 0) {
  lines.splice(closeParenIndex, 0, indent + '</>');
  console.log('\nFixed lines:');
  lines.forEach((l, i) => console.log(`${i}: "${l}"`));
  
  const fixed = lines.join('\n');
  console.log('\nFixed code:');
  console.log(fixed);
}
