import { put } from '@vercel/blob';
import { verifyToken, getToken } from './_auth.js';
import { parseBody } from './_body.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!verifyToken(getToken(req), process.env.JWT_SECRET)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { filename, contentType, data } = await parseBody(req);
  if (!data) return res.status(400).json({ error: 'data required' });

  const buffer = Buffer.from(data, 'base64');
  const blob = await put(`listings/${Date.now()}-${filename || 'image.jpg'}`, buffer, {
    access: 'public',
    contentType: contentType || 'image/jpeg',
  });

  return res.status(200).json({ url: blob.url });
}
