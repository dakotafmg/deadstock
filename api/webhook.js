import Stripe from 'stripe';
import { parseRawBody } from './_body.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const rawBody = await parseRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const ids = (session.metadata?.productIds || session.metadata?.productId || '')
      .split(',').filter(Boolean);
    for (const productId of ids) {
      try {
        await stripe.products.update(productId, { metadata: { available: 'false' } });
      } catch (err) {
        console.error(`Failed to mark product ${productId} sold:`, err);
      }
    }
  }

  res.status(200).json({ received: true });
}
