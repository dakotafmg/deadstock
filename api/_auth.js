import { createHmac } from 'crypto';

export function createToken(secret) {
  const payload = Buffer.from(JSON.stringify({ iat: Date.now() })).toString('base64url');
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

export function getToken(req) {
  return (req.headers.authorization || '').replace('Bearer ', '').trim();
}
