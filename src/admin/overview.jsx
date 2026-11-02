import React, { useState, useEffect } from 'react';
import { apiCall, fmt$$, fmtDate, can } from './api';
import { STATUS_LABELS } from './repairs/statuses';

// ============================================================
// OVERVIEW
// ============================================================
export function Overview({ staff, onExpire, onView, onOpenRepair }) {
  const [listings, setListings] = useState([]);
  const [sales, setSales] = useState([]);
  const [repairs, setRepairs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Repairs need Supabase; until it's set up the card just stays hidden.
    if (can.repairs(staff)) {
      apiCall('/api/admin-repairs').then(d => setRepairs(d.jobs || [])).catch(() => setRepairs(null));
    }
    if (!can.sales(staff)) { setLoading(false); return; }
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
  const soldCt    = sales.filter(x => x.channel !== 'repair').length;
  const totalRev  = sales.reduce((s, x) => s + (x.amount || 0), 0);
  const recent    = sales.slice(0, 8);

  return (
    <div>
      <h1 className="admin-page-title">Overview</h1>

      {repairs && <RepairsSummary jobs={repairs} onView={onView} onOpen={onOpenRepair} />}

      {can.sales(staff) && <>
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
      </>}
    </div>
  );
}

// Open repair jobs at a glance: counts per status, then the newest few.
function RepairsSummary({ jobs, onView, onOpen }) {
  const counts = jobs.reduce((m, j) => ({ ...m, [j.status]: (m[j.status] || 0) + 1 }), {});
  return (
    <div className="admin-card">
      <div className="admin-card-head">
        <span>Open Repairs · {jobs.length}</span>
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => onView('repairs')}>
          Repair board →
        </button>
      </div>
      {jobs.length === 0 ? (
        <p className="admin-empty-text">No open repairs.</p>
      ) : (
        <>
          <div className="admin-repair-counts">
            {Object.entries(counts).map(([status, n]) => (
              <span key={status} className={`badge badge-repair-${status}`}>{STATUS_LABELS[status]} · {n}</span>
            ))}
          </div>
          <div className="admin-table-wrap"><table className="admin-table">
            <tbody>
              {jobs.slice(0, 5).map(j => (
                <tr key={j.id} className="admin-row-clickable" onClick={() => onOpen(j.id)}>
                  <td className="admin-mono">{j.job_number}</td>
                  <td className="admin-td-product">{[j.instrument_brand, j.instrument_model].filter(Boolean).join(' ') || '—'}</td>
                  <td>{j.customer?.name || '—'}</td>
                  <td><span className={`badge badge-repair-${j.status}`}>{STATUS_LABELS[j.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </>
      )}
    </div>
  );
}
