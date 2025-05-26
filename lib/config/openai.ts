import OpenAI from 'openai';

export const MODELS = {
  "o3": "gpt-3.5-turbo-0125",
  "o4-mini": "gpt-4-0125-preview",
  "4.1": "gpt-4-turbo-preview",
  "4.1-nano": "gpt-4-turbo-preview",
};

export function createOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}