import { put } from '@vercel/blob';
import { getSupabase, supabaseConfigured, must } from './_lib/supabase.js';
import { parseBody } from './_lib/body.js';
import { sendRepairEmail } from './_lib/email.js';
import { changeStatus, findOrCreateCustomer, publicJobView, JOB_SELECT } from './_lib/repairs.js';

// Public repairs API (no login).
//   GET  ?view=info          → active services + shop phone/email for /repairs
//   GET  ?token=<uuid>       → one job's status, for the customer's private link
//   POST {action:'request'}  → new repair request from the /repairs form
//   POST {action:'respond'}  → customer approves or declines a quote

const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 1_500_000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Best-effort spam brake, same idea as the admin login limiter.
const requests = new Map();
const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 60 * 1000;

function tooMany(ip) {
  const now = Date.now();
  const rec = requests.get(ip) || { count: 0, first: now };
  if (now - rec.first > WINDOW_MS) { rec.count = 0; rec.first = now; }
  rec.count++;
  requests.set(ip, rec);
  return rec.count > MAX_REQUESTS;
}

const clip = (v, n) => (v == null ? '' : String(v).trim().slice(0, n));

export default async function handler(req, res) {
  // Before Supabase is connected the page shows contact details instead of the form.
  if (!supabaseConfigured()) {
    if (req.method === 'GET' && req.query?.view === 'info') return res.status(200).json({ open: false, services: [], phone: null, email: null });
    return res.status(503).json({ error: 'Online repair requests are not open yet. Please call or email the shop.' });
  }

  try {
    const sb = getSupabase();

    if (req.method === 'GET') {
      if (req.query?.view === 'info') {
        const [services, settings] = await Promise.all([
          sb.from('repair_services').select('id, name, description, starting_price_cents, est_days')
            .eq('active', true).order('sort_order'),
          sb.from('site_settings').select('key, value').in('key', ['phone', 'contact_email']),
        ]);
        const s = Object.fromEntries((must(settings) || []).map(r => [r.key, r.value]));
        res.setHeader('Cache-Control', 's-maxage=300'); // Vercel's edge caches it; browsers don't
        return res.status(200).json({ open: true, services: must(services), phone: s.phone || null, email: s.contact_email || null });
      }

      const token = req.query?.token;
      if (!token || !UUID_RE.test(token)) return res.status(404).json({ error: 'Not found' });
      const job = must(await sb.from('repair_jobs').select('*').eq('public_token', token).maybeSingle());
      if (!job) return res.status(404).json({ error: 'Not found' });
      const events = must(await sb.from('repair_events').select('*').eq('job_id', job.id).order('created_at'));
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ job: publicJobView(job, events) });
    }

    if (req.method !== 'POST') return res.status(405).end();
    const body = await parseBody(req);

    if (body.action === 'respond') {
      if (!body.token || !UUID_RE.test(body.token)) return res.status(404).json({ error: 'Not found' });
      const job = must(await sb.from('repair_jobs').select(JOB_SELECT).eq('public_token', body.token).maybeSingle());
      if (!job) return res.status(404).json({ error: 'Not found' });
      if (job.status !== 'quoted') return res.status(409).json({ error: 'This quote has already been answered.' });
      const to = body.approve ? 'approved' : 'declined';
      const updated = await changeStatus(sb, job, to, {
        note: body.approve ? 'Quote approved by customer' : 'Quote declined by customer',
      });
      const events = must(await sb.from('repair_events').select('*').eq('job_id', job.id).order('created_at'));
      return res.status(200).json({ job: publicJobView(updated, events) });
    }

    if (body.action !== 'request') return res.status(400).json({ error: 'Unknown action' });

    // Honeypot: real people never see or fill the "website" field.
    if (body.website) return res.status(200).json({ ok: true });

    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
    if (tooMany(ip)) return res.status(429).json({ error: 'Too many requests. Please call or email us instead.' });

    const name = clip(body.name, 120);
    const email = clip(body.email, 200);
    const phone = clip(body.phone, 40);
    const issue = clip(body.issue, 4000);
    if (!name) return res.status(400).json({ error: 'Please add your name.' });
    if (!email && !phone) return res.status(400).json({ error: 'Please add an email or phone number.' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'That email address looks wrong.' });
    if (!issue) return res.status(400).json({ error: 'Tell us what needs fixing.' });

    const photos = (Array.isArray(body.photos) ? body.photos : []).slice(0, MAX_PHOTOS)
      .map(p => Buffer.from(String(p?.data || ''), 'base64'))
      .filter(b => b.length > 0);
    if (photos.some(b => b.length > MAX_PHOTO_BYTES)) {
      return res.status(400).json({ error: 'One of the photos is too large.' });
    }

    const customer = await findOrCreateCustomer(sb, { name, email, phone });

    const job = must(await sb.from('repair_jobs').insert({
      customer_id: customer.id,
      instrument_brand: clip(body.brand, 80),
      instrument_model: clip(body.model, 120),
      instrument_serial: clip(body.serial, 80) || null,
      issue,
    }).select('*').single());

    // Services the customer ticked, priced at today's starting price.
    const serviceIds = (Array.isArray(body.serviceIds) ? body.serviceIds : []).filter(id => UUID_RE.test(id)).slice(0, 10);
    if (serviceIds.length) {
      const services = must(await sb.from('repair_services').select('id, starting_price_cents')
        .in('id', serviceIds).eq('active', true));
      if (services.length) {
        must(await sb.from('repair_job_services').insert(services.map(s => ({
          job_id: job.id, service_id: s.id, price_cents: s.starting_price_cents ?? 0,
        }))));
      }
    }

    // Photos go to Vercel Blob; a failed upload doesn't lose the request.
    for (let i = 0; i < photos.length; i++) {
      try {
        const blob = await put(`repairs/${job.job_number}/intake-${Date.now()}-${i + 1}.jpg`, photos[i], {
          access: 'public', contentType: 'image/jpeg',
        });
        must(await sb.from('repair_photos').insert({ job_id: job.id, url: blob.url, stage: 'intake' }));
      } catch (err) {
        console.error(`Repair photo upload failed for ${job.job_number}:`, err);
      }
    }

    must(await sb.from('repair_events').insert({
      job_id: job.id, kind: 'status', to_status: 'requested',
      body: 'Request submitted online', visible_to_customer: true,
    }));

    await sendRepairEmail('requested', job, customer);

    return res.status(201).json({ job_number: job.job_number, status_url: `/repair/${job.public_token}` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong. Please try again or give us a call.' });
  }
}
