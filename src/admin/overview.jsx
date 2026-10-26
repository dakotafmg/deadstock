import React, { useState, useEffect } from 'react';
import { apiCall, fmt$$, fmtDate } from './api';

// ============================================================
// OVERVIEW
// ============================================================
export function Overview({ onExpire, onView }) {
  const [listings, setListings] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      apiCall('/api/admin-listings'),
      apiCall('/api/admin-sales'),
    ]).then(([l, s]) => {
      setListings(l.listings || []);
      setSales(s.sales || []);
      setLoading(false);
    }).catch(err => {
      if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
      setError(err.message);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="admin-loading">Loading...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  const activeCt  = listings.filter(l => l.available && l.active).length;
  const soldCt    = sales.length;
  const totalRev  = sales.reduce((s, x) => s + (x.amount || 0), 0);
  const recent    = sales.slice(0, 8);

  return (
    <div>
      <h1 className="admin-page-title">Overview</h1>

      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat-label">Active Listings</div>
          <div className="admin-stat-value">{activeCt}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Units Sold</div>
          <div className="admin-stat-value">{soldCt}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Total Revenue</div>
          <div className="admin-stat-value">{fmt$$(totalRev)}</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-head">
          <span>Recent Sales</span>
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => onView('sales')}>
            All sales →
          </button>
        </div>
        {recent.length === 0 ? (
          <p className="admin-empty-text">No sales yet.</p>
        ) : (
          <div className="admin-table-wrap"><table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Channel</th>
                <th>Buyer</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(s => (
                <tr key={s.id}>
                  <td>{fmtDate(s.date)}</td>
                  <td>{s.productName || s.productId || '—'}</td>
                  <td>{fmt$$(s.amount)}</td>
                  <td><span className={`badge badge-${s.channel}`}>{s.channel}</span></td>
                  <td>{s.customer || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}
