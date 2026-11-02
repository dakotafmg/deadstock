// ============================================================
// ADMIN — shared fetch + formatting helpers
// ============================================================
import { accessToken } from '../lib/supabase';

export async function apiCall(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  // Supabase sign-in sends its token; the legacy login rides on its cookie.
  const token = await accessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, {
    method: opts.method || 'GET',
    headers,
    credentials: 'include',
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status === 401) throw new Error('SESSION_EXPIRED');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error ${res.status}`);
  }
  return res.json();
}

export function fmt$$(cents) {
  if (cents == null) return '—';
  return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 });
}

// Stripe gives seconds since 1970; Supabase gives ISO strings. Both work here.
function toDate(ts) {
  return typeof ts === 'string' ? new Date(ts) : new Date(ts * 1000);
}

export function fmtDate(ts) {
  if (ts == null) return '—';
  return toDate(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function fmtDateTime(ts) {
  if (ts == null) return '—';
  return toDate(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

// Who can see which admin screens. The server enforces the same rules;
// this only hides what a role can't use.
export const can = {
  sales:   (staff) => ['owner', 'sales'].includes(staff?.role),
  repairs: (staff) => ['owner', 'sales', 'tech'].includes(staff?.role),
  editRepairs: (staff) => ['owner', 'tech'].includes(staff?.role),
  team:    (staff) => staff?.role === 'owner',
  content: (staff) => staff?.role === 'owner',
};
