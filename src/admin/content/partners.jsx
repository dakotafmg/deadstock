import React, { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { STATIC_CONTENT } from '../../content/use-content';
import { Field, RowTools, SaveBar, UploadButton, replaceAt, useLeaveWarning } from './parts';

// ============================================================
// SITE CONTENT — partners page
// ============================================================
export function ContentPartners({ onExpire }) {
  const [list, setList] = useState(null);
  const [fromBuiltIn, setFromBuiltIn] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  useLeaveWarning(dirty);

  const handle = (err) => { if (err.message === 'SESSION_EXPIRED') onExpire(); else setError(err.message); };

  useEffect(() => {
    apiCall('/api/content?view=admin').then(d => {
      if (d.partners.length) {
        setList(d.partners.map(p => ({ name: p.name, role: p.role || '', logo_url: p.logo_url || '', description: p.description, website_url: p.website_url || '' })));
      } else {
        setFromBuiltIn(true);
        setList(STATIC_CONTENT.partners.map(p => ({ name: p.name, role: p.role, logo_url: p.logo, description: p.description, website_url: p.url })));
      }
    }).catch(handle);
  }, []);

  const change = (next) => { setList(next); setDirty(true); setSaved(false); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      await apiCall('/api/content', { method: 'POST', body: { action: 'partners-save', partners: list } });
      setDirty(false); setSaved(true); setFromBuiltIn(false);
    } catch (err) { handle(err); }
    finally { setSaving(false); }
  };

  if (error && !list) return <div className="admin-error">{error}</div>;
  if (!list) return <div className="admin-loading">Loading...</div>;

  return (
    <form onSubmit={save}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Partners</h1>
        <button type="button" className="admin-btn admin-btn-primary"
          onClick={() => change([...list, { name: '', role: '', logo_url: '', description: '', website_url: '' }])}>+ Add partner</button>
      </div>
      <p className="admin-page-sub" style={{ marginTop: -12 }}>The Partners page, in this order.</p>
      {fromBuiltIn && <div className="admin-notice">These are the partners built into the site. Saving here moves them into the dashboard.</div>}

      {list.map((p, i) => (
        <div className="admin-card admin-form admin-partner-item" key={i}>
          <div className="admin-edit-row" style={{ marginBottom: 12 }}>
            <strong>{i + 1}. {p.name || 'New partner'}</strong>
            <span style={{ flex: 1 }} />
            <RowTools list={list} i={i} onChange={change} removeLabel="Remove partner" />
          </div>
          <div className="admin-partner-grid">
            <div className="admin-partner-logo">
              {p.logo_url ? <img src={p.logo_url} alt={p.name} /> : <div className="admin-listing-thumb-ph" />}
              <UploadButton label={p.logo_url ? 'Replace logo' : 'Add logo'} multiple={false}
                onUploaded={([url]) => change(replaceAt(list, i, { logo_url: url }))} />
            </div>
            <div className="admin-form-grid">
              <Field label="Name"><input className="admin-input" value={p.name} onChange={e => change(replaceAt(list, i, { name: e.target.value }))} required /></Field>
              <Field label="What they make" hint="e.g. Bodies, Necks"><input className="admin-input" value={p.role} onChange={e => change(replaceAt(list, i, { role: e.target.value }))} /></Field>
              <Field label="Website" wide><input className="admin-input" type="url" value={p.website_url} onChange={e => change(replaceAt(list, i, { website_url: e.target.value }))} placeholder="https://" /></Field>
              <Field label="About" wide><textarea className="admin-textarea" rows={3} value={p.description} onChange={e => change(replaceAt(list, i, { description: e.target.value }))} /></Field>
            </div>
          </div>
        </div>
      ))}

      <SaveBar saving={saving} saved={saved} error={error} dirty={dirty || fromBuiltIn} />
    </form>
  );
}
