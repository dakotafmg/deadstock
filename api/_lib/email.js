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
//   heading: the big line at the top      lines: short paragraphs
//   amount:  a price shown in a box        notes: the quote's "what it covers"
//   cta:     the main button (defaults to the customer's status page)
export const TEMPLATES = {
  requested: (job) => ({
    subject: `We got your repair request (${job.job_number})`,
    heading: 'We got your request.',
    lines: [
      `Thanks for reaching out about your ${instrument(job)}.`,
      job.dropoff_location === 'music_garage'
        ? `You can drop it off at Fortville Music Garage. Mention job ${job.job_number} and they'll tag it for us.`
        : job.dropoff_location === 'shop'
          ? `Bring it by the Deadstock shop whenever suits you, and mention job ${job.job_number}.`
          : `We'll look over what you sent and get back to you about drop-off.`,
    ],
  }),
  received: (job) => ({
    subject: `Your ${instrument(job)} is in the shop (${job.job_number})`,
    heading: "It's on our bench.",
    lines: [
      `Your ${instrument(job)} is checked in at the shop.`,
      `We'll take a look and send you a quote before doing any work.`,
    ],
  }),
  quoted: (job) => ({
    subject: `Your repair quote: ${money(job.quote_cents)} (${job.job_number})`,
    heading: 'Your quote is ready.',
    lines: [`Here's what we'd charge to take care of your ${instrument(job)}. Nothing gets done until you approve it.`],
    amount: { label: 'Quote', cents: job.quote_cents },
    notes: job.quote_notes,
    cta: { label: 'Approve or decline' },
  }),
  ready: (job) => ({
    subject: `Your ${instrument(job)} is ready for pickup (${job.job_number})`,
    heading: 'Ready for pickup.',
    lines: [
      `Good news: your ${instrument(job)} is done and waiting for you.`,
      job.invoice_url && !job.paid_at ? `You can pay ahead of time online, or when you pick it up.` : '',
    ],
    cta: job.invoice_url && !job.paid_at ? { label: 'Pay online', url: job.invoice_url } : undefined,
  }),
  invoice: (job) => ({
    subject: `Invoice for your repair (${job.job_number})`,
    heading: 'Your invoice.',
    lines: [`Here's the invoice for your ${instrument(job)}. You can pay it securely online.`],
    amount: { label: 'Amount due', cents: job.invoice_amount_cents },
    cta: { label: 'Pay invoice', url: job.invoice_url },
  }),
  message: (job, extra) => ({
    subject: `An update on your repair (${job.job_number})`,
    heading: 'A note from the shop.',
    lines: [extra?.body || ''],
  }),
};

