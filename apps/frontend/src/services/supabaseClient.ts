import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://falnqoftmtqhonkmrtby.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhbG5xb2Z0bXRxaG9ua21ydGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwNjQ4OTYsImV4cCI6MjEwOTY0MDg5Nn0.LgtOrqLdy9-k0pnO7pbMdJC9ykj5mWjdNw0mcwdTubY';

const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let localUrl = '';
let localKey = '';
if (typeof window !== 'undefined') {
  const storedUrl = localStorage.getItem('accessglobal_supabase_url') || '';
  const storedKey = localStorage.getItem('accessglobal_supabase_anon_key') || '';
  if (storedUrl && !storedUrl.includes('xyzcompany') && storedUrl.startsWith('http')) {
    localUrl = storedUrl;
    localKey = storedKey;
  } else if (storedUrl.includes('xyzcompany')) {
    localStorage.removeItem('accessglobal_supabase_url');
    localStorage.removeItem('accessglobal_supabase_anon_key');
  }
}

export const SUPABASE_URL = (envUrl || localUrl || DEFAULT_SUPABASE_URL).trim();
export const SUPABASE_ANON_KEY = (envKey || localKey || DEFAULT_SUPABASE_ANON_KEY).trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('http'));
};

let clientInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (clientInstance) return clientInstance;
  if (!isSupabaseConfigured()) return null;

  try {
    clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return clientInstance;
  } catch (err) {
    console.warn('[SupabaseClient] Initialization failed:', err);
    return null;
  }
};

export const saveSupabaseConfig = (url: string, anonKey: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessglobal_supabase_url', url.trim());
    localStorage.setItem('accessglobal_supabase_anon_key', anonKey.trim());
    clientInstance = null; // Reset instance to recreate with new credentials
  }
};
