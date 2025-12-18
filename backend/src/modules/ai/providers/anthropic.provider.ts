import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider } from './gemini.provider';

/**
 * Anthropic Claude Provider
 */
@Injectable()
export class AnthropicProvider implements AIProvider {
  private readonly logger = new Logger(AnthropicProvider.name);
  private client: any;

  constructor(private readonly configService: ConfigService) {
    this.initClient();
  }

  private async initClient() {
    const apiKey = this.configService.get<string>('ai.anthropic.apiKey');
    if (!apiKey) {
      this.logger.debug('Anthropic API key not configured (will load from database on-demand)');
      return;
    }

    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      this.client = new Anthropic({ apiKey });
      this.logger.log('Anthropic client initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Anthropic client', error);
    }
  }

  async generateContent(prompt: string): Promise<string> {
    if (!this.client) throw new Error('Anthropic client not initialized');

    const model = this.configService.get<string>('ai.anthropic.model') || 'claude-3-opus-20240229';
    
    const message = await this.client.messages.create({
      model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = message.content.find((c: any) => c.type === 'text');
    return textContent?.text || '';
  }

  async generateSEO(content: string): Promise<{ title: string; description: string; keywords: string[] }> {
    const prompt = `Analyze the following content and generate SEO metadata. Return a JSON object with "title" (max 60 chars), "description" (max 160 chars), and "keywords" (array of 5-10 relevant keywords).

Content:
${content}

Return only valid JSON, no explanation.`;

    const result = await this.generateContent(prompt);
    
    try {
      return JSON.parse(result);
    } catch {
      return { title: '', description: '', keywords: [] };
    }
  }

  async summarize(content: string): Promise<string> {
    return this.generateContent(`Summarize the following content in 2-3 sentences:\n\n${content}`);
  }

  async improveWriting(content: string): Promise<string> {
    return this.generateContent(`Improve the following text for clarity, grammar, and engagement while maintaining the original meaning:\n\n${content}`);
  }
}
