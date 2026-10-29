import React, { useState, useEffect, useCallback } from 'react';
import { apiCall, fmtDate } from '../api';

// ============================================================
// TEAM — invite staff, set roles, turn accounts off (owner only)
// ============================================================
const ROLE_INFO = {
  owner: 'Everything, including staff and settings',
  sales: 'Listings, sales, logging in-person sales; can view repairs',
  tech:  'Repair jobs: intake, quotes, status, notes, invoices',
};

export function Team({ staff: me, onExpire }) {
  const [team, setTeam] = useState([]);
  const [invite, setInvite] = useState({ email: '', full_name: '', role: 'tech' });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const handle = (err) => {
    if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
    setError(err.message);
  };

  const load = useCallback(() => {
    apiCall('/api/admin-team')
      .then(d => { setTeam(d.staff || []); setLoading(false); })
      .catch(err => { handle(err); setLoading(false); });
  }, []);
  useEffect(load, [load]);

  const sendInvite = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null); setNotice(null);
    try {
      await apiCall('/api/admin-team', { method: 'POST', body: { action: 'invite', ...invite } });
      setNotice(`Invite sent to ${invite.email}. They'll pick their own password from the email.`);
      setInvite({ email: '', full_name: '', role: 'tech' });
      load();
    } catch (err) { handle(err); }
    finally { setBusy(false); }
  };

  const update = async (id, fields, question) => {
    if (question && !confirm(question)) return;
    setBusy(true); setError(null); setNotice(null);
    try {
      await apiCall('/api/admin-team', { method: 'PATCH', body: { id, ...fields } });
      load();
    } catch (err) { handle(err); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div>
      <h1 className="admin-page-title">Staff</h1>

      {error && <div className="admin-error">{error}</div>}
      {notice && <div className="admin-notice">{notice}</div>}

      <div className="admin-card">
        <div className="admin-card-head"><span>Team</span></div>
        <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>Name</th><th>Role</th><th>Last sign-in</th><th /></tr></thead>
          <tbody>
            {team.map(p => (
              <tr key={p.id} className={p.active ? '' : 'admin-row-off'}>
                <td className="admin-td-product">
                  {p.full_name || '—'}
                  <div className="admin-muted" style={{ fontSize: 12 }}>{p.email}</div>
                </td>
                <td>
                  <select className="admin-select admin-select-sm" value={p.role} disabled={busy || p.id === me.id}
                    onChange={e => update(p.id, { role: e.target.value }, `Change ${p.full_name || p.email} to ${e.target.value}?`)}>
                    {Object.keys(ROLE_INFO).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td>{p.invite_pending ? <span className="badge badge-manual">Invite pending</span> : fmtDate(p.last_sign_in_at)}</td>
                <td>
                  {p.id !== me.id && (p.active
                    ? <button className="admin-btn admin-btn-ghost admin-btn-sm" disabled={busy}
                        onClick={() => update(p.id, { active: false }, `Turn off ${p.full_name || p.email}'s access? They'll be signed out and can't sign back in.`)}>Turn off</button>
                    : <button className="admin-btn admin-btn-ghost admin-btn-sm" disabled={busy}
                        onClick={() => update(p.id, { active: true })}>Turn back on</button>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      <form className="admin-card admin-form" onSubmit={sendInvite}>
        <div className="admin-card-head"><span>Invite someone</span></div>
        <div className="admin-form-row">
          <div className="admin-field"><label className="admin-label">Name</label>
            <input className="admin-input" value={invite.full_name} onChange={e => setInvite(i => ({ ...i, full_name: e.target.value }))} /></div>
          <div className="admin-field"><label className="admin-label">Email</label>
            <input className="admin-input" type="email" value={invite.email} onChange={e => setInvite(i => ({ ...i, email: e.target.value }))} /></div>
        </div>
        <div className="admin-field">
          <label className="admin-label">Role</label>
          <select className="admin-select" value={invite.role} onChange={e => setInvite(i => ({ ...i, role: e.target.value }))}>
            {Object.keys(ROLE_INFO).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <div className="admin-hint">{ROLE_INFO[invite.role]}</div>
        </div>
        <div className="admin-form-actions">
          <button className="admin-btn admin-btn-primary" disabled={busy || !invite.email}>{busy ? 'Sending...' : 'Send invite'}</button>
        </div>
      </form>
    </div>
  );
}
