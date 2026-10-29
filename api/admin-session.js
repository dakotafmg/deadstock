import bcrypt from 'bcryptjs';
import { createToken, getStaff, legacyLoginEnabled } from './_lib/auth.js';
import { parseBody } from './_lib/body.js';

// One function for the admin session (replaces admin-check, admin-login and
// admin-logout, which keeps the project under Vercel's function limit).
//   GET    → who is signed in: { id, email, full_name, role, legacy }
//   POST   → legacy email + password login (until LEGACY_ADMIN_LOGIN=off)
//   DELETE → clear the legacy cookie
// Supabase logins happen in the browser; this only reads their token.

// In-memory rate limiting — best-effort in serverless (resets on cold start)
// but still catches rapid sequential attempts on warm instances.
const attempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(ip) {
  const now = Date.now();
  const rec = attempts.get(ip) || { count: 0, first: now };
  if (now - rec.first > WINDOW_MS) { rec.count = 0; rec.first = now; }
  attempts.set(ip, rec);
  return rec.count >= MAX_ATTEMPTS;
}

function recordFailure(ip) {
  const rec = attempts.get(ip) || { count: 0, first: Date.now() };
  rec.count++;
  attempts.set(ip, rec);
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const staff = await getStaff(req);
      if (!staff) return res.status(401).json({ error: 'Unauthorized' });
      return res.status(200).json({ staff });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Session check failed' });
    }
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', 'ds_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') return res.status(405).end();

  if (!legacyLoginEnabled()) {
    return res.status(404).json({ error: 'Legacy login is turned off.' });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress
    || 'unknown';

  if (checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  }

  const { email, password } = await parseBody(req);

  const emailMatch = email && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
  const passwordMatch = emailMatch && password
    ? await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)
    : false;

  if (!emailMatch || !passwordMatch) {
    recordFailure(ip);
    // Deliberate vague message — don't reveal whether email or password was wrong
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  attempts.delete(ip);

  const token = createToken(process.env.JWT_SECRET, email);
  res.setHeader('Set-Cookie',
    `ds_admin=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
  );
  return res.status(200).json({ ok: true });
}
