import { createToken } from './_auth.js';
import { parseBody } from './_body.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = await parseBody(req);

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = createToken(process.env.JWT_SECRET);
  res.status(200).json({ token });
}
