import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';

@Module({
  controllers: [AIController],
  providers: [AIService, GeminiProvider, OpenAIProvider, AnthropicProvider],
  exports: [AIService],
})
export class AIModule {}
