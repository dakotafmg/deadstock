import { put } from '@vercel/blob';
import { requireRole, ROLES } from './_lib/auth.js';
import { parseBody } from './_lib/body.js';

const FOLDERS = ['listings', 'repairs'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!(await requireRole(req, res, ROLES.STAFF))) return;

  try {
    const { filename, contentType, data, folder } = await parseBody(req);
    if (!data) return res.status(400).json({ error: 'data required' });

    const dir = FOLDERS.includes(folder) ? folder : 'listings';
    const buffer = Buffer.from(data, 'base64');
    const blob = await put(`${dir}/${Date.now()}-${filename || 'image.jpg'}`, buffer, {
      access: 'public',
      contentType: contentType || 'image/jpeg',
    });

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: err.message });
  }
}
