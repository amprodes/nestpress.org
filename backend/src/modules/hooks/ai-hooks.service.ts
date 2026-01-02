/**
 * NestPress AI Hooks Service
 * Provides AI-powered hook handlers for content processing
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HooksService } from './hooks.service';
import { AIContentHook, ContentHook, HookContext } from './interfaces';

interface AIConfig {
  provider: string;
  apiKey: string;
  model: string;
}

@Injectable()
export class AIHooksService implements OnModuleInit {
  private readonly logger = new Logger(AIHooksService.name);
  private aiConfig: AIConfig | null = null;

  constructor(
    private readonly hooksService: HooksService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.loadAIConfig();
    this.registerDefaultAIHooks();
  }

  private loadAIConfig() {
    const provider = this.configService.get<string>('ai.provider');
    const apiKey = this.configService.get<string>('ai.apiKey');
    const model = this.configService.get<string>('ai.model');

    if (provider && apiKey) {
      this.aiConfig = { provider, apiKey, model: model || 'gemini-3-pro-preview' };
      this.logger.log(`🤖 AI Hooks enabled with provider: ${provider}`);
    } else {
      this.logger.warn('AI Hooks disabled - no AI provider configured');
    }
  }

  /**
   * Register default AI-powered hooks
   */
  private registerDefaultAIHooks() {
    if (!this.aiConfig) return;

    // Content Enhancement Hook
    this.hooksService.addAIHook(
      AIContentHook.AI_CONTENT_ENHANCE,
      this.enhanceContent.bind(this),
      {
        aiTask: 'content_enhance',
        priority: 50,
        namespace: 'nestpress-ai',
        description: 'AI-powered content enhancement',
        fallbackOnError: true,
      },
    );

    // SEO Optimization Hook
    this.hooksService.addAIHook(
      AIContentHook.AI_SEO_OPTIMIZE,
      this.optimizeSEO.bind(this),
      {
        aiTask: 'seo_optimize',
        priority: 50,
        namespace: 'nestpress-ai',
        description: 'AI-powered SEO optimization',
        fallbackOnError: true,
      },
    );

    // Content Moderation Hook
    this.hooksService.addAIHook(
      AIContentHook.AI_MODERATE_CONTENT,
      this.moderateContent.bind(this),
      {
        aiTask: 'moderate_content',
        priority: 10,
        namespace: 'nestpress-ai',
        description: 'AI-powered content moderation',
        fallbackOnError: true,
      },
    );

    // Summarization Hook
    this.hooksService.addAIHook(
      AIContentHook.AI_SUMMARIZE,
      this.summarizeContent.bind(this),
      {
        aiTask: 'summarize',
        priority: 50,
        namespace: 'nestpress-ai',
        description: 'AI-powered text summarization',
        fallbackOnError: true,
      },
    );

    // Auto-categorization Hook
    this.hooksService.addAIHook(
      AIContentHook.AI_CATEGORIZE,
      this.categorizeContent.bind(this),
      {
        aiTask: 'categorize',
        priority: 50,
        namespace: 'nestpress-ai',
        description: 'AI-powered content categorization',
        fallbackOnError: true,
      },
    );

    // Image Alt Text Hook
    this.hooksService.addAIHook(
      AIContentHook.AI_IMAGE_ALT,
      this.generateImageAlt.bind(this),
      {
        aiTask: 'image_alt',
        priority: 50,
        namespace: 'nestpress-ai',
        description: 'AI-powered image alt text generation',
        fallbackOnError: true,
      },
    );

    // Keyword Extraction Hook
    this.hooksService.addAIHook(
      AIContentHook.AI_KEYWORDS,
      this.extractKeywords.bind(this),
      {
        aiTask: 'keyword_extraction',
        priority: 50,
        namespace: 'nestpress-ai',
        description: 'AI-powered keyword extraction',
        fallbackOnError: true,
      },
    );

    // Grammar Check Hook
    this.hooksService.addAIHook(
      AIContentHook.AI_GRAMMAR,
      this.checkGrammar.bind(this),
      {
        aiTask: 'grammar_check',
        priority: 20,
        namespace: 'nestpress-ai',
        description: 'AI-powered grammar checking',
        fallbackOnError: true,
      },
    );

    this.logger.log('🤖 Registered 8 default AI hooks');
  }

  // ============================================
  // AI Hook Handlers
  // ============================================

  /**
   * Enhance content readability and quality
   */
  async enhanceContent(content: string, context: HookContext): Promise<string> {
    if (!this.aiConfig || !content) return content;

    try {
      const prompt = `Improve the following content for readability and engagement while maintaining its meaning. Only return the improved content, no explanations:

${content}`;

      const enhanced = await this.callAI(prompt);
      return enhanced || content;
    } catch (error) {
      this.logger.error(`Content enhancement failed: ${error}`);
      return content;
    }
  }

  /**
   * Optimize content for SEO
   */
  async optimizeSEO(
    data: { title: string; content: string; metaDescription?: string },
    context: HookContext,
  ): Promise<{ title: string; content: string; metaDescription: string; keywords: string[] }> {
    if (!this.aiConfig) return { ...data, metaDescription: data.metaDescription || '', keywords: [] };

    try {
      const prompt = `Analyze the following content and provide SEO optimization suggestions. Return a JSON object with:
- title: An SEO-optimized title (max 60 chars)
- metaDescription: An SEO meta description (max 160 chars)
- keywords: An array of 5-10 relevant keywords

Content Title: ${data.title}
Content: ${data.content.substring(0, 2000)}

Return only valid JSON, no markdown or explanations.`;

      const result = await this.callAI(prompt);
      
      try {
        const parsed = JSON.parse(result);
        return {
          title: parsed.title || data.title,
          content: data.content,
          metaDescription: parsed.metaDescription || data.metaDescription || '',
          keywords: parsed.keywords || [],
        };
      } catch {
        return { ...data, metaDescription: data.metaDescription || '', keywords: [] };
      }
    } catch (error) {
      this.logger.error(`SEO optimization failed: ${error}`);
      return { ...data, metaDescription: data.metaDescription || '', keywords: [] };
    }
  }

  /**
   * Moderate content for inappropriate material
   */
  async moderateContent(
    content: string,
    context: HookContext,
  ): Promise<{ content: string; approved: boolean; flags: string[]; confidence: number }> {
    if (!this.aiConfig || !content) {
      return { content, approved: true, flags: [], confidence: 1 };
    }

    try {
      const prompt = `Analyze the following content for moderation. Check for:
- Hate speech or discrimination
- Violence or threats
- Adult/NSFW content
- Spam or advertising
- Misinformation

Return a JSON object with:
- approved: boolean (true if content is safe)
- flags: array of detected issues (empty if none)
- confidence: number 0-1 indicating confidence level

Content: ${content.substring(0, 3000)}

Return only valid JSON, no markdown or explanations.`;

      const result = await this.callAI(prompt);
      
      try {
        const parsed = JSON.parse(result);
        return {
          content,
          approved: parsed.approved !== false,
          flags: parsed.flags || [],
          confidence: parsed.confidence || 0.5,
        };
      } catch {
        return { content, approved: true, flags: [], confidence: 0.5 };
      }
    } catch (error) {
      this.logger.error(`Content moderation failed: ${error}`);
      return { content, approved: true, flags: [], confidence: 0.5 };
    }
  }

  /**
   * Generate content summary/excerpt
   */
  async summarizeContent(
    content: string,
    context: HookContext,
  ): Promise<string> {
    if (!this.aiConfig || !content) return content.substring(0, 200);

    try {
      const maxLength = context.metadata?.maxLength || 200;
      const prompt = `Summarize the following content in ${maxLength} characters or less. The summary should be engaging and capture the main points:

${content.substring(0, 3000)}

Return only the summary, no explanations.`;

      const summary = await this.callAI(prompt);
      return summary || content.substring(0, maxLength);
    } catch (error) {
      this.logger.error(`Summarization failed: ${error}`);
      return content.substring(0, 200);
    }
  }

  /**
   * Auto-categorize content
   */
  async categorizeContent(
    data: { title: string; content: string; availableCategories?: string[] },
    context: HookContext,
  ): Promise<{ categories: string[]; tags: string[]; confidence: number }> {
    if (!this.aiConfig) return { categories: [], tags: [], confidence: 0 };

    try {
      const categoriesHint = data.availableCategories?.length
        ? `Available categories: ${data.availableCategories.join(', ')}`
        : 'Suggest appropriate categories';

      const prompt = `Analyze the following content and categorize it.
${categoriesHint}

Title: ${data.title}
Content: ${data.content.substring(0, 2000)}

Return a JSON object with:
- categories: array of 1-3 most relevant categories
- tags: array of 5-10 relevant tags
- confidence: number 0-1 indicating confidence level

Return only valid JSON, no markdown or explanations.`;

      const result = await this.callAI(prompt);
      
      try {
        const parsed = JSON.parse(result);
        return {
          categories: parsed.categories || [],
          tags: parsed.tags || [],
          confidence: parsed.confidence || 0.5,
        };
      } catch {
        return { categories: [], tags: [], confidence: 0 };
      }
    } catch (error) {
      this.logger.error(`Categorization failed: ${error}`);
      return { categories: [], tags: [], confidence: 0 };
    }
  }

  /**
   * Generate image alt text
   */
  async generateImageAlt(
    data: { imageUrl: string; context?: string },
    hookContext: HookContext,
  ): Promise<string> {
    if (!this.aiConfig) return '';

    try {
      // Note: For actual image analysis, you'd need a vision-capable model
      // This is a placeholder that generates alt text based on context
      const prompt = `Generate a descriptive alt text for an image. 
Context about the image: ${data.context || 'No context provided'}
Image URL: ${data.imageUrl}

The alt text should be:
- Descriptive but concise (max 125 characters)
- Useful for accessibility
- SEO-friendly

Return only the alt text, no explanations.`;

      const altText = await this.callAI(prompt);
      return altText || '';
    } catch (error) {
      this.logger.error(`Alt text generation failed: ${error}`);
      return '';
    }
  }

  /**
   * Extract keywords from content
   */
  async extractKeywords(
    content: string,
    context: HookContext,
  ): Promise<string[]> {
    if (!this.aiConfig || !content) return [];

    try {
      const prompt = `Extract the most important keywords from the following content. Return 5-15 keywords that best represent the main topics.

${content.substring(0, 3000)}

Return only a JSON array of keywords, no explanations.`;

      const result = await this.callAI(prompt);
      
      try {
        const parsed = JSON.parse(result);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    } catch (error) {
      this.logger.error(`Keyword extraction failed: ${error}`);
      return [];
    }
  }

  /**
   * Check and fix grammar
   */
  async checkGrammar(
    content: string,
    context: HookContext,
  ): Promise<{ corrected: string; corrections: Array<{ original: string; corrected: string; type: string }> }> {
    if (!this.aiConfig || !content) {
      return { corrected: content, corrections: [] };
    }

    try {
      const prompt = `Check the following text for grammar, spelling, and punctuation errors. Fix any issues found.

${content.substring(0, 3000)}

Return a JSON object with:
- corrected: the corrected text
- corrections: array of objects with {original, corrected, type} for each fix made

Return only valid JSON, no markdown or explanations.`;

      const result = await this.callAI(prompt);
      
      try {
        const parsed = JSON.parse(result);
        return {
          corrected: parsed.corrected || content,
          corrections: parsed.corrections || [],
        };
      } catch {
        return { corrected: content, corrections: [] };
      }
    } catch (error) {
      this.logger.error(`Grammar check failed: ${error}`);
      return { corrected: content, corrections: [] };
    }
  }

  // ============================================
  // AI Provider Integration
  // ============================================

  /**
   * Call the configured AI provider
   */
  private async callAI(prompt: string): Promise<string> {
    if (!this.aiConfig) {
      throw new Error('AI not configured');
    }

    switch (this.aiConfig.provider) {
      case 'gemini':
        return this.callGemini(prompt);
      case 'openai':
        return this.callOpenAI(prompt);
      case 'anthropic':
        return this.callAnthropic(prompt);
      default:
        throw new Error(`Unsupported AI provider: ${this.aiConfig.provider}`);
    }
  }

  private async callGemini(prompt: string): Promise<string> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.aiConfig!.model}:generateContent?key=${this.aiConfig!.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json() as any;
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.aiConfig!.apiKey}`,
      },
      body: JSON.stringify({
        model: this.aiConfig!.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json() as any;
    return data.choices?.[0]?.message?.content || '';
  }

  private async callAnthropic(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.aiConfig!.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.aiConfig!.model || 'claude-3-sonnet-20240229',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json() as any;
    return data.content?.[0]?.text || '';
  }

  // ============================================
  // Public API for manual AI hook invocation
  // ============================================

  async enhance(content: string): Promise<string> {
    const result = await this.hooksService.applyAIHooks(
      AIContentHook.AI_CONTENT_ENHANCE,
      content,
    );
    return result.finalValue;
  }

  async moderate(content: string) {
    const result = await this.hooksService.applyAIHooks(
      AIContentHook.AI_MODERATE_CONTENT,
      content,
    );
    return result.finalValue;
  }

  async summarize(content: string, maxLength?: number) {
    const result = await this.hooksService.applyAIHooks(
      AIContentHook.AI_SUMMARIZE,
      content,
      { maxLength },
    );
    return result.finalValue;
  }

  async optimizeForSEO(title: string, content: string) {
    const result = await this.hooksService.applyAIHooks(
      AIContentHook.AI_SEO_OPTIMIZE,
      { title, content },
    );
    return result.finalValue;
  }
}
