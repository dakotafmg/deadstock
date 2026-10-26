import React, { useState, useEffect, useCallback } from 'react';
import { apiCall, fmt$$, fmtDate } from '../api';
import { SaleDetail } from './sale-detail';

// ============================================================
// SALES
// ============================================================
export function Sales({ onExpire }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    apiCall('/api/admin-sales')
      .then(d => { setSales(d.sales || []); setLoading(false); })
      .catch(err => {
        if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
        setError(err.message); setLoading(false);
      });
  }, []);

  useEffect(load, [load]);

  const deleteSale = async (id) => {
    if (!confirm('Void and remove this sale record?')) return;
    setDeleting(id);
    try {
      await apiCall('/api/admin-sales', { method: 'DELETE', body: { id } });
      load();
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const visible = filter === 'all' ? sales : sales.filter(s => s.channel === filter);
  const totalRev = visible.reduce((s, x) => s + (x.amount || 0), 0);

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div>
      <SaleDetail sale={selected} onClose={() => setSelected(null)} />
      <h1 className="admin-page-title">All Sales</h1>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-sales-header">
        <div className="admin-filters">
          {['all', 'online', 'manual'].map(f => (
            <button key={f} className={`admin-filter${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="admin-revenue-total">
          {visible.length} sale{visible.length !== 1 ? 's' : ''} · {fmt$$(totalRev)} total
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        {visible.length === 0 ? (
          <p className="admin-empty-text" style={{ padding: '32px 24px' }}>No sales yet.</p>
        ) : (
          <div className="admin-table-wrap"><table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Channel</th>
                <th>Method</th>
                <th>Buyer</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map(s => (
                <tr key={s.id} className="admin-row-clickable" onClick={() => setSelected(s)}>
                  <td>{fmtDate(s.date)}</td>
                  <td className="admin-td-product">
                    {s.productName || (s.productId ? <span className="admin-mono">{s.productId.slice(0, 12)}…</span> : '—')}
                  </td>
                  <td><strong>{fmt$$(s.amount)}</strong></td>
                  <td><span className={`badge badge-${s.channel}`}>{s.channel}</span></td>
                  <td className="admin-muted">{s.paymentMethod || '—'}</td>
                  <td className="admin-muted">{s.customer || '—'}</td>
                  <td onClick={e => e.stopPropagation()}>
                    {(s.channel === 'manual' || s.channel === 'online') && (
                      <button
                        className="admin-btn admin-btn-ghost admin-btn-sm admin-btn-danger"
                        onClick={() => deleteSale(s.id)}
                        disabled={deleting === s.id}
                      >
                        {deleting === s.id ? '…' : 'Delete'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}
