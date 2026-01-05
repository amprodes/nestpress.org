import { Module } from '@nestjs/common';
import { ThemeConverterController } from './theme-converter.controller';
import { ThemeConverterService } from './theme-converter.service';
import { BlockParserService } from './parsers/block-parser.service';
import { PatternParserService } from './parsers/pattern-parser.service';
import { PhpParserService } from './parsers/php-parser.service';
import { BlockTransformerService } from './transformers/block-transformer.service';
import { ComponentGeneratorService } from './generators/component-generator.service';
import { ThemeGeneratorService } from './generators/theme-generator.service';
import { GlobalStylesGeneratorService } from './generators/global-styles-generator.service';

@Module({
  controllers: [ThemeConverterController],
  providers: [
    ThemeConverterService,
    BlockParserService,
    PatternParserService,
    PhpParserService,
    BlockTransformerService,
    ComponentGeneratorService,
    ThemeGeneratorService,
    GlobalStylesGeneratorService,
  ],
  exports: [ThemeConverterService],
})
export class ThemeConverterModule {}
