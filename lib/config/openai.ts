import OpenAI from 'openai';

const MODEL = process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4-turbo-preview';

export function createOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export { MODEL };