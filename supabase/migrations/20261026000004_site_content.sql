-- Migration 4: site content (replaces src/data.js etc.)
-- From the Deadstock Supabase schema plan (2026-10-22). Money is integer cents.

create type model_status as enum ('available', 'in_development', 'hidden');

create table models (
  id                 text primary key,       -- 'broadman', 'tele52'
  kind               item_type not null,
  name               text not null,
  archetype          text not null default '',   -- 'SINGLE-CUT' / 'HUMBUCKER'
  serial_prefix      text,
  year_label         text,                   -- 'MMXXVI'
  base_price_cents   integer check (base_price_cents >= 0),
  finish             text,
  pickups_summary    text,
  magnet             text,
  wind               text,
  lede               text not null default '',
  blurb              text not null default '',
  story              jsonb not null default '{}',  -- {heading, problem, solution, pull}
  build_note         text,
  found_in_model_id  text references models (id),
  card_image_url     text,
  card_image_pos     text,
  status             model_status not null default 'available',
  sort_order         integer not null default 0,
  updated_by         uuid references profiles (id) on delete set null,
  updated_at         timestamptz not null default now()
);

create table model_images (
  id          uuid primary key default gen_random_uuid(),
  model_id    text not null references models (id) on delete cascade,
  url         text not null,
  alt         text not null default '',
  crop_pos    text,
  sort_order  integer not null default 0
);

create table model_swatches (
  id                 uuid primary key default gen_random_uuid(),
  model_id           text not null references models (id) on delete cascade,
  name               text not null,
  hex                text not null check (hex ~ '^#[0-9A-Fa-f]{6}$'),
  price_delta_cents  integer not null default 0,
  sort_order         integer not null default 0
);

create table model_specs (
  id          uuid primary key default gen_random_uuid(),
  model_id    text not null references models (id) on delete cascade,
  section     text not null,                 -- body, neck, electronics, hardware, bridge, middle
  label       text not null,
  value       text not null,
  sort_order  integer not null default 0
);
create index on model_specs (model_id, section, sort_order);

create table hero_slides (
  id          uuid primary key default gen_random_uuid(),
  image_url   text not null,
  crop_pos    text not null default 'center',
  scale       numeric not null default 1,
  active      boolean not null default true,
  sort_order  integer not null default 0
);

create table partners (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  logo_url     text,
  description  text not null default '',
  website_url  text,
  sort_order   integer not null default 0
);

create table suppliers (
  id          uuid primary key default gen_random_uuid(),
  material    text not null,
  supplier    text not null,
  location    text,
  miles       text,
  category    text,                          -- WOOD, ELECTRONICS, TACTILE, HARDWARE
  sort_order  integer not null default 0
);

create table dealers (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  city         text,
  region       text,
  website_url  text,
  image_url    text,
  active       boolean not null default true,
  sort_order   integer not null default 0
);

alter table listings
  add constraint listings_model_id_fkey foreign key (model_id) references models (id);

alter table models         enable row level security;
alter table model_images   enable row level security;
alter table model_swatches enable row level security;
alter table model_specs    enable row level security;
alter table hero_slides    enable row level security;
alter table partners       enable row level security;
alter table suppliers      enable row level security;
alter table dealers        enable row level security;

create policy "public reads models"   on models for select using (status <> 'hidden');
create policy "staff read models"     on models for select using (has_role('{owner,sales,tech}'));
create policy "owner edits models"    on models for all    using (has_role('{owner}'));
create policy "public reads model images"   on model_images   for select using (true);
create policy "owner edits model images"    on model_images   for all    using (has_role('{owner}'));
create policy "public reads swatches"       on model_swatches for select using (true);
create policy "owner edits swatches"        on model_swatches for all    using (has_role('{owner}'));
create policy "public reads specs"          on model_specs    for select using (true);
create policy "owner edits specs"           on model_specs    for all    using (has_role('{owner}'));
create policy "public reads hero"     on hero_slides for select using (active);
create policy "owner edits hero"      on hero_slides for all    using (has_role('{owner}'));
create policy "public reads partners" on partners    for select using (true);
create policy "owner edits partners"  on partners    for all    using (has_role('{owner}'));
create policy "public reads suppliers" on suppliers  for select using (true);
create policy "owner edits suppliers"  on suppliers  for all    using (has_role('{owner}'));
create policy "public reads dealers"  on dealers     for select using (active);
create policy "owner edits dealers"   on dealers     for all    using (has_role('{owner}'));
