-- Migration 2: customers and repairs
-- From the Deadstock Supabase schema plan (2026-10-22). Money is integer cents.

create table customers (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null default '',
  email               text,
  phone               text,
  stripe_customer_id  text unique,
  created_at          timestamptz not null default now()
);
create unique index customers_email_key on customers (lower(email)) where email is not null;

create type repair_status as enum (
  'requested', 'received', 'quoted', 'approved',
  'in_progress', 'ready', 'picked_up', 'declined'
);

create table repair_services (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  description           text not null default '',
  starting_price_cents  integer check (starting_price_cents >= 0),
  est_days              integer,
  active                boolean not null default true,
  sort_order            integer not null default 0
);

create sequence repair_job_number_seq start 1001;

create table repair_jobs (
  id                 uuid primary key default gen_random_uuid(),
  job_number         text not null unique default ('R-' || nextval('repair_job_number_seq')),
  customer_id        uuid not null references customers (id),
  instrument_brand   text not null default '',
  instrument_model   text not null default '',
  instrument_serial  text,
  issue              text not null,
  status             repair_status not null default 'requested',
  assigned_to        uuid references profiles (id) on delete set null,
  quote_cents        integer check (quote_cents >= 0),
  quote_notes        text,
  order_id           uuid,                  -- FK added in migration 3
  public_token       uuid not null unique default gen_random_uuid(),
  received_at        timestamptz,
  promised_at        timestamptz,
  completed_at       timestamptz,
  picked_up_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index on repair_jobs (status);
create index on repair_jobs (customer_id);

create table repair_job_services (
  job_id       uuid not null references repair_jobs (id) on delete cascade,
  service_id   uuid not null references repair_services (id),
  price_cents  integer not null check (price_cents >= 0),
  notes        text,
  primary key (job_id, service_id)
);

create type repair_photo_stage as enum ('intake', 'progress', 'final');

create table repair_photos (
  id           uuid primary key default gen_random_uuid(),
  job_id       uuid not null references repair_jobs (id) on delete cascade,
  url          text not null,
  stage        repair_photo_stage not null default 'intake',
  uploaded_by  uuid references profiles (id) on delete set null,  -- null = customer
  created_at   timestamptz not null default now()
);

create type repair_event_kind as enum ('status', 'note', 'message');

create table repair_events (
  id                   bigint generated always as identity primary key,
  job_id               uuid not null references repair_jobs (id) on delete cascade,
  actor_id             uuid references profiles (id) on delete set null,  -- null = customer/system
  kind                 repair_event_kind not null,
  from_status          repair_status,
  to_status            repair_status,
  body                 text,
  visible_to_customer  boolean not null default false,
  created_at           timestamptz not null default now()
);
create index on repair_events (job_id, created_at);

alter table customers           enable row level security;
alter table repair_services     enable row level security;
alter table repair_jobs         enable row level security;
alter table repair_job_services enable row level security;
alter table repair_photos       enable row level security;
alter table repair_events       enable row level security;

create policy "staff use customers"  on customers for all using (has_role('{owner,sales,tech}'));
create policy "public reads active services" on repair_services for select using (active);
create policy "staff read services"  on repair_services for select using (has_role('{owner,sales,tech}'));
create policy "tech edits services"  on repair_services for all    using (has_role('{owner,tech}'));
-- Public request form and status link go through serverless functions (service key), not RLS.
create policy "staff read jobs"      on repair_jobs         for select using (has_role('{owner,sales,tech}'));
create policy "tech edits jobs"      on repair_jobs         for all    using (has_role('{owner,tech}'));
create policy "staff read job svcs"  on repair_job_services for select using (has_role('{owner,sales,tech}'));
create policy "tech edits job svcs"  on repair_job_services for all    using (has_role('{owner,tech}'));
create policy "staff read photos"    on repair_photos       for select using (has_role('{owner,sales,tech}'));
create policy "tech edits photos"    on repair_photos       for all    using (has_role('{owner,tech}'));
create policy "staff read events"    on repair_events       for select using (has_role('{owner,sales,tech}'));
create policy "tech adds events"     on repair_events       for all    using (has_role('{owner,tech}'));
