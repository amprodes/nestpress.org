/**
 * Gemini AI Service
 * Handles AI content generation with proper error handling and rate limiting
 */

import { GoogleGenAI } from "@google/genai";
import { sanitizeHTML, sanitizeText } from '../utils/security';
import { createRateLimiter } from '../utils/security';
import { ERROR_MESSAGES, TIMEOUTS } from '../utils/constants';

// Rate limiter: 10 requests per minute
const rateLimiter = createRateLimiter(10, 60000);

// Singleton client instance
let clientInstance: GoogleGenAI | null = null;

/**
 * Get or create Gemini client instance
 * Uses singleton pattern to avoid creating multiple instances
 */
const getClient = (): GoogleGenAI => {
  if (clientInstance) return clientInstance;
  
  const apiKey = process.env.API_KEY || '';
  
  if (!apiKey) {
    throw new Error(ERROR_MESSAGES.API_KEY_REQUIRED);
  }
  
  clientInstance = new GoogleGenAI({ apiKey });
  return clientInstance;
};

/**
 * Reset client (useful when API key changes)
 */
export const resetClient = (): void => {
  clientInstance = null;
};

/**
 * Generate blog post content with AI
 * @param title - The post title
 * @param context - Additional context/notes for generation
 * @returns Sanitized HTML content
 */
export const generatePostContent = async (
  title: string, 
  context: string = ''
): Promise<string> => {
  // Rate limiting check
  if (!rateLimiter.isAllowed()) {
    throw new Error('Rate limit exceeded. Please wait before making another request.');
  }
  
  // Input validation
  const sanitizedTitle = sanitizeText(title).trim();
  const sanitizedContext = sanitizeText(context).trim();
  
  if (!sanitizedTitle) {
    throw new Error('Title is required for content generation.');
  }
  
  try {
    const ai = getClient();
    const prompt = `
      You are an expert blog writer and SEO specialist. 
      Write a comprehensive, engaging blog post about: "${sanitizedTitle}".
      
      Context/Notes: ${sanitizedContext}
      
      Format the output using simple HTML tags suitable for a WYSIWYG editor 
      (e.g., <p>, <h2>, <ul>, <li>, <strong>). 
      Do not include the <html>, <head>, or <body> tags, just the content.
      Keep the tone professional yet accessible.
      Content should be between 500-1000 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const rawContent = response.text || '';
    
    // Sanitize the generated HTML to prevent XSS
    return sanitizeHTML(rawContent);
  } catch (error) {
    console.error("Gemini API Error:", error);
    
    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('API key')) {
        throw new Error('Invalid API key. Please check your Gemini API configuration.');
      }
      if (error.message.includes('quota')) {
        throw new Error('API quota exceeded. Please try again later.');
      }
      throw error;
    }
    
    throw new Error(ERROR_MESSAGES.GENERIC);
  }
};

/**
 * Generate an SEO-friendly title from a topic
 * @param topic - The topic to generate a title for
 * @returns Sanitized title text
 */
export const generatePostTitle = async (topic: string): Promise<string> => {
  // Rate limiting check
  if (!rateLimiter.isAllowed()) {
    throw new Error('Rate limit exceeded. Please wait before making another request.');
  }
  
  const sanitizedTopic = sanitizeText(topic).trim();
  
  if (!sanitizedTopic) {
    return topic;
  }
  
  try {
    const ai = getClient();
    const prompt = `Generate a catchy, SEO-friendly blog post title based on this topic: "${sanitizedTopic}". 
    Requirements:
    - Return ONLY the title text, nothing else
    - Keep it under 60 characters
    - Make it engaging and click-worthy
    - Include relevant keywords`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const rawTitle = response.text?.trim() || '';
    
    // Sanitize and return
    return sanitizeText(rawTitle) || topic;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Graceful fallback to original topic
    return topic;
  }
};

/**
 * Generate product description with AI
 * @param productName - The product name
 * @param features - Product features/specs
 * @returns Sanitized HTML description
 */
export const generateProductDescription = async (
  productName: string,
  features: string = ''
): Promise<string> => {
  if (!rateLimiter.isAllowed()) {
    throw new Error('Rate limit exceeded. Please wait before making another request.');
  }
  
  const sanitizedName = sanitizeText(productName).trim();
  const sanitizedFeatures = sanitizeText(features).trim();
  
  if (!sanitizedName) {
    throw new Error('Product name is required.');
  }
  
  try {
    const ai = getClient();
    const prompt = `
      Write a compelling product description for: "${sanitizedName}".
      
      Features/Specs: ${sanitizedFeatures}
      
      Requirements:
      - Write 2-3 short paragraphs
      - Highlight key benefits
      - Use persuasive, engaging language
      - Format with simple HTML (<p>, <strong>, <ul>, <li>)
      - Focus on what makes this product valuable
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const rawContent = response.text || '';
    return sanitizeHTML(rawContent);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error('Failed to generate product description. Please try again.');
  }
};

/**
 * Generate SEO meta description
 * @param content - Content to summarize
 * @returns SEO-optimized meta description
 */
export const generateMetaDescription = async (content: string): Promise<string> => {
  if (!rateLimiter.isAllowed()) {
    throw new Error('Rate limit exceeded.');
  }
  
  const sanitizedContent = sanitizeText(content).trim().substring(0, 2000);
  
  if (!sanitizedContent) {
    return '';
  }
  
  try {
    const ai = getClient();
    const prompt = `
      Generate an SEO-optimized meta description for the following content.
      Requirements:
      - Maximum 155 characters
      - Include primary keywords naturally
      - Write a compelling call-to-action
      - Return ONLY the meta description text
      
      Content: ${sanitizedContent}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const rawDescription = response.text?.trim() || '';
    return sanitizeText(rawDescription).substring(0, 160);
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return truncated content as fallback
    return sanitizedContent.substring(0, 155) + '...';
  }
};