import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  display_name: string;
  is_admin: boolean;
  created_at: string;
}

export interface DailyCompletion {
  id: string;
  user_id: string;
  session_key: string;
  date: string;
  practices_completed: number;
  minutes_completed: number;
  cancelled: boolean;
  cancelled_at: string | null;
  completed_at: string;
}

export interface CustomAudio {
  id: string;
  session_key: string;
  practice_name: string;
  audio_type: 'voice' | 'ambient';
  label: string;
  url: string;
  created_by: string;
  created_at: string;
}

export interface AdminSetting {
  key: string;
  value: Record<string, unknown>;
  updated_by: string | null;
  updated_at: string;
}
