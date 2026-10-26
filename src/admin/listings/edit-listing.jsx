import React, { useState } from 'react';
import { apiCall } from '../api';
import { MODEL_OPTIONS, SPECS_SEP } from './templates';
import { ImageUpload } from './image-upload';

// ============================================================
// EDIT LISTING
// ============================================================
export function EditListing({ listing, onExpire, onDone }) {
  const descParts = (listing.description || '').split(SPECS_SEP);
  const [form, setForm] = useState({
    name: listing.name || '',
    model: listing.model || '',
    serial: listing.serial || '',
    type: listing.type || 'guitar',
    price: listing.price != null ? String(listing.price / 100) : '',
    description: descParts[0] || '',
    specs: descParts[1] || '',
    condition: listing.condition || '',
    images: listing.images || [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const priceChanged = form.price !== String(listing.price / 100);
    try {
      const combined = [form.description, form.specs].filter(Boolean).join(SPECS_SEP);
      await apiCall('/api/admin-listings', {
        method: 'PATCH',
        body: {
          id: listing.id,
          name: form.name,
          model: form.model,
          serial: form.serial,
          type: form.type,
          description: combined,
          condition: form.condition,
          images: form.images,
          ...(priceChanged ? { price: form.price } : {}),
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
      <h1 className="admin-page-title">Edit Listing</h1>

      <form className="admin-form" onSubmit={submit}>
        {error && <div className="admin-error">{error}</div>}

        <div className="admin-form-row">
          <div className="admin-field">
            <label className="admin-label">Model</label>
            <select className="admin-select" value={form.model} onChange={e => set('model', e.target.value)}>
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
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Price (USD)</label>
            <input
              className="admin-input"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={e => set('price', e.target.value)}
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
            rows={3}
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">Specifications <span className="admin-label-opt">(optional — shown as a separate section on the listing)</span></label>
          <textarea
            className="admin-textarea admin-textarea-mono"
            value={form.specs}
            onChange={e => set('specs', e.target.value)}
            rows={8}
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">Condition Notes <span className="admin-label-opt">(optional)</span></label>
          <input
            className="admin-input"
            value={form.condition}
            onChange={e => set('condition', e.target.value)}
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">Images</label>
          <ImageUpload urls={form.images} onChange={(imgs) => set('images', imgs)} />
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary" disabled={loading || !form.name || !form.price}>
            {loading ? 'Saving...' : 'Save changes'}
          </button>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onDone}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
