import { readFile } from 'fs/promises';
import { join } from 'path';
import { marked } from 'marked';
import OpenAI from 'openai';
import { createOpenAIClient } from '../config/openai';

export class CreatomateBuilder {
  private static instance: CreatomateBuilder;
  private docsCache: string | null = null;
  private openai: OpenAI;
  private model: string;

  private constructor(model: string) {
    this.openai = createOpenAIClient();
    this.model = model
  }

  static getInstance(string: model): CreatomateBuilder {
    if (!CreatomateBuilder.instance) {
      CreatomateBuilder.instance = new CreatomateBuilder(model);
    }
    return CreatomateBuilder.instance;
  }

  private async loadDocs(): Promise<string> {
    if (this.docsCache) {
      return this.docsCache;
    }

    try {
      const docsPath = join(process.cwd(), 'docs', 'creatomate.md');
      this.docsCache = await readFile(docsPath, 'utf-8');
      return this.docsCache;
    } catch (error) {
      console.error('Error loading Creatomate docs:', error);
      throw new Error('Failed to load Creatomate documentation');
    }
  }

  private async planVideoStructure(script: string, availableVideos: string[]): Promise<any> {
    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `You are a video planning expert. Analyze the script and available videos to create a scene-by-scene plan.
          
          For each scene, determine:
          1. The natural break points in the script
          2. Which video asset best matches the content
          3. Any special requirements or transitions needed
          
          Return the plan as a JSON object with an array of scenes.`
        },
        {
          role: 'user',
          content: `Script: ${script}\n\nAvailable videos: ${JSON.stringify(availableVideos)}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  private async generateTemplate(params: {
    script: string;
    selectedVideos: string[];
    voiceId: string;
    editorialProfile: any;
    scenePlan: any;
  }): Promise<any> {
    const docs = await this.loadDocs();
    
    const completion = await this.openai.chat.completions.create({
      model: this.model
      ,
      messages: [
        {
          role: 'system',
          content: `You are a Creatomate JSON expert. Generate a complete video template following these rules:

1. Format:
- Vertical video (1080x1920)
- MP4 output
- No global duration (auto-timed to voiceover)

2. Scene Structure:
- Each scene must have:
  * Video background (track 1)
  * Voiceover audio (track 3)
  * Synchronized subtitles (track 2)
- Use "time": "auto" for smooth flow

3. Voiceover Configuration:
- type: "audio"
- track: 3
- Empty source (for AI generation)
- Use voice_id=NFcw9p0jKu3zbmXieNPE
- Set dynamic: true

4. Subtitle Requirements:
- Maximum width: 50%
- Position: Bottom third (y_alignment: "85%")
- Use transcript_source to link with voiceover
- Include background for readability

Documentation:
${docs}`
        },
        {
          role: 'user',
          content: `Generate a template using this structure:

Scene Plan:
${JSON.stringify(params.scenePlan, null, 2)}

Voice ID: ${params.voiceId}
Available Videos: ${JSON.stringify(params.selectedVideos)}

The template must:
1. Follow the scene plan exactly
2. Use only provided video assets
3. Configure proper voiceover and subtitles
4. Ensure smooth transitions`
        }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  async buildJson(params: {
    script: string;
    selectedVideos: string[];
    voiceId: string;
    editorialProfile?: any;
  }): Promise<any> {
    try {
      console.log('Planning video structure...');
      const scenePlan = await this.planVideoStructure(params.script, params.selectedVideos);
      console.log(' video structure...', {scenePlan : JSON.stringify(scenePlan)});

      console.log('Generating video template...');
      const template = await this.generateTemplate({
        ...params,
        scenePlan,
        editorialProfile: params.editorialProfile || {
          persona_description: 'Professional content creator',
          tone_of_voice: 'Clear and engaging',
          audience: 'General audience',
          style_notes: 'Modern and professional style'
        }
      });

      // this.validateTemplate(template);
      
      console.log('Template generated successfully', {template: JSON.stringify(template)});
      return template;
    } catch (error) {
      console.error('Error building template:', error);
      throw new Error(`Failed to build video template: ${error.message}`);
    }
  }

  private validateTemplate(template: any) {
    // Basic structure validation
    if (!template.output_format || !template.width || !template.height || !template.elements) {
      throw new Error('Invalid template: Missing required properties');
    }

    // Validate dimensions for TikTok format
    if (template.width !== 1080 || template.height !== 1920) {
      throw new Error('Invalid template: Must be 1080x1920 for vertical video');
    }

    // Validate scenes
    if (!Array.isArray(template.elements)) {
      throw new Error('Invalid template: elements must be an array');
    }

    template.elements.forEach((scene: any, index: number) => {
      // Validate scene composition
      if (!scene.type || scene.type !== 'composition') {
        throw new Error(`Scene ${index}: Must be a composition`);
      }

      if (!Array.isArray(scene.elements)) {
        throw new Error(`Scene ${index}: Missing elements array`);
      }

      // Check required elements
      const elements = scene.elements;
      
      // Video validation
      const video = elements.find((el: any) => el.type === 'video');
      if (!video || !video.source || video.track !== 1) {
        throw new Error(`Scene ${index}: Invalid or missing video element`);
      }

      // Audio validation
      const audio = elements.find((el: any) => el.type === 'audio');
      if (!audio || audio.track !== 3 || !audio.provider || !audio.dynamic) {
        throw new Error(`Scene ${index}: Invalid or missing audio element`);
      }

      // Subtitle validation
      const subtitle = elements.find((el: any) => el.type === 'text');
      if (!subtitle || 
          subtitle.track !== 2 || 
          !subtitle.transcript_source || 
          subtitle.width !== '50%' ||
          subtitle.y_alignment !== '85%') {
        throw new Error(`Scene ${index}: Invalid or missing subtitle element`);
      }

      // Verify audio-subtitle link
      if (!audio.id || subtitle.transcript_source !== audio.id) {
        throw new Error(`Scene ${index}: Mismatched audio and subtitle IDs`);
      }
    });
  }
}