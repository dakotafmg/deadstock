import React, { useState } from 'react';
import { compressAndUpload } from '../listings/image-upload';

// ============================================================
// SITE CONTENT — small shared editing pieces
// ============================================================

export const move = (list, i, by) => {
  const j = i + by;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};
export const without = (list, i) => list.filter((_, n) => n !== i);
export const replaceAt = (list, i, patch) => list.map((x, n) => (n === i ? { ...x, ...patch } : x));

// Up / down / remove buttons for one row of a list.
export function RowTools({ list, i, onChange, removeLabel = 'Remove' }) {
  return (
    <span className="admin-row-tools">
      <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" disabled={i === 0} onClick={() => onChange(move(list, i, -1))} aria-label="Move up">↑</button>
      <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" disabled={i === list.length - 1} onClick={() => onChange(move(list, i, 1))} aria-label="Move down">↓</button>
      <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => onChange(without(list, i))} aria-label={removeLabel}>✕</button>
    </span>
  );
}

// Upload button that hands back Vercel Blob URLs.
export function UploadButton({ label = '+ Add photos', multiple = true, onUploaded }) {
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState(null);
  const pick = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setBusy(files.length); setError(null);
    try {
      const urls = await Promise.all(files.map(f => compressAndUpload(f, 'content')));
      onUploaded(urls);
    } catch {
      setError('Upload failed. Check your connection and try again.');
    } finally { setBusy(0); }
  };
  return (
    <span>
      <label className={`admin-btn admin-btn-ghost admin-btn-sm${busy ? ' disabled' : ''}`} style={{ cursor: busy ? 'wait' : 'pointer' }}>
        {busy ? `Uploading ${busy}…` : label}
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple} style={{ display: 'none' }} onChange={pick} disabled={Boolean(busy)} />
      </label>
      {error && <span className="admin-image-error" style={{ marginLeft: 8 }}>{error}</span>}
    </span>
  );
}

// Ordered photo strip: reorder, remove, pick the homepage card photo.
export function PhotoList({ images, onChange, cardUrl, onPickCard }) {
  return (
    <div>
      <div className="admin-photo-list">
        {images.map((img, i) => (
          <div key={img.url + i} className={`admin-photo-item${cardUrl === img.url ? ' is-card' : ''}`}>
            <img src={img.url} alt={img.alt || `Photo ${i + 1}`} />
            <div className="admin-photo-num">{i + 1}</div>
            <div className="admin-photo-tools">
              <RowTools list={images} i={i} onChange={onChange} removeLabel="Remove photo" />
            </div>
            {onPickCard && (
              <button type="button" className="admin-link-btn admin-photo-card" onClick={() => onPickCard(cardUrl === img.url ? null : img.url)}>
                {cardUrl === img.url ? '★ Homepage card' : 'Use on homepage'}
              </button>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10 }}>
        <UploadButton onUploaded={(urls) => onChange([...images, ...urls.map(url => ({ url, alt: '' }))])} />
      </div>
    </div>
  );
}

export function Field({ label, hint, children, wide }) {
  return (
    <div className="admin-field" style={wide ? { gridColumn: '1 / -1' } : undefined}>
      <label className="admin-label">{label}</label>
      {children}
      {hint && <div className="admin-hint">{hint}</div>}
    </div>
  );
}

export function SaveBar({ saving, saved, error, dirty, onCancel, label = 'Save changes' }) {
  return (
    <div className="admin-save-bar">
      {error && <div className="admin-error" style={{ margin: 0 }}>{error}</div>}
      {!error && saved && !dirty && <span className="admin-muted">Saved. The site shows it within a minute.</span>}
      {!error && dirty && <span className="admin-muted">Unsaved changes</span>}
      <span style={{ flex: 1 }} />
      {onCancel && <button type="button" className="admin-btn admin-btn-ghost" onClick={onCancel}>Back</button>}
      <button className="admin-btn admin-btn-primary" disabled={saving}>{saving ? 'Saving…' : label}</button>
    </div>
  );
}

export function useLeaveWarning(dirty) {
  React.useEffect(() => {
    if (!dirty) return;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
}
