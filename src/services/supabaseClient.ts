import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables or fallback
const SUPABASE_URL = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY || '';

export let supabase: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase Client Initialized with live URL:', SUPABASE_URL);
  } catch (err) {
    console.warn('⚠️ Supabase connection failed, falling back to Demo Mode:', err);
    supabase = null;
  }
} else {
  console.log('ℹ️ Running in SeatSync Demo Mode (Persistent Local Database with Real-time Simulation).');
}

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabase);
};
