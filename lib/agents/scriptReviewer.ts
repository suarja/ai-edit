import OpenAI from 'openai';

export class ScriptReviewer {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async review(script: string, editorialProfile: any): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a script optimization agent that reviews and enhances scripts for TTS compatibility.
          
          Editorial Profile:
          - Persona: ${editorialProfile.persona_description}
          - Tone: ${editorialProfile.tone_of_voice}
          - Audience: ${editorialProfile.audience}
          - Style: ${editorialProfile.style_notes}
          
          Ensure the script:
          1. Maintains natural speech patterns
          2. Uses clear punctuation for TTS
          3. Avoids complex structures
          4. Fits within 60 seconds when spoken
          5. Matches the creator's style`
        },
        {
          role: 'user',
          content: script
        }
      ]
    });

    return completion.choices[0].message.content || script;
  }
}