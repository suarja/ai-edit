export interface SurveyOption {
  id: string;
  text: string;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  options: SurveyOption[];
}

export const surveyQuestions: SurveyQuestion[] = [
  {
    id: 'content_goals',
    question: "What's your primary goal with video content?",
    options: [
      { id: 'brand', text: 'Build brand awareness' },
      { id: 'sales', text: 'Drive sales and conversions' },
      { id: 'educate', text: 'Educate my audience' },
      { id: 'entertain', text: 'Entertain and engage followers' },
      { id: 'expertise', text: 'Share my expertise' },
    ],
  },
  {
    id: 'pain_points',
    question: "What's your biggest challenge with creating videos?",
    options: [
      { id: 'ideas', text: 'Coming up with good ideas' },
      { id: 'scripts', text: 'Writing compelling scripts' },
      { id: 'voiceovers', text: 'Recording professional voiceovers' },
      { id: 'time', text: 'Finding time to create content' },
      { id: 'consistency', text: 'Getting consistent results' },
    ],
  },
  {
    id: 'content_style',
    question: 'What style of content resonates most with your audience?',
    options: [
      { id: 'educational', text: 'Educational and informative' },
      { id: 'entertaining', text: 'Entertaining and humorous' },
      { id: 'inspirational', text: 'Inspirational and motivational' },
      { id: 'practical', text: 'Practical tips and how-tos' },
      { id: 'professional', text: 'Professional and authoritative' },
    ],
  },
  {
    id: 'platform_focus',
    question: 'Which platforms do you primarily create content for?',
    options: [
      { id: 'tiktok', text: 'TikTok' },
      { id: 'instagram', text: 'Instagram Reels' },
      { id: 'youtube', text: 'YouTube Shorts' },
      { id: 'facebook', text: 'Facebook/Meta' },
      { id: 'linkedin', text: 'LinkedIn' },
    ],
  },
  {
    id: 'content_frequency',
    question: 'How often do you aim to publish video content?',
    options: [
      { id: 'daily', text: 'Daily' },
      { id: 'several_weekly', text: 'Several times a week' },
      { id: 'weekly', text: 'Weekly' },
      { id: 'few_monthly', text: 'A few times a month' },
      { id: 'monthly', text: 'Monthly or less' },
    ],
  },
];
