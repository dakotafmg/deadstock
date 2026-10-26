-- Migration 1: staff, roles, settings
-- From the Deadstock Supabase schema plan (2026-10-22). Money is integer cents.

create type staff_role as enum ('owner', 'sales', 'tech');

create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  email       text not null,
  role        staff_role not null default 'sales',
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table activity_log (
  id           bigint generated always as identity primary key,
  actor_id     uuid references profiles (id) on delete set null,
  action       text not null,               -- e.g. 'listing.update', 'repair.status'
  entity_type  text not null,
  entity_id    text not null,
  changes      jsonb,
  created_at   timestamptz not null default now()
);
create index on activity_log (entity_type, entity_id);
create index on activity_log (created_at desc);

create table site_settings (
  key         text primary key,             -- 'phone', 'contact_email', 'instagram_url'
  value       jsonb not null,
  updated_by  uuid references profiles (id) on delete set null,
  updated_at  timestamptz not null default now()
);

-- Role check used by RLS policies
create function has_role(roles staff_role[]) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and active and role = any (roles)
  );
$$;

alter table profiles      enable row level security;
alter table activity_log  enable row level security;
alter table site_settings enable row level security;

create policy "own profile"        on profiles      for select using (id = auth.uid());
create policy "owner manages staff" on profiles     for all    using (has_role('{owner}'));
create policy "owner reads log"    on activity_log  for select using (has_role('{owner}'));
create policy "public reads settings" on site_settings for select using (true);
create policy "owner edits settings"  on site_settings for all    using (has_role('{owner}'));
