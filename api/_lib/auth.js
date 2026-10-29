import { createHmac } from 'crypto';
import { getSupabase, supabaseConfigured } from './supabase.js';

// Who may do what. Every admin function calls requireRole with one of these.
export const ROLES = {
  STAFF: ['owner', 'sales', 'tech'],
  SALES: ['owner', 'sales'],
  TECH:  ['owner', 'tech'],
  OWNER: ['owner'],
};

// ============================================================
// Legacy single-admin login (ADMIN_EMAIL + ADMIN_PASSWORD_HASH).
// Kept working until LEGACY_ADMIN_LOGIN=off, so the switch to Supabase
// logins can't lock anyone out. A legacy session counts as the owner.
// ============================================================

export function legacyLoginEnabled() {
  return process.env.LEGACY_ADMIN_LOGIN !== 'off'
    && Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && process.env.JWT_SECRET);
}

export function createToken(secret, email) {
  const payload = Buffer.from(JSON.stringify({ email, iat: Date.now() })).toString('base64url');
  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyToken(token, secret) {
  if (!token || !secret) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  if (sig !== expected) return false;
  try {
    const { iat } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return Date.now() - iat < 86_400_000;
  } catch {
    return false;
  }
}

function legacyCookie(req) {
  const cookie = req.headers.cookie || '';
  return cookie.match(/(?:^|;\s*)ds_admin=([^;]+)/)?.[1] || null;
}

function bearer(req) {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7).trim() : null;
}

// ============================================================
// Current staff member
// ============================================================

// Resolves the caller to { id, email, full_name, role, legacy } or null.
export async function getStaff(req) {
  const token = bearer(req);
  if (token && supabaseConfigured()) {
    const sb = getSupabase();
    const { data, error } = await sb.auth.getUser(token);
    if (!error && data?.user) {
      const { data: profile } = await sb
        .from('profiles')
        .select('id, email, full_name, role, active')
        .eq('id', data.user.id)
        .maybeSingle();
      if (profile?.active) {
        return { id: profile.id, email: profile.email, full_name: profile.full_name, role: profile.role, legacy: false };
      }
    }
    // Not a valid staff token: fall through, a legacy cookie may still be good.
  }

  if (legacyLoginEnabled() && verifyToken(legacyCookie(req), process.env.JWT_SECRET)) {
    return { id: null, email: process.env.ADMIN_EMAIL, full_name: 'Admin', role: 'owner', legacy: true };
  }
  return null;
}

// Call first in every admin handler. Sends 401/403 and returns null when the
// caller is not signed in or their role isn't in `roles`.
export async function requireRole(req, res, roles) {
  let staff;
  try {
    staff = await getStaff(req);
  } catch (err) {
    console.error('Auth check failed:', err);
    res.status(500).json({ error: 'Auth check failed' });
    return null;
  }
  if (!staff) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  if (!roles.includes(staff.role)) {
    res.status(403).json({ error: 'Your role does not have access to this.' });
    return null;
  }
  return staff;
}

// ============================================================
// Activity log: who changed what, when. Never blocks the change itself.
// ============================================================
export async function logActivity(staff, action, entityType, entityId, changes = null) {
  if (!supabaseConfigured()) return;
  try {
    const { error } = await getSupabase().from('activity_log').insert({
      actor_id: staff?.id || null,
      action,
      entity_type: entityType,
      entity_id: String(entityId),
      changes: staff?.legacy ? { ...(changes || {}), via: 'legacy-admin-login' } : changes,
    });
    if (error) throw error;
  } catch (err) {
    console.error('Activity log write failed:', err);
  }
}
