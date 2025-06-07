import OpenAI from 'openai';

export const MODELS = {
  o3: 'o3-2025-04-16',
  'o4-mini': 'o4-mini-2025-04-16',
  '4.1': 'gpt-4.1-2025-04-14',
  '4.1-nano': 'gpt-4.1-nano-2025-04-14',
};

const MODEL = MODELS['o4-mini'];

export function createOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const isProduction = process.env.EXPO_PUBLIC_ENVIRONMENT === 'production';

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    // Add production-specific configurations
    timeout: isProduction ? 90000 : 60000, // Longer timeout in production
    maxRetries: isProduction ? 5 : 3, // More retries in production
    // Ensure proper user agent for server environments
    defaultHeaders: {
      'User-Agent': 'AI-Edit-Server/1.0',
    },
  });
}

export { MODEL };
