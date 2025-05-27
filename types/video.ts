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
