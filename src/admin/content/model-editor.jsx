import React, { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { Field, PhotoList, RowTools, SaveBar, replaceAt, useLeaveWarning } from './parts';

// ============================================================
// SITE CONTENT — edit one model page
// ============================================================
const SECTIONS = {
  guitar: [['body', 'Body'], ['neck', 'Neck & fingerboard'], ['electronics', 'Electronics'], ['hardware', 'Hardware']],
  pickup: [['bridge', 'Bridge pickup'], ['middle', 'Middle pickup'], ['neck', 'Neck pickup']],
};

const BLANK = {
  id: '', kind: 'guitar', name: '', status: 'hidden', sort_order: '', archetype: '', serial_prefix: '',
  year_label: '', price: '', finish: '', pickups_summary: '', magnet: '', wind: '', lede: '', blurb: '',
  story: { heading: '', problem: '', solution: '', pull: '' }, build_note: '', found_in_model_id: '',
  card_image_url: null, card_image_pos: '', card_headline: '', card_finish: '', card_pickups: '', card_construction: '',
};

function toForm(m) {
  const f = { ...BLANK };
  for (const k of Object.keys(BLANK)) if (m[k] !== undefined && m[k] !== null) f[k] = m[k];
  f.price = m.base_price_cents == null ? '' : String(m.base_price_cents / 100);
  f.sort_order = String(m.sort_order ?? '');
  f.story = { ...BLANK.story, ...(m.story || {}) };
  return f;
}

export function ModelEditor({ id, onExpire, onDone }) {
  const isNew = !id;
  const [all, setAll] = useState(null);
  const [form, setForm] = useState(null);
  const [images, setImages] = useState([]);
  const [swatches, setSwatches] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  useLeaveWarning(dirty);

  const handle = (err) => { if (err.message === 'SESSION_EXPIRED') onExpire(); else setError(err.message); };

  useEffect(() => {
    apiCall('/api/content?view=admin').then(d => {
      setAll(d);
      if (isNew) {
        const last = Math.max(0, ...d.models.map(m => m.sort_order || 0));
        setForm({ ...BLANK, sort_order: String(last + 10) });
        return;
      }
      const m = d.models.find(x => x.id === id);
      if (!m) { setError('That model no longer exists.'); return; }
      setForm(toForm(m));
      setImages(d.images.filter(i => i.model_id === id).map(i => ({ url: i.url, alt: i.alt, crop_pos: i.crop_pos })));
      setSwatches(d.swatches.filter(s => s.model_id === id).map(s => ({ name: s.name, hex: s.hex })));
      setSpecs(d.specs.filter(s => s.model_id === id).map(s => ({ section: s.section, label: s.label, value: s.value })));
    }).catch(handle);
  }, [id]);

  const touch = (fn) => (...args) => { fn(...args); setDirty(true); setSaved(false); };
  const set = touch((k, v) => setForm(f => ({ ...f, [k]: v })));
  const setStory = touch((k, v) => setForm(f => ({ ...f, story: { ...f.story, [k]: v } })));
  const changeImages = touch(setImages);
  const changeSwatches = touch(setSwatches);
  const changeSpecs = touch(setSpecs);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const { price, ...rest } = form;
      const r = await apiCall('/api/content', {
        method: 'POST',
        body: {
          action: 'model-save',
          isNew,
          model: {
            ...rest,
            base_price_cents: price === '' ? null : Math.round(parseFloat(price) * 100),
            card_image_url: form.card_image_url && images.some(i => i.url === form.card_image_url) ? form.card_image_url : null,
          },
          images, swatches, specs,
        },
      });
      setDirty(false); setSaved(true);
      if (isNew) onDone(r.id);
    } catch (err) { handle(err); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!window.confirm(`Delete ${form.name} and its page? This can't be undone. (Hidden keeps it but takes it off the site.)`)) return;
    try {
      await apiCall('/api/content', { method: 'POST', body: { action: 'model-delete', id } });
      setDirty(false);
      onDone(null);
    } catch (err) { handle(err); }
  };

  if (error && !form) return <div className="admin-error">{error}</div>;
  if (!form) return <div className="admin-loading">Loading...</div>;

  const guitar = form.kind === 'guitar';
  const others = all.models.filter(m => m.id !== id && m.kind === 'guitar');

  return (
    <form onSubmit={save} className="admin-content-editor">
      <div className="admin-page-header">
        <h1 className="admin-page-title">{isNew ? 'New model' : form.name}</h1>
        <div className="admin-page-actions">
          {!isNew && guitar && form.status !== 'hidden' && (
            <a className="admin-btn admin-btn-ghost admin-btn-sm" href={`/${id}`} target="_blank" rel="noreferrer">View page ↗</a>
          )}
        </div>
      </div>

      <div className="admin-card admin-form">
        <div className="admin-card-head">Basics</div>
        <div className="admin-form-grid">
          <Field label="Name"><input className="admin-input" value={form.name} onChange={e => set('name', e.target.value)} required /></Field>
          <Field label="Page address" hint={isNew ? 'Lowercase, no spaces. Can\'t be changed later.' : 'Fixed once created.'}>
            <div className="admin-input-prefix"><span>/</span>
              <input className="admin-input" value={form.id} disabled={!isNew}
                onChange={e => set('id', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} required /></div>
          </Field>
          <Field label="Type">
            <select className="admin-select" value={form.kind} disabled={!isNew} onChange={e => set('kind', e.target.value)}>
              <option value="guitar">Guitar</option><option value="pickup">Pickup set</option>
            </select>
          </Field>
          <Field label="Show on site" hint={guitar ? 'Coming soon shows a "Get notified" card on the homepage.' : 'Pickup pages are not linked from the site yet.'}>
            <select className="admin-select" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="available">Live</option>
              <option value="in_development">Coming soon</option>
              <option value="hidden">Hidden</option>
            </select>
          </Field>
          <Field label="Price ($)" hint="Shown on the page. Shop listings keep their own prices.">
            <input className="admin-input" type="number" min="0" step="1" value={form.price} onChange={e => set('price', e.target.value)} />
          </Field>
          <Field label="Order" hint="Lower numbers come first.">
            <input className="admin-input" type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} />
          </Field>
          <Field label={guitar ? 'Body style' : 'Pickup type'} hint={guitar ? 'e.g. SINGLE-CUT' : 'e.g. SINGLE-COIL / TELE'}>
            <input className="admin-input" value={form.archetype} onChange={e => set('archetype', e.target.value)} />
          </Field>
          <Field label="Serial"><input className="admin-input" value={form.serial_prefix} onChange={e => set('serial_prefix', e.target.value)} /></Field>
          <Field label="Year label" hint="e.g. MMXXVI"><input className="admin-input" value={form.year_label} onChange={e => set('year_label', e.target.value)} /></Field>
          {guitar ? <>
            <Field label="Finish"><input className="admin-input" value={form.finish} onChange={e => set('finish', e.target.value)} /></Field>
            <Field label="Pickups" wide><input className="admin-input" value={form.pickups_summary} onChange={e => set('pickups_summary', e.target.value)} /></Field>
          </> : <>
            <Field label="Magnets"><input className="admin-input" value={form.magnet} onChange={e => set('magnet', e.target.value)} /></Field>
            <Field label="Wind"><input className="admin-input" value={form.wind} onChange={e => set('wind', e.target.value)} /></Field>
            <Field label="Found in">
              <select className="admin-select" value={form.found_in_model_id || ''} onChange={e => set('found_in_model_id', e.target.value)}>
                <option value="">—</option>
                {others.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </Field>
          </>}
          <Field label="Intro" hint="The paragraph under the name at the top of the page." wide>
            <textarea className="admin-textarea" rows={3} value={form.lede} onChange={e => set('lede', e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-head">Photos</div>
        <p className="admin-hint" style={{ marginTop: 0 }}>
          The first photo leads the page.{guitar && ' Photos 2–5 sit beside the Body, Neck, Electronics and Hardware spec tabs.'}
        </p>
        <PhotoList images={images} onChange={changeImages}
          cardUrl={guitar ? form.card_image_url : undefined}
          onPickCard={guitar ? (url) => set('card_image_url', url) : undefined} />
      </div>

      {guitar && (
        <div className="admin-card admin-form">
          <div className="admin-card-head">Homepage card</div>
          <div className="admin-form-grid">
            <Field label="Headline" hint="Wrap the part in italics with asterisks: The Broad*man.*">
              <input className="admin-input" value={form.card_headline} onChange={e => set('card_headline', e.target.value)} placeholder={`The *${form.name || 'Name'}.*`} />
            </Field>
            <Field label="Photo focus" hint="Where the card photo is centered, e.g. 55% 50%">
              <input className="admin-input" value={form.card_image_pos} onChange={e => set('card_image_pos', e.target.value)} placeholder="center" />
            </Field>
            <Field label="Finish shown"><input className="admin-input" value={form.card_finish} onChange={e => set('card_finish', e.target.value)} /></Field>
            <Field label="Pickups shown"><input className="admin-input" value={form.card_pickups} onChange={e => set('card_pickups', e.target.value)} /></Field>
            <Field label="Construction shown"><input className="admin-input" value={form.card_construction} onChange={e => set('card_construction', e.target.value)} /></Field>
            <Field label="Blurb" wide><textarea className="admin-textarea" rows={2} value={form.blurb} onChange={e => set('blurb', e.target.value)} /></Field>
          </div>
          {!form.card_image_url && images.length > 0 && <div className="admin-hint">No card photo picked, so the first photo is used.</div>}
        </div>
      )}

      <div className="admin-card admin-form">
        <div className="admin-card-head">Story</div>
        <Field label="Heading"><input className="admin-input" value={form.story.heading} onChange={e => setStory('heading', e.target.value)} /></Field>
        <div className="admin-form-row">
          <Field label="First column"><textarea className="admin-textarea" rows={6} value={form.story.problem} onChange={e => setStory('problem', e.target.value)} /></Field>
          <Field label="Second column"><textarea className="admin-textarea" rows={6} value={form.story.solution} onChange={e => setStory('solution', e.target.value)} /></Field>
        </div>
        <Field label="Pull quote"><input className="admin-input" value={form.story.pull} onChange={e => setStory('pull', e.target.value)} /></Field>
        {guitar && <Field label="Bench tag: built" hint="e.g. Built 2026 · Fortville, IN"><input className="admin-input" value={form.build_note} onChange={e => set('build_note', e.target.value)} /></Field>}
      </div>

      {guitar && (
        <div className="admin-card">
          <div className="admin-card-head">Colors</div>
          {swatches.map((s, i) => (
            <div className="admin-edit-row" key={i}>
              <input type="color" className="admin-color" value={/^#[0-9a-f]{6}$/i.test(s.hex) ? s.hex : '#000000'}
                onChange={e => changeSwatches(replaceAt(swatches, i, { hex: e.target.value.toUpperCase() }))} />
              <input className="admin-input" style={{ maxWidth: 110 }} value={s.hex} onChange={e => changeSwatches(replaceAt(swatches, i, { hex: e.target.value }))} placeholder="#F2B8BC" />
              <input className="admin-input" value={s.name} onChange={e => changeSwatches(replaceAt(swatches, i, { name: e.target.value }))} placeholder="Color name" />
              <RowTools list={swatches} i={i} onChange={changeSwatches} />
            </div>
          ))}
          <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => changeSwatches([...swatches, { name: '', hex: '#000000' }])}>+ Add color</button>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-head">Spec sheet</div>
        {SECTIONS[form.kind].map(([key, title]) => {
          const rows = specs.map((s, n) => ({ ...s, n })).filter(s => s.section === key);
          const update = (n, patch) => changeSpecs(replaceAt(specs, n, patch));
          const moveRow = (pos, by) => {
            const a = rows[pos]?.n, b = rows[pos + by]?.n;
            if (a == null || b == null) return;
            const next = [...specs];
            [next[a], next[b]] = [next[b], next[a]];
            changeSpecs(next);
          };
          return (
            <div key={key} className="admin-spec-section">
              <div className="admin-label">{title}</div>
              {rows.map((r, pos) => (
                <div className="admin-edit-row" key={r.n}>
                  <input className="admin-input" style={{ maxWidth: 180 }} value={r.label} onChange={e => update(r.n, { label: e.target.value })} placeholder="Label" />
                  <input className="admin-input" value={r.value} onChange={e => update(r.n, { value: e.target.value })} placeholder="Value" />
                  <span className="admin-row-tools">
                    <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" disabled={pos === 0} onClick={() => moveRow(pos, -1)}>↑</button>
                    <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" disabled={pos === rows.length - 1} onClick={() => moveRow(pos, 1)}>↓</button>
                    <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => changeSpecs(specs.filter((_, n) => n !== r.n))}>✕</button>
                  </span>
                </div>
              ))}
              <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => changeSpecs([...specs, { section: key, label: '', value: '' }])}>+ Add row</button>
            </div>
          );
        })}
      </div>

      {!isNew && (
        <div style={{ margin: '8px 0 90px' }}>
          <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={remove}>Delete model</button>
        </div>
      )}

      <SaveBar saving={saving} saved={saved} error={error} dirty={dirty} label={isNew ? 'Create model' : 'Save changes'}
        onCancel={() => { if (!dirty || window.confirm('Leave without saving?')) onDone(null); }} />
    </form>
  );
}
