import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// When credentials are missing we don't crash the whole app — instead we expose
// `isSupabaseConfigured` so the UI can show a friendly "not configured" message.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // Helpful during setup so the developer knows why auth is inert.
  console.warn(
    '[MindMate] Supabase is not configured. Add VITE_SUPABASE_URL and ' +
      'VITE_SUPABASE_ANON_KEY to your .env file to enable authentication.'
  );
}

// A single shared client instance for the whole app.
// Session is persisted to localStorage and auto-refreshed so users stay
// logged in across app restarts (important for elderly users).
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'mindmate-auth',
      },
    })
  : null;
