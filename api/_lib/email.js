// Customer emails for repairs, sent through Resend (https://resend.com).
// With no RESEND_API_KEY set, emails are skipped and logged, so everything
// else keeps working before the email account exists.

const FROM = () => process.env.REPAIRS_FROM_EMAIL || 'Deadstock Repairs <repairs@deadstockguitars.com>';
const REPLY_TO = () => process.env.REPAIRS_REPLY_TO || undefined;

export function siteUrl() {
  return process.env.SITE_URL || `https://${process.env.VERCEL_URL}`;
}

export function statusLink(job) {
  return `${siteUrl()}/repair/${job.public_token}`;
}

const money = (cents) => '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

// One template per moment the customer hears from us.
const TEMPLATES = {
  requested: (job) => ({
    subject: `We got your repair request (${job.job_number})`,
    lines: [
      `Thanks for reaching out about your ${instrument(job)}.`,
      `We'll look over what you sent and get back to you about drop-off. Your job number is ${job.job_number}.`,
    ],
  }),
  received: (job) => ({
    subject: `Your ${instrument(job)} is in the shop (${job.job_number})`,
    lines: [
      `Your ${instrument(job)} is checked in at the shop.`,
      `We'll take a look and send you a quote before doing any work.`,
    ],
  }),
  quoted: (job) => ({
    subject: `Your repair quote: ${money(job.quote_cents)} (${job.job_number})`,
    lines: [
      `Here's our quote for your ${instrument(job)}: ${money(job.quote_cents)}.`,
      job.quote_notes || '',
      `Open your status page to approve or decline it.`,
    ],
  }),
  ready: (job) => ({
    subject: `Your ${instrument(job)} is ready for pickup (${job.job_number})`,
    lines: [
      `Good news: your ${instrument(job)} is ready.`,
      job.invoice_url ? `You can pay ahead of time from your status page, or when you pick it up.` : '',
    ],
  }),
  invoice: (job) => ({
    subject: `Invoice for your repair (${job.job_number})`,
    lines: [
      `Your invoice for ${money(job.invoice_amount_cents)} is ready.`,
      `Pay it here: ${job.invoice_url}`,
    ],
  }),
  message: (job, extra) => ({
    subject: `An update on your repair (${job.job_number})`,
    lines: [extra?.body || ''],
  }),
};

function instrument(job) {
  return [job.instrument_brand, job.instrument_model].filter(Boolean).join(' ') || 'instrument';
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// kind: a key of TEMPLATES. Returns true when sent.
export async function sendRepairEmail(kind, job, customer, extra) {
  if (!customer?.email) return false;
  const tpl = TEMPLATES[kind]?.(job, extra);
  if (!tpl) return false;

  const link = statusLink(job);
  const lines = tpl.lines.filter(Boolean);
  const text = [`Hi ${customer.name || 'there'},`, '', ...lines, '', `Check your repair any time: ${link}`, '', 'Deadstock Guitars'].join('\n');
  const html = `<p>Hi ${escapeHtml(customer.name || 'there')},</p>`
    + lines.map(l => `<p>${escapeHtml(l)}</p>`).join('')
    + `<p><a href="${link}">Check your repair status</a></p><p>Deadstock Guitars</p>`;

  if (!process.env.RESEND_API_KEY) {
    console.log(`[email skipped: no RESEND_API_KEY] ${kind} → ${customer.email}: ${tpl.subject}`);
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM(),
        to: [customer.email],
        reply_to: REPLY_TO(),
        subject: tpl.subject,
        text,
        html,
      }),
    });
    if (!res.ok) {
      console.error('Resend error:', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('Email send failed:', err);
    return false;
  }
}
