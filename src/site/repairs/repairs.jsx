import React, { useState, useEffect } from 'react';
import { Reveal } from '../../components/shared';

// ============================================================
// REPAIRS — services, how it works, and the request form
// DRAFT COPY: the wording below is a starting point for Dakota to edit.
// ============================================================

const MAX_PHOTOS = 5;

const STEPS = [
  { k: '01', t: 'Tell us what\'s wrong', d: 'Send the request below with a few photos. We\'ll reply about drop-off.' },
  { k: '02', t: 'We quote first', d: 'Once it\'s on the bench we look it over and send a quote. Nothing gets done until you approve it.' },
  { k: '03', t: 'Pick it up', d: 'We let you know the moment it\'s ready. Pay online ahead of time or at pickup.' },
];

const money = (cents) => '$' + (cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 });

// Shrinks a photo in the browser so five fit in one request.
function compress(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const src = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1400;
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(src);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
      resolve({ preview: dataUrl, data: dataUrl.split(',')[1] });
    };
    img.onerror = reject;
    img.src = src;
  });
}

export default function Repairs({ onNavigate }) {
  const [info, setInfo] = useState({ open: true, services: [], phone: null, email: null });

  useEffect(() => {
    fetch('/api/repairs?view=info')
      .then(r => (r.ok ? r.json() : null))
      .then(d => d && setInfo(d))
      .catch(() => {});
  }, []);

  return (
    <main className="repairs-page">
      <section className="repairs-hero">
        <div className="wrap">
          <div className="letter-eyebrow">Repairs & Setups</div>
          <Reveal className="display">
            <h1>Bring it to<br />the <em>bench.</em></h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="repairs-lede">
              Setups, fretwork, electronics and the odd rescue, done at our shop in
              Fortville, Indiana by the same hands that build Deadstock guitars. Any make, any era.
            </p>
          </Reveal>
          {info.phone && (
            <p className="repairs-call">
              Rather talk it through? Call <a href={`tel:${info.phone.replace(/[^\d+]/g, '')}`}>{info.phone}</a>
            </p>
          )}
        </div>
      </section>

      <section className="repairs-steps">
        <div className="wrap repairs-steps-grid">
          {STEPS.map((s, i) => (
            <Reveal key={s.k} delay={i * 80} className="repairs-step">
              <div className="repairs-step-num">{s.k}</div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {info.services.length > 0 && (
        <section className="repairs-services">
          <div className="wrap">
            <div className="eyebrow">Services</div>
            <div className="repairs-service-list">
              {info.services.map(s => (
                <div key={s.id} className="repairs-service">
                  <div>
                    <div className="repairs-service-name">{s.name}</div>
                    {s.description && <div className="repairs-service-desc">{s.description}</div>}
                  </div>
                  <div className="repairs-service-price">
                    {s.starting_price_cents != null ? <>from {money(s.starting_price_cents)}</> : 'Quoted'}
                    {s.est_days && <span>~{s.est_days} days</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="repairs-request" id="request">
        <div className="wrap">
          {info.open ? (
            <RequestForm services={info.services} contactEmail={info.email} onNavigate={onNavigate} />
          ) : (
            <div className="repairs-form-head">
              <div className="eyebrow">Request a repair</div>
              <h2>Get in <em>touch.</em></h2>
              <p className="repairs-lede">
                Online requests open soon. Until then, email{' '}
                <a href="mailto:hello@deadstockguitars.com">hello@deadstockguitars.com</a> and tell us about your instrument.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function RequestForm({ services, contactEmail, onNavigate }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', brand: '', model: '', serial: '', issue: '', website: '' });
  const [serviceIds, setServiceIds] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggle = (id) => setServiceIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);

  const addPhotos = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_PHOTOS - photos.length);
    e.target.value = '';
    try {
      const done = await Promise.all(files.map(compress));
      setPhotos(p => [...p, ...done].slice(0, MAX_PHOTOS));
    } catch {
      setError('One of those photos could not be read. Try a JPG or PNG.');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    try {
      const res = await fetch('/api/repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', ...form, serviceIds, photos: photos.map(p => ({ data: p.data })) }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || `Something went wrong (error ${res.status}).`);
      // A reply without a job number means the request never reached the repairs service.
      if (!data?.job_number || !data?.status_url) {
        console.error('Repair request: unexpected reply', res.status, res.headers.get('content-type'), data);
        throw new Error(`Your request didn't go through (unexpected reply, ${res.status}).`);
      }
      setResult(data);
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  if (status === 'done' && result) {
    return (
      <div className="repairs-done">
        <div className="notify-check">✓</div>
        <h2>Got it. Your job number is <em>{result.job_number}.</em></h2>
        <p>
          {form.email ? 'We emailed you a copy. ' : ''}We'll be in touch about drop-off.
          Bookmark your status page to follow along.
        </p>
        <a className="btn btn-amber" href={result.status_url}
          onClick={(e) => { e.preventDefault(); onNavigate('repair-status', result.status_url.split('/').pop()); }}>
          View your repair <span className="arrow">→</span>
        </a>
      </div>
    );
  }

  return (
    <form className="repairs-form" onSubmit={submit}>
      <div className="repairs-form-head">
        <div className="eyebrow">Request a repair</div>
        <h2>Tell us about <em>it.</em></h2>
      </div>

      {/* Honeypot: hidden from people, filled in by bots. */}
      <input className="repairs-hp" tabIndex={-1} autoComplete="off" value={form.website}
        onChange={e => set('website', e.target.value)} aria-hidden="true" name="website" />

      <div className="repairs-fields">
        <label className="repairs-field">
          <span>Name</span>
          <input required value={form.name} onChange={e => set('name', e.target.value)} autoComplete="name" />
        </label>
        <label className="repairs-field">
          <span>Email</span>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" />
        </label>
        <label className="repairs-field">
          <span>Phone</span>
          <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} autoComplete="tel" />
        </label>
        <label className="repairs-field">
          <span>Brand</span>
          <input value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Fender, Gibson, Deadstock…" />
        </label>
        <label className="repairs-field">
          <span>Model</span>
          <input value={form.model} onChange={e => set('model', e.target.value)} placeholder="'62 Strat reissue" />
        </label>
        <label className="repairs-field">
          <span>Serial <em>(optional)</em></span>
          <input value={form.serial} onChange={e => set('serial', e.target.value)} />
        </label>
      </div>

      <label className="repairs-field repairs-field-wide">
        <span>What's going on?</span>
        <textarea required rows={5} value={form.issue} onChange={e => set('issue', e.target.value)}
          placeholder="Buzzing past the 7th fret on the low E, scratchy volume pot, wants a full setup with 10s…" />
      </label>

      {services.length > 0 && (
        <fieldset className="repairs-field repairs-field-wide">
          <span>Services you think it needs <em>(optional)</em></span>
          <div className="repairs-checks">
            {services.map(s => (
              <label key={s.id} className={`repairs-check${serviceIds.includes(s.id) ? ' on' : ''}`}>
                <input type="checkbox" checked={serviceIds.includes(s.id)} onChange={() => toggle(s.id)} />
                {s.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="repairs-field repairs-field-wide">
        <span>Photos <em>(up to {MAX_PHOTOS}, optional)</em></span>
        <div className="repairs-photos">
          {photos.map((p, i) => (
            <div key={i} className="repairs-photo">
              <img src={p.preview} alt={`Photo ${i + 1}`} />
              <button type="button" onClick={() => setPhotos(ps => ps.filter((_, j) => j !== i))} aria-label="Remove photo">×</button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className="repairs-photo-add">
              + Add
              <input type="file" accept="image/*" multiple onChange={addPhotos} />
            </label>
          )}
        </div>
      </div>

      {error && (
        <p className="repairs-error">
          {error}
          {contactEmail && <> You can also email <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.</>}
        </p>
      )}

      <button className="btn btn-amber" type="submit"
        disabled={status === 'sending' || !form.name.trim() || !form.issue.trim() || (!form.email.trim() && !form.phone.trim())}>
        {status === 'sending' ? 'Sending…' : <>Send request <span className="arrow">→</span></>}
      </button>
      <p className="repairs-fine">We'll only use your details for this repair.</p>
    </form>
  );
}
