import { NextResponse } from 'next/server';
import { PromptBank } from '@/lib/services/prompts/promptBank';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mainPrompt, outputLanguage } = body;

    if (!mainPrompt) {
      return NextResponse.json(
        { error: 'Missing required field: mainPrompt' },
        { status: 400 }
      );
    }

    if (!outputLanguage) {
      return NextResponse.json(
        { error: 'Missing required field: outputLanguage' },
        { status: 400 }
      );
    }

    console.log('🚀 Generating system prompt with language:', outputLanguage);

    // Get the system prompt generator agent
    const promptBank = new PromptBank();
    const generatorAgent = promptBank.getPrompt(
      'system-prompt-generator-agent'
    );

    if (!generatorAgent) {
      return NextResponse.json(
        { error: 'System prompt generator agent not found' },
        { status: 500 }
      );
    }

    // Call OpenAI to generate the system prompt
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
            content: generatorAgent.prompts.system,
          },
          {
            role: 'user',
            content: generatorAgent.prompts.user
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
    const generatedPrompt = result.choices[0].message.content.trim();

    return NextResponse.json({ generatedPrompt });
  } catch (error) {
    console.error('Error generating system prompt:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
