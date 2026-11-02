-- Site content seed: copies src/content/data.js into Supabase.
-- Safe to re-run: skips anything already there.
begin;

insert into models (id, kind, name, archetype, serial_prefix, year_label, base_price_cents, finish, pickups_summary, magnet, wind, lede, blurb, story, build_note, card_image_url, card_image_pos, card_headline, card_finish, card_pickups, card_construction, status, sort_order)
values ('broadman', 'guitar', 'Broadman', 'SINGLE-CUT', 'DS26001', 'MMXXVI', 449900, 'Nitro', 'Seymour Duncan Antiquity Tele', null, null, 'Raw, honest, punchy. A working instrument that earns its scratches. Built like a tank, plays like a memory.', 'Raw, honest, punchy. A working instrument that earns its scratches. Built like a tank.', '{"heading":"Built for the players who never stopped playing.","problem":"Big brands sand the edges off until everything sounds the same. Polished, predictable, polite. We wanted the opposite — a guitar that pushes back, with the chime and snap a single-cut was supposed to have before quality control became a focus group.","solution":"The Broadman is utilitarian by design. The body is 2-piece Swamp Ash with a solid Swamp Ash top — the nitro finish is kept thin so the wood can breathe and age.","pull":"It''s not a tribute. It''s the guitar that should have been built all along."}'::jsonb, 'Built 2026 · Fortville, IN', '/assets/PinkBroadman-1.jpg', '55% 50%', 'The Broad*man.*', 'Shell Pink', 'SD Antiquity Tele', 'Bolt-on neck', 'available', 10)
on conflict (id) do nothing;
insert into models (id, kind, name, archetype, serial_prefix, year_label, base_price_cents, finish, pickups_summary, magnet, wind, lede, blurb, story, build_note, card_image_url, card_image_pos, card_headline, card_finish, card_pickups, card_construction, status, sort_order)
values ('wayfarer', 'guitar', 'Wayfarer', 'DOUBLE-CUT', 'DS26002', 'MMXXVI', 459900, 'Nitro', 'Seymour Duncan', null, null, 'Ergonomic, fluid, versatile. The road-tested partner built to disappear in your hands so the song doesn''t.', 'Ergonomic, fluid, versatile. The road-tested partner — built to disappear in your hands so the song doesn''t.', '{"heading":"A double-cut that gets out of your way.","problem":"Most modern double-cuts are precise to the point of cold. We love the architecture — the contours, the trio of pickups, the long sustain. We just wanted one that felt loved before you opened the case.","solution":"The Wayfarer''s contours are deeper than spec. The neck heel is rolled back so your hand can live at the 17th fret. The trem is hand‑set and floats true. The middle pickup is reverse‑wound; positions 2 and 4 hum‑cancel without losing the bell.","pull":"The road shouldn''t take more from you than it gives back. This one gives back."}'::jsonb, 'Built 2026 · Fortville, IN', '/assets/Wayfarer-1.jpg', '55% 55%', 'The Way*farer.*', 'Sunburst', 'Seymour Duncan', 'Bolt-on neck', 'available', 20)
on conflict (id) do nothing;
insert into models (id, kind, name, archetype, serial_prefix, year_label, base_price_cents, finish, pickups_summary, magnet, wind, lede, blurb, story, build_note, card_image_url, card_image_pos, card_headline, card_finish, card_pickups, card_construction, status, sort_order)
values ('monarch', 'guitar', 'Monarch', 'OFFSET', 'DS26001', 'MMXXVI', 519900, 'Nitro', 'Seymour Duncan Phat Cat (neck) / Antiquity Humbucker (bridge)', null, null, 'A premium offset with a Seymour Duncan Phat Cat in the neck and Antiquity Humbucker in the bridge, over a carved flamed maple top.', 'A premium offset, in development. Carved top, bolt-on neck, Seymour Duncan Phat Cat neck and Antiquity Humbucker bridge.', '{"heading":"Where rock meets jazz — and stays.","problem":"The offset world is full of guitars that can''t decide what they are. Too bright for jazz, too polite for rock, too refined to really push. We wanted one that could hold its own in both rooms without compromising either.","solution":"The Monarch pairs a carved flamed maple top with a Seymour Duncan Phat Cat P90 in the neck — fat midrange, that humbucker-sized snap — and an Antiquity Humbucker in the bridge for vintage PAF warmth that can still get loud. Bolt-on construction keeps it punchy. The carved top is not cosmetic.","pull":"This is the guitar for the player who refused to pick a lane."}'::jsonb, 'Fortville, IN', '/assets/monarch-1.jpg', null, 'The *Monarch.*', 'Sunburst', 'Seymour Duncan', 'Bolt-on neck', 'available', 30)
on conflict (id) do nothing;
insert into models (id, kind, name, archetype, serial_prefix, year_label, base_price_cents, finish, pickups_summary, magnet, wind, lede, blurb, story, build_note, card_image_url, card_image_pos, card_headline, card_finish, card_pickups, card_construction, status, sort_order)
values ('tele52', 'pickup', '''52 Tele Set', 'SINGLE-COIL / TELE', 'DS-PU-T52', 'MMXXVI', 27000, null, null, 'A3 neck / A5 bridge', 'Plain enamel, flat-pole, hand-scatter wound', 'The pickup that started it all. Flat-pole design, low output between 6k–7k — wound to bring your Tele back to its 1952 glory.', 'Flat-pole design, 6k-7k output. As close to an original ''52 Tele as we can wind it.', '{"heading":"The pickup that haunts you in your sleep.","problem":"Our head luthier has owned every variation of the Telecaster you can think of — original no-casters to modern Tele Pros. The sound of the flat-pole Tele pickup is the one he keeps chasing. No modern mass-wound pickup gets there.","solution":"This is as close to his original 1952 Telecaster as we can wind. Flat-pole design, low output between 6k–7k, hand-scatter wound. Not hot. Not scooped. Just the real thing.","pull":"Tired of your Tele sounding like a Tele-shaped object? This is the fix."}'::jsonb, null, '/assets/Tele52-1.jpg', null, null, null, null, null, 'hidden', 40)
on conflict (id) do nothing;
insert into models (id, kind, name, archetype, serial_prefix, year_label, base_price_cents, finish, pickups_summary, magnet, wind, lede, blurb, story, build_note, card_image_url, card_image_pos, card_headline, card_finish, card_pickups, card_construction, status, sort_order)
values ('strat62', 'pickup', '''62 Strat Set', 'SINGLE-COIL / STRAT', 'DS-PU-S62', 'MMXXVI', 29000, null, null, 'A5 — Alnico V', 'Formvar, hand-scatter wound', 'Slightly scooped mids, excited highs, full lows. The pre-CBS Strat sound that everyone talks about — tested against slab-board Strats to get it right.', 'Slightly scooped mids, excited highs, full lows. The pre-CBS Strat sound — tested against slab-board Strats.', '{"heading":"All the glorious things you hear about the early ''60s.","problem":"If you''re tired of your Strat feeling a little bland — here''s your wake-up call. Most modern sets chase ''vintage'' but miss what made pre-CBS pickups special: those slightly scooped mids, the excited highs, the low end that doesn''t disappear.","solution":"We tested this design against several slab-board Strats over the years. A5 rods throughout, Formvar wire for that glassy top, RWRP middle for hum-cancelling positions 2 and 4. It falls perfectly into a ''62.","pull":"Let us fix it."}'::jsonb, null, '/assets/Strat62-1.jpg', null, null, null, null, null, 'hidden', 50)
on conflict (id) do nothing;
insert into models (id, kind, name, archetype, serial_prefix, year_label, base_price_cents, finish, pickups_summary, magnet, wind, lede, blurb, story, build_note, card_image_url, card_image_pos, card_headline, card_finish, card_pickups, card_construction, status, sort_order)
values ('paf', 'pickup', 'PAF Set', 'HUMBUCKER', 'DS-PU-PAF', 'MMXXVI', 35000, null, null, 'A2 — Alnico II', 'Plain enamel, hand-scatter wound', 'One of the most coveted pickups on earth. Original PAFs run thousands — if you can find one. Our faithful recreation gets you there.', 'One of the most coveted pickups on earth. Faithful recreation. A2 bar magnets, mismatched coils, aged nickel covers.', '{"heading":"Welcome to the most coveted pickup on earth.","problem":"Original PAFs run thousands of dollars if you can even find one. Most ''recreations'' get the output right and miss everything else — the scatter, the variation between coils, the way they breathe.","solution":"A2 bar magnets, hand-scatter wound on a slow machine with mismatched coil winds — the same variation the originals had. Nickel covers that will age on the guitar. Wound to archive the PAF goal in a more reasonable fashion.","pull":"You don''t have to spend thousands to hear what all the fuss is about."}'::jsonb, null, '/assets/PAF-1.jpg', null, null, null, null, null, 'hidden', 60)
on conflict (id) do nothing;

update models set found_in_model_id = 'broadman' where id = 'tele52' and found_in_model_id is null;
update models set found_in_model_id = 'wayfarer' where id = 'strat62' and found_in_model_id is null;
update models set found_in_model_id = 'monarch' where id = 'paf' and found_in_model_id is null;

insert into model_images (model_id, url, alt, sort_order)
select 'broadman', v.* from (values
  ('/assets/PinkBroadman-1.jpg', 'Broadman photo 1', 0),
  ('/assets/PinkBroadman-2.jpg', 'Broadman photo 2', 1),
  ('/assets/PinkBroadman-3.jpg', 'Broadman photo 3', 2),
  ('/assets/PinkBroadman-4.jpg', 'Broadman photo 4', 3),
  ('/assets/PinkBroadman-5.jpg', 'Broadman photo 5', 4),
  ('/assets/PinkBroadman-6.jpg', 'Broadman photo 6', 5),
  ('/assets/PinkBroadman-7.jpg', 'Broadman photo 7', 6),
  ('/assets/PinkBroadman-8.jpg', 'Broadman photo 8', 7),
  ('/assets/PinkBroadman-9.jpg', 'Broadman photo 9', 8),
  ('/assets/PinkBroadman-10.jpg', 'Broadman photo 10', 9)
) as v(url, alt, sort_order)
where not exists (select 1 from model_images where model_id = 'broadman');
insert into model_swatches (model_id, name, hex, sort_order)
select 'broadman', v.* from (values
  ('Shell Pink', '#F2B8BC', 0),
  ('Black', '#1C1C1C', 1),
  ('Sunburst', '#7A3B10', 2),
  ('Butterscotch', '#D4A029', 3),
  ('Sonic Blue', '#6DB3BD', 4),
  ('Seafoam Green', '#93C5B5', 5),
  ('Blonde', '#F2E0A6', 6)
) as v(name, hex, sort_order)
where not exists (select 1 from model_swatches where model_id = 'broadman');
insert into model_specs (model_id, section, label, value, sort_order)
select 'broadman', v.* from (values
  ('body', 'Wood', '2-piece Swamp Ash, solid top — milled in Ohio', 0),
  ('body', 'Finish', 'Nitrocellulose, very thin coats', 1),
  ('body', 'Construction', 'Bolt-on, 4 screws + neck plate', 2),
  ('body', 'Contour', 'Flat top, vintage edge radius', 3),
  ('neck', 'Profile', 'Chunky C', 4),
  ('neck', 'Wood', '1-piece Maple', 5),
  ('neck', 'Fretboard', '10" radius / Maple', 6),
  ('neck', 'Frets', '21 / Tall (0.079" x 0.055")', 7),
  ('neck', 'Nut', 'Bone, hand cut — 1-5/8" width', 8),
  ('neck', 'Scale', '25.5"', 9),
  ('neck', 'Thickness', '0.85" (1st fret) · 0.95" (12th fret)', 10),
  ('neck', 'Heel', '2-3/16" width, squared', 11),
  ('neck', 'Truss Rod', 'Heel adjust', 12),
  ('neck', 'Tuner Holes', 'Vintage 2-step — 0.34" bushing / 0.25" post', 13),
  ('neck', 'Inlays', 'Black fretboard + side marker dots', 14),
  ('electronics', 'Neck PU', 'Seymour Duncan Antiquity Tele — Alnico 2, aged', 15),
  ('electronics', 'Bridge PU', 'Seymour Duncan Antiquity Tele — Alnico 5, aged', 16),
  ('electronics', 'Switching', 'Oak Grigsby 3-way', 17),
  ('electronics', 'Output Jack', 'Switchcraft L11 mono', 18),
  ('hardware', 'Bridge', 'Vintage aged nickel with brass saddles', 19),
  ('hardware', 'Tuners', 'Gotoh vintage 15:1', 20),
  ('hardware', 'Knobs', 'Knurl metal barrel', 21),
  ('hardware', 'Strap Buttons', 'Aged nickel', 22),
  ('hardware', 'Plate', 'Numbered, aged nickel', 23)
) as v(section, label, value, sort_order)
where not exists (select 1 from model_specs where model_id = 'broadman');

insert into model_images (model_id, url, alt, sort_order)
select 'wayfarer', v.* from (values
  ('/assets/Wayfarer-1.jpg', 'Wayfarer photo 1', 0),
  ('/assets/Wayfarer-2.jpg', 'Wayfarer photo 2', 1),
  ('/assets/Wayfarer-3.jpg', 'Wayfarer photo 3', 2),
  ('/assets/Wayfarer-4.jpg', 'Wayfarer photo 4', 3),
  ('/assets/Wayfarer-5.jpg', 'Wayfarer photo 5', 4),
  ('/assets/Wayfarer-6.jpg', 'Wayfarer photo 6', 5),
  ('/assets/Wayfarer-7.jpg', 'Wayfarer photo 7', 6)
) as v(url, alt, sort_order)
where not exists (select 1 from model_images where model_id = 'wayfarer');
insert into model_swatches (model_id, name, hex, sort_order)
select 'wayfarer', v.* from (values
  ('Sunburst', '#7A3B10', 0),
  ('Black', '#1C1C1C', 1),
  ('Olympic White', '#F2F0E6', 2),
  ('Mary Kay', '#E8D5A3', 3),
  ('Lake Placid Blue', '#699FB8', 4),
  ('Shell Pink', '#F2B8BC', 5),
  ('Aztec Gold', '#C4893A', 6),
  ('2-Tone Sunburst', '#5C2800', 7)
) as v(name, hex, sort_order)
where not exists (select 1 from model_swatches where model_id = 'wayfarer');
insert into model_specs (model_id, section, label, value, sort_order)
select 'wayfarer', v.* from (values
  ('body', 'Wood', 'Locally sourced Alder — milled in Ohio', 0),
  ('body', 'Finish', 'Nitrocellulose', 1),
  ('body', 'Construction', 'Bolt-on, contoured heel', 2),
  ('body', 'Contour', 'Deep belly + forearm', 3),
  ('neck', 'Profile', 'C', 4),
  ('neck', 'Wood', 'Maple with rosewood fretboard', 5),
  ('neck', 'Neck Finish', 'None / unfinished', 6),
  ('neck', 'Fretboard', '10" radius / Indian Rosewood', 7),
  ('neck', 'Frets', '21 / Tall (0.079" x 0.055")', 8),
  ('neck', 'Nut', 'Bone, hand cut — 1-5/8" width', 9),
  ('neck', 'Scale', '25.5"', 10),
  ('neck', 'Thickness', '0.86" (1st fret) · 0.96" (12th fret)', 11),
  ('neck', 'Heel', '2-3/16" width', 12),
  ('neck', 'Truss Rod', 'Heel adjust', 13),
  ('neck', 'Tuner Holes', 'Vintage 2-step — 0.34" bushing / 0.25" post', 14),
  ('neck', 'Inlays', 'White fretboard + side marker dots', 15),
  ('electronics', 'Pickups', 'Seymour Duncan', 16),
  ('electronics', 'Middle PU', 'Seymour Duncan', 17),
  ('electronics', 'Switching', 'Oak Grigsby 5-way blade', 18),
  ('electronics', 'Wiring', 'Vintage cloth, modern shielding — CTS 250k, 0.047µF Sprague Orange Drop', 19),
  ('hardware', 'Bridge', 'Gotoh vintage aged tremolo', 20),
  ('hardware', 'Tuners', 'Gotoh vintage 15:1', 21),
  ('hardware', 'Knobs', 'Knurl metal barrel', 22),
  ('hardware', 'Strap Buttons', 'Aged nickel', 23),
  ('hardware', 'Plate', 'Numbered, aged nickel', 24)
) as v(section, label, value, sort_order)
where not exists (select 1 from model_specs where model_id = 'wayfarer');

insert into model_images (model_id, url, alt, sort_order)
select 'monarch', v.* from (values
  ('/assets/monarch-1.jpg', 'Monarch photo 1', 0),
  ('/assets/monarch-2.jpg', 'Monarch photo 2', 1),
  ('/assets/monarch-3.jpg', 'Monarch photo 3', 2),
  ('/assets/monarch-4.jpg', 'Monarch photo 4', 3),
  ('/assets/monarch-5.jpg', 'Monarch photo 5', 4),
  ('/assets/monarch-6.jpg', 'Monarch photo 6', 5),
  ('/assets/monarch-7.jpg', 'Monarch photo 7', 6),
  ('/assets/monarch-8.jpg', 'Monarch photo 8', 7)
) as v(url, alt, sort_order)
where not exists (select 1 from model_images where model_id = 'monarch');
insert into model_specs (model_id, section, label, value, sort_order)
select 'monarch', v.* from (values
  ('body', 'Wood', '2-piece Maple, carved back + sides', 0),
  ('body', 'Top', 'Book-matched 1/4" flamed Maple, carved', 1),
  ('body', 'Construction', 'Bolt-on neck', 2),
  ('neck', 'Profile', 'C', 3),
  ('neck', 'Wood', 'Maple with rosewood fretboard', 4),
  ('neck', 'Neck Finish', 'None / unfinished', 5),
  ('neck', 'Fretboard', '10" radius / Indian Rosewood', 6),
  ('neck', 'Frets', 'Tall (0.079" x 0.055")', 7),
  ('neck', 'Nut', 'Bone, hand cut — 1-5/8" width', 8),
  ('neck', 'Scale', '25.5"', 9),
  ('neck', 'Thickness', '0.86" (1st fret) · 0.96" (12th fret)', 10),
  ('neck', 'Heel', '2-3/16" width, squared', 11),
  ('neck', 'Truss Rod', 'Heel adjust', 12),
  ('neck', 'Tuner Holes', 'Vintage 2-step — 0.34" bushing / 0.25" post', 13),
  ('neck', 'Inlays', 'White fretboard + side marker dots', 14),
  ('electronics', 'Neck PU', 'Seymour Duncan Phat Cat — Alnico 2, humbucker-sized P90', 15),
  ('electronics', 'Bridge PU', 'Seymour Duncan Antiquity Humbucker — Alnico 2, vintage PAF', 16),
  ('electronics', 'Switching', 'Oak Grigsby 3-way toggle', 17),
  ('electronics', 'Wiring', 'Vintage cloth, modern shielding — CTS 500k, 0.047µF Sprague Orange Drop', 18),
  ('hardware', 'Bridge', 'Vintage aged nickel with 3 brass saddles', 19),
  ('hardware', 'Tuners', 'True Tune vintage nickel 15:1', 20)
) as v(section, label, value, sort_order)
where not exists (select 1 from model_specs where model_id = 'monarch');

insert into model_images (model_id, url, alt, sort_order)
select 'tele52', v.* from (values
  ('/assets/Tele52-1.jpg', '''52 Tele Set photo 1', 0),
  ('/assets/Tele52-2.jpg', '''52 Tele Set photo 2', 1),
  ('/assets/Tele52-3.jpg', '''52 Tele Set photo 3', 2),
  ('/assets/Tele52-4.jpg', '''52 Tele Set photo 4', 3),
  ('/assets/Tele52-5.jpg', '''52 Tele Set photo 5', 4)
) as v(url, alt, sort_order)
where not exists (select 1 from model_images where model_id = 'tele52');
insert into model_specs (model_id, section, label, value, sort_order)
select 'tele52', v.* from (values
  ('bridge', 'Magnet', 'Alnico V rods, flat-pole', 0),
  ('bridge', 'Wire', '42 AWG plain enamel', 1),
  ('bridge', 'DC Resistance', '6k-7k Ω', 2),
  ('bridge', 'Wind', 'Hand-scatter wound', 3),
  ('bridge', 'Bobbin', 'Fiber, period-correct', 4),
  ('bridge', 'Cover', 'Brass, aged in-house', 5),
  ('neck', 'Magnet', 'Alnico III rods, flat-pole', 6),
  ('neck', 'Wire', '42 AWG plain enamel', 7),
  ('neck', 'DC Resistance', '6k-7k Ω', 8),
  ('neck', 'Wind', 'Hand-scatter wound', 9),
  ('neck', 'Bobbin', 'Fiber, period-correct', 10),
  ('neck', 'Cover', 'Aged nickel', 11)
) as v(section, label, value, sort_order)
where not exists (select 1 from model_specs where model_id = 'tele52');

insert into model_images (model_id, url, alt, sort_order)
select 'strat62', v.* from (values
  ('/assets/Strat62-1.jpg', '''62 Strat Set photo 1', 0),
  ('/assets/Strat62-2.jpg', '''62 Strat Set photo 2', 1),
  ('/assets/Strat62-3.jpg', '''62 Strat Set photo 3', 2)
) as v(url, alt, sort_order)
where not exists (select 1 from model_images where model_id = 'strat62');
insert into model_specs (model_id, section, label, value, sort_order)
select 'strat62', v.* from (values
  ('bridge', 'Magnet', 'Alnico V rods', 0),
  ('bridge', 'Wire', '42 AWG Formvar', 1),
  ('bridge', 'DC Resistance', '~6.5 kΩ', 2),
  ('bridge', 'Wind', 'Hand-scatter wound', 3),
  ('bridge', 'Polarity', 'Standard', 4),
  ('middle', 'Magnet', 'Alnico V rods', 5),
  ('middle', 'Wire', '42 AWG Formvar', 6),
  ('middle', 'DC Resistance', '~6.2 kΩ', 7),
  ('middle', 'Wind', 'Hand-scatter wound, RWRP', 8),
  ('middle', 'Polarity', 'Reverse-wound / reverse-polarity', 9),
  ('neck', 'Magnet', 'Alnico V rods', 10),
  ('neck', 'Wire', '42 AWG Formvar', 11),
  ('neck', 'DC Resistance', '~5.8 kΩ', 12),
  ('neck', 'Wind', 'Hand-scatter wound', 13),
  ('neck', 'Polarity', 'Standard', 14)
) as v(section, label, value, sort_order)
where not exists (select 1 from model_specs where model_id = 'strat62');

insert into model_images (model_id, url, alt, sort_order)
select 'paf', v.* from (values
  ('/assets/PAF-1.jpg', 'PAF Set photo 1', 0),
  ('/assets/PAF-2.jpg', 'PAF Set photo 2', 1),
  ('/assets/PAF-3.jpg', 'PAF Set photo 3', 2)
) as v(url, alt, sort_order)
where not exists (select 1 from model_images where model_id = 'paf');
insert into model_specs (model_id, section, label, value, sort_order)
select 'paf', v.* from (values
  ('bridge', 'Magnet', 'Alnico II bar', 0),
  ('bridge', 'Wire', '42 AWG plain enamel', 1),
  ('bridge', 'DC Resistance', '~8.5 kΩ', 2),
  ('bridge', 'Wind', 'Hand-scatter, mismatched coils', 3),
  ('bridge', 'Cover', 'Aged nickel, no potting', 4),
  ('neck', 'Magnet', 'Alnico II bar', 5),
  ('neck', 'Wire', '42 AWG plain enamel', 6),
  ('neck', 'DC Resistance', '~7.8 kΩ', 7),
  ('neck', 'Wind', 'Hand-scatter, mismatched coils', 8),
  ('neck', 'Cover', 'Aged nickel, no potting', 9)
) as v(section, label, value, sort_order)
where not exists (select 1 from model_specs where model_id = 'paf');

insert into hero_slides (image_url, crop_pos, scale, active, sort_order)
select v.* from (values
  ('/assets/hero-1.jpg', 'center', 1::numeric, true, 0),
  ('/assets/hero-2.jpg', '50% 10%', 1::numeric, true, 1),
  ('/assets/hero-3.jpg', 'center', 1::numeric, true, 2),
  ('/assets/hero-4.jpg', 'center', 1::numeric, true, 3),
  ('/assets/hero-5.jpg', 'center', 1::numeric, true, 4),
  ('/assets/hero-6.jpeg', '50% 60%', 1::numeric, true, 5),
  ('/assets/hero-7.jpg', 'center', 1::numeric, true, 6),
  ('/assets/hero-8.jpg', '50% 15%', 1::numeric, true, 7),
  ('/assets/hero-9.jpg', 'center', 1::numeric, true, 8),
  ('/assets/hero-10.jpg', 'center', 1::numeric, true, 9),
  ('/assets/hero-11.jpg', 'center', 1::numeric, true, 10),
  ('/assets/hero-12.jpg', '50% 90%', 1::numeric, true, 11),
  ('/assets/hero-15.jpg', 'center', 1::numeric, true, 12)
) as v(image_url, crop_pos, scale, active, sort_order)
where not exists (select 1 from hero_slides);

insert into partners (name, role, logo_url, description, website_url, sort_order)
select v.* from (values
  ('Woodtech Routing', 'Bodies', '/assets/partner-woodtech.jpg', 'Built by tradesmen who spent years in sawmills and around lumber before betting on themselves. They hand select domestic lumber, kiln dry it locally, and CNC every body to our exact specifications. That''s not supply chain — that''s legacy.', 'https://woodtechrouting.com', 0),
  ('Musikraft', 'Necks', '/assets/partner-musikraft.jpg', 'Their pursuit of excellence mirrors our own belief that instruments should feel like extensions of the player, not products off an assembly line. Every carve, every spec, every detail matters. Built in relationship, not transaction.', 'https://musikraft.com', 1),
  ('Seymour Duncan', 'Pickups', '/assets/partner-seymourduncan.png', 'Their passion for tone and dedication to exceptional pickup design help bring out the character and voice of every instrument. Partners in the pursuit of the real thing.', 'https://seymourduncan.com', 2),
  ('Allparts USA', 'Hardware & Components', '/assets/partner-allparts.jpg', 'Hardware, lacquer, screws, bolts, plates, bridges and countless tiny details. They''ve supported us from the beginning and helped make the impossible start to feel possible.', 'https://allparts.com', 3),
  ('Crossrock Cases', 'Cases', '/assets/partner-crossrock.jpg', 'From the beginning we believed the experience should feel special before the guitar is ever played. Crossrock partnered with us to create an unboxing experience that feels intentional — unlike the standard-issue black box the industry settled for years ago.', 'https://crossrockcase.com/', 4)
) as v(name, role, logo_url, description, website_url, sort_order)
where not exists (select 1 from partners);

commit;
