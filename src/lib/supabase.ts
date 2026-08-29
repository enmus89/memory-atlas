import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;

// Supabase renamed the browser-safe key from "anon" to "publishable"
// (sb_publishable_...). Projects created before the change still show the
// legacy anon key, so accept either name.
const anonKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

/**
 * True when the app has been given Supabase credentials. The UI uses this to
 * show a setup message instead of failing with opaque network errors.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  console.error(
    'Memory Atlas: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are not set. ' +
      'Copy .env.example to .env.local and fill them in — see README.md.'
  );
}

/**
 * The publishable key is designed to be public: every table has row level
 * security, so this key alone grants no access to anybody's data. Never put
 * the secret / service_role key in client code.
 */
export const supabase: SupabaseClient = createClient(
  url ?? 'https://placeholder.supabase.co',
  anonKey ?? 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/** Access token for the current session, for calls to our own /api routes. */
export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/**
 * fetch() wrapper that attaches the caller's Supabase access token. The
 * server-side AI routes require it so the deployed URL cannot be used by
 * strangers to spend our Gemini quota.
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(path, { ...init, headers });
}
