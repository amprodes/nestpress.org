import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * AI Provider Interface
 */
export interface AIProvider {
  generateContent(prompt: string): Promise<string>;
  generateSEO(content: string): Promise<{ title: string; description: string; keywords: string[] }>;
  summarize(content: string): Promise<string>;
  improveWriting(content: string): Promise<string>;
}

/**
 * Google Gemini AI Provider
 */
@Injectable()
export class GeminiProvider implements AIProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private client: any;

  constructor(private readonly configService: ConfigService) {
    this.initClient();
  }

  private async initClient() {
    const apiKey = this.configService.get<string>('ai.gemini.apiKey');
    if (!apiKey) {
      this.logger.debug('Gemini API key not configured (will load from database on-demand)');
      return;
    }

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      this.client = new GoogleGenerativeAI(apiKey);
      this.logger.log('Gemini client initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Gemini client', error);
    }
  }

  async generateContent(prompt: string): Promise<string> {
    if (!this.client) throw new Error('Gemini client not initialized');

    const model = this.client.getGenerativeModel({ model: 'gemini-3-pro-preview' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  async generateSEO(content: string): Promise<{ title: string; description: string; keywords: string[] }> {
    const prompt = `Analyze the following content and generate SEO metadata. Return a JSON object with "title" (max 60 chars), "description" (max 160 chars), and "keywords" (array of 5-10 relevant keywords).

Content:
${content}

Return only valid JSON, no markdown.`;

    const result = await this.generateContent(prompt);
    
    try {
      return JSON.parse(result.replace(/```json\n?|\n?```/g, ''));
    } catch {
      return { title: '', description: '', keywords: [] };
    }
  }

  async summarize(content: string): Promise<string> {
    const prompt = `Summarize the following content in 2-3 sentences:

${content}`;

    return this.generateContent(prompt);
  }

  async improveWriting(content: string): Promise<string> {
    const prompt = `Improve the following text for clarity, grammar, and engagement while maintaining the original meaning and tone:

${content}`;

    return this.generateContent(prompt);
  }
}
