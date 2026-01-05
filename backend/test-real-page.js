const fs = require('fs');

const content = fs.readFileSync('../wordpress/wp-content/themes/twentytwentyfive/templates/page.html', 'utf-8');

// Simple block parser
function parseBlocks(content) {
  const blocks = [];
  const lines = content.split('\n');
  let i = 0;
  
  while (i < lines.length) {
    const result = parseBlock(lines, i);
    if (result.block) {
      blocks.push(result.block);
    }
    i = result.nextIndex;
  }
  
  return blocks;
}

function parseBlock(lines, startIndex) {
  const line = lines[startIndex]?.trim();
  
  if (!line || !line.startsWith('<!--')) {
    return { block: null, nextIndex: startIndex + 1 };
  }
  
  const blockNameMatch = line.match(/<!--\s+wp:([^\s{]+)/);
  if (!blockNameMatch) {
    return { block: null, nextIndex: startIndex + 1 };
  }
  
  const isSelfClosing = line.includes('/-->');
  
  if (isSelfClosing) {
    return {
      block: {
        blockName: `core/${blockNameMatch[1]}`,
        isSelfClosing: true
      },
      nextIndex: startIndex + 1
    };
  }
  
  const closingTag = `<!-- /wp:${blockNameMatch[1]} -->`;
  let currentIndex = startIndex + 1;
  let depth = 1;
  
  while (currentIndex < lines.length && depth > 0) {
    const currentLine = lines[currentIndex];
    
    if (currentLine.trim() === closingTag.trim()) {
      depth--;
      if (depth === 0) {
        break;
      }
      currentIndex++;
      continue;
    }
    
    if (currentLine.includes(`<!-- wp:${blockNameMatch[1]} `) && !currentLine.includes('/>')) {
      depth++;
    }
    
    currentIndex++;
  }
  
  return {
    block: {
      blockName: `core/${blockNameMatch[1]}`,
      startLine: startIndex,
      endLine: currentIndex
    },
    nextIndex: currentIndex + 1
  };
}

const blocks = parseBlocks(content);
console.log('Root-level blocks found:');
blocks.forEach((block, i) => {
  console.log(`  ${i + 1}. ${block.blockName}${block.isSelfClosing ? ' (self-closing)' : ''} ${block.startLine !== undefined ? `[lines ${block.startLine}-${block.endLine}]` : ''}`);
});
