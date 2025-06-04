import { PromptBank } from '@/lib/services/prompts/promptBank';
import { errorResponse, successResponse } from '@/lib/utils/api/responses';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userInput, outputLanguage } = body;

    if (!userInput) {
      return errorResponse('Missing required field: userInput', 400);
    }

    if (!outputLanguage) {
      return errorResponse('Missing required field: outputLanguage', 400);
    }

    console.log('🚀 Enhancing prompt with language:', outputLanguage);

    // Get the prompt enhancer agent
    const promptBank = new PromptBank();
    const enhancerAgent = promptBank.getPrompt('prompt-enhancer-agent');

    if (!enhancerAgent) {
      return errorResponse('Prompt enhancer agent not found', 500);
    }

    // Call OpenAI to enhance the prompt
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: enhancerAgent.prompts.system,
          },
          {
            role: 'user',
            content: enhancerAgent.prompts.user
              .replace('{userInput}', userInput)
              .replace('{outputLanguage}', outputLanguage),
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
    }

    const result = await response.json();
    const enhancedPrompt = result.choices[0].message.content.trim();

    return successResponse({ enhancedPrompt });
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}
