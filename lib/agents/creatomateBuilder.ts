import { readFile } from 'fs/promises';
import { join } from 'path';
import { marked } from 'marked';

export class CreatomateBuilder {
  private static instance: CreatomateBuilder;
  private docsCache: string | null = null;

  private constructor() {}

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

  private extractJsonExamples(markdown: string): any {
    const tokens = marked.lexer(markdown);
    const jsonExamples: any = {};
    
    tokens.forEach(token => {
      if (token.type === 'code' && token.lang === 'json') {
        try {
          const json = JSON.parse(token.text);
          // Store example based on its content
          if (json.type === 'audio') {
            jsonExamples.voiceover = json;
          } else if (json.type === 'text') {
            jsonExamples.subtitle = json;
          } else if (json.type === 'composition') {
            jsonExamples.scene = json;
          }
        } catch (e) {
          console.warn('Failed to parse JSON example:', e);
        }
      }
    });

    return jsonExamples;
  }

  async buildJson(params: {
    script: string;
    selectedVideos: string[];
    voiceId: string;
  }): Promise<any> {
    const { script, selectedVideos, voiceId } = params;

    // Load and parse documentation
    const docs = await this.loadDocs();
    const examples = this.extractJsonExamples(docs);

    // Split script into scenes
    const scenes = script.split('\n\n').filter(Boolean);

    // Build video JSON using documentation templates
    return {
      output_format: 'mp4',
      width: 1080,
      height: 1920,
      elements: scenes.map((sceneText, index) => ({
        type: 'composition',
        name: `Scene-${index + 1}`,
        track: 1,
        elements: [
          {
            type: 'video',
            track: 1,
            source: selectedVideos[index % selectedVideos.length],
            fit: 'cover'
          },
          {
            id: `voice-${index}`,
            type: 'audio',
            track: 3,
            source: '',
            provider: `elevenlabs model_id=eleven_multilingual_v2 voice_id=${voiceId} stability=0.75`,
            dynamic: true
          },
          {
            type: 'text',
            track: 2,
            width: '50%',
            y_alignment: '85%',
            transcript_source: `voice-${index}`,
            transcript_effect: 'highlight',
            transcript_maximum_length: 35,
            transcript_color: '#ff0040',
            font_family: 'Montserrat',
            font_weight: '700',
            font_size: '8 vmin',
            fill_color: '#ffffff',
            stroke_color: '#333333',
            background_color: 'rgba(0,0,0,0.7)',
            background_x_padding: '26%',
            background_y_padding: '7%',
            background_border_radius: '28%'
          }
        ]
      }))
    };
  }
}