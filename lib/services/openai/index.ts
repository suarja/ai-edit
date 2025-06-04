import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type CompletionOptions = {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
};

/**
 * Service for interacting with OpenAI API
 */
export class OpenAIService {
  /**
   * Generate a completion using OpenAI
   * @param options Options for the completion
   * @returns The generated text
   */
  static async generateCompletion(options: CompletionOptions): Promise<string> {
    const {
      systemPrompt,
      userPrompt,
      temperature = 0.7,
      maxTokens = 500,
      model = 'gpt-4o',
    } = options;

    try {
      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature,
        max_tokens: maxTokens,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating completion:', error);
      throw new Error('Failed to generate completion');
    }
  }

  /**
   * Generate a structured completion using function calling
   * @param options Options for the completion
   * @param functions Functions to call
   * @returns The structured response
   */
  static async generateStructuredCompletion<T>(
    options: CompletionOptions,
    functionName: string,
    functionDescription: string,
    functionParameters: Record<string, any>
  ): Promise<T> {
    const {
      systemPrompt,
      userPrompt,
      temperature = 0.7,
      model = 'gpt-4o',
    } = options;

    try {
      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature,
        functions: [
          {
            name: functionName,
            description: functionDescription,
            parameters: {
              type: 'object',
              properties: functionParameters,
              required: Object.keys(functionParameters),
            },
          },
        ],
        function_call: { name: functionName },
      });

      const functionCall = response.choices[0]?.message?.function_call;

      if (!functionCall || !functionCall.arguments) {
        throw new Error('No function call in response');
      }

      return JSON.parse(functionCall.arguments) as T;
    } catch (error) {
      console.error('Error generating structured completion:', error);
      throw new Error('Failed to generate structured completion');
    }
  }
}
