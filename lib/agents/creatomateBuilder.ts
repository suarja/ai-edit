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
          content: 'Script: ${script}\n\nAvailable videos: ${JSON.stringify(availableVideos)}'
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
          content: `
Tu es un expert en génération de vidéos avec Creatomate via JSON.

🎯 OBJECTIF
Tu dois générer un fichier JSON **valide, complet et sans erreur**, destiné à générer une vidéo TikTok à partir de :

- un script découpé en scènes
- une liste d’assets vidéo préexistants

Chaque scène doit combiner :

- un ou plusieurs éléments vidéo ('type: "video"')
- un voiceover IA ('type: "audio"')
- un sous-titre dynamique synchronisé ('type: "text"')

---

🛠️ RÈGLES GÉNÉRALES

- **Format JSON sans commentaires !**
- Le JSON doit être directement utilisable dans Creatomate
- N’utilise **aucun asset fictif**, uniquement ceux listés dans l’input
- Si tu ne peux pas associer d’asset, ignore la scène
- Tu dois utiliser l’outil 'think_tool' pour planifier la structure avant de générer le JSON

---

📐 STRUCTURE DE BASE

'''json
{
  "output_format": "mp4",
  "width": 1080,
  "height": 1920,
  "elements": [ ... ]
}

⸻

🎙️ VOICEOVER – OBLIGATOIRE

Pour chaque scène, tu dois inclure :

{
  "type": "audio",
  "track": 3,
  "id": "voice-scene-1",
  "source": "Text à afficher en guise de sous-titres et qui sera utilisé pour générer le voice-over",
  "provider": "elevenlabs model_id=eleven_multilingual_v2 voice_id=NFcw9p0jKu3zbmXieNPE stability=0.50",
  "dynamic": true
}

	•	Un id unique par scène (voice-scene-1, voice-scene-2, etc.)
	•	Le source est vide → Creatomate générera automatiquement la voix

⸻

💬 SUBTITRES – OBLIGATOIRES

Chaque voix-off doit être liée à un élément text avec :

{
  "type": "text",
  "track": 2,
  "width": "50%",
  "y_alignment": "85%",  // sous-titres dans le tiers bas de l’écran
  "transcript_source": "voice-scene-1",
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

	•	Ne pas dépasser 50% de largeur
	•	Les sous-titres doivent être dans le tiers bas de l’écran
	•	Ne jamais afficher le script en tant que text si un transcript_source est disponible

⸻

🎞️ VIDÉO
	•	Tu dois utiliser au moins 1 vidéo asset existant par scène
	•	Utilise l’attribut "source" avec l’URL fournie
	•	Ex. :

{
  "type": "video",
  "source": "https://res.cloudinary.com/dwyozn4df/video/upload/>..._gestures_demonstrative_workout_gear_sunny_bocqj7.mov",
  "track": 1,
  "time": "auto",
  "duration": "auto",
  "fit": "cover"
}

	•	Ne jamais générer de source fictif
	•	Si le nom d’un asset contient intro, outro, bureau, etc., tu peux l’associer intelligemment

⸻

🎨 ANIMATIONS (facultatives mais recommandées)

Tu peux ajouter une animation simple au texte :

{
  "animations": [
    {
      "time": "start",
      "duration": "1 s",
      "easing": "quadratic-out",
      "type": "text-slide",
      "direction": "up",
      "split": "letter",
      "scope": "split-clip"
    }
  ]
}

⸻

📏 TIMING
	•	Ne pas définir de duration globale
	•	Chaque scène adapte sa durée à la voix générée
	•	Utilise "time": "auto" pour un enchaînement fluide

⸻

🔧 STRUCTURE SUGGÉRÉE POUR CHAQUE SCÈNE

[
  {
    "type": "video",
    "source": "...",
    "track": 1
  },
  {
    "id": "voice-scene-1",
    "type": "audio",
    "track": 3,
    "provider": "...",
    "dynamic": true
  },
  {
    "type": "text",
    "track": 2,
    "transcript_source": "voice-scene-1",
    ...
  }
]

⸻

✅ À RETENIR ABSOLUMENT
	•	❌ PAS de commentaires dans le JSON
	•	✅ Max 50% width pour les sous-titres
	•	✅ Sous-titres en bas de l’écran (y_alignment: “85%”)
	•	✅ Un seul JSON final, bien formaté, sans texte explicatif
	•	✅ Utilisation obligatoire des assets vidéos listés, sinon ignorer la scène
    •   ✅ Utilise toujours ce voice Id => voice_id=NFcw9p0jKu3zbmXieNPE

Tu es précis, structuré, et ne fais jamais d’invention.

Utilise maintenant think_tool pour planifier la structure du JSON avant de l’émettre.



Documentation:
${docs}'
        },
        {
          role: 'user',
          content: 'Generate a template using this structure:

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
      throw new Error('Failed to build video template: ${error.message}');
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
      if (!subtitle || 
          subtitle.track !== 2 || 
          !subtitle.transcript_source || 
          subtitle.width !== '50%' ||
          subtitle.y_alignment !== '85%') {
        throw new Error('Scene ${index}: Invalid or missing subtitle element');
      }

      // Verify audio-subtitle link
      if (!audio.id || subtitle.transcript_source !== audio.id) {
        throw new Error('Scene ${index}: Mismatched audio and subtitle IDs');
      }
    });
  }
}