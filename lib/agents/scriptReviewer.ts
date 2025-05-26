import OpenAI from 'openai';
import { createOpenAIClient } from '../config/openai';

export class ScriptReviewer {
  private openai: OpenAI;
  private model: string;

  constructor(model: string) {
    this.openai = createOpenAIClient();
    this.model = model;
  }

  async review(script: string, editorialProfile: any): Promise<string> {
    try {
      console.log('Starting script review...');

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a script review agent in a creative automation pipeline.
            Your task is to review, correct, and validate scripts for TikTok-style videos.
            
            Editorial Profile:
            - Persona: ${editorialProfile.persona_description}
            - Tone: ${editorialProfile.tone_of_voice}
            - Audience: ${editorialProfile.audience}
            - Style: ${editorialProfile.style_notes}
            
            VOICEOVER SANITIZATION RULES:
            - Remove symbols: *, /, (), [], emojis, markdown
            - Remove stage directions like [pause] or (laughs)
            - Use proper punctuation (. , ! ?) - no ellipses, slashes, or pipes
            - Avoid long or nested sentences
            - Only use abbreviations if phonetically readable (AI = ok, w/ = not ok)
            
            VALIDATION CRITERIA:
            1. Matches creator's editorial style
            2. Clear and natural when spoken
            3. 30-60 seconds duration (~110-130 words)
            4. No unexplained technical terms
            5. No filler or vague phrases
            
            Return only the optimized script without any comments or formatting.
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

      // Validate script length
      const wordCount = reviewedScript.split(/\s+/).length;
      const estimatedDuration = wordCount * 0.4; // Rough estimate: 0.4 seconds per word
      
      if (estimatedDuration < 30 || estimatedDuration > 60) {
        console.warn(`Script duration warning: Estimated ${estimatedDuration.toFixed(1)} seconds`);
      }

      // Check for common issues
      const hasStageDirections = /[\[\(].*?[\]\)]/.test(reviewedScript);
      const hasInvalidPunctuation = /[…|\/]/.test(reviewedScript);
      const hasLongSentences = reviewedScript.split(/[.!?]/).some(sentence => 
        sentence.split(/\s+/).length > 25
      );

      if (hasStageDirections || hasInvalidPunctuation || hasLongSentences) {
        console.warn('Script contains potential TTS issues');
      }

      return reviewedScript;
    } catch (error) {
      console.error('Error reviewing script:', error);
      throw new Error(`Failed to review script: ${error.message}`);
    }
  }
}