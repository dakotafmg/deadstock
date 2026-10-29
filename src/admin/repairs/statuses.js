// ============================================================
// REPAIRS — status names and order, shared by the board and job page
// ============================================================

export const STATUS_LABELS = {
  requested:   'Requested',
  received:    'Received',
  quoted:      'Quoted',
  approved:    'Approved',
  in_progress: 'In progress',
  ready:       'Ready for pickup',
  picked_up:   'Picked up',
  declined:    'Declined',
};

// Board columns, left to right. Picked up and declined are "closed".
export const OPEN_STATUSES = ['requested', 'received', 'quoted', 'approved', 'in_progress', 'ready'];
export const CLOSED_STATUSES = ['picked_up', 'declined'];
export const ALL_STATUSES = [...OPEN_STATUSES, ...CLOSED_STATUSES];

// Moving to these emails the customer, so the job page confirms first.
export const EMAILS_CUSTOMER = ['received', 'quoted', 'ready'];

export function instrumentName(job) {
  return [job.instrument_brand, job.instrument_model].filter(Boolean).join(' ') || 'Instrument';
}

// Whole days a job has been open, for the board cards.
export function daysOpen(job) {
  return Math.max(0, Math.floor((Date.now() - new Date(job.created_at)) / 86_400_000));
}
