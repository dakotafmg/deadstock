import React, { useState, useEffect } from 'react';
import { apiCall } from '../api';

// ============================================================
// SETTINGS — shop details shown on the site (owner only)
// ============================================================
export function Settings({ onExpire }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiCall('/api/admin-team?view=settings')
      .then(d => setForm({ phone: d.settings?.phone || '', contact_email: d.settings?.contact_email || '' }))
      .catch(err => { if (err.message === 'SESSION_EXPIRED') onExpire(); else setError(err.message); });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null); setSaved(false);
    try {
      await apiCall('/api/admin-team', { method: 'PUT', body: { settings: form } });
      setSaved(true);
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
      setError(err.message);
    } finally { setSaving(false); }
  };

  if (error && !form) return <div className="admin-error">{error}</div>;
  if (!form) return <div className="admin-loading">Loading...</div>;

  return (
    <div>
      <h1 className="admin-page-title">Settings</h1>
      <form className="admin-form" onSubmit={save}>
        {error && <div className="admin-error">{error}</div>}
        {saved && <div className="admin-notice">Saved. The repairs page picks it up within 5 minutes.</div>}
        <div className="admin-field">
          <label className="admin-label">Shop phone</label>
          <input className="admin-input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(317) 555-0100" />
        </div>
        <div className="admin-field">
          <label className="admin-label">Repairs contact email</label>
          <input className="admin-input" type="email" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} placeholder="repairs@deadstockguitars.com" />
        </div>
        <div className="admin-form-actions">
          <button className="admin-btn admin-btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}
