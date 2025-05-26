import OpenAI from 'openai';

export class ScriptGenerator {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generate(prompt: string, editorialProfile: any): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a creative script-writing agent specialized in short-form video content.
          Generate concise, engaging scripts optimized for TikTok-style videos (30-60 seconds).
          
          Editorial Profile:
          - Persona: ${editorialProfile.persona_description}
          - Tone: ${editorialProfile.tone_of_voice}
          - Audience: ${editorialProfile.audience}
          - Style: ${editorialProfile.style_notes}
          
          Format the script in clear, spoken sentences suitable for text-to-speech.
          Focus on maintaining the creator's unique voice and style.`
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return completion.choices[0].message.content || '';
  }
}