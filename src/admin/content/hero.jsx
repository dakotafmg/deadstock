import React, { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { STATIC_CONTENT } from '../../content/use-content';
import { RowTools, SaveBar, UploadButton, replaceAt, useLeaveWarning } from './parts';

// ============================================================
// SITE CONTENT — homepage slideshow
// ============================================================
export function ContentHero({ onExpire }) {
  const [slides, setSlides] = useState(null);
  const [fromBuiltIn, setFromBuiltIn] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  useLeaveWarning(dirty);

  const handle = (err) => { if (err.message === 'SESSION_EXPIRED') onExpire(); else setError(err.message); };

  useEffect(() => {
    apiCall('/api/content?view=admin').then(d => {
      if (d.hero.length) {
        setSlides(d.hero.map(h => ({ image_url: h.image_url, crop_pos: h.crop_pos, scale: Number(h.scale) || 1, active: h.active })));
      } else {
        // Nothing saved yet: start from what the site shows today.
        setFromBuiltIn(true);
        setSlides(STATIC_CONTENT.hero.map(h => ({ image_url: h.src, crop_pos: h.pos, scale: h.scale, active: true })));
      }
    }).catch(handle);
  }, []);

  const change = (next) => { setSlides(next); setDirty(true); setSaved(false); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      await apiCall('/api/content', { method: 'POST', body: { action: 'hero-save', slides } });
      setDirty(false); setSaved(true); setFromBuiltIn(false);
    } catch (err) { handle(err); }
    finally { setSaving(false); }
  };

  if (error && !slides) return <div className="admin-error">{error}</div>;
  if (!slides) return <div className="admin-loading">Loading...</div>;

  return (
    <form onSubmit={save}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Homepage photos</h1>
        <UploadButton onUploaded={(urls) => change([...slides, ...urls.map(u => ({ image_url: u, crop_pos: 'center', scale: 1, active: true }))])} />
      </div>
      <p className="admin-page-sub" style={{ marginTop: -12 }}>
        The slideshow at the top of the homepage, in this order. Focus moves the crop (50% 20% shows more of the top). Zoom 1.15 is 15% closer.
      </p>
      {fromBuiltIn && <div className="admin-notice">These are the photos built into the site. Saving here moves them into the dashboard.</div>}

      <div className="admin-hero-list">
        {slides.map((s, i) => (
          <div key={s.image_url + i} className={`admin-card admin-hero-item${s.active ? '' : ' admin-row-off'}`}>
            <div className="admin-hero-frame">
              <img src={s.image_url} alt={`Slide ${i + 1}`}
                style={{ objectPosition: s.crop_pos, transform: `scale(${s.scale || 1})`, transformOrigin: s.crop_pos }} />
            </div>
            <div className="admin-hero-fields">
              <div className="admin-edit-row">
                <strong>{i + 1}</strong>
                <span style={{ flex: 1 }} />
                <RowTools list={slides} i={i} onChange={change} removeLabel="Remove slide" />
              </div>
              <div className="admin-edit-row">
                <label className="admin-label" style={{ margin: 0, minWidth: 48 }}>Focus</label>
                <input className="admin-input" value={s.crop_pos} onChange={e => change(replaceAt(slides, i, { crop_pos: e.target.value }))} placeholder="center" />
              </div>
              <div className="admin-edit-row">
                <label className="admin-label" style={{ margin: 0, minWidth: 48 }}>Zoom</label>
                <input className="admin-input" type="number" min="1" max="3" step="0.05" value={s.scale}
                  onChange={e => change(replaceAt(slides, i, { scale: e.target.value }))} />
              </div>
              <label className="admin-check">
                <input type="checkbox" checked={s.active} onChange={e => change(replaceAt(slides, i, { active: e.target.checked }))} />
                Show on the homepage
              </label>
            </div>
          </div>
        ))}
      </div>

      <SaveBar saving={saving} saved={saved} error={error} dirty={dirty || fromBuiltIn} />
    </form>
  );
}
