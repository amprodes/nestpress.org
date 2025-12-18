import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AIService, GenerateContentDto } from './ai.service';
import { Roles, Role } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';

@ApiTags('AI')
@Controller('ai')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.EDITOR, Role.AUTHOR)
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('generate')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Generate content with AI' })
  generateContent(@Body() dto: GenerateContentDto) {
    return this.aiService.generateContent(dto);
  }

  @Post('generate-blog')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Generate complete blog post' })
  generateBlogPost(@Body('topic') topic: string) {
    return this.aiService.generateBlogPost(topic);
  }

  @Post('generate-product-description')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Generate product description' })
  generateProductDescription(@Body('productInfo') productInfo: string) {
    return this.aiService.generateProductDescription(productInfo);
  }

  @Post('generate-seo')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Generate SEO metadata from content' })
  generateSEO(@Body('content') content: string) {
    return this.aiService.generateSEO(content);
  }

  @Post('summarize')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Summarize content' })
  summarize(@Body('content') content: string) {
    return this.aiService.summarize(content);
  }

  @Post('improve-writing')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Improve writing quality' })
  improveWriting(@Body('content') content: string) {
    return this.aiService.improveWriting(content);
  }

  @Post('generate-headlines')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Generate headline suggestions' })
  generateHeadlines(@Body('topic') topic: string, @Body('count') count?: number) {
    return this.aiService.generateHeadlines(topic, count);
  }
}
