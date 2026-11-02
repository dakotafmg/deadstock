-- Migration 5: repairs v1 additions
-- Run after migrations 1-4. Adds what the repair board and Stripe invoices need.

-- The Stripe invoice sent for a job, so the webhook can find the job when it is paid.
alter table repair_jobs
  add column stripe_invoice_id     text unique,
  add column invoice_url           text,
  add column invoice_amount_cents  integer check (invoice_amount_cents >= 0),
  add column paid_at               timestamptz;

-- Keep repair_jobs.updated_at current on every change.
create function touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger repair_jobs_touch
  before update on repair_jobs
  for each row execute function touch_updated_at();

-- Board queries filter open jobs by status and sort by newest.
create index on repair_jobs (created_at desc);
