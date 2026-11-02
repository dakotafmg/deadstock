-- Migration 7: fields the dashboard content editor needs.
-- Homepage lineup cards show a short finish / pickups / construction line and a
-- headline with an emphasised part ("The Broad*man.*"). Partners have a role
-- ("Bodies", "Necks").

alter table models
  add column if not exists card_headline     text,
  add column if not exists card_finish       text,
  add column if not exists card_pickups      text,
  add column if not exists card_construction text;

alter table partners
  add column if not exists role text not null default '';

-- The site reads content through /api/content with the service role.
grant all on models, model_images, model_swatches, model_specs, hero_slides, partners to service_role;
