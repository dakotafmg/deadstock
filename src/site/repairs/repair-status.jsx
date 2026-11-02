import React, { useState, useEffect } from 'react';

// ============================================================
// REPAIR STATUS — the customer's private page, /repair/<token>
// ============================================================

const STEPS = [
  ['requested', 'Requested'],
  ['received', 'In the shop'],
  ['quoted', 'Quoted'],
  ['approved', 'Approved'],
  ['in_progress', 'On the bench'],
  ['ready', 'Ready for pickup'],
  ['picked_up', 'Picked up'],
];
const STEP_INDEX = Object.fromEntries(STEPS.map(([k], i) => [k, i]));
const LABEL = { ...Object.fromEntries(STEPS), declined: 'Quote declined' };

const money = (cents) => '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });
const day = (ts) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function RepairStatus({ token, onNavigate }) {
  const [job, setJob] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | missing | error
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/repairs?token=${encodeURIComponent(token || '')}`)
      .then(async r => {
        if (r.status === 404) { setState('missing'); return; }
        if (!r.ok) throw new Error();
        setJob((await r.json()).job);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [token]);

  const respond = async (approve) => {
    if (!approve && !confirm("Decline this quote? We'll get in touch about picking it up.")) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch('/api/repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'respond', token, approve }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Something went wrong.');
      setJob(d.job);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (state === 'loading') return <main className="repairs-page"><div className="wrap shop-state">Loading…</div></main>;
  if (state !== 'ready') {
    return (
      <main className="repairs-page">
        <div className="wrap repairs-status-missing">
          <h1>{state === 'missing' ? "We couldn't find that repair." : 'Something went wrong.'}</h1>
          <p>Check the link in your email, or <a onClick={() => onNavigate('repairs')} style={{ cursor: 'pointer' }}>contact the shop</a>.</p>
        </div>
      </main>
    );
  }

  const current = job.status === 'declined' ? STEP_INDEX.quoted : STEP_INDEX[job.status];

  return (
    <main className="repairs-page">
      <section className="repairs-status wrap"><div className="repairs-status-inner">
        <div className="letter-eyebrow">Repair {job.job_number}</div>
        <h1 className="repairs-status-title">{job.instrument || 'Your instrument'}</h1>
        <div className="repairs-status-now">{LABEL[job.status]}</div>

        <ol className="repairs-track">
          {STEPS.map(([k, label], i) => (
            <li key={k} className={i < current ? 'done' : i === current ? 'now' : ''}>{label}</li>
          ))}
        </ol>

        {job.status === 'quoted' && job.quote_cents != null && (
          <div className="repairs-quote">
            <div className="eyebrow">Your quote</div>
            <div className="repairs-quote-amount">{money(job.quote_cents)}</div>
            {job.quote_notes && <p>{job.quote_notes}</p>}
            {error && <p className="repairs-error">{error}</p>}
            <div className="repairs-quote-actions">
              <button className="btn btn-amber" disabled={busy} onClick={() => respond(true)}>Approve <span className="arrow">→</span></button>
              <button className="btn btn-ghost" disabled={busy} onClick={() => respond(false)}>Decline</button>
            </div>
          </div>
        )}

        {job.status !== 'quoted' && job.quote_cents != null && (
          <p className="repairs-status-line">Quote: {money(job.quote_cents)}{job.status === 'declined' ? ' (declined)' : ''}</p>
        )}

        {job.invoice_url && (
          <div className="repairs-quote">
            <div className="eyebrow">Ready to pay</div>
            <div className="repairs-quote-amount">{money(job.invoice_amount_cents)}</div>
            <a className="btn btn-amber" href={job.invoice_url} target="_blank" rel="noopener noreferrer">Pay online <span className="arrow">→</span></a>
          </div>
        )}
        {job.paid && <p className="repairs-status-line">Paid. Thank you.</p>}
        {job.promised_at && !['ready', 'picked_up', 'declined'].includes(job.status) && (
          <p className="repairs-status-line">We're aiming to have it done by {day(job.promised_at)}.</p>
        )}

        <div className="repairs-timeline">
          <div className="eyebrow">History</div>
          {[...job.timeline].reverse().map((e, i) => (
            <div key={i} className="repairs-timeline-item">
              <span className="repairs-timeline-date">{day(e.created_at)}</span>
              <span>{e.kind === 'status' ? (LABEL[e.to_status] || e.to_status) : e.body}
                {e.kind === 'status' && e.body && <em> · {e.body}</em>}</span>
            </div>
          ))}
        </div>
      </div></section>
    </main>
  );
}
