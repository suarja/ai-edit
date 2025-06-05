import { readFile } from 'fs/promises';
import { join } from 'path';
import OpenAI from 'openai';
import { createOpenAIClient } from '../config/openai';
import { PromptService } from '@/lib/services/prompts';

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
    captionStructure?: any;
    agentPrompt?: string;
  }): Promise<any> {
    const docs = await this.loadDocs();

    // Use custom agent prompt if provided, otherwise use prompt from prompt bank
    let systemPrompt = params.agentPrompt;
    let userPrompt = '';

    if (!systemPrompt) {
      // Get the creatomate-builder-agent prompt from the prompt bank
      const promptTemplate = PromptService.fillPromptTemplate(
        'creatomate-builder-agent',
        {
          script: params.script,
          scenePlan: JSON.stringify(params.scenePlan, null, 2),
          voiceId: params.voiceId,
          captionInfo: params.captionStructure
            ? `\n\nUTILISE CETTE STRUCTURE EXACTE POUR LES SOUS-TITRES:\n${JSON.stringify(
                params.captionStructure,
                null,
                2
              )}`
            : '',
        }
      );

      if (!promptTemplate) {
        console.warn('Prompt template not found, using default system prompt');
        systemPrompt = `
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
`;
        userPrompt = `Script: ${params.script}

Scene Plan: ${JSON.stringify(params.scenePlan, null, 2)}

Voice ID: ${params.voiceId}

${
  params.captionStructure
    ? `\n\nUTILISE CETTE STRUCTURE EXACTE POUR LES SOUS-TITRES:\n${JSON.stringify(
        params.captionStructure,
        null,
        2
      )}`
    : ''
}

Documentation Creatomate:
${docs}
 
Génère le JSON Creatomate pour cette vidéo, en utilisant EXACTEMENT les assets vidéo assignés dans le scene plan. Chaque scène doit avoir une vidéo, un voiceover, et des sous-titres.`;
      } else {
        systemPrompt = promptTemplate.system;
        userPrompt = promptTemplate.user;

        // Add documentation if not already included in the prompt
        if (!userPrompt.includes('Documentation Creatomate')) {
          userPrompt += `\n\nDocumentation Creatomate:\n${docs}`;
        }
      }
    } else {
      // Use the provided user prompt
      userPrompt = `Script: ${params.script}

Scene Plan: ${JSON.stringify(params.scenePlan, null, 2)}

Voice ID: ${params.voiceId}

${
  params.captionStructure
    ? `\n\nUTILISE CETTE STRUCTURE EXACTE POUR LES SOUS-TITRES:\n${JSON.stringify(
        params.captionStructure,
        null,
        2
      )}`
    : ''
}

Documentation Creatomate:
${docs}
 
Génère le JSON Creatomate pour cette vidéo, en utilisant EXACTEMENT les assets vidéo assignés dans le scene plan. Chaque scène doit avoir une vidéo, un voiceover, et des sous-titres.`;
    }

    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    // Parse the response
    let template = JSON.parse(completion.choices[0].message.content || '{}');

    // Log original dimensions before enforcement
    console.log('Original template dimensions:', {
      width: template.width || 'not specified',
      height: template.height || 'not specified',
      output_format: template.output_format || 'not specified',
    });

    // Ensure the template has the correct dimensions for vertical video
    template = {
      ...template,
      output_format: template.output_format || 'mp4',
      width: 1080, // Force correct width
      height: 1920, // Force correct height
    };

    console.log(
      'Template dimensions enforced: 1080x1920 (vertical format required for mobile viewing)'
    );
    return template;
  }

  /**
   * Builds a Creatomate JSON template
   */
  async buildJson(params: {
    script: string;
    selectedVideos: any[];
    voiceId: string;
    editorialProfile?: any;
    captionStructure?: any;
    agentPrompt?: string;
  }): Promise<any> {
    console.log('Building Creatomate JSON template...');
    console.log('Voice ID:', params.voiceId);
    console.log(
      'Caption structure:',
      params.captionStructure ? 'Provided' : 'Not provided'
    );

    // Step 1: Plan the video structure (scene-by-scene)
    const scenePlan = await this.planVideoStructure(
      params.script,
      params.selectedVideos
    );

    // Step 2: Generate the Creatomate template
    const template = await this.generateTemplate({
      script: params.script,
      selectedVideos: params.selectedVideos,
      voiceId: params.voiceId || 'NFcw9p0jKu3zbmXieNPE', // Default voice if not provided
      editorialProfile: params.editorialProfile,
      scenePlan,
      captionStructure: params.captionStructure,
      agentPrompt: params.agentPrompt,
    });

    // Step 3: Validate the template
    this.validateTemplate(template);

    return template;
  }

  private validateTemplate(template: any) {
    // Basic structure validation
    if (
      !template.output_format ||
      !template.width ||
      !template.height ||
      !template.elements
    ) {
      throw new Error(
        'Invalid template: Missing required properties (output_format, width, height, or elements)'
      );
    }

    // Validate dimensions for TikTok format
    if (template.width !== 1080 || template.height !== 1920) {
      throw new Error(
        `Invalid template: Must be 1080x1920 for vertical video. Current dimensions: ${template.width}x${template.height}. Please ensure that the template explicitly specifies "width": 1080, "height": 1920 in the root object. Example correct format: {"output_format": "mp4", "width": 1080, "height": 1920, "elements": [...]}`
      );
    }

    // Validate scenes
    if (!Array.isArray(template.elements)) {
      throw new Error('Invalid template: elements must be an array');
    }

    // template.elements.forEach((scene: any, index: number) => {
    //   // Validate scene composition
    //   if (!scene.type || scene.type !== 'composition') {
    //     throw new Error('Scene ${index}: Must be a composition');
    //   }

    //   if (!Array.isArray(scene.elements)) {
    //     throw new Error('Scene ${index}: Missing elements array');
    //   }

    //   // Check required elements
    //   const elements = scene.elements;

    //   // Video validation
    //   const video = elements.find((el: any) => el.type === 'video');
    //   if (!video || !video.source || video.track !== 1) {
    //     throw new Error('Scene ${index}: Invalid or missing video element');
    //   }

    //   // Audio validation
    //   const audio = elements.find((el: any) => el.type === 'audio');
    //   if (!audio || audio.track !== 3 || !audio.provider || !audio.dynamic) {
    //     throw new Error('Scene ${index}: Invalid or missing audio element');
    //   }

    //   // Subtitle validation
    //   const subtitle = elements.find((el: any) => el.type === 'text');
    //   if (
    //     !subtitle ||
    //     subtitle.track !== 2 ||
    //     !subtitle.transcript_source ||
    //     subtitle.width !== '50%' ||
    //     subtitle.x_alignment !== '50%' ||
    //     subtitle.y_alignment !== '85%'
    //   ) {
    //     throw new Error('Scene ${index}: Invalid or missing subtitle element');
    //   }

    //   // Verify audio-subtitle link
    //   if (!audio.id || subtitle.transcript_source !== audio.id) {
    //     throw new Error('Scene ${index}: Mismatched audio and subtitle IDs');
    //   }
    // });
  }
}
