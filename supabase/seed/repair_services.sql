-- Starter repair services: the Deadstock repair menu (Nov 2026).
-- Prices are in cents (6000 = $60). Turnaround (est_days) is left blank; set it in Admin > Repairs > Services.

insert into repair_services (name, description, starting_price_cents, est_days, sort_order) values
  ('String change',                 'Replace strings and condition the fretboard. Strings extra.',                                                                                  2500,  null, 10),
  ('Setup',                         'Fresh strings, adjust action, fret cleaning, fretboard conditioning, clean electronics, set intonation. Strings extra.',                         6000,  null, 20),
  ('Fret level, crown and polish',  'Level, crown and polish frets, plus a fresh setup.',                                                                                           12500, null, 30),
  ('Refret',                        'Replace old frets, make a new bone nut, then level, crown and polish the frets and finish with a fresh setup.',                                  40000, null, 40),
  ('Bone upgrade',                  'Hand-made real bone nut, saddle or both, for more resonance and sustain, followed by a setup. $75 per piece, plus parts and strings.',          7500,  null, 50),
  ('Acoustic crack repair',         'Top, back and side cracks cleaned, reglued, cleated if needed and buffed back to a clean finish. $50 per crack.',                               5000,  null, 60),
  ('Headstock repair',              'Reattach the headstock, add carbon rods if needed, and refinish the area to look like new.',                                                   25000, null, 70),
  ('Electronics repair',            'Clean out the electronics and work out what needs replacing. $40 and up.',                                                                     4000,  null, 80),
  ('Other repair or restoration',   'Anything else: tell us what''s going on, or call us to talk through a quote.',                                                                 null,  null, 90);
