import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/^["']|["']$/g, '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim().replace(/^["']|["']$/g, '').trim();

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl.startsWith('https://') &&
  !rawUrl.includes('placeholder') &&
  !rawUrl.includes('example.supabase.co')
);

export const supabaseUrl = rawUrl;
export const supabaseAnonKey = rawKey;

// Create Supabase client with safe fallback url if unconfigured to prevent hard runtime crashes
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://dummy-studyspace.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'dummy-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
