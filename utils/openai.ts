import OpenAI from 'openai';
import { z } from 'zod';
import Constants from 'expo-constants';

// Configuration validation schema
const ConfigSchema = z.object({
  apiKey: z.string().min(1, 'OpenAI API key is required'),
});

// Request options schema
const RequestOptionsSchema = z.object({
  model: z.string().default('gpt-3.5-turbo'),
  maxTokens: z.number().int().positive().default(150),
  temperature: z.number().min(0).max(2).default(0.7),
  timeout: z.number().int().positive().default(30000),
});

export type GenerateTextOptions = z.infer<typeof RequestOptionsSchema>;

// Custom error types
export class OpenAIConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenAIConfigError';
  }
}

export class OpenAIRequestError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'OpenAIRequestError';
  }
}

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 3,
  windowMs: 1000,
};

class RateLimiter {
  private requests: number[] = [];

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(
      timestamp => now - timestamp < RATE_LIMIT.windowMs
    );
    return this.requests.length < RATE_LIMIT.maxRequests;
  }

  addRequest(): void {
    this.requests.push(Date.now());
  }
}

const rateLimiter = new RateLimiter();

// OpenAI client instance
let openaiClient: OpenAI | null = null;

/**
 * Initialize the OpenAI client with the provided API key
 * @throws {OpenAIConfigError} If the API key is invalid or missing
 */
function initializeClient(): OpenAI {
  if (openaiClient) return openaiClient;

  try {
    // First try to get the API key from Constants
    let apiKey = Constants.expoConfig?.extra?.openaiApiKey;
    
    // If not found in Constants, try process.env
    if (!apiKey) {
      apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      console.log('API Key from process.env:', !!apiKey);
    } else {
      console.log('API Key from Constants:', !!apiKey);
    }

    if (!apiKey) {
      throw new OpenAIConfigError('OpenAI API key is missing. Please check your environment configuration.');
    }

    const config = ConfigSchema.parse({ apiKey });

    openaiClient = new OpenAI({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true,
    });

    return openaiClient;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new OpenAIConfigError('Invalid OpenAI configuration: ' + error.errors[0].message);
    }
    if (error instanceof OpenAIConfigError) {
      throw error;
    }
    throw new OpenAIConfigError('Failed to initialize OpenAI client');
  }
}

/**
 * Generate text using the OpenAI API
 */
export async function generateText(
  prompt: string,
  options: Partial<GenerateTextOptions> = {}
): Promise<string> {
  if (!rateLimiter.canMakeRequest()) {
    throw new OpenAIRequestError('Too many requests. Please wait a moment before trying again.');
  }

  try {
    const client = initializeClient();
    const validatedOptions = RequestOptionsSchema.parse(options);

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, validatedOptions.timeout);

    rateLimiter.addRequest();

    const completion = await client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: validatedOptions.model,
      max_tokens: validatedOptions.maxTokens,
      temperature: validatedOptions.temperature,
    }, { signal: controller.signal });

    clearTimeout(timeout);

    const generatedText = completion.choices[0]?.message?.content;
    if (!generatedText) {
      throw new OpenAIRequestError('No response was generated. Please try again.');
    }

    return generatedText;
  } catch (error) {
    if (error instanceof OpenAIConfigError) {
      throw error;
    }

    if (error instanceof z.ZodError) {
      throw new OpenAIRequestError('Invalid request options: ' + error.errors[0].message);
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new OpenAIRequestError('Request timed out. Please try again.');
      }

      if ('status' in error && typeof error.status === 'number') {
        switch (error.status) {
          case 401:
            throw new OpenAIRequestError('Invalid API key. Please check your environment configuration.');
          case 429:
            throw new OpenAIRequestError('Rate limit exceeded. Please try again in a few moments.');
          case 500:
            throw new OpenAIRequestError('OpenAI service is currently experiencing issues. Please try again later.');
          default:
            throw new OpenAIRequestError(`API error: ${error.message}`);
        }
      }

      if ('code' in error && error.code === 'ECONNABORTED') {
        throw new OpenAIRequestError('Network connection timed out. Please check your internet connection.');
      }
    }

    throw new OpenAIRequestError('Failed to generate text. Please try again.', error);
  }
}