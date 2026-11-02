import React, { useState, useEffect } from 'react';
import { apiCall, fmt$$ } from '../api';
import { ImageUpload } from '../listings/image-upload';
import { DROPOFF_LABELS } from './statuses';

// ============================================================
// NEW REPAIR — check in an instrument at the counter
// (online requests arrive on the board by themselves)
// ============================================================
export function NewRepair({ onExpire, onDone }) {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', brand: '', model: '', serial: '', issue: '', promised: '',
    dropoff_location: 'shop', tag_number: '',
  });
  const [serviceIds, setServiceIds] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiCall('/api/admin-repairs?view=services')
      .then(d => setServices((d.services || []).filter(s => s.active)))
      .catch(err => { if (err.message === 'SESSION_EXPIRED') onExpire(); });
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggle = (id) => setServiceIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { job } = await apiCall('/api/admin-repairs', {
        method: 'POST',
        body: {
          action: 'create',
          ...form,
          promised_at: form.promised ? `${form.promised}T12:00:00Z` : null,
          serviceIds,
          photos,
        },
      });
      onDone(job.id);
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="admin-page-title">New Repair</h1>
      <p className="admin-page-sub">Check in an instrument at the shop, or enter a tag from Fortville Music Garage. The customer gets an email with their status link if you add one.</p>

      <form className="admin-form" onSubmit={submit}>
        {error && <div className="admin-error">{error}</div>}

        <div className="admin-form-row">
          <div className="admin-field">
            <label className="admin-label">Dropped off at</label>
            <select className="admin-select" value={form.dropoff_location} onChange={e => set('dropoff_location', e.target.value)}>
              {Object.entries(DROPOFF_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-label">Tag number <span className="admin-label-opt">(optional)</span></label>
            <input className="admin-input" value={form.tag_number} onChange={e => set('tag_number', e.target.value)} placeholder="From the paper tag" />
          </div>
        </div>

        <div className="admin-label" style={{ marginBottom: 10 }}>Customer</div>
        <div className="admin-field">
          <input className="admin-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" />
        </div>
        <div className="admin-form-row">
          <div className="admin-field">
            <input className="admin-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="Email" />
          </div>
          <div className="admin-field">
            <input className="admin-input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Phone" />
          </div>
        </div>

        <div className="admin-label" style={{ margin: '8px 0 10px' }}>Instrument</div>
        <div className="admin-form-row">
          <div className="admin-field">
            <input className="admin-input" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Brand (Fender, Gibson…)" />
          </div>
          <div className="admin-field">
            <input className="admin-input" value={form.model} onChange={e => set('model', e.target.value)} placeholder="Model" />
          </div>
        </div>
        <div className="admin-field">
          <input className="admin-input" value={form.serial} onChange={e => set('serial', e.target.value)} placeholder="Serial (optional)" />
        </div>
        <div className="admin-field">
          <label className="admin-label">What's wrong</label>
          <textarea className="admin-textarea" rows={4} value={form.issue} onChange={e => set('issue', e.target.value)}
            placeholder="Buzzing on the low E past the 7th fret, scratchy volume pot…" />
        </div>

        {services.length > 0 && (
          <div className="admin-field">
            <label className="admin-label">Services <span className="admin-label-opt">(optional)</span></label>
            <div className="admin-checks">
              {services.map(s => (
                <label key={s.id} className="admin-check">
                  <input type="checkbox" checked={serviceIds.includes(s.id)} onChange={() => toggle(s.id)} />
                  {s.name}{s.starting_price_cents != null && <span className="admin-muted"> · from {fmt$$(s.starting_price_cents)}</span>}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="admin-field">
          <label className="admin-label">Promised by <span className="admin-label-opt">(optional)</span></label>
          <input className="admin-input" type="date" value={form.promised} onChange={e => set('promised', e.target.value)} />
        </div>

        <div className="admin-field">
          <label className="admin-label">Intake photos <span className="admin-label-opt">(record the condition it came in)</span></label>
          <ImageUpload urls={photos} onChange={setPhotos} folder="repairs" />
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary" disabled={loading || !form.name.trim() || !form.issue.trim()}>
            {loading ? 'Saving...' : 'Check in'}
          </button>
        </div>
      </form>
    </div>
  );
}
