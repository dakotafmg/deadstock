import Stripe from 'stripe';
import { requireRole, logActivity, ROLES } from './_lib/auth.js';
import { getSupabase, must } from './_lib/supabase.js';
import { parseBody } from './_lib/body.js';
import { sendRepairEmail } from './_lib/email.js';
import { changeStatus, cleanDropoff, findOrCreateCustomer, JOB_SELECT, STATUSES } from './_lib/repairs.js';

// Repair board API. All staff can read; owner and tech can change things.
//   GET   ?view=services          → every service, active or not
//   GET   ?id=<job id>            → one job with services, photos, timeline
//   GET   [?scope=all]            → open jobs (or every job)
//   POST  {action:'create'}       → walk-in intake
//   POST  {action:'note'}         → internal note, or a message emailed to the customer
//   POST  {action:'photo'}        → attach an uploaded photo
//   POST  {action:'invoice'}      → create a Stripe invoice the customer pays online
//   POST  {action:'service-save'} → add or edit a service
//   PATCH {id, ...fields, status} → edit a job and/or move it to a new status
//   PATCH {id, ..., resendQuote}   → email the (updated) quote again while it's waiting on the customer

const EDITABLE = ['instrument_brand', 'instrument_model', 'instrument_serial', 'issue',
  'quote_cents', 'quote_notes', 'promised_at', 'assigned_to', 'dropoff_location', 'tag_number'];

