import { createClient, SupabaseClient } from '@supabase/supabase-js';

const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

const localUrl = typeof window !== 'undefined' ? localStorage.getItem('accessglobal_supabase_url') || '' : '';
const localKey = typeof window !== 'undefined' ? localStorage.getItem('accessglobal_supabase_anon_key') || '' : '';

export const SUPABASE_URL = (envUrl || localUrl || '').trim();
export const SUPABASE_ANON_KEY = (envKey || localKey || '').trim();

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
    console.warn('[SupabaseClient] Admin initialization failed:', err);
    return null;
  }
};

export const saveSupabaseConfig = (url: string, anonKey: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessglobal_supabase_url', url.trim());
    localStorage.setItem('accessglobal_supabase_anon_key', anonKey.trim());
    clientInstance = null; // Recreate with new credentials
  }
};

