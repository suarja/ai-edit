import { PromptBank } from '@/lib/services/prompts/promptBank';
import { jest, describe, test, expect } from '@jest/globals';

describe('Prompt Quality Validation', () => {
  let promptBank: PromptBank;

  beforeEach(() => {
    promptBank = new PromptBank();
  });

  it('prompt enhancer agent is optimized for video script generation', () => {
    const enhancerAgent = promptBank.getPrompt('prompt-enhancer-agent');
    expect(enhancerAgent).toBeTruthy();
    expect(enhancerAgent?.prompts.system).toContain('short-form video script');
    expect(enhancerAgent?.prompts.system).toContain('60-120 words');
    expect(enhancerAgent?.prompts.system).toContain('TikTok-style content');
    expect(enhancerAgent?.prompts.user).toContain('30-60 second video scripts');
    expect(enhancerAgent?.prompts.user).toContain('Target 60-120 words');
    expect(enhancerAgent?.prompts.user).toContain('script content');
    expect(enhancerAgent?.version).toBe('v2.0.0');
  });

  it('system prompt enhancer is optimized for video script generation', () => {
    const systemEnhancerAgent = promptBank.getPrompt(
      'system-prompt-enhancer-agent'
    );

    expect(systemEnhancerAgent).toBeTruthy();
    expect(systemEnhancerAgent?.prompts.system).toContain(
      'video script generation'
    );
    expect(systemEnhancerAgent?.prompts.system).toContain('TTS optimization');
    expect(systemEnhancerAgent?.prompts.system).toContain('ElevenLabs');
    expect(systemEnhancerAgent?.prompts.system).toContain('scriptGenerator.ts');
    expect(systemEnhancerAgent?.prompts.user).toContain('script generation');
    expect(systemEnhancerAgent?.prompts.user).toContain('TTS optimization');
    expect(systemEnhancerAgent?.version).toBe('v2.0.0');
  });

  it('system prompt generator is optimized for video script creation', () => {
    const generatorAgent = promptBank.getPrompt(
      'system-prompt-generator-agent'
    );

    expect(generatorAgent).toBeTruthy();
    expect(generatorAgent?.prompts.system).toContain('video script generation');
    expect(generatorAgent?.prompts.system).toContain('TikTok-style scripts');
    expect(generatorAgent?.prompts.system).toContain('ElevenLabs TTS');
    expect(generatorAgent?.prompts.system).toContain('scriptGenerator.ts');
    expect(generatorAgent?.prompts.user).toContain('script creation');
    expect(generatorAgent?.prompts.user).toContain('script generation');
    expect(generatorAgent?.version).toBe('v2.0.0');
  });

  it('all video-related agents have proper language support', () => {
    const agents = [
      'prompt-enhancer-agent',
      'system-prompt-enhancer-agent',
      'system-prompt-generator-agent',
    ];

    agents.forEach((agentId) => {
      const agent = promptBank.getPrompt(agentId);
      expect(agent).toBeTruthy();
      expect(agent?.prompts.user).toContain('{outputLanguage}');
      expect(agent?.prompts.system).toContain('target language');
    });
  });

  it('enhanced prompts should be concise for video script content', () => {
    const enhancerAgent = promptBank.getPrompt('prompt-enhancer-agent');
    expect(enhancerAgent?.prompts.system).toContain('60-120 words');
    expect(enhancerAgent?.prompts.system).toContain('script generation');
    expect(enhancerAgent?.prompts.user).toContain('Target 60-120 words');

    // Ensure focus is on script content, not visual elements
    expect(enhancerAgent?.prompts.system).toContain('script content');
    expect(enhancerAgent?.prompts.system).toContain('narrative structure');
    expect(enhancerAgent?.prompts.user).toContain(
      'Remove any visual/editing references'
    );
  });
});
