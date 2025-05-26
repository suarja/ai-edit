import OpenAI from 'openai';

const MODEL = process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4-turbo-preview';
const MODELS = {
 "o3": "o3-2025-04-16",
  "o4-mini": "o4-mini-2025-04-16",
  "4.1": "gpt-4.1-2025-04-14",
  "4.1-nano": "gpt-4.1-nano-2025-04-14",
  
}

export function createOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export { MODEL };