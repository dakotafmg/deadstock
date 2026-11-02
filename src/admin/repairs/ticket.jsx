import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import { fmt$$, fmtDate } from '../api';
import { instrumentName, DROPOFF_LABELS } from './statuses';

// ============================================================
// REPAIR TICKET — printed from a job's page. Top half is tied to the
// instrument; bottom half is the customer's claim slip. Hidden on screen,
// shown only when printing (see .repair-ticket in admin.css). Rendered straight
// into <body> so the admin layout around it can't clip or hide it on paper.
// ============================================================
export function RepairTicket({ job, services }) {
  const [shop, setShop] = useState({ phone: null });
  const [qr, setQr] = useState(null);
  const statusUrl = `${window.location.origin}/repair/${job.public_token}`;
  useEffect(() => {
    fetch('/api/repairs?view=info').then(r => (r.ok ? r.json() : null)).then(d => d && setShop(d)).catch(() => {});
  }, []);
  useEffect(() => {
    QRCode.toString(statusUrl, { type: 'svg', margin: 0, errorCorrectionLevel: 'M' }).then(setQr).catch(() => setQr(null));
  }, [statusUrl]);

  const c = job.customer || {};
  const received = job.received_at || job.created_at;
  const where = DROPOFF_LABELS[job.dropoff_location];

  return createPortal(
    <div className="repair-ticket" aria-hidden="true">
      <section className="rt-half">
        <div className="rt-top">
          <span className="rt-brand">Deadstock Guitars · Repair tag</span>
          {job.tag_number && <span className="rt-tagno">Tag {job.tag_number}</span>}
        </div>
        <div className="rt-number">{job.job_number}</div>
        <div className="rt-instrument">{instrumentName(job)}{job.instrument_serial && <span> · SN {job.instrument_serial}</span>}</div>
        <dl className="rt-grid">
          <dt>Customer</dt><dd>{c.name || '—'}</dd>
          <dt>Phone</dt><dd>{c.phone || '—'}</dd>
          <dt>Email</dt><dd>{c.email || '—'}</dd>
          <dt>Received</dt><dd>{fmtDate(received)}{where && ` · ${where}`}</dd>
          {job.promised_at && <><dt>Promised</dt><dd>{fmtDate(job.promised_at)}</dd></>}
          {job.quote_cents != null && <><dt>Quote</dt><dd>{fmt$$(job.quote_cents)}</dd></>}
          {job.assignee?.full_name && <><dt>Tech</dt><dd>{job.assignee.full_name}</dd></>}
        </dl>
        <div className="rt-label">What's wrong</div>
        <p className="rt-issue">{job.issue}</p>
        {services.length > 0 && <p className="rt-services">Services: {services.map(s => s.service?.name).filter(Boolean).join(', ')}</p>}
        <div className="rt-lines">
          <div><span>Work completed</span></div>
          <div><span>Notes</span></div>
          <div><span>Signed</span><span>Date</span></div>
        </div>
      </section>

      <div className="rt-cut">✂ cut here · customer keeps the bottom half</div>

      <section className="rt-half rt-claim">
        <div className="rt-top">
          <span className="rt-brand">Deadstock Guitars · Claim slip</span>
          {job.tag_number && <span className="rt-tagno">Tag {job.tag_number}</span>}
        </div>
        <div className="rt-number">{job.job_number}</div>
        <div className="rt-instrument">{instrumentName(job)}</div>
        <p>Thanks for trusting us with it. We'll send a quote before doing any work.</p>
        <div className="rt-follow">
          {/* SVG made by the qrcode package from our own URL, not user input. */}
          {qr && <div className="rt-qr" dangerouslySetInnerHTML={{ __html: qr }} />}
          <div>
            <div className="rt-label">Follow your repair online</div>
            <p>{qr ? 'Scan the code with your phone camera, or go to:' : 'Go to:'}</p>
            <p className="rt-url">{statusUrl}</p>
          </div>
        </div>
        <p>{shop.phone ? `Questions? Call ${shop.phone}.` : 'Questions? Reply to any email from us.'} Bring this slip, or your job number, when you pick it up.</p>
      </section>
    </div>,
    document.body,
  );
}
