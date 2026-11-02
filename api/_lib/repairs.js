import { must } from './supabase.js';
import { sendRepairEmail } from './email.js';

// Shared repair-job rules, used by the public repairs function, the admin
// repair board and the Stripe webhook.

export const STATUSES = [
  'requested', 'received', 'quoted', 'approved',
  'in_progress', 'ready', 'picked_up', 'declined',
];

// Where an instrument can be dropped off. Null means not decided yet.
export const DROPOFF_LOCATIONS = ['shop', 'music_garage'];
export const cleanDropoff = (v) => (DROPOFF_LOCATIONS.includes(v) ? v : null);

// Status changes that email the customer.
const EMAIL_ON = { received: 'received', quoted: 'quoted', ready: 'ready' };

export const JOB_SELECT = '*, customer:customers(*)';

// A request the shop's rules don't allow; handlers answer it with a 400.
export class RepairRuleError extends Error {
  constructor(message) { super(message); this.status = 400; }
}

// Moves a job to a new status: stamps the matching date, records the change
// on the job's timeline, and emails the customer when the step calls for it.
// actorId is null for changes made by the customer or the system.
export async function changeStatus(sb, job, to, { actorId = null, note = null } = {}) {
  if (!STATUSES.includes(to)) throw new RepairRuleError(`Unknown status: ${to}`);
  if (to === job.status) return job;
  if (to === 'quoted' && job.quote_cents == null) {
    throw new RepairRuleError('Add a quote amount before marking the job quoted.');
  }

  const now = new Date().toISOString();
  const patch = { status: to };
  if (to === 'received' && !job.received_at) patch.received_at = now;
  if (to === 'ready' && !job.completed_at) patch.completed_at = now;
  if (to === 'picked_up' && !job.picked_up_at) patch.picked_up_at = now;

  const updated = must(await sb.from('repair_jobs').update(patch).eq('id', job.id).select(JOB_SELECT).single());

  must(await sb.from('repair_events').insert({
    job_id: job.id,
    actor_id: actorId,
    kind: 'status',
    from_status: job.status,
    to_status: to,
    body: note,
    visible_to_customer: true,
  }));

  // Not a database column: lets the caller tell staff whether the email went.
  if (EMAIL_ON[to]) updated.emailResult = await sendRepairEmail(EMAIL_ON[to], updated, updated.customer);
  return updated;
}

// What the customer's private status page may see. No internal notes, no
// staff names, no other customers' data.
export function publicJobView(job, events) {
  const showQuote = ['quoted', 'approved', 'in_progress', 'ready', 'picked_up', 'declined'].includes(job.status);
  return {
    job_number: job.job_number,
    status: job.status,
    instrument: [job.instrument_brand, job.instrument_model].filter(Boolean).join(' '),
    issue: job.issue,
    dropoff_location: job.dropoff_location,
    quote_cents: showQuote ? job.quote_cents : null,
    quote_notes: showQuote ? job.quote_notes : null,
    invoice_url: job.paid_at ? null : job.invoice_url,
    invoice_amount_cents: job.invoice_amount_cents,
    paid: Boolean(job.paid_at),
    created_at: job.created_at,
    received_at: job.received_at,
    promised_at: job.promised_at,
    completed_at: job.completed_at,
    picked_up_at: job.picked_up_at,
    timeline: (events || [])
      .filter(e => e.visible_to_customer)
      .map(e => ({ kind: e.kind, to_status: e.to_status, body: e.body, created_at: e.created_at })),
  };
}

// Finds a customer by email or creates one. Emails are stored lowercased.
export async function findOrCreateCustomer(sb, { name, email, phone }) {
  const cleanEmail = email ? String(email).trim().toLowerCase() : null;
  if (cleanEmail) {
    const existing = must(await sb.from('customers').select('*').eq('email', cleanEmail).maybeSingle());
    if (existing) {
      const patch = {};
      if (name && !existing.name) patch.name = name;
      if (phone && !existing.phone) patch.phone = phone;
      if (Object.keys(patch).length) {
        return must(await sb.from('customers').update(patch).eq('id', existing.id).select().single());
      }
      return existing;
    }
  }
  return must(await sb.from('customers').insert({
    name: name || '',
    email: cleanEmail,
    phone: phone || null,
  }).select().single());
}

// A repair invoice was paid online: records it as an order and marks the job
// paid. Called by the Stripe webhook, and by the repair page as a backup when
// the webhook didn't arrive. Safe to run more than once.
export async function recordInvoicePaid(sb, invoice) {
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
