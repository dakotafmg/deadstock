import { createClient } from '@supabase/supabase-js';

// Browser Supabase client, used only for staff sign-in. It holds the public
// (anon) key, which is safe to ship: row-level security guards the data, and
// all writes go through the api/ functions anyway.
//
// Vercel's Supabase integration names these NEXT_PUBLIC_*; vite.config.js
// exposes that prefix. VITE_* works too if you set them by hand.
const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Read before the client starts: it consumes the link's #access_token…&type=…
// hash. 'invite' and 'recovery' links send the person to set a password.
export const authLinkType = typeof window !== 'undefined'
  ? new URLSearchParams(window.location.hash.slice(1)).get('type')
  : null;

export const supabase = url && key ? createClient(url, key) : null;

export async function accessToken() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}
