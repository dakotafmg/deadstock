import React, { useState, useEffect } from 'react';
import { apiCall, fmtDateTime } from '../api';

// ============================================================
// ACTIVITY — who changed what, newest first (owner only)
// ============================================================
const ACTION_LABELS = {
  'listing.create': 'Created listing',
  'listing.update': 'Edited listing',
  'sale.log': 'Logged a sale',
  'sale.delete': 'Deleted a sale',
  'repair.create': 'Checked in a repair',
  'repair.update': 'Updated a repair',
  'repair.invoice': 'Sent a repair invoice',
  'repair_service.save': 'Edited a repair service',
  'staff.invite': 'Invited staff',
  'staff.update': 'Changed staff access',
  'settings.update': 'Changed site settings',
};

export function Activity({ onExpire }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiCall('/api/admin-team?view=activity')
      .then(d => setRows(d.activity || []))
      .catch(err => { if (err.message === 'SESSION_EXPIRED') onExpire(); else setError(err.message); });
  }, []);

  if (error) return <div className="admin-error">{error}</div>;
  if (!rows) return <div className="admin-loading">Loading...</div>;

  return (
    <div>
      <h1 className="admin-page-title">Activity</h1>
      <div className="admin-card">
        {rows.length === 0 ? <p className="admin-empty-text">Nothing yet.</p> : (
          <div className="admin-table-wrap"><table className="admin-table">
            <thead><tr><th>When</th><th>Who</th><th>What</th><th>Details</th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(r.created_at)}</td>
                  <td>{r.actor?.full_name || r.actor?.email || (r.changes?.via ? 'Old admin login' : '—')}</td>
                  <td className="admin-td-product">{ACTION_LABELS[r.action] || r.action}</td>
                  <td className="admin-mono admin-muted" style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    title={JSON.stringify(r.changes)}>
                    {r.entity_id}{r.changes ? ` · ${summarize(r.changes)}` : ''}
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

function summarize(changes) {
  return Object.entries(changes)
    .filter(([k]) => k !== 'via')
    .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
    .join(', ');
}
