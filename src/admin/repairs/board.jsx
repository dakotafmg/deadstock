import React, { useState, useEffect, useCallback } from 'react';
import { apiCall, fmt$$, fmtDate, can } from '../api';
import { STATUS_LABELS, OPEN_STATUSES, CLOSED_STATUSES, instrumentName, daysOpen } from './statuses';

// ============================================================
// REPAIR BOARD — one column per status, a card per job
// ============================================================
export function RepairBoard({ staff, onExpire, onView, onOpen }) {
  const [jobs, setJobs] = useState([]);
  const [showClosed, setShowClosed] = useState(false);
  const [mine, setMine] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    apiCall(`/api/admin-repairs${showClosed ? '?scope=all' : ''}`)
      .then(d => { setJobs(d.jobs || []); setLoading(false); })
      .catch(err => {
        if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
        setError(err.message); setLoading(false);
      });
  }, [showClosed]);

  useEffect(load, [load]);

  const visible = mine && staff.id ? jobs.filter(j => j.assigned_to === staff.id) : jobs;
  const columns = showClosed ? [...OPEN_STATUSES, ...CLOSED_STATUSES] : OPEN_STATUSES;

  return (
    <div className="admin-wide">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Repair Board</h1>
        {can.editRepairs(staff) && (
          <button className="admin-btn admin-btn-primary" onClick={() => onView('new-repair')}>+ New Repair</button>
        )}
      </div>

      <div className="admin-filters">
        <button className={`admin-filter${!mine ? ' active' : ''}`} onClick={() => setMine(false)}>All jobs</button>
        {staff.id && <button className={`admin-filter${mine ? ' active' : ''}`} onClick={() => setMine(true)}>Assigned to me</button>}
        <button className={`admin-filter${showClosed ? ' active' : ''}`} onClick={() => setShowClosed(s => !s)}>
          {showClosed ? 'Hide closed' : 'Show closed'}
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {loading ? <div className="admin-loading">Loading...</div> : (
        <div className="admin-board">
          {columns.map(status => {
            const col = visible.filter(j => j.status === status);
            return (
              <div key={status} className="admin-board-col">
                <div className="admin-board-col-head">
                  <span>{STATUS_LABELS[status]}</span>
                  <span className="admin-board-count">{col.length}</span>
                </div>
                {col.length === 0 && <div className="admin-board-empty">—</div>}
                {col.map(j => <JobCard key={j.id} job={j} onOpen={onOpen} />)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function JobCard({ job, onOpen }) {
  const overdue = job.promised_at && new Date(job.promised_at) < new Date()
    && !['ready', 'picked_up', 'declined'].includes(job.status);
  return (
    <button className="admin-board-card" onClick={() => onOpen(job.id)}>
      <div className="admin-board-card-top">
        <span className="admin-mono">{job.job_number}</span>
        <span className="admin-board-age">{daysOpen(job)}d</span>
      </div>
      <div className="admin-board-card-title">{instrumentName(job)}</div>
      <div className="admin-board-card-meta">{job.customer?.name || '—'}</div>
      <div className="admin-board-card-foot">
        {job.assignee?.full_name && <span>{job.assignee.full_name}</span>}
        {job.quote_cents != null && <span>{fmt$$(job.quote_cents)}</span>}
        {job.paid_at && <span className="badge badge-available">Paid</span>}
        {job.promised_at && <span className={overdue ? 'admin-overdue' : ''}>Due {fmtDate(job.promised_at)}</span>}
      </div>
    </button>
  );
}
