import React, { useState, useEffect, useCallback } from 'react';
import { apiCall, fmt$$, fmtDate } from '../api';

// ============================================================
// SITE CONTENT — models list (guitar + pickup pages)
// ============================================================
const STATUS_LABEL = { available: 'Live', in_development: 'Coming soon', hidden: 'Hidden' };

export function ContentModels({ onExpire, onEdit }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    apiCall('/api/content?view=admin')
      .then(setData)
      .catch(err => { if (err.message === 'SESSION_EXPIRED') onExpire(); else setError(err.message); });
  }, []);
  useEffect(load, [load]);

  if (error) return <div className="admin-error">{error}</div>;
  if (!data) return <div className="admin-loading">Loading...</div>;

  const cover = (id) => data.images.find(i => i.model_id === id)?.url;
  const groups = [
    ['Guitars', data.models.filter(m => m.kind === 'guitar')],
    ['Pickups', data.models.filter(m => m.kind === 'pickup')],
  ];

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Models</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => onEdit(null)}>+ New model</button>
      </div>
      <p className="admin-page-sub" style={{ marginTop: -12 }}>
        The model pages and the homepage lineup. Guitars that are Live or Coming soon show on the homepage in this order.
      </p>

      {data.models.length === 0 && (
        <div className="admin-notice">
          No models in Supabase yet, so the site is still showing the built-in copy. Run the content seed SQL to bring it in.
        </div>
      )}

      {groups.map(([title, list]) => list.length > 0 && (
        <div className="admin-card" key={title}>
          <div className="admin-card-head">{title}</div>
          <div className="admin-listing-list">
            {list.map(m => (
              <div key={m.id} className="admin-listing-row admin-row-clickable" onClick={() => onEdit(m.id)}>
                {cover(m.id)
                  ? <img className="admin-listing-thumb" src={cover(m.id)} alt="" />
                  : <div className="admin-listing-thumb-ph" />}
                <div className="admin-listing-info">
                  <div className="admin-listing-name">{m.name}</div>
                  <div className="admin-listing-meta">
                    /{m.id} · {m.archetype || m.kind} · {STATUS_LABEL[m.status]}{m.updated_at ? ` · edited ${fmtDate(m.updated_at)}` : ''}
                  </div>
                </div>
                <div className="admin-listing-price">{fmt$$(m.base_price_cents)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
