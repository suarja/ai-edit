import { POST } from '@/app/api/prompts/enhance+api';
import { PromptBank } from '@/lib/services/prompts/promptBank';
import { jest, describe, beforeEach, test, expect } from '@jest/globals';

// Mock the PromptBank
jest.mock('@/lib/services/prompts/promptBank');

// Mock fetch globally
global.fetch = jest.fn();

describe('Prompt Enhancement API', () => {
  const mockPromptBank = {
    getPrompt: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (PromptBank as jest.MockedClass<typeof PromptBank>).mockImplementation(
      () => mockPromptBank as any
    );

    // Mock successful OpenAI response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content:
                'Enhanced video prompt: Create a 30-second productivity tips video with clear visuals and engaging narration.',
            },
          },
        ],
      }),
    });
  });

  it('successfully enhances a prompt for video content', async () => {
    // Mock the prompt enhancer agent
    mockPromptBank.getPrompt.mockReturnValue({
      prompts: {
        system: 'You are a video content enhancement specialist...',
        user: 'Transform this prompt for short-form video content...',
      },
    });

    const request = new Request('http://localhost/api/prompts/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userInput: 'Make a video about productivity tips for remote workers',
        outputLanguage: 'en',
      }),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.data.enhancedPrompt).toContain('Enhanced video prompt');
    expect(mockPromptBank.getPrompt).toHaveBeenCalledWith(
      'prompt-enhancer-agent'
    );
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        }),
      })
    );
  });

  it('returns 400 for missing userInput', async () => {
    const request = new Request('http://localhost/api/prompts/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        outputLanguage: 'en',
      }),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe('Missing required field: userInput');
  });

  it('returns 400 for missing outputLanguage', async () => {
    const request = new Request('http://localhost/api/prompts/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userInput: 'Test prompt',
      }),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe('Missing required field: outputLanguage');
  });

  it('returns 500 when prompt enhancer agent not found', async () => {
    mockPromptBank.getPrompt.mockReturnValue(null);

    const request = new Request('http://localhost/api/prompts/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userInput: 'Test prompt',
        outputLanguage: 'en',
      }),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.error).toBe('Prompt enhancer agent not found');
  });

  it('returns 500 when OpenAI API fails', async () => {
    mockPromptBank.getPrompt.mockReturnValue({
      prompts: {
        system: 'Test system prompt',
        user: 'Test user prompt',
      },
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'OpenAI API error' }),
    });

    const request = new Request('http://localhost/api/prompts/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userInput: 'Test prompt',
        outputLanguage: 'en',
      }),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.error).toContain('OpenAI API error');
  });

  it('properly formats the prompt for video content optimization', async () => {
    mockPromptBank.getPrompt.mockReturnValue({
      prompts: {
        system: 'Video content enhancement system prompt',
        user: 'Transform this prompt for short-form video content:\n\nOutput Language: {outputLanguage}\n\nUser Prompt: {userInput}',
      },
    });

    const request = new Request('http://localhost/api/prompts/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userInput: 'Explain machine learning basics',
        outputLanguage: 'fr',
      }),
    });

    await POST(request);

    // Verify that the OpenAI call includes the properly formatted prompt
    const openAICall = (global.fetch as jest.Mock).mock.calls[0];
    const requestBody = JSON.parse(openAICall[1].body);

    expect(requestBody.messages[1].content).toContain(
      'Explain machine learning basics'
    );
    expect(requestBody.messages[1].content).toContain('fr');
    expect(requestBody.model).toBe('gpt-4o');
    expect(requestBody.temperature).toBe(0.7);
  });
});
