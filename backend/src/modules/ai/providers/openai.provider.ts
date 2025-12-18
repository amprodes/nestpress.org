import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider } from './gemini.provider';

/**
 * OpenAI Provider
 */
@Injectable()
export class OpenAIProvider implements AIProvider {
  private readonly logger = new Logger(OpenAIProvider.name);
  private client: any;

  constructor(private readonly configService: ConfigService) {
    this.initClient();
  }

  private async initClient() {
    const apiKey = this.configService.get<string>('ai.openai.apiKey');
    if (!apiKey) {
      this.logger.debug('OpenAI API key not configured (will load from database on-demand)');
      return;
    }

    try {
      const OpenAI = (await import('openai')).default;
      this.client = new OpenAI({ apiKey });
      this.logger.log('OpenAI client initialized');
    } catch (error) {
      this.logger.error('Failed to initialize OpenAI client', error);
    }
  }

  async generateContent(prompt: string): Promise<string> {
    if (!this.client) throw new Error('OpenAI client not initialized');

    const model = this.configService.get<string>('ai.openai.model') || 'gpt-4-turbo-preview';
    
    const completion = await this.client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || '';
  }

  async generateSEO(content: string): Promise<{ title: string; description: string; keywords: string[] }> {
    const prompt = `Analyze the following content and generate SEO metadata. Return a JSON object with "title" (max 60 chars), "description" (max 160 chars), and "keywords" (array of 5-10 relevant keywords).

Content:
${content}

Return only valid JSON.`;

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
