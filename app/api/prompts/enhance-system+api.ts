import { NextResponse } from 'next/server';
import { PromptBank } from '@/lib/services/prompts/promptBank';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userInput, mainPrompt, outputLanguage } = body;

    if (!userInput || !mainPrompt) {
      return NextResponse.json(
        { error: 'Missing required fields: userInput or mainPrompt' },
        { status: 400 }
      );
    }

    if (!outputLanguage) {
      return NextResponse.json(
        { error: 'Missing required field: outputLanguage' },
        { status: 400 }
      );
    }

    console.log('🚀 Enhancing system prompt with language:', outputLanguage);

    // Get the system prompt enhancer agent
    const promptBank = new PromptBank();
    const enhancerAgent = promptBank.getPrompt('system-prompt-enhancer-agent');

    if (!enhancerAgent) {
      return NextResponse.json(
        { error: 'System prompt enhancer agent not found' },
        { status: 500 }
      );
    }

    // Call OpenAI to enhance the system prompt
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
              .replace('{mainPrompt}', mainPrompt)
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

    return NextResponse.json({ enhancedPrompt });
  } catch (error) {
    console.error('Error enhancing system prompt:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
