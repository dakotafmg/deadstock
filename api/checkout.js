import Stripe from 'stripe';
import { parseBody } from './_body.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { priceId, productId } = await parseBody(req);

  if (!priceId) return res.status(400).json({ error: 'priceId required' });

  const siteUrl = process.env.SITE_URL || `https://${process.env.VERCEL_URL}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      automatic_payment_methods: { enabled: true },
      shipping_address_collection: { allowed_countries: ['US', 'CA'] },
      success_url: `${siteUrl}/shop?checkout=success`,
      cancel_url: `${siteUrl}/shop`,
      metadata: { productId: productId || '' },
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