export default async function handler(req, res) {
  const staff = await requireRole(req, res, req.method === 'GET' ? ROLES.STAFF : ROLES.TECH);
  if (!staff) return;

  try {
    const sb = getSupabase();

    if (req.method === 'GET') {
      if (req.query?.view === 'services') {
        return res.status(200).json({ services: must(await sb.from('repair_services').select('*').order('sort_order')) });
      }
      if (req.query?.id) return res.status(200).json(await loadJob(sb, req.query.id));

      let q = sb.from('repair_jobs')
        .select('id, job_number, tag_number, dropoff_location, status, instrument_brand, instrument_model, issue, quote_cents, promised_at, created_at, updated_at, paid_at, assigned_to, customer:customers(name, email, phone), assignee:profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(200);
      if (req.query?.scope !== 'all') q = q.not('status', 'in', '(picked_up,declined)');
      return res.status(200).json({ jobs: must(await q) });
    }

    if (req.method === 'PATCH') {
      const body = await parseBody(req);
      if (!body.id) return res.status(400).json({ error: 'id required' });
      let job = must(await sb.from('repair_jobs').select(JOB_SELECT).eq('id', body.id).maybeSingle());
      if (!job) return res.status(404).json({ error: 'Job not found' });

      const patch = {};
      for (const k of EDITABLE) if (body[k] !== undefined) patch[k] = body[k] === '' ? null : body[k];
      if (patch.quote_cents != null) patch.quote_cents = Math.round(Number(patch.quote_cents));
      if (Number.isNaN(patch.quote_cents)) return res.status(400).json({ error: 'Quote must be a number' });
      if (patch.dropoff_location !== undefined) patch.dropoff_location = cleanDropoff(patch.dropoff_location);
      if (patch.tag_number) patch.tag_number = String(patch.tag_number).trim().slice(0, 40) || null;
      if (Object.keys(patch).length) {
        job = must(await sb.from('repair_jobs').update(patch).eq('id', job.id).select(JOB_SELECT).single());
      }

      let email = null;
      if (body.status && body.status !== job.status) {
        if (!STATUSES.includes(body.status)) return res.status(400).json({ error: 'Unknown status' });
        job = await changeStatus(sb, job, body.status, { actorId: staff.id, note: body.note || null });
        email = job.emailResult || null;
      } else if (body.resendQuote) {
        if (job.status !== 'quoted') return res.status(409).json({ error: 'Only a quote waiting on the customer can be resent.' });
        if (job.quote_cents == null) return res.status(400).json({ error: 'Add a quote amount first.' });
        must(await sb.from('repair_events').insert({
          job_id: job.id, actor_id: staff.id, kind: 'note',
          body: `Quote sent again: $${(job.quote_cents / 100).toFixed(2)}`, visible_to_customer: true,
        }));
        email = await sendRepairEmail('quoted', job, job.customer);
      }

      await logActivity(staff, 'repair.update', 'repair_job', job.id, {
        ...patch, ...(body.status ? { status: body.status } : {}), ...(body.resendQuote ? { resendQuote: true } : {}),
      });
      return res.status(200).json({ ...(await loadJob(sb, job.id)), email });
    }

    if (req.method !== 'POST') return res.status(405).end();
    const body = await parseBody(req);

    if (body.action === 'create') {
      if (!body.name || !body.issue) return res.status(400).json({ error: 'Customer name and the issue are required' });
      const customer = await findOrCreateCustomer(sb, { name: body.name, email: body.email, phone: body.phone });
      const now = new Date().toISOString();
      const job = must(await sb.from('repair_jobs').insert({
        customer_id: customer.id,
        instrument_brand: body.brand || '',
        instrument_model: body.model || '',
        instrument_serial: body.serial || null,
        issue: body.issue,
        dropoff_location: cleanDropoff(body.dropoff_location) || 'shop',
        tag_number: String(body.tag_number || '').trim().slice(0, 40) || null,
        status: 'received',
        received_at: now,
        promised_at: body.promised_at || null,
        assigned_to: body.assigned_to || null,
      }).select('*').single());

      if (Array.isArray(body.serviceIds) && body.serviceIds.length) {
        const services = must(await sb.from('repair_services').select('id, starting_price_cents').in('id', body.serviceIds));
        if (services.length) {
          must(await sb.from('repair_job_services').insert(services.map(s => ({
            job_id: job.id, service_id: s.id, price_cents: s.starting_price_cents ?? 0,
          }))));
        }
      }
      const photos = (body.photos || []).filter(u => typeof u === 'string' && u.startsWith('https://'));
      if (photos.length) {
        must(await sb.from('repair_photos').insert(photos.map(url => ({ job_id: job.id, url, stage: 'intake', uploaded_by: staff.id }))));
      }
      must(await sb.from('repair_events').insert({
        job_id: job.id, actor_id: staff.id, kind: 'status', to_status: 'received',
        body: 'Checked in at the shop', visible_to_customer: true,
      }));
      const email = await sendRepairEmail('received', job, customer);
      await logActivity(staff, 'repair.create', 'repair_job', job.id, { job_number: job.job_number });
      return res.status(201).json({ ...(await loadJob(sb, job.id)), email });
    }

    if (body.action === 'note') {
      const text = String(body.body || '').trim();
      if (!body.id || !text) return res.status(400).json({ error: 'id and body required' });
      const job = must(await sb.from('repair_jobs').select(JOB_SELECT).eq('id', body.id).maybeSingle());
      if (!job) return res.status(404).json({ error: 'Job not found' });
      const toCustomer = Boolean(body.toCustomer);
      must(await sb.from('repair_events').insert({
        job_id: job.id, actor_id: staff.id, kind: toCustomer ? 'message' : 'note',
        body: text, visible_to_customer: toCustomer,
      }));
      const email = toCustomer ? await sendRepairEmail('message', job, job.customer, { body: text }) : null;
      return res.status(201).json({ ...(await loadJob(sb, job.id)), email });
    }

    if (body.action === 'photo') {
      if (!body.id || typeof body.url !== 'string' || !body.url.startsWith('https://')) {
        return res.status(400).json({ error: 'id and url required' });
      }
      const stage = ['intake', 'progress', 'final'].includes(body.stage) ? body.stage : 'progress';
      must(await sb.from('repair_photos').insert({ job_id: body.id, url: body.url, stage, uploaded_by: staff.id }));
      return res.status(201).json(await loadJob(sb, body.id));
    }

    if (body.action === 'invoice') {
      const job = must(await sb.from('repair_jobs').select(JOB_SELECT).eq('id', body.id).maybeSingle());
      if (!job) return res.status(404).json({ error: 'Job not found' });
      if (job.paid_at) return res.status(409).json({ error: 'This job is already paid.' });
      const amount = Math.round(Number(body.amount_cents ?? job.quote_cents));
      if (!amount || amount < 50) return res.status(400).json({ error: 'Set an invoice amount of at least $0.50' });

      const updated = await createRepairInvoice(sb, job, amount);
      const email = await sendRepairEmail('invoice', updated, updated.customer);
      must(await sb.from('repair_events').insert({
        job_id: job.id, actor_id: staff.id, kind: 'note',
        body: `Invoice sent for $${(amount / 100).toFixed(2)}`, visible_to_customer: true,
      }));
      await logActivity(staff, 'repair.invoice', 'repair_job', job.id, { amount_cents: amount, invoice: updated.stripe_invoice_id });
      return res.status(201).json({ ...(await loadJob(sb, job.id)), email });
    }

    if (body.action === 'service-save') {
      const s = body.service || {};
      if (!s.name) return res.status(400).json({ error: 'Service name required' });
      const row = {
        name: s.name,
        description: s.description || '',
        starting_price_cents: s.starting_price_cents === '' || s.starting_price_cents == null ? null : Math.round(Number(s.starting_price_cents)),
        est_days: s.est_days === '' || s.est_days == null ? null : Math.round(Number(s.est_days)),
        active: s.active !== false,
        sort_order: Number(s.sort_order) || 0,
      };
      const saved = s.id
        ? must(await sb.from('repair_services').update(row).eq('id', s.id).select().single())
        : must(await sb.from('repair_services').insert(row).select().single());
      await logActivity(staff, 'repair_service.save', 'repair_service', saved.id, row);
      return res.status(200).json({ service: saved });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    if (err.status !== 400) console.error(err);
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function loadJob(sb, id) {
  const [job, services, photos, events, staffList] = await Promise.all([
    sb.from('repair_jobs').select('*, customer:customers(*), assignee:profiles(id, full_name)').eq('id', id).maybeSingle(),
    sb.from('repair_job_services').select('price_cents, notes, service:repair_services(id, name)').eq('job_id', id),
    sb.from('repair_photos').select('*').eq('job_id', id).order('created_at'),
    sb.from('repair_events').select('*, actor:profiles(full_name)').eq('job_id', id).order('created_at'),
    sb.from('profiles').select('id, full_name, role').eq('active', true).in('role', ['owner', 'tech']).order('full_name'),
  ]);
  return {
    job: must(job),
    services: must(services),
    photos: must(photos),
    events: must(events),
    techs: must(staffList),
  };
}

// One invoice per job. Re-sending voids the previous unpaid one so the
// customer never has two live links.
async function createRepairInvoice(sb, job, amount) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const customer = job.customer;

  let stripeCustomerId = customer.stripe_customer_id;
  if (!stripeCustomerId) {
    if (customer.email) {
      const { data } = await stripe.customers.list({ email: customer.email, limit: 1 });
      stripeCustomerId = data[0]?.id;
    }
    if (!stripeCustomerId) {
      const created = await stripe.customers.create({
        name: customer.name || undefined,
        email: customer.email || undefined,
        phone: customer.phone || undefined,
      });
      stripeCustomerId = created.id;
    }
    must(await sb.from('customers').update({ stripe_customer_id: stripeCustomerId }).eq('id', customer.id));
  }

  if (job.stripe_invoice_id) {
    try {
      const old = await stripe.invoices.retrieve(job.stripe_invoice_id);
      if (old.status === 'open') await stripe.invoices.voidInvoice(old.id);
    } catch (err) {
      console.error('Could not void previous repair invoice:', err.message);
    }
  }

  const instrument = [job.instrument_brand, job.instrument_model].filter(Boolean).join(' ');
  const invoice = await stripe.invoices.create({
    customer: stripeCustomerId,
    collection_method: 'send_invoice',
    days_until_due: 14,
    auto_advance: false,
    description: `Repair ${job.job_number}${instrument ? ` · ${instrument}` : ''}`,
    metadata: { repairJobId: job.id, jobNumber: job.job_number },
  });
  await stripe.invoiceItems.create({
    customer: stripeCustomerId,
    invoice: invoice.id,
    amount,
    currency: 'usd',
    description: `Repair ${job.job_number}${instrument ? `: ${instrument}` : ''}`,
  });
  const finalized = await stripe.invoices.finalizeInvoice(invoice.id);

  return must(await sb.from('repair_jobs').update({
    stripe_invoice_id: finalized.id,
    invoice_url: finalized.hosted_invoice_url,
    invoice_amount_cents: amount,
  }).eq('id', job.id).select(JOB_SELECT).single());
}
