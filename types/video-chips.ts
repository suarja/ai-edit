export interface VideoChipItem {
  label: string;
  value: string;
  tags?: string[];
  duration?: string;
  status?: 'processed' | 'processing' | 'error';
  created_at?: string;
}

export interface VideoChipConfig {
  variant?: 'solid' | 'outlined' | 'disabled';
  allowMultipleSelection?: boolean;
  showTags?: boolean;
  showDuration?: boolean;
  showStatus?: boolean;
}
