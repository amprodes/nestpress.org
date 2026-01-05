import { Test } from '@nestjs/testing';
import { BlockParserService } from './src/modules/theme-converter/parsers/block-parser.service';
import * as fs from 'fs';

async function test() {
  const module = await Test.createTestingModule({
    providers: [BlockParserService],
  }).compile();

  const parser = module.get<BlockParserService>(BlockParserService);
  const content = fs.readFileSync('../wordpress/wp-content/themes/twentytwentyfive/templates/page.html', 'utf-8');
  
  console.log('=== Parsing page.html ===\n');
  const blocks = parser.parseBlocks(content);
  
  console.log(`\n=== Found ${blocks.length} root-level blocks ===`);
  blocks.forEach((block, i) => {
    console.log(`\nBlock ${i + 1}: ${block.blockName}`);
    console.log(`  Inner blocks: ${block.innerBlocks.length}`);
    if (block.innerBlocks.length > 0) {
      block.innerBlocks.forEach((inner, j) => {
        console.log(`    ${j + 1}. ${inner.blockName}`);
      });
    }
  });
}

test().catch(console.error);