function instrument(job) {
  return [job.instrument_brand, job.instrument_model].filter(Boolean).join(' ') || 'instrument';
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Plain text keeps line breaks; HTML needs them as <br>.
const htmlText = (s) => escapeHtml(s).replace(/\n/g, '<br>');

// Site colours (src/styles/global.css), inlined because email apps ignore stylesheets.
const C = { cream: '#F2E6C9', paper: '#FBF6EA', black: '#121212', walnut: '#3B2A1E', tobacco: '#7A4A20', amber: '#D28400', rule: '#DCCDAA', steel: '#6F7276' };
const SANS = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const SERIF = "'Iowan Old Style', 'Hoefler Text', Georgia, serif";

// Builds the email in tables with inline styles, which is what Gmail, Outlook and
// Apple Mail all render the same way.
export function renderRepairEmail(tpl, job, customer) {
  const status = statusLink(job);
  const cta = tpl.cta ? { url: tpl.cta.url || status, label: tpl.cta.label } : { url: status, label: 'Check your repair' };
  const lines = tpl.lines.filter(Boolean);
  const name = customer.name || 'there';

  const text = [
    `Hi ${name},`, '',
    ...lines.flatMap(l => [l, '']),
    ...(tpl.amount?.cents != null ? [`${tpl.amount.label}: ${money(tpl.amount.cents)}`, ''] : []),
    ...(tpl.notes ? [tpl.notes, ''] : []),
    `${cta.label}: ${cta.url}`,
    ...(cta.url !== status ? [`Your repair status: ${status}`] : []),
    '', `Job ${job.job_number}`, 'Deadstock Guitars, Fortville, Indiana',
  ].join('\n');

  const p = (inner, extra = '') => `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:1.6;color:${C.walnut};${extra}">${inner}</p>`;

  const amountBox = tpl.amount?.cents != null ? `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;border:1px solid ${C.rule};background:${C.cream};">
            <tr><td style="padding:20px 24px;">
              <div style="font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.tobacco};font-weight:600;">${escapeHtml(tpl.amount.label)}</div>
              <div style="font-family:${SANS};font-size:36px;font-weight:600;letter-spacing:-1px;color:${C.black};margin-top:6px;">${money(tpl.amount.cents)}</div>
              ${tpl.notes ? `<div style="font-family:${SANS};font-size:15px;line-height:1.6;color:${C.walnut};margin-top:12px;padding-top:12px;border-top:1px solid ${C.rule};">${htmlText(tpl.notes)}</div>` : ''}
            </td></tr>
          </table>` : (tpl.notes ? p(htmlText(tpl.notes)) : '');

  const button = `
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 8px;">
            <tr><td style="background:${C.amber};border-radius:2px;">
              <a href="${escapeHtml(cta.url)}" style="display:inline-block;padding:14px 28px;font-family:${SANS};font-size:15px;font-weight:600;color:${C.black};text-decoration:none;">${escapeHtml(cta.label)} &rarr;</a>
            </td></tr>
          </table>
          ${cta.url !== status ? p(`<a href="${escapeHtml(status)}" style="color:${C.tobacco};">See your repair status</a>`, `font-size:14px;margin-top:12px;`) : ''}`;

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(tpl.subject)}</title></head>
<body style="margin:0;padding:0;background:${C.cream};">
  <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(lines[0] || tpl.heading)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="padding:0 4px 24px;">
          <img src="${siteUrl()}/assets/wordmark.png" width="150" alt="Deadstock Guitars" style="display:block;width:150px;height:auto;border:0;">
        </td></tr>
        <tr><td style="background:${C.paper};border:1px solid ${C.rule};padding:36px 32px 28px;">
          <div style="font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.tobacco};font-weight:600;margin-bottom:12px;">Repair ${escapeHtml(job.job_number)} &middot; ${escapeHtml(instrument(job))}</div>
          <h1 style="margin:0 0 20px;font-family:${SERIF};font-style:italic;font-weight:400;font-size:32px;line-height:1.15;color:${C.black};">${escapeHtml(tpl.heading)}</h1>
          ${p(`Hi ${escapeHtml(name)},`)}
          ${lines.map(l => p(htmlText(l))).join('\n          ')}
          ${amountBox}
          ${button}
        </td></tr>
        <tr><td style="padding:20px 4px 0;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.steel};">
          Deadstock Guitars &middot; Fortville, Indiana<br>
          Questions? Just reply to this email.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject: tpl.subject, text, html };
}

// kind: a key of TEMPLATES. Returns { sent: true, to } or { sent: false, reason }
// so the admin can show staff whether the customer was actually emailed.
export async function sendRepairEmail(kind, job, customer, extra) {
  if (!customer?.email) return { sent: false, reason: 'This customer has no email address.' };
  const tpl = TEMPLATES[kind]?.(job, extra);
  if (!tpl) return { sent: false, reason: `No email template for "${kind}".` };

  const { subject, text, html } = renderRepairEmail(tpl, job, customer);

  if (!process.env.RESEND_API_KEY) {
    console.log(`[email skipped: no RESEND_API_KEY] ${kind} → ${customer.email}: ${subject}`);
    return { sent: false, reason: 'Email isn\'t set up on this server (no RESEND_API_KEY).' };
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
        subject,
        text,
        html,
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error('Resend error:', res.status, detail);
      let message = detail;
      try { message = JSON.parse(detail).message || detail; } catch {}
      return { sent: false, reason: `Resend refused it (${res.status}): ${message}` };
    }
    return { sent: true, to: customer.email };
  } catch (err) {
    console.error('Email send failed:', err);
    return { sent: false, reason: 'Could not reach Resend.' };
  }
}
