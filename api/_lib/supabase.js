import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client using the service role key. It bypasses row-level
// security, so every function that uses it must check the caller's role first
// (see requireRole in auth.js). Never import this from anything under src/.

let client;

export function supabaseConfigured() {
  return Boolean(supabaseUrl() && serviceKey());
}

export function getSupabase() {
  if (!supabaseConfigured()) {
    throw new Error('Supabase is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing)');
  }
  if (!client) {
    client = createClient(supabaseUrl(), serviceKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

// The Vercel Marketplace integration has used both naming schemes.
function supabaseUrl() {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
}

function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
}

// Throws on a Supabase error so handlers can rely on try/catch.
export function must({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}
