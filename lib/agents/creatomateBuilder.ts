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
    this.model = model;
  }

  static getInstance(model: string): CreatomateBuilder {
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

  private async planVideoStructure(
    script: string,
    selectedVideos: any[]
  ): Promise<any> {
    console.log('Available videos:', JSON.stringify(selectedVideos, null, 2));
    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `You are a video planning expert. Your PRIMARY GOAL is to create a scene-by-scene plan that ALWAYS uses the available video assets.

CRITICAL RULES:
1. EVERY scene MUST be assigned a video asset from the provided list
2. NO scenes should be left without a video asset (video_asset: null is FORBIDDEN)
3. You can reuse video assets across multiple scenes if needed
4. Match video assets to script content based on keywords, themes, or general relevance
5. If a video seems unrelated, still assign it - we prioritize video content over perfect matching

For each scene, determine:
1. Natural break points in the script (aim for 3-7 scenes total)
2. Which video asset best matches the content (REQUIRED - never null)
3. Brief reasoning for the video choice
4. Any timing or transition notes

Available videos format: [{ id: "...", url: "...", title: "...", description: "...", tags: [...] }]

Return a JSON object with an array of scenes. Each scene MUST have a video_asset assigned.

OUTPUT FORMAT:
{
  "scenes": [
    {
      "scene_number": 1,
      "script_text": "Text for this scene",
      "video_asset": {
        "id": "video_id",
        "url": "actual_video_url_from_available_videos",
        "title": "video_title"
      },
      "reasoning": "Why this video was chosen"
    }
  ]
}

CRITICAL: The video_asset.url MUST be the exact URL from the available videos list.`,
        },
        {
          role: 'user',
          content: `Script: ${script}

Available videos: ${JSON.stringify(selectedVideos, null, 2)}

REMEMBER: Every scene MUST have a video_asset assigned. Never leave video_asset as null.`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    console.log('Planning completion:', completion.choices[0].message.content);
    return JSON.parse(completion.choices[0].message.content || '{}');
  }

  private async generateTemplate(params: {
    script: string;
    selectedVideos: any[];
    voiceId: string;
    editorialProfile: any;
    scenePlan: any;
  }): Promise<any> {
    const docs = await this.loadDocs();

    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `
Tu es un expert en génération de vidéos avec Creatomate via JSON.

🎯 OBJECTIF PRINCIPAL
Tu dois générer un fichier JSON **valide, complet et sans erreur**, destiné à générer une vidéo TikTok à partir de :
- un script découpé en scènes avec des assets vidéo assignés
- une liste d'assets vidéo préexistants

🚨 RÈGLES CRITIQUES - VIDEO FIRST APPROACH
1. **CHAQUE SCÈNE DOIT CONTENIR EXACTEMENT 3 ÉLÉMENTS :**
   - 1 élément vidéo ('type: "video"') - OBLIGATOIRE
   - 1 voiceover IA ('type: "audio"') - OBLIGATOIRE  
   - 1 sous-titre dynamique ('type: "text"' avec transcript_source) - OBLIGATOIRE
   - Chaque élément VIDÉO doit avoir un volume de 0% afin de ne pas interférer avec le voiceover

2. **INTERDICTIONS ABSOLUES :**
   - ❌ PAS de text statique (sans transcript_source)
   - ❌ PAS de text décoratif ou d'animation de texte au centre de l'écran
   - ❌ PAS d'éléments visuels autres que les vidéos fournies
   - ❌ PAS de scène sans vidéo

3. **STRUCTURE OBLIGATOIRE PAR SCÈNE :**
{
  "type": "composition",
  "track": 1,
  "elements": [
    {
      "type": "video",
      "source": "[USE_ACTUAL_VIDEO_URL_FROM_SCENE_PLAN]",
      "track": 1,
      "fit": "cover",
      "time": "auto",
      "duration": "auto",
      "volume": 0,
    },
    {
      "id": "voice-scene-X",
      "type": "audio",
      "track": 3,
      "source": "SCRIPT_TEXT_FOR_THIS_SCENE",
      "provider": "elevenlabs model_id=eleven_multilingual_v2 voice_id=NFcw9p0jKu3zbmXieNPE stability=0.50",
      "dynamic": true
    },
    {
      "type": "text",
      "track": 2,
      "width": "50%",
      "x_alignment": "50%",
      "y_alignment": "85%",
      "transcript_source": "voice-scene-X",
      "transcript_effect": "highlight",
      "transcript_maximum_length": 35,
      "transcript_color": "#ff0040",
      "font_family": "Montserrat",
      "font_weight": "700",
      "font_size": "8 vmin",
      "fill_color": "#ffffff",
      "stroke_color": "#333333",
      "background_color": "rgba(0,0,0,0.7)",
      "background_x_padding": "26%",
      "background_y_padding": "7%",
      "background_border_radius": "28%"
    }
  ]
}

🎞️ UTILISATION DES VIDÉOS
- Utilise EXACTEMENT les URLs fournies dans le scene plan
- Pour chaque scène, utilise scene.video_asset.url comme source vidéo
- Chaque scène doit avoir son video asset assigné
- Ne jamais inventer d'URL ou laisser une scène sans vidéo
- JAMAIS d'URLs d'exemple comme "https://example.com/video.mp4"
- Utilise UNIQUEMENT les vraies URLs du scene plan

EXEMPLE D'EXTRACTION:
Si scene plan contient: { "video_asset": { "url": "https://real-url.com/video.mp4" } }
Alors utilise: "source": "https://real-url.com/video.mp4"

🎙️ VOICEOVER
- Un audio par scène avec un ID unique (voice-scene-1, voice-scene-2, etc.)
- Le "source" contient le texte exact du script pour cette scène
- Provider fixe : "elevenlabs model_id=eleven_multilingual_v2 voice_id=NFcw9p0jKu3zbmXieNPE stability=0.50"

💬 SOUS-TITRES UNIQUEMENT
- Un seul élément text par scène
- TOUJOURS avec transcript_source pointant vers l'audio
- Positionnés EN BAS de l'écran (y_alignment: "85%" - JAMAIS au centre)
- Centrés horizontalement (x_alignment: "50%")
- Largeur max 50%

📐 FORMAT FINAL
{
  "output_format": "mp4",
  "width": 1080,
  "height": 1920,
  "elements": [
    // Array of compositions (one per scene)
  ]
}

✅ CHECKLIST FINAL
- ❌ PAS de text sans transcript_source
- ✅ Chaque scène = 1 video + 1 audio + 1 caption
- ✅ Chaque élément VIDÉO doit avoir un volume de 0% afin de ne pas interférer avec le voiceover
- ✅ URLs vidéo exactement comme dans le scene plan
- ✅ Voice ID correct
- ✅ JSON valide sans commentaires

Documentation:
${docs}`,
        },
        {
          role: 'user',
          content: `Generate a template using this structure:

Scene Plan:
${JSON.stringify(params.scenePlan, null, 2)}

Voice ID: ${params.voiceId}

IMPORTANT: Use ONLY the video URLs provided in the scene plan. Each scene must have exactly 3 elements: video + audio + caption (no additional text elements).

CRITICAL: Captions MUST be positioned at the bottom of the screen with y_alignment: "85%" and x_alignment: "50%" - NEVER in the middle of the screen.

NEVER use example URLs like "https://example.com/video.mp4" - use ONLY the actual URLs from the scene plan provided above.

FOR EACH SCENE: Extract the video URL from scene.video_asset.url and use it as the "source" property in the video element.`,
        },
      ],
      response_format: { type: 'json_object' },
    });
    console.log('Template completion:', completion.choices[0].message.content);
    return JSON.parse(completion.choices[0].message.content || '{}');
  }

  async buildJson(params: {
    script: string;
    selectedVideos: any[];
    voiceId: string;
    editorialProfile?: any;
  }): Promise<any> {
    try {
      console.log('Planning video structure...');
      const scenePlan = await this.planVideoStructure(
        params.script,
        params.selectedVideos
      );
      console.log('Video structure planned:', {
        scenePlan: JSON.stringify(scenePlan),
      });

      console.log('Generating video template...');
      const template = await this.generateTemplate({
        ...params,
        scenePlan,
        editorialProfile: params.editorialProfile || {
          persona_description: 'Professional content creator',
          tone_of_voice: 'Clear and engaging',
          audience: 'General audience',
          style_notes: 'Modern and professional style',
        },
      });

      // this.validateTemplate(template);

      console.log('Template generated successfully', {
        template: JSON.stringify(template),
      });
      return template;
    } catch (error: any) {
      console.error('Error building template:', error);
      throw new Error(
        `Failed to build video template: ${error?.message || 'Unknown error'}`
      );
    }
  }

  private validateTemplate(template: any) {
    // Basic structure validation
    if (
      !template.output_format ||
      !template.width ||
      !template.height ||
      !template.elements
    ) {
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
        throw new Error('Scene ${index}: Must be a composition');
      }

      if (!Array.isArray(scene.elements)) {
        throw new Error('Scene ${index}: Missing elements array');
      }

      // Check required elements
      const elements = scene.elements;

      // Video validation
      const video = elements.find((el: any) => el.type === 'video');
      if (!video || !video.source || video.track !== 1) {
        throw new Error('Scene ${index}: Invalid or missing video element');
      }

      // Audio validation
      const audio = elements.find((el: any) => el.type === 'audio');
      if (!audio || audio.track !== 3 || !audio.provider || !audio.dynamic) {
        throw new Error('Scene ${index}: Invalid or missing audio element');
      }

      // Subtitle validation
      const subtitle = elements.find((el: any) => el.type === 'text');
      if (
        !subtitle ||
        subtitle.track !== 2 ||
        !subtitle.transcript_source ||
        subtitle.width !== '50%' ||
        subtitle.x_alignment !== '50%' ||
        subtitle.y_alignment !== '85%'
      ) {
        throw new Error('Scene ${index}: Invalid or missing subtitle element');
      }

      // Verify audio-subtitle link
      if (!audio.id || subtitle.transcript_source !== audio.id) {
        throw new Error('Scene ${index}: Mismatched audio and subtitle IDs');
      }
    });
  }
}
