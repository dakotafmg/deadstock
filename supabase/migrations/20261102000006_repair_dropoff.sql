-- Migration 6: where a repair was dropped off
-- Instruments come in at the Deadstock shop or through Fortville Music Garage,
-- which fills out a paper tag. Run after migration 5.

alter table repair_jobs
  add column dropoff_location text check (dropoff_location in ('shop', 'music_garage')),
  add column tag_number       text;

-- The board looks up a job by the number written on its tag.
create index on repair_jobs (tag_number) where tag_number is not null;
