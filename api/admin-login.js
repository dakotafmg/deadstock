import bcrypt from 'bcryptjs';
import { createToken } from './_auth.js';
import { parseBody } from './_body.js';

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

function clearAttempts(ip) {
  attempts.delete(ip);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress
    || 'unknown';

  if (checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  }

  const { email, password } = await parseBody(req);

  const emailMatch = email && process.env.ADMIN_EMAIL
    && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();

  const passwordMatch = emailMatch && password && process.env.ADMIN_PASSWORD_HASH
    ? await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)
    : false;

  if (!emailMatch || !passwordMatch) {
    recordFailure(ip);
    // Deliberate vague message — don't reveal whether email or password was wrong
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  clearAttempts(ip);

  const token = createToken(process.env.JWT_SECRET, email);

  res.setHeader('Set-Cookie',
    `ds_admin=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
  );
  return res.status(200).json({ ok: true });
}
