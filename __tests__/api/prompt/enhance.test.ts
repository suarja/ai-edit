import { POST } from '@/app/api/prompt/enhance+api';
import { AuthService } from '@/lib/services/auth';
import { PromptService } from '@/lib/services/prompts';
import { OpenAIService } from '@/lib/services/openai';
import { HttpStatus } from '@/lib/utils/api/responses';
import { jest, describe, beforeEach, test, expect } from '@jest/globals';

// Mock dependencies
jest.mock('@/lib/services/auth');
jest.mock('@/lib/services/prompts');
jest.mock('@/lib/services/openai');

describe('Prompt Enhance API', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock auth service
    (AuthService.verifyUser as jest.Mock).mockResolvedValue({
      user: { id: 'test-user-id' },
      errorResponse: null,
    });

    // Mock prompt service
    (PromptService.fillPromptTemplate as jest.Mock).mockReturnValue({
      system: 'Test system prompt',
      user: 'Test user prompt with input',
    });

    // Mock OpenAI service
    (OpenAIService.generateCompletion as jest.Mock).mockResolvedValue(
      'Enhanced prompt result'
    );
  });

  it('successfully enhances a prompt', async () => {
    const mockRequest = new Request('http://localhost/api/prompt/enhance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({ prompt: 'Test prompt' }),
    });

    const response = await POST(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(HttpStatus.OK);
    expect(result.data).toEqual({
      original: 'Test prompt',
      enhanced: 'Enhanced prompt result',
    });

    // Verify service calls
    expect(AuthService.verifyUser).toHaveBeenCalledWith('Bearer test-token');
    expect(PromptService.fillPromptTemplate).toHaveBeenCalledWith(
      'prompt-enhancer-agent',
      { userInput: 'Test prompt' }
    );
    expect(OpenAIService.generateCompletion).toHaveBeenCalledWith({
      systemPrompt: 'Test system prompt',
      userPrompt: 'Test user prompt with input',
      temperature: 0.7,
      maxTokens: 500,
    });
  });

  it('returns 401 for unauthorized requests', async () => {
    (AuthService.verifyUser as jest.Mock).mockResolvedValue({
      user: null,
      errorResponse: new Response(null, { status: HttpStatus.UNAUTHORIZED }),
    });

    const mockRequest = new Request('http://localhost/api/prompt/enhance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer invalid-token',
      },
      body: JSON.stringify({ prompt: 'Test prompt' }),
    });

    const response = await POST(mockRequest);

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(PromptService.fillPromptTemplate).not.toHaveBeenCalled();
    expect(OpenAIService.generateCompletion).not.toHaveBeenCalled();
  });

  it('returns 400 for missing prompt', async () => {
    const mockRequest = new Request('http://localhost/api/prompt/enhance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({
        /* no prompt */
      }),
    });

    const response = await POST(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(result.error).toBe('Missing or invalid prompt');
    expect(OpenAIService.generateCompletion).not.toHaveBeenCalled();
  });

  it('returns 500 when prompt template not found', async () => {
    (PromptService.fillPromptTemplate as jest.Mock).mockReturnValue(null);

    const mockRequest = new Request('http://localhost/api/prompt/enhance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({ prompt: 'Test prompt' }),
    });

    const response = await POST(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(result.error).toBe('Prompt template not found');
    expect(OpenAIService.generateCompletion).not.toHaveBeenCalled();
  });

  it('returns 500 when OpenAI service fails', async () => {
    (OpenAIService.generateCompletion as jest.Mock).mockRejectedValue(
      new Error('OpenAI service error')
    );

    const mockRequest = new Request('http://localhost/api/prompt/enhance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({ prompt: 'Test prompt' }),
    });

    const response = await POST(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(result.error).toBe('OpenAI service error');
  });
});
