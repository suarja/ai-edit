import { PromptService } from '@/lib/services/prompts';

// Mock the prompt bank
jest.mock('@/lib/config/prompt-bank.json', () => [
  {
    id: 'test-prompt',
    name: 'Test Prompt',
    description: 'Prompt for testing',
    context: 'Used for testing purposes',
    version: 'v1.0.0',
    status: 'LATEST',
    createdAt: '2025-06-10T10:00:00Z',
    updatedAt: '2025-06-10T10:00:00Z',
    author: 'Test Author',
    tags: ['test'],
    metadata: {
      notes: 'Test notes',
    },
    prompts: {
      system: 'You are a test system. {testVar}',
      user: 'This is a test prompt with {userVar}',
      developer: 'Developer note: {devVar}',
    },
    history: [
      {
        version: 'v0.9.0',
        updatedAt: '2025-06-01T10:00:00Z',
        changelog: 'Initial test',
      },
    ],
  },
  {
    id: 'deprecated-prompt',
    name: 'Deprecated Prompt',
    description: 'This prompt is deprecated',
    context: 'Used for testing deprecated prompts',
    version: 'v0.9.0',
    status: 'DEPRECATED',
    createdAt: '2025-05-10T10:00:00Z',
    updatedAt: '2025-05-10T10:00:00Z',
    author: 'Test Author',
    tags: ['test', 'deprecated'],
    metadata: {},
    prompts: {
      system: 'Deprecated system prompt',
      user: 'Deprecated user prompt',
    },
    history: [],
  },
]);

describe('PromptService', () => {
  it('gets a prompt by ID', () => {
    const prompt = PromptService.getPrompt('test-prompt');

    expect(prompt).not.toBeNull();
    expect(prompt?.id).toBe('test-prompt');
    expect(prompt?.name).toBe('Test Prompt');
  });

  it('returns null for non-existent prompt', () => {
    const prompt = PromptService.getPrompt('non-existent');

    expect(prompt).toBeNull();
  });

  it('gets latest prompts only', () => {
    const prompts = PromptService.getLatestPrompts();

    expect(prompts).toHaveLength(1);
    expect(prompts[0].id).toBe('test-prompt');
    expect(prompts[0].status).toBe('LATEST');
  });

  it('fills a prompt template with values', () => {
    const filledPrompt = PromptService.fillPromptTemplate('test-prompt', {
      testVar: 'Test Variable',
      userVar: 'User Variable',
      devVar: 'Developer Variable',
    });

    expect(filledPrompt).not.toBeNull();
    expect(filledPrompt?.system).toBe('You are a test system. Test Variable');
    expect(filledPrompt?.user).toBe('This is a test prompt with User Variable');
    expect(filledPrompt?.developer).toBe('Developer note: Developer Variable');
  });

  it('handles JSON values in templates', () => {
    const jsonValue = { key: 'value', nested: { data: 123 } };
    const filledPrompt = PromptService.fillPromptTemplate('test-prompt', {
      testVar: jsonValue,
      userVar: 'Simple Value',
      devVar: 'Dev Value',
    });

    expect(filledPrompt).not.toBeNull();
    expect(filledPrompt?.system).toContain('"key": "value"');
    expect(filledPrompt?.system).toContain('"nested": {');
    expect(filledPrompt?.system).toContain('"data": 123');
  });

  it('returns null for non-existent prompt when filling template', () => {
    const filledPrompt = PromptService.fillPromptTemplate('non-existent', {
      testVar: 'Test',
    });

    expect(filledPrompt).toBeNull();
  });
});
