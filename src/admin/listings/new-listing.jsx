import React, { useState } from 'react';
import { apiCall } from '../api';
import { MODEL_OPTIONS, MODEL_TEMPLATES, formatSpecs, SPECS_SEP } from './templates';
import { ImageUpload } from './image-upload';

// ============================================================
// NEW LISTING
// ============================================================

export function NewListing({ onExpire, onDone }) {
  const [form, setForm] = useState({
    name: '', model: '', serial: '', type: 'guitar', price: '',
    description: '', specs: '', condition: '', images: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleModelChange = (model) => {
    set('model', model);
    if (!form.name) set('name', `The ${model}`);
    if (['Broadman', 'Wayfarer', 'Monarch'].includes(model)) set('type', 'guitar');
    else set('type', 'pickup');
  };

  const importFromModel = (templateId) => {
    if (!templateId) return;
    const t = MODEL_TEMPLATES.find(m => m.id === templateId);
    if (!t) return;
    setForm(f => ({
      ...f,
      model: t.model,
      type: t.type,
      name: t.name,
      description: t.lede || '',
      specs: t.specs ? formatSpecs(t.specs, t.type) : '',
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const combined = [form.description, form.specs].filter(Boolean).join(SPECS_SEP);
      await apiCall('/api/admin-listings', {
        method: 'POST',
        body: {
          name: form.name,
          model: form.model,
          serial: form.serial,
          type: form.type,
          price: form.price,
          description: combined,
          condition: form.condition,
          images: form.images,
        },
      });
      onDone();
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="admin-page-title">New Listing</h1>

      <form className="admin-form" onSubmit={submit}>
        {error && <div className="admin-error">{error}</div>}

        <div className="admin-field admin-import-row">
          <label className="admin-label">Start from model <span className="admin-label-opt">(optional — pre-fills description &amp; specs)</span></label>
          <select
            className="admin-select"
            defaultValue=""
            onChange={e => importFromModel(e.target.value)}
          >
            <option value="">— select a model to pre-fill —</option>
            <optgroup label="Guitars">
              {MODEL_TEMPLATES.filter(t => t.type === 'guitar').map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </optgroup>
            <optgroup label="Pickups">
              {MODEL_TEMPLATES.filter(t => t.type === 'pickup').map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="admin-form-row">
          <div className="admin-field">
            <label className="admin-label">Model</label>
            <select className="admin-select" value={form.model} onChange={e => handleModelChange(e.target.value)}>
              <option value="">Select model</option>
              {MODEL_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-label">Type</label>
            <select className="admin-select" value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="guitar">Guitar</option>
              <option value="pickup">Pickup</option>
            </select>
          </div>
        </div>

        <div className="admin-field">
          <label className="admin-label">Listing Name</label>
          <input
            className="admin-input"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. The Broadman — Shell Pink"
            required
          />
        </div>

        <div className="admin-form-row">
          <div className="admin-field">
            <label className="admin-label">Serial Number</label>
            <input
              className="admin-input"
              value={form.serial}
              onChange={e => set('serial', e.target.value)}
              placeholder="e.g. BR-0042"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Price (USD)</label>
            <input
              className="admin-input"
              type="number"
              min="1"
              step="0.01"
              value={form.price}
              onChange={e => set('price', e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="admin-field">
          <label className="admin-label">Description</label>
          <textarea
            className="admin-textarea"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Finish, notable features, anything the buyer should know..."
            rows={3}
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">Specifications <span className="admin-label-opt">(optional — shown as a separate section on the listing)</span></label>
          <textarea
            className="admin-textarea admin-textarea-mono"
            value={form.specs}
            onChange={e => set('specs', e.target.value)}
            placeholder={"BODY\nWood: 2-piece Swamp Ash\nFinish: Nitrocellulose\n\nNECK\nScale: 25.5\""}
            rows={8}
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">Condition Notes <span className="admin-label-opt">(optional)</span></label>
          <input
            className="admin-input"
            value={form.condition}
            onChange={e => set('condition', e.target.value)}
            placeholder="e.g. Light play wear on back of neck"
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">Images</label>
          <ImageUpload
            urls={form.images}
            onChange={(imgs) => set('images', imgs)}
          />
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary" disabled={loading || !form.name || !form.price}>
            {loading ? 'Creating...' : 'Create listing'}
          </button>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onDone}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
