-- Migration 3: inventory and sales (mirrors Stripe)
-- From the Deadstock Supabase schema plan (2026-10-22). Money is integer cents.

create type item_type      as enum ('guitar', 'pickup');
create type listing_status as enum ('draft', 'available', 'reserved', 'sold', 'archived');
create type order_channel  as enum ('online', 'in_person', 'repair');
create type payment_method as enum (
  'stripe_checkout', 'cash', 'check', 'card', 'bank_transfer',
  'affirm', 'afterpay', 'klarna', 'trade', 'other'
);

create table listings (
  id                 uuid primary key default gen_random_uuid(),
  stripe_product_id  text unique,
  stripe_price_id    text,
  model_id           text,                  -- FK added in migration 4
  type               item_type not null default 'guitar',
  name               text not null,
  serial             text unique,
  condition          text not null default '',
  description        text not null default '',
  specs_text         text not null default '',
  price_cents        integer not null check (price_cents >= 0),
  status             listing_status not null default 'draft',
  created_at         timestamptz not null default now(),
  sold_at            timestamptz
);
create index on listings (status);

create table listing_images (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references listings (id) on delete cascade,
  url         text not null,
  sort_order  integer not null default 0
);
create index on listing_images (listing_id, sort_order);

create table orders (
  id                          uuid primary key default gen_random_uuid(),
  channel                     order_channel not null,
  stripe_checkout_session_id  text unique,
  stripe_invoice_id           text unique,
  customer_id                 uuid references customers (id),
  amount_cents                integer not null check (amount_cents >= 0),
  currency                    text not null default 'usd',
  payment_method              payment_method not null,
  notes                       text,
  voided_at                   timestamptz,
  voided_by                   uuid references profiles (id) on delete set null,
  created_at                  timestamptz not null default now(),
  check (stripe_checkout_session_id is not null or stripe_invoice_id is not null)
);
create index on orders (created_at desc);

create table order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references orders (id) on delete cascade,
  listing_id    uuid references listings (id),
  description   text not null default '',
  amount_cents  integer not null check (amount_cents >= 0)
);
-- A guitar can only be on one non-voided order: enforced in the API
-- (and by listings.status), since voids are a column on orders.

alter table repair_jobs
  add constraint repair_jobs_order_id_fkey foreign key (order_id) references orders (id);

alter table listings       enable row level security;
alter table listing_images enable row level security;
alter table orders         enable row level security;
alter table order_items    enable row level security;

create policy "public reads available listings" on listings
  for select using (status = 'available');
create policy "staff read listings"  on listings for select using (has_role('{owner,sales,tech}'));
create policy "sales edit listings"  on listings for all    using (has_role('{owner,sales}'));
create policy "public reads listing images" on listing_images
  for select using (exists (select 1 from listings l where l.id = listing_id and l.status = 'available'));
create policy "staff read listing images" on listing_images for select using (has_role('{owner,sales,tech}'));
create policy "sales edit listing images" on listing_images for all    using (has_role('{owner,sales}'));
create policy "sales use orders"      on orders      for all using (has_role('{owner,sales}'));
create policy "sales use order items" on order_items for all using (has_role('{owner,sales}'));
