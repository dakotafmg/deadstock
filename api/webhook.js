import Stripe from 'stripe';
import { parseBody } from './_lib/body.js';
import { getSupabase, supabaseConfigured, must } from './_lib/supabase.js';

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

  // A repair invoice (sent from the repair board) was paid.
  if (event.type === 'invoice.paid' && event.data.object.metadata?.repairJobId && supabaseConfigured()) {
    try {
      await markRepairPaid(event.data.object);
    } catch (err) {
      console.error('Failed to record repair payment:', err);
      return res.status(500).json({ error: 'Failed to record repair payment' });
    }
  }

  res.status(200).json({ received: true });
}

// Records the payment as an order and links it to the job. Safe to run twice:
// Stripe can deliver the same event more than once.
async function markRepairPaid(invoice) {
  const sb = getSupabase();
  // Counter payments are marked paid from the repair page, which records them itself.
  if (invoice.paid_out_of_band) return;
  const job = must(await sb.from('repair_jobs').select('*').eq('id', invoice.metadata.repairJobId).maybeSingle());
  if (!job || job.paid_at) return;

  let order = must(await sb.from('orders').select('id').eq('stripe_invoice_id', invoice.id).maybeSingle());
  if (!order) {
    order = must(await sb.from('orders').insert({
      channel: 'repair',
      stripe_invoice_id: invoice.id,
      customer_id: job.customer_id,
      amount_cents: invoice.amount_paid,
      currency: invoice.currency,
      payment_method: 'card',
    }).select('id').single());
    must(await sb.from('order_items').insert({
      order_id: order.id,
      description: `Repair ${job.job_number}`,
      amount_cents: invoice.amount_paid,
    }));
  }

  must(await sb.from('repair_jobs').update({ order_id: order.id, paid_at: new Date().toISOString() }).eq('id', job.id));
  must(await sb.from('repair_events').insert({
    job_id: job.id, kind: 'note', body: 'Paid online', visible_to_customer: true,
  }));
}
