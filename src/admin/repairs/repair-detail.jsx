import React, { useState, useEffect, useCallback } from 'react';
import { apiCall, fmt$$, fmtDate, fmtDateTime, can } from '../api';
import { compressAndUpload } from '../listings/image-upload';
import { STATUS_LABELS, ALL_STATUSES, EMAILS_CUSTOMER, instrumentName, DROPOFF_LABELS } from './statuses';
import { RepairTicket } from './ticket';

// Dates are stored at noon UTC so they show as the same day across US time zones.
const toDateInput = (ts) => (ts ? ts.slice(0, 10) : '');
const fromDateInput = (d) => (d ? `${d}T12:00:00Z` : null);
const dollarsToCents = (v) => (v === '' || v == null ? null : Math.round(parseFloat(v) * 100));
const centsToDollars = (c) => (c == null ? '' : String(c / 100));

// ============================================================
// REPAIR JOB — everything about one job, and the actions on it
// ============================================================
export function RepairDetail({ staff, id, onExpire, onBack }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const editable = can.editRepairs(staff);

  const handle = (err) => {
    if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
    setError(err.message);
  };

  const load = useCallback(() => {
    apiCall(`/api/admin-repairs?id=${encodeURIComponent(id)}`).then(setData).catch(handle);
  }, [id]);
  useEffect(load, [load]);

  // Every change returns the whole job again, so the page always shows the saved state.
  const act = async (call) => {
    setBusy(true);
    setError(null);
    try { setData(await call()); }
    catch (err) { handle(err); }
    finally { setBusy(false); }
  };
  const patch = (fields) => act(() => apiCall('/api/admin-repairs', { method: 'PATCH', body: { id, ...fields } }));
  const post = (body) => act(() => apiCall('/api/admin-repairs', { method: 'POST', body: { id, ...body } }));

  if (!data) return error ? <div className="admin-error">{error}</div> : <div className="admin-loading">Loading...</div>;
  const { job, services, photos, events, techs, email } = data;

  const setStatus = (to) => {
    if (EMAILS_CUSTOMER.includes(to) && job.customer?.email
      && !confirm(`Mark as "${STATUS_LABELS[to]}"? This emails ${job.customer.email}.`)) return;
    patch({ status: to });
  };

  return (
    <div>
      <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={onBack} style={{ marginBottom: 16 }}>← Repair board</button>
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <span className="admin-mono" style={{ fontSize: 15, marginRight: 10 }}>{job.job_number}</span>
          {instrumentName(job)}
        </h1>
        <div className="admin-page-actions">
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => window.print()}>Print ticket</button>
          <span className={`badge badge-repair-${job.status}`}>{STATUS_LABELS[job.status]}</span>
        </div>
      </div>
      <RepairTicket job={job} services={services} />
      {email && (email.sent
        ? <div className="admin-notice">Emailed {email.to}.</div>
        : <div className="admin-error">The customer was not emailed. {email.reason}</div>)}

      {error && <div className="admin-error">{error}</div>}

      {editable && (
        <div className="admin-status-steps">
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              className={`admin-status-step${job.status === s ? ' active' : ''}`}
              disabled={busy || job.status === s}
              onClick={() => setStatus(s)}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}

      <div className="admin-repair-grid">
        <div>
          <InstrumentCard job={job} editable={editable} busy={busy} onSave={patch} />
          <CustomerCard job={job} />
          {services.length > 0 && (
            <div className="admin-card">
              <div className="admin-card-head"><span>Requested services</span></div>
              {services.map((s, i) => (
                <div key={i} className="admin-item-row">
                  <span className="admin-item-name">{s.service?.name}</span>
                  <span className="admin-item-price">{s.price_cents ? `from ${fmt$$(s.price_cents)}` : 'quote'}</span>
                </div>
              ))}
            </div>
          )}
          <PhotosCard photos={photos} editable={editable} onAdd={(url) => post({ action: 'photo', url, stage: 'progress' })} onError={handle} />
        </div>

        <div>
          <QuoteCard job={job} editable={editable} busy={busy} onSave={patch} />
          {editable && (
            <div className="admin-card">
              <div className="admin-card-head"><span>Bench</span></div>
              <div className="admin-form-row">
                <div className="admin-field">
                  <label className="admin-label">Dropped off at</label>
                  <select className="admin-select" value={job.dropoff_location || ''} disabled={busy}
                    onChange={e => patch({ dropoff_location: e.target.value })}>
                    <option value="">— Not yet</option>
                    {Object.entries(DROPOFF_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                  </select>
                </div>
                <div className="admin-field">
                  <label className="admin-label">Tag number</label>
                  <input className="admin-input" defaultValue={job.tag_number || ''} key={job.tag_number || ''} disabled={busy}
                    placeholder="From the paper tag"
                    onBlur={e => { if (e.target.value.trim() !== (job.tag_number || '')) patch({ tag_number: e.target.value.trim() }); }} />
                </div>
              </div>
              <div className="admin-field">
                <label className="admin-label">Assigned to</label>
                <select className="admin-select" value={job.assigned_to || ''} disabled={busy}
                  onChange={e => patch({ assigned_to: e.target.value })}>
                  <option value="">— Nobody yet</option>
                  {techs.map(t => <option key={t.id} value={t.id}>{t.full_name || t.id.slice(0, 8)} ({t.role})</option>)}
                </select>
              </div>
              <div className="admin-field" style={{ marginBottom: 0 }}>
                <label className="admin-label">Promised by</label>
                <input className="admin-input" type="date" value={toDateInput(job.promised_at)} disabled={busy}
                  onChange={e => patch({ promised_at: fromDateInput(e.target.value) })} />
              </div>
            </div>
          )}
          {!editable && job.dropoff_location && (
            <div className="admin-card"><div className="admin-detail-row">
              <span className="admin-detail-label">Dropped off at</span>
              <span className="admin-detail-value">{DROPOFF_LABELS[job.dropoff_location]}{job.tag_number && ` · tag ${job.tag_number}`}</span>
            </div></div>
          )}
          {!editable && job.assignee && (
            <div className="admin-card"><div className="admin-detail-row">
              <span className="admin-detail-label">Assigned</span>
              <span className="admin-detail-value">{job.assignee.full_name}</span>
            </div></div>
          )}
          <InvoiceCard job={job} editable={editable} busy={busy} onSend={(amount_cents) => post({ action: 'invoice', amount_cents })}
            onCancel={() => post({ action: 'cancel-invoice' })}
            paidInPerson={events.some(e => e.body?.startsWith('Paid in person'))}
            onPaidInPerson={(amount_cents, method) => post({ action: 'paid-in-person', amount_cents, method })} />
          <Timeline events={events} editable={editable} busy={busy}
            onAdd={(body, toCustomer) => post({ action: 'note', body, toCustomer })} />
        </div>
      </div>
    </div>
  );
}

function InstrumentCard({ job, editable, busy, onSave }) {
  const [form, setForm] = useState(null);
  const editing = form !== null;
  const start = () => setForm({
    instrument_brand: job.instrument_brand, instrument_model: job.instrument_model,
    instrument_serial: job.instrument_serial || '', issue: job.issue,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="admin-card">
      <div className="admin-card-head">
        <span>Instrument</span>
        {editable && !editing && <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={start}>Edit</button>}
      </div>
      {editing ? (
        <>
          <div className="admin-form-row">
            <div className="admin-field"><label className="admin-label">Brand</label>
              <input className="admin-input" value={form.instrument_brand} onChange={e => set('instrument_brand', e.target.value)} /></div>
            <div className="admin-field"><label className="admin-label">Model</label>
              <input className="admin-input" value={form.instrument_model} onChange={e => set('instrument_model', e.target.value)} /></div>
          </div>
          <div className="admin-field"><label className="admin-label">Serial</label>
            <input className="admin-input" value={form.instrument_serial} onChange={e => set('instrument_serial', e.target.value)} /></div>
          <div className="admin-field"><label className="admin-label">What's wrong</label>
            <textarea className="admin-textarea" rows={4} value={form.issue} onChange={e => set('issue', e.target.value)} /></div>
          <div className="admin-form-actions">
            <button className="admin-btn admin-btn-primary admin-btn-sm" disabled={busy} onClick={async () => { await onSave(form); setForm(null); }}>Save</button>
            <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </>
      ) : (
        <div className="admin-detail-grid">
          <Row label="Brand / model" value={instrumentName(job)} />
          <Row label="Serial" value={job.instrument_serial} />
          <Row label="Issue" value={job.issue} pre />
          <Row label="Requested" value={fmtDate(job.created_at)} />
          <Row label="Received" value={job.received_at && fmtDate(job.received_at)} />
          <Row label="Finished" value={job.completed_at && fmtDate(job.completed_at)} />
          <Row label="Picked up" value={job.picked_up_at && fmtDate(job.picked_up_at)} />
        </div>
      )}
    </div>
  );
}

function CustomerCard({ job }) {
  const c = job.customer || {};
  const link = `${window.location.origin}/repair/${job.public_token}`;
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    catch { prompt('Copy the status link:', link); }
  };
  return (
    <div className="admin-card">
      <div className="admin-card-head">
        <span>Customer</span>
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={copy}>{copied ? 'Copied' : 'Copy status link'}</button>
      </div>
      <div className="admin-detail-grid">
        <Row label="Name" value={c.name} />
        <Row label="Email" value={c.email && <a className="admin-detail-link" href={`mailto:${c.email}`}>{c.email}</a>} />
        <Row label="Phone" value={c.phone && <a className="admin-detail-link" href={`tel:${c.phone}`}>{c.phone}</a>} />
      </div>
    </div>
  );
}

function QuoteCard({ job, editable, busy, onSave }) {
  const [amount, setAmount] = useState(centsToDollars(job.quote_cents));
  const [notes, setNotes] = useState(job.quote_notes || '');
  useEffect(() => { setAmount(centsToDollars(job.quote_cents)); setNotes(job.quote_notes || ''); }, [job.quote_cents, job.quote_notes]);
  const dirty = dollarsToCents(amount) !== job.quote_cents || notes !== (job.quote_notes || '');

  return (
    <div className="admin-card">
      <div className="admin-card-head"><span>Quote</span>
        {job.status === 'approved' && <span className="badge badge-available">Approved</span>}
        {job.status === 'declined' && <span className="badge badge-sold">Declined</span>}
      </div>
      {editable ? (
        <>
          <div className="admin-field">
            <label className="admin-label">Amount ($)</label>
            <input className="admin-input" type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div className="admin-field">
            <label className="admin-label">What it covers <span className="admin-label-opt">(the customer sees this)</span></label>
            <textarea className="admin-textarea" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Fret level and crown, new nut, full setup" />
          </div>
          <div className="admin-form-actions">
            <button className="admin-btn admin-btn-ghost admin-btn-sm" disabled={busy || !dirty}
              onClick={() => onSave({ quote_cents: dollarsToCents(amount), quote_notes: notes })}>Save quote</button>
            {['requested', 'received', 'quoted', 'declined'].includes(job.status) && (
              <button className="admin-btn admin-btn-primary admin-btn-sm" disabled={busy || amount === ''}
                onClick={() => {
                  if (job.customer?.email && !confirm(`Send this quote to ${job.customer.email}?`)) return;
                  const fields = { quote_cents: dollarsToCents(amount), quote_notes: notes };
                  // Already quoted: send it again. Otherwise (new, or a revised quote after a decline) move it to quoted.
                  onSave(job.status === 'quoted' ? { ...fields, resendQuote: true } : { ...fields, status: 'quoted' });
                }}>
                {job.status === 'quoted' ? (dirty ? 'Save & resend quote' : 'Resend quote')
                  : job.status === 'declined' ? 'Send revised quote' : 'Save & send to customer'}
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="admin-detail-grid">
          <Row label="Amount" value={job.quote_cents != null && fmt$$(job.quote_cents)} />
          <Row label="Notes" value={job.quote_notes} pre />
        </div>
      )}
    </div>
  );
}

const COUNTER_METHODS = [['cash', 'Cash'], ['card', 'Card'], ['check', 'Check'], ['other', 'Other']];

function InvoiceCard({ job, paidInPerson, editable, busy, onSend, onCancel, onPaidInPerson }) {
  const [amount, setAmount] = useState(centsToDollars(job.invoice_amount_cents ?? job.quote_cents));
  const [counter, setCounter] = useState(null); // { amount, method } while recording a counter payment
  const paidHow = job.order?.payment_method;
  useEffect(() => { setAmount(centsToDollars(job.invoice_amount_cents ?? job.quote_cents)); }, [job.invoice_amount_cents, job.quote_cents]);

  return (
    <div className="admin-card">
      <div className="admin-card-head"><span>Payment</span>
        {job.paid_at
          ? <span className="badge badge-available">Paid {fmtDate(job.paid_at)}</span>
          : job.invoice_url && <span className="badge badge-manual">Invoice sent</span>}
      </div>
      {job.invoice_url && !job.paid_at && (
        <p className="admin-empty-text" style={{ marginBottom: 12 }}>
          {fmt$$(job.invoice_amount_cents)} · <a className="admin-detail-link" href={job.invoice_url} target="_blank" rel="noopener noreferrer">Open invoice</a>
          {editable && <> · <button type="button" className="admin-link-btn" disabled={busy}
            onClick={() => { if (confirm(`Cancel the ${fmt$$(job.invoice_amount_cents)} invoice? The customer's payment link will stop working.`)) onCancel(); }}>
            Cancel invoice</button></>}
        </p>
      )}
      {job.paid_at && (
        <p className="admin-empty-text">
          {fmt$$(job.order?.amount_cents ?? job.invoice_amount_cents)}{' '}
          {paidInPerson ? `paid in person${paidHow ? ` (${paidHow})` : ''}.` : 'paid online through Stripe.'}
        </p>
      )}
      {editable && !job.paid_at && (
        <div className="admin-item-add">
          <input className="admin-input admin-item-amount-input" type="number" min="0" step="0.01" value={amount}
            onChange={e => setAmount(e.target.value)} placeholder="Amount" />
          <button className="admin-btn admin-btn-ghost" disabled={busy || !amount}
            onClick={() => {
              if (!confirm(`${job.invoice_url ? 'Replace the current invoice and send' : 'Send'} an invoice for $${amount}?`)) return;
              onSend(dollarsToCents(amount));
            }}>
            {job.invoice_url ? 'Resend invoice' : 'Send invoice'}
          </button>
        </div>
      )}
      {editable && !job.paid_at && (counter ? (
        <div className="admin-counter-pay">
          <div className="admin-label">Paid at the counter</div>
          <div className="admin-item-add">
            <input className="admin-input admin-item-amount-input" type="number" min="0" step="0.01" value={counter.amount}
              onChange={e => setCounter(c => ({ ...c, amount: e.target.value }))} placeholder="Amount" />
            <select className="admin-select" value={counter.method} onChange={e => setCounter(c => ({ ...c, method: e.target.value }))}>
              {COUNTER_METHODS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </div>
          <div className="admin-form-actions">
            <button className="admin-btn admin-btn-ghost admin-btn-sm" disabled={busy} onClick={() => setCounter(null)}>Never mind</button>
            <button className="admin-btn admin-btn-primary admin-btn-sm" disabled={busy || !counter.amount}
              onClick={() => onPaidInPerson(dollarsToCents(counter.amount), counter.method)}>Mark paid</button>
          </div>
        </div>
      ) : (
        <button className="admin-link-btn admin-counter-open" disabled={busy}
          onClick={() => setCounter({ amount: amount || centsToDollars(job.quote_cents), method: 'cash' })}>
          Paid in person? Mark it paid
        </button>
      ))}
    </div>
  );
}

function PhotosCard({ photos, editable, onAdd, onError }) {
  const [uploading, setUploading] = useState(false);
  const add = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setUploading(true);
    try {
      for (const f of files.slice(0, 8)) await onAdd(await compressAndUpload(f, 'repairs'));
    } catch (err) { onError(err); }
    finally { setUploading(false); }
  };
  return (
    <div className="admin-card">
      <div className="admin-card-head"><span>Photos</span></div>
      <div className="admin-image-upload">
        {photos.map(p => (
          <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="admin-image-preview" title={p.stage}>
            <img src={p.url} alt={`${p.stage} photo`} />
            <span className="admin-photo-stage">{p.stage}</span>
          </a>
        ))}
        {uploading && <div className="admin-image-drop uploading">Uploading…</div>}
        {editable && !uploading && (
          <label className="admin-image-drop">
            <span className="admin-image-plus">+</span>
            <span>Add photos</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={add} />
          </label>
        )}
      </div>
      {photos.length === 0 && !editable && <p className="admin-empty-text">No photos.</p>}
    </div>
  );
}

function Timeline({ events, editable, busy, onAdd }) {
  const [text, setText] = useState('');
  const [toCustomer, setToCustomer] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await onAdd(text.trim(), toCustomer);
    setText('');
    setToCustomer(false);
  };
  return (
    <div className="admin-card">
      <div className="admin-card-head"><span>Timeline</span></div>
      {editable && (
        <form onSubmit={submit} style={{ marginBottom: 16 }}>
          <textarea className="admin-textarea" rows={2} value={text} onChange={e => setText(e.target.value)}
            placeholder={toCustomer ? 'Message to the customer (emailed)' : 'Internal note (staff only)'} />
          <div className="admin-form-actions" style={{ marginTop: 8 }}>
            <label className="admin-check">
              <input type="checkbox" checked={toCustomer} onChange={e => setToCustomer(e.target.checked)} />
              Send to customer
            </label>
            <button className="admin-btn admin-btn-ghost admin-btn-sm" disabled={busy || !text.trim()}>
              {toCustomer ? 'Send' : 'Add note'}
            </button>
          </div>
        </form>
      )}
      <div className="admin-timeline">
        {[...events].reverse().map(ev => (
          <div key={ev.id} className={`admin-timeline-item admin-timeline-${ev.kind}`}>
            <div className="admin-timeline-meta">
              {fmtDateTime(ev.created_at)} · {ev.actor?.full_name || (ev.actor_id ? 'Staff' : 'Customer / system')}
              {ev.visible_to_customer ? ' · customer sees this' : ' · internal'}
            </div>
            <div className="admin-timeline-body">
              {ev.kind === 'status' && <strong>{ev.from_status ? `${STATUS_LABELS[ev.from_status]} → ` : ''}{STATUS_LABELS[ev.to_status]}</strong>}
              {ev.kind === 'status' && ev.body && ' · '}
              {ev.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value, pre }) {
  if (value == null || value === '' || value === false) return null;
  return (
    <div className="admin-detail-row">
      <span className="admin-detail-label">{label}</span>
      <span className="admin-detail-value" style={pre ? { whiteSpace: 'pre-wrap' } : undefined}>{value}</span>
    </div>
  );
}
