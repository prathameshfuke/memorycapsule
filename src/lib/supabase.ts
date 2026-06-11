import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return typeof supabaseUrl === 'string' && supabaseUrl.trim().length > 0 && !supabaseUrl.includes('YOUR_') &&
         typeof supabaseAnonKey === 'string' && supabaseAnonKey.trim().length > 0 && !supabaseAnonKey.includes('YOUR_');
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any);
