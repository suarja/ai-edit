import { readFile } from 'fs/promises';
import { join } from 'path';
import { marked } from 'marked';
import OpenAI from 'openai';

export class CreatomateBuilder {
  private static instance: CreatomateBuilder;
  private docsCache: string | null = null;
  private openai: OpenAI;

  private constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  static getInstance(): CreatomateBuilder {
    if (!CreatomateBuilder.instance) {
      CreatomateBuilder.instance = new CreatomateBuilder();
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

  private async generateTemplate(params: {
    script: string;
    selectedVideos: string[];
    voiceId: string;
    editorialProfile: any;
  }): Promise<any> {
    const docs = await this.loadDocs();
    
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a video template generation expert. Using the Creatomate documentation provided, create a JSON template for a social media video.

Documentation:
${docs}

Key requirements:
- Format: Vertical video (1080x1920)
- Include voiceovers with subtitles
- Support multiple scenes
- Use dynamic video backgrounds
- Implement smooth transitions
- Follow all best practices from the docs

Output a complete, valid Creatomate JSON template.`
        },
        {
          role: 'user',
          content: `Generate a template for the following video:

Script:
${params.script}

Available source videos: ${params.selectedVideos.length}
Voice ID: ${params.voiceId}

Editorial style:
${JSON.stringify(params.editorialProfile, null, 2)}

The template should:
1. Split the script into natural scenes
2. Use source videos as backgrounds
3. Add voiceovers with the specified voice ID
4. Include synchronized subtitles
5. Apply appropriate animations and transitions`
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
      console.log('Generating video template...');
      
      // Generate base template using AI
      const template = await this.generateTemplate({
        ...params,
        editorialProfile: params.editorialProfile || {
          persona_description: 'Professional content creator',
          tone_of_voice: 'Clear and engaging',
          audience: 'General audience',
          style_notes: 'Modern and professional style'
        }
      });

      // Validate and enhance template
      this.validateTemplate(template);
      
      console.log('Template generated successfully');
      return template;
    } catch (error) {
      console.error('Error building template:', error);
      throw new Error(`Failed to build video template: ${error.message}`);
    }
  }

  private validateTemplate(template: any) {
    // Ensure required properties
    if (!template.output_format || !template.width || !template.height || !template.elements) {
      throw new Error('Invalid template: Missing required properties');
    }

    // Validate dimensions
    if (template.width !== 1080 || template.height !== 1920) {
      throw new Error('Invalid template: Incorrect dimensions for vertical video');
    }

    // Check elements structure
    if (!Array.isArray(template.elements) || template.elements.length === 0) {
      throw new Error('Invalid template: No elements defined');
    }

    // Validate each scene
    template.elements.forEach((scene: any, index: number) => {
      if (!scene.type || scene.type !== 'composition') {
        throw new Error(`Invalid scene ${index}: Must be a composition`);
      }

      if (!Array.isArray(scene.elements)) {
        throw new Error(`Invalid scene ${index}: Missing elements array`);
      }

      // Check for required elements in each scene
      const hasVideo = scene.elements.some((el: any) => el.type === 'video');
      const hasVoiceover = scene.elements.some((el: any) => el.type === 'audio');
      const hasSubtitles = scene.elements.some((el: any) => el.type === 'text' && el.transcript_source);

      if (!hasVideo || !hasVoiceover || !hasSubtitles) {
        throw new Error(`Invalid scene ${index}: Missing required elements (video, audio, or subtitles)`);
      }
    });
  }
}