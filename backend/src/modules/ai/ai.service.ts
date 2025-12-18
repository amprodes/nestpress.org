import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiProvider, AIProvider } from './providers/gemini.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';

export interface GenerateContentDto {
  prompt: string;
  type?: 'blog' | 'product' | 'page' | 'email' | 'social';
}

export interface GenerateSEODto {
  content: string;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private provider: AIProvider;

  constructor(
    private readonly configService: ConfigService,
    private readonly gemini: GeminiProvider,
    private readonly openai: OpenAIProvider,
    private readonly anthropic: AnthropicProvider,
  ) {
    this.selectProvider();
  }

  private selectProvider() {
    const providerName = this.configService.get<string>('ai.provider') || 'gemini';

    const providers: Record<string, AIProvider> = {
      gemini: this.gemini,
      openai: this.openai,
      anthropic: this.anthropic,
    };

    this.provider = providers[providerName] || this.gemini;
    this.logger.log(`AI provider selected: ${providerName}`);
  }

  async generateContent(dto: GenerateContentDto): Promise<string> {
    const { prompt, type = 'blog' } = dto;

    const typePrompts: Record<string, string> = {
      blog: `Write a blog post about: ${prompt}. Include an engaging introduction, main points, and conclusion.`,
      product: `Write a compelling product description for: ${prompt}. Highlight features, benefits, and use cases.`,
      page: `Write website page content about: ${prompt}. Make it informative and engaging.`,
      email: `Write a professional email about: ${prompt}. Include subject line, greeting, body, and sign-off.`,
      social: `Write engaging social media posts about: ${prompt}. Create 3 variations for different platforms.`,
    };

    const fullPrompt = typePrompts[type] || prompt;
    return this.provider.generateContent(fullPrompt);
  }

  async generateBlogPost(topic: string): Promise<{ title: string; content: string; excerpt: string }> {
    const prompt = `Write a comprehensive blog post about "${topic}".

Return a JSON object with:
- "title": An engaging SEO-friendly title
- "content": The full blog post content in HTML format with proper headings (h2, h3), paragraphs, and lists
- "excerpt": A 2-3 sentence summary

Return only valid JSON.`;

    const result = await this.provider.generateContent(prompt);
    
    try {
      return JSON.parse(result.replace(/```json\n?|\n?```/g, ''));
    } catch {
      return { title: topic, content: result, excerpt: '' };
    }
  }

  async generateProductDescription(productInfo: string): Promise<string> {
    const prompt = `Create a compelling product description for: ${productInfo}

Include:
- Key features and benefits
- Use cases
- Why customers should buy it
- A call to action

Format with proper HTML paragraphs and bullet points.`;

    return this.provider.generateContent(prompt);
  }

  async generateSEO(content: string): Promise<{ title: string; description: string; keywords: string[] }> {
    return this.provider.generateSEO(content);
  }

  async summarize(content: string): Promise<string> {
    return this.provider.summarize(content);
  }

  async improveWriting(content: string): Promise<string> {
    return this.provider.improveWriting(content);
  }

  async generateHeadlines(topic: string, count = 5): Promise<string[]> {
    const prompt = `Generate ${count} compelling, SEO-friendly headlines for a blog post about: "${topic}"

Return a JSON array of strings with just the headlines.`;

    const result = await this.provider.generateContent(prompt);
    
    try {
      return JSON.parse(result.replace(/```json\n?|\n?```/g, ''));
    } catch {
      return [topic];
    }
  }
}
