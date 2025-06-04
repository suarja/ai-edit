import promptBankJson from '@/lib/config/prompt-bank.json';

/**
 * Type definitions for the prompt bank
 */
export type Prompt = {
  id: string;
  name: string;
  description: string;
  context: string;
  version: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  tags: string[];
  metadata: {
    notes: string;
    evaluation?: {
      score: number;
      criteria: string;
      lastTested: string;
    };
    testCases?: Array<{
      input: string;
      output: string;
    }>;
  };
  prompts: {
    system: string;
    user: string;
    developer?: string;
  };
  history: Array<{
    version: string;
    updatedAt: string;
    changelog: string;
  }>;
};

/**
 * Service for managing and accessing prompts
 */
export class PromptBank {
  private prompts: Prompt[];

  constructor() {
    this.prompts = promptBankJson as Prompt[];
  }

  /**
   * Get a prompt by ID
   * @param id The ID of the prompt to retrieve
   * @returns The prompt or undefined if not found
   */
  getPrompt(id: string): Prompt | undefined {
    return this.prompts.find((prompt) => prompt.id === id);
  }

  /**
   * Get all prompts
   * @returns Array of all prompts
   */
  getAllPrompts(): Prompt[] {
    return this.prompts;
  }

  /**
   * Get prompts by tag
   * @param tag Tag to filter by
   * @returns Array of prompts with the specified tag
   */
  getPromptsByTag(tag: string): Prompt[] {
    return this.prompts.filter((prompt) => prompt.tags.includes(tag));
  }

  /**
   * Get the latest version of each prompt
   * @returns Array of latest prompts
   */
  getLatestPrompts(): Prompt[] {
    return this.prompts.filter((prompt) => prompt.status === 'LATEST');
  }
}
