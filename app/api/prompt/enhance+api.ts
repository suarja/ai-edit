import { AuthService } from '@/lib/services/auth';
import { PromptService } from '@/lib/services/prompts';
import { OpenAIService } from '@/lib/services/openai';
import {
  successResponse,
  errorResponse,
  HttpStatus,
} from '@/lib/utils/api/responses';

/**
 * Prompt enhancement API controller
 *
 * Handles POST requests to enhance user prompts
 */
export async function POST(request: Request) {
  console.log('🔍 Starting prompt enhancement request...');

  try {
    // Step 1: Authenticate user
    const authHeader = request.headers.get('Authorization');
    const { user, errorResponse: authError } = await AuthService.verifyUser(
      authHeader
    );

    if (authError) {
      return authError;
    }

    console.log('🔐 User authenticated:', user.id);

    // Step 2: Parse request
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      console.error('❌ Invalid JSON in request body:', error);
      return errorResponse(
        'Invalid JSON in request body',
        HttpStatus.BAD_REQUEST
      );
    }

    // Step 3: Validate request
    const { prompt, systemPrompt, type = 'general' } = requestBody;

    if (!prompt || typeof prompt !== 'string') {
      return errorResponse('Missing or invalid prompt', HttpStatus.BAD_REQUEST);
    }

    // Step 4: Get prompt enhancer from prompt bank
    const promptId = 'prompt-enhancer-agent';
    const filledPrompt = PromptService.fillPromptTemplate(promptId, {
      userInput: prompt,
      systemInput: systemPrompt || '',
    });

    if (!filledPrompt) {
      return errorResponse(
        'Prompt template not found',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // Step 5: Call OpenAI to enhance the prompt
    const enhancedPrompt = await OpenAIService.generateCompletion({
      systemPrompt: filledPrompt.system,
      userPrompt: filledPrompt.user,
      temperature: 0.7,
      maxTokens: 500,
    });

    // Step 6: If systemPrompt is provided, enhance it as well
    let enhancedSystemPrompt = systemPrompt;

    if (systemPrompt && systemPrompt.trim()) {
      const systemPromptId = 'system-prompt-enhancer-agent';
      const filledSystemPrompt = PromptService.fillPromptTemplate(
        systemPromptId,
        {
          userInput: systemPrompt,
          mainPrompt: prompt,
        }
      );

      if (filledSystemPrompt) {
        enhancedSystemPrompt = await OpenAIService.generateCompletion({
          systemPrompt: filledSystemPrompt.system,
          userPrompt: filledSystemPrompt.user,
          temperature: 0.7,
          maxTokens: 300,
        });
      }
    } else if (!systemPrompt) {
      // Generate a system prompt if none was provided
      const systemSplitPromptId = 'system-prompt-generator-agent';
      const filledSplitPrompt = PromptService.fillPromptTemplate(
        systemSplitPromptId,
        {
          mainPrompt: prompt,
        }
      );

      if (filledSplitPrompt) {
        enhancedSystemPrompt = await OpenAIService.generateCompletion({
          systemPrompt: filledSplitPrompt.system,
          userPrompt: filledSplitPrompt.user,
          temperature: 0.7,
          maxTokens: 300,
        });
      }
    }

    console.log('✅ Prompt enhancement completed');

    // Step 7: Return the enhanced prompts
    return successResponse(
      {
        original: prompt,
        enhanced: enhancedPrompt,
        originalSystemPrompt: systemPrompt || null,
        enhancedSystemPrompt: enhancedSystemPrompt || null,
      },
      HttpStatus.OK
    );
  } catch (error: any) {
    console.error('❌ Error enhancing prompt:', error);
    return errorResponse(
      error.message || 'Failed to enhance prompt',
      HttpStatus.INTERNAL_SERVER_ERROR,
      process.env.NODE_ENV === 'development'
        ? { stack: error.stack }
        : undefined
    );
  }
}
