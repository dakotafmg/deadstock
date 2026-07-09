import Stripe from 'stripe';
import { parseBody } from './_body.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await parseBody(req);
  const siteUrl = process.env.SITE_URL || `https://${process.env.VERCEL_URL}`;

  let lineItems, productIds, productNames;
  if (body.items && Array.isArray(body.items) && body.items.length > 0) {
    lineItems = body.items.map(item => ({ price: item.priceId, quantity: 1 }));
    productIds = body.items.map(i => i.productId).filter(Boolean).join(',');
    productNames = body.items.map(i => i.name || '').join(',');
  } else if (body.priceId) {
    lineItems = [{ price: body.priceId, quantity: 1 }];
    productIds = body.productId || '';
    productNames = body.productName || '';
  } else {
    return res.status(400).json({ error: 'items or priceId required' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ['US', 'CA'] },
      success_url: `${siteUrl}/shop?checkout=success`,
      cancel_url: `${siteUrl}/shop`,
      metadata: { productIds, productNames },
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
