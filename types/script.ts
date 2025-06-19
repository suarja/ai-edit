import { z } from 'zod';

// Script Chat Message Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    isStreaming?: boolean;
    tokensUsed?: number;
    model?: string;
  };
}

// Script Draft with Conversation History
export interface ScriptDraft {
  id: string;
  title: string;
  status: 'draft' | 'validated' | 'used';
  currentScript: string;
  messages: ChatMessage[];
  metadata: {
    outputLanguage: string;
    editorialProfileId?: string;
    wordCount: number;
    estimatedDuration: number;
    lastModified: string;
    version: number;
  };
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Chat Request/Response Types
export interface ScriptChatRequest {
  scriptId?: string; // Optional: for continuing existing conversation
  message: string;
  outputLanguage: string;
  editorialProfileId?: string;
  conversationHistory?: ChatMessage[];
}

export interface ScriptChatResponse {
  scriptId: string;
  message: ChatMessage;
  currentScript: string;
  metadata: {
    wordCount: number;
    estimatedDuration: number;
    suggestedImprovements?: string[];
  };
}

// Streaming Response Type
export interface ScriptChatStreamResponse {
  type: 'message_start' | 'content_delta' | 'message_complete' | 'error';
  scriptId: string;
  content?: string;
  message?: ChatMessage;
  currentScript?: string;
  metadata?: {
    wordCount: number;
    estimatedDuration: number;
  };
  error?: string;
}

// Script List Types
export interface ScriptListItem {
  id: string;
  title: string;
  status: 'draft' | 'validated' | 'used';
  currentScript: string;
  outputLanguage: string;
  lastModified: string;
  messageCount: number;
  wordCount: number;
  estimatedDuration: number;
}

export interface ScriptListResponse {
  scripts: ScriptListItem[];
  totalCount: number;
  hasMore: boolean;
}

// Validation Schemas
export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.string(),
  metadata: z.object({
    isStreaming: z.boolean().optional(),
    tokensUsed: z.number().optional(),
    model: z.string().optional(),
  }).optional(),
});

export const scriptDraftSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['draft', 'validated', 'used']),
  currentScript: z.string(),
  messages: z.array(chatMessageSchema),
  metadata: z.object({
    outputLanguage: z.string(),
    editorialProfileId: z.string().optional(),
    wordCount: z.number(),
    estimatedDuration: z.number(),
    lastModified: z.string(),
    version: z.number(),
  }),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const scriptChatRequestSchema = z.object({
  scriptId: z.string().optional(),
  message: z.string(),
  outputLanguage: z.string(),
  editorialProfileId: z.string().optional(),
  conversationHistory: z.array(chatMessageSchema).optional(),
});

// Utility Functions
export const estimateScriptDuration = (script: string): number => {
  const wordCount = script.split(/\s+/).length;
  return wordCount * 0.4; // 0.4 seconds per word
};

export const generateScriptTitle = (script: string): string => {
  const firstLine = script.split('\n')[0];
  const words = firstLine.split(' ');
  return words.slice(0, 6).join(' ') + (words.length > 6 ? '...' : '');
};

export const isValidScriptDraft = (draft: any): draft is ScriptDraft => {
  try {
    scriptDraftSchema.parse(draft);
    return true;
  } catch {
    return false;
  }
};

export const isValidChatMessage = (message: any): message is ChatMessage => {
  try {
    chatMessageSchema.parse(message);
    return true;
  } catch {
    return false;
  }
}; 