export type VideoType = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  upload_url: string;
  duration_seconds: number;
  created_at: string;
  storage_path?: string;
  user_id?: string;
};

export type CaptionPreset = {
  name: string;
  id: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontColor: string;
  uppercase: boolean;
  strokeColor: string;
  strokeWidth: number;
  shadow: boolean;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  animation: string;
  effect: string;
  placement: 'top' | 'middle' | 'bottom';
  lines: 1 | 3;
  highlightColor: string;
  maxWordsPerLine: number;
};

export type CaptionConfiguration = {
  presetId: string;
  placement?: 'top' | 'middle' | 'bottom';
  lines?: 1 | 3;
};
