import React, { useState, useEffect, useCallback } from 'react';
import { apiCall, fmt$$ } from '../api';

// ============================================================
// REPAIR SERVICES — the menu and starting prices on /repairs
// ============================================================
const BLANK = { name: '', description: '', price: '', est_days: '', sort_order: '', active: true };

export function RepairServices({ onExpire }) {
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null); // a form object, or null
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handle = (err) => {
    if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
    setError(err.message);
  };

  const load = useCallback(() => {
    apiCall('/api/admin-repairs?view=services')
      .then(d => { setServices(d.services || []); setLoading(false); })
      .catch(err => { handle(err); setLoading(false); });
  }, []);
  useEffect(load, [load]);

  const edit = (s) => setEditing(s ? {
    id: s.id, name: s.name, description: s.description,
    price: s.starting_price_cents == null ? '' : String(s.starting_price_cents / 100),
    est_days: s.est_days ?? '', sort_order: s.sort_order ?? '', active: s.active,
  } : { ...BLANK, sort_order: String((services.at(-1)?.sort_order || 0) + 10) });

  const set = (k, v) => setEditing(f => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiCall('/api/admin-repairs', {
        method: 'POST',
        body: {
          action: 'service-save',
          service: {
            id: editing.id,
            name: editing.name,
            description: editing.description,
            starting_price_cents: editing.price === '' ? null : Math.round(parseFloat(editing.price) * 100),
            est_days: editing.est_days,
            sort_order: editing.sort_order,
            active: editing.active,
          },
        },
      });
      setEditing(null);
      load();
    } catch (err) { handle(err); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Services & Prices</h1>
        {!editing && <button className="admin-btn admin-btn-primary" onClick={() => edit(null)}>+ Add service</button>}
      </div>
      <p className="admin-page-sub" style={{ marginTop: -12 }}>What customers see on the repairs page. Leave the price blank to show "Quoted".</p>

      {error && <div className="admin-error">{error}</div>}

      {editing && (
        <form className="admin-card admin-form" onSubmit={save}>
          <div className="admin-field"><label className="admin-label">Name</label>
            <input className="admin-input" value={editing.name} onChange={e => set('name', e.target.value)} autoFocus /></div>
          <div className="admin-field"><label className="admin-label">Description</label>
            <textarea className="admin-textarea" rows={2} value={editing.description} onChange={e => set('description', e.target.value)} /></div>
          <div className="admin-form-row">
            <div className="admin-field"><label className="admin-label">Starting price ($)</label>
              <input className="admin-input" type="number" min="0" step="1" value={editing.price} onChange={e => set('price', e.target.value)} placeholder="Quoted" /></div>
            <div className="admin-field"><label className="admin-label">Typical days</label>
              <input className="admin-input" type="number" min="0" value={editing.est_days} onChange={e => set('est_days', e.target.value)} /></div>
            <div className="admin-field"><label className="admin-label">Order</label>
              <input className="admin-input" type="number" value={editing.sort_order} onChange={e => set('sort_order', e.target.value)} /></div>
          </div>
          <label className="admin-check" style={{ marginBottom: 16 }}>
            <input type="checkbox" checked={editing.active} onChange={e => set('active', e.target.checked)} />
            Show on the repairs page
          </label>
          <div className="admin-form-actions">
            <button className="admin-btn admin-btn-primary" disabled={saving || !editing.name.trim()}>{saving ? 'Saving...' : 'Save'}</button>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="admin-card">
        {services.length === 0 ? <p className="admin-empty-text">No services yet.</p> : (
          <div className="admin-table-wrap"><table className="admin-table">
            <thead><tr><th>Service</th><th>From</th><th>Days</th><th>Shown</th><th /></tr></thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id}>
                  <td className="admin-td-product">{s.name}<div className="admin-muted" style={{ fontSize: 12 }}>{s.description}</div></td>
                  <td>{s.starting_price_cents == null ? 'Quoted' : fmt$$(s.starting_price_cents)}</td>
                  <td>{s.est_days ?? '—'}</td>
                  <td>{s.active ? 'Yes' : <span className="admin-muted">Hidden</span>}</td>
                  <td><button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => edit(s)}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}
