import React, { useState, useEffect, useCallback } from 'react';
import { apiCall, fmt$$, fmtDate } from '../api';

// ============================================================
// LISTINGS
// ============================================================
export function Listings({ onExpire, onView, onEdit }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [acting, setActing] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    apiCall('/api/admin-listings')
      .then(d => { setListings(d.listings || []); setLoading(false); })
      .catch(err => {
        if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
        setError(err.message); setLoading(false);
      });
  }, []);

  useEffect(load, [load]);

  const markSold = async (id) => {
    setActing(id);
    try {
      await apiCall('/api/admin-listings', { method: 'PATCH', body: { id, available: false } });
      load();
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
      alert(err.message);
    } finally {
      setActing(null);
    }
  };

  const markAvailable = async (id) => {
    setActing(id);
    try {
      await apiCall('/api/admin-listings', { method: 'PATCH', body: { id, available: true } });
      load();
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
      alert(err.message);
    } finally {
      setActing(null);
    }
  };

  const archive = async (id) => {
    if (!confirm('Archive this listing? It will no longer appear anywhere.')) return;
    setActing(id);
    try {
      await apiCall('/api/admin-listings', { method: 'PATCH', body: { id, active: false } });
      load();
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
      alert(err.message);
    } finally {
      setActing(null);
    }
  };

  const visible = listings.filter(l => {
    if (!l.active) return filter === 'archived';
    if (filter === 'available') return l.available;
    if (filter === 'sold') return !l.available;
    if (filter === 'archived') return false;
    return true;
  });

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Listings</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => onView('new-listing')}>
          + New Listing
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-filters">
        {['all', 'available', 'sold', 'archived'].map(f => (
          <button key={f} className={`admin-filter${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="admin-card">
          <p className="admin-empty-text">No listings in this category.</p>
        </div>
      ) : (
        <div className="admin-listing-list">
          {visible.map(l => (
            <div key={l.id} className="admin-listing-row">
              {l.images?.[0]
                ? <img src={l.images[0]} alt={l.name} className="admin-listing-thumb" />
                : <div className="admin-listing-thumb-ph">No img</div>
              }
              <div className="admin-listing-info">
                <div className="admin-listing-name">{l.name}</div>
                <div className="admin-listing-meta">
                  {l.serial && `S/N ${l.serial}`}
                  {l.serial && l.model && ' · '}
                  {l.model}
                  {(l.serial || l.model) && ' · '}
                  {fmtDate(l.createdAt)}
                </div>
              </div>
              <span className={`badge badge-${l.available ? 'available' : 'sold'}`}>
                {l.available ? 'Available' : 'Sold'}
              </span>
              <div className="admin-listing-price">{fmt$$(l.price)}</div>
              <div className="admin-listing-actions">
                <button
                  className="admin-btn admin-btn-ghost admin-btn-sm"
                  onClick={() => onEdit(l)}
                  disabled={acting === l.id}
                >
                  Edit
                </button>
                {l.active && l.available && (
                  <button
                    className="admin-btn admin-btn-ghost admin-btn-sm"
                    onClick={() => markSold(l.id)}
                    disabled={acting === l.id}
                  >
                    Mark sold
                  </button>
                )}
                {l.active && !l.available && (
                  <button
                    className="admin-btn admin-btn-ghost admin-btn-sm"
                    onClick={() => markAvailable(l.id)}
                    disabled={acting === l.id}
                  >
                    Re-list
                  </button>
                )}
                {l.active && (
                  <button
                    className="admin-btn admin-btn-ghost admin-btn-sm"
                    onClick={() => archive(l.id)}
                    disabled={acting === l.id}
                  >
                    Archive
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
