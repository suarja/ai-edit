import OpenAI from 'openai';
import { createOpenAIClient, MODEL } from '../config/openai';

export class ScriptGenerator {
  private openai: OpenAI;

  constructor() {
    this.openai = createOpenAIClient();
  }

  async generate(prompt: string, editorialProfile: any): Promise<string> {
    try {
      console.log('Generating script with profile:', editorialProfile);

      const completion = await this.openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a creative script-writing agent specialized in short-form video content for platforms like TikTok.

Your task is to generate spoken-style scripts optimized for AI voice synthesis (ElevenLabs) that will be layered over silent videos.

CONTEXT:
- Scripts are used as voiceovers for 30-60 second vertical videos
- Videos are muted, the script is the only audio
- Content must be optimized for ElevenLabs voice synthesis:
  * Clear, prosody-friendly sentences
  * Avoid nested clauses or complex structures
  * Use proper punctuation (periods, commas) - no ellipses or parentheses

STRUCTURE:
1. Hook (1-2 lines): Attention-grabbing opening
2. Insight/Value (3-6 lines): Core message or explanation
3. Punch/Wrap (1-2 lines): Strong conclusion

Editorial Profile:
- Persona: ${editorialProfile.persona_description}
- Tone: ${editorialProfile.tone_of_voice}
- Audience: ${editorialProfile.audience}
- Style: ${editorialProfile.style_notes}

REQUIREMENTS:
- Duration: 30-60 seconds when spoken
- Style: Conversational and direct
- No technical jargon unless clearly explained
- No calls-to-action unless contextually relevant

AVOID:
- Formal or corporate language
- Flat sentence structures
- Rambling explanations
- Passive voice
- Complex ideas that exceed 1 minute
- Nested clauses or parentheticals

Return only the final script without any additional context or formatting.`
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const script = completion.choices[0].message.content;
      if (!script) {
        throw new Error('Failed to generate script: Empty response');
      }

      // Validate script length
      const wordCount = script.split(/\s+/).length;
      const estimatedDuration = wordCount * 0.4; // Rough estimate: 0.4 seconds per word
      
      if (estimatedDuration < 30 || estimatedDuration > 60) {
        console.warn(`Script duration warning: Estimated ${estimatedDuration.toFixed(1)} seconds`);
      }

      return script;
    } catch (error) {
      console.error('Error generating script:', error);
      throw new Error(`Failed to generate script: ${error.message}`);
    }
  }

  async review(script: string, editorialProfile: any): Promise<string> {
    try {
      console.log('Reviewing script...');

      const completion = await this.openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a script optimization expert for TikTok-style videos.

Review and enhance the script for:
1. Voice synthesis compatibility
2. Timing (30-60 seconds)
3. Structural clarity
4. Engagement potential
5. Editorial style match

Editorial Profile:
- Persona: ${editorialProfile.persona_description}
- Tone: ${editorialProfile.tone_of_voice}
- Audience: ${editorialProfile.audience}
- Style: ${editorialProfile.style_notes}

Return the optimized script without any additional context or formatting.
If the script is already optimal, return it unchanged.`
          },
          {
            role: 'user',
            content: script
          }
        ]
      });

      const reviewedScript = completion.choices[0].message.content;
      if (!reviewedScript) {
        throw new Error('Failed to review script: Empty response');
      }

      return reviewedScript;
    } catch (error) {
      console.error('Error reviewing script:', error);
      throw new Error(`Failed to review script: ${error.message}`);
    }
  }
}