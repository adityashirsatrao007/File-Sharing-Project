import { createClient } from '@insforge/sdk';

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://3929n3sz.us-east.insforge.app';

export const insforge = createClient({
  baseUrl: insforgeUrl,
});

export type FileRecord = {
  id: string;
  user_id: string;
  name: string;
  original_name: string;
  size: number;
  mime_type: string;
  storage_url: string;
  storage_key: string;
  share_token?: string;
  is_public: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  email: string;
  role?: string;
  name?: string;
  createdAt?: string;
  emailVerified?: boolean;
  updatedAt?: string;
};

export type Profile = {
  id: string;
  nickname?: string;
  bio?: string;
  avatar_url?: string;
};
