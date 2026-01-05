const fs = require('fs');

const content = `<!-- wp:template-part {"slug":"header"} /-->

<!-- wp:group {"tagName":"main"} -->
<main class="wp-block-group">
        <!-- wp:group {"align":"full"} -->
        <div class="wp-block-group alignfull">
                <!-- wp:post-title {"level":1} /-->
        </div>
        <!-- /wp:group -->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer"} /-->`;

const lines = content.split('\n');
console.log('Total lines:', lines.length);
lines.forEach((line, i) => console.log(`${i}: ${line}`));

// Find group block
let i = 0;
while (i < lines.length) {
  const line = lines[i].trim();
  if (line.startsWith('<!-- wp:group')) {
    console.log(`\nFound group block at line ${i}`);
    console.log(`Line: "${line}"`);
    
    // Simulate parser
    let currentIndex = i + 1;
    let depth = 1;
    const closingTag = '<!-- /wp:group -->';
    
    while (currentIndex < lines.length && depth > 0) {
      const currentLine = lines[currentIndex];
      console.log(`  [depth=${depth}] Line ${currentIndex}: "${currentLine.trim()}"`);
      
      if (currentLine.trim() === closingTag.trim()) {
        depth--;
        console.log(`    → Closing tag found! depth=${depth}`);
        if (depth === 0) {
          console.log(`    → Breaking loop at line ${currentIndex}`);
          break;
        }
      }
      
      // Check for nested groups
      if (currentLine.includes('<!-- wp:group ') && !currentLine.includes('/>')) {
        depth++;
        console.log(`    → Nested group! depth=${depth}`);
      }
      
      currentIndex++;
    }
    
    console.log(`\nLoop ended at line ${currentIndex}`);
    console.log(`Next line would be ${currentIndex + 1}: "${lines[currentIndex + 1]?.trim()}"`);
    break;
  }
  i++;
}
