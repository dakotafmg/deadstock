import Stripe from 'stripe';
import { parseBody } from './_body.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let eventId;
  try {
    const body = await parseBody(req);
    eventId = body.id;
    if (!eventId) return res.status(400).json({ error: 'Missing event id' });
  } catch (err) {
    return res.status(400).json({ error: 'Bad request body' });
  }

  // Verify authenticity by re-fetching the event from Stripe using our secret key.
  // An attacker cannot forge a valid Stripe event ID.
  let event;
  try {
    event = await stripe.events.retrieve(eventId);
  } catch (err) {
    console.error('Could not retrieve event:', err.message);
    return res.status(400).json({ error: 'Invalid event' });
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
