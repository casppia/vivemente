import OpenAI from 'openai';
import { z } from 'zod';

const ConfigSchema = z.object({
  apiKey: z.string().min(1, 'OpenAI API key is required'),
});

const RequestOptionsSchema = z.object({
  model: z.string().default('gpt-3.5-turbo'),
  maxTokens: z.number().int().positive().default(150),
  temperature: z.number().min(0).max(2).default(0.7),
  timeout: z.number().int().positive().default(30000),
  maxRetries: z.number().int().min(0).max(3).default(2),
});

export type GenerateTextOptions = z.infer<typeof RequestOptionsSchema>;

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

const RATE_LIMIT = {
  maxRequests: 3,
  windowMs: 2000,
  minBackoff: 1000,
  maxBackoff: 10000,
};

class RateLimiter {
  private requests: number[] = [];
  private lastError: number | null = null;

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(
      (timestamp) => now - timestamp < RATE_LIMIT.windowMs
    );

    if (this.lastError && now - this.lastError < RATE_LIMIT.minBackoff) {
      return false;
    }

    return this.requests.length < RATE_LIMIT.maxRequests;
  }

  addRequest(): void {
    this.requests.push(Date.now());
  }

  markError(): void {
    this.lastError = Date.now();
  }

  async waitForNextSlot(): Promise<void> {
    const now = Date.now();
    if (this.lastError) {
      const backoff = Math.min(
        RATE_LIMIT.maxBackoff,
        RATE_LIMIT.minBackoff * Math.pow(2, this.requests.length)
      );
      await new Promise(resolve => setTimeout(resolve, backoff));
      this.lastError = null;
      return;
    }

    if (this.requests.length === 0) return;

    const oldestRequest = this.requests[0];
    const nextSlot = oldestRequest + RATE_LIMIT.windowMs - now;
    if (nextSlot > 0) {
      await new Promise(resolve => setTimeout(resolve, nextSlot));
    }
  }
}

const rateLimiter = new RateLimiter();
let openaiClient: OpenAI | null = null;

function initializeClient(): OpenAI {
  if (openaiClient) return openaiClient;

  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
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

export async function generateText(
  prompt: string,
  options: Partial<GenerateTextOptions> = {}
): Promise<string> {
  const validatedOptions = RequestOptionsSchema.parse(options);
  let retries = 0;

  while (retries <= validatedOptions.maxRetries) {
    if (!rateLimiter.canMakeRequest()) {
      await rateLimiter.waitForNextSlot();
    }

    try {
      const client = initializeClient();
      
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

      // Validate JSON response if the prompt asks for JSON
      if (prompt.toLowerCase().includes('return') && prompt.toLowerCase().includes('json')) {
        try {
          const parsed = JSON.parse(generatedText);
          if (typeof parsed !== 'object' || parsed === null) {
            throw new Error('Invalid JSON response');
          }
        } catch (error) {
          throw new OpenAIRequestError('Invalid JSON response from OpenAI. Please try again.');
        }
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
              rateLimiter.markError();
              if (retries < validatedOptions.maxRetries) {
                retries++;
                continue;
              }
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

      if (retries < validatedOptions.maxRetries) {
        retries++;
        continue;
      }

      throw new OpenAIRequestError('Failed to generate text. Please try again.', error);
    }
  }

  throw new OpenAIRequestError('Maximum retries exceeded. Please try again later.');
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    const client = initializeClient();

    // Convert blob to File object
    const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });

    const transcription = await client.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'es',
      response_format: 'json',
    });

    return transcription.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new OpenAIRequestError('Failed to transcribe audio. Please try again.');
  }
}