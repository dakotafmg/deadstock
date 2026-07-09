import { verifyToken, getToken } from './_auth.js';

export default async function handler(req, res) {
  if (verifyToken(getToken(req), process.env.JWT_SECRET)) {
    return res.status(200).json({ ok: true });
  }
  return res.status(401).json({ error: 'Unauthorized' });
}
