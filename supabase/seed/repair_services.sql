-- Starter repair services. PLACEHOLDER names, prices and turnaround: edit them
-- here before running, or run as-is and change them later under
-- Admin > Repairs > Services. Prices are in cents (8500 = $85).

insert into repair_services (name, description, starting_price_cents, est_days, sort_order) values
  ('Setup',               'Clean, restring, adjust truss rod, action, intonation and pickup heights.', 8500,  3, 10),
  ('Fret level & crown',  'Level, crown and polish frets to fix buzz and dead spots.',               20000, 7, 20),
  ('Refret',              'New frets, with board prep and a full setup.',                             45000, 14, 30),
  ('Nut replacement',     'Cut and fit a new bone nut.',                                              9000,  5, 40),
  ('Electronics',         'Pots, jacks, switches, wiring repairs and pickup swaps.',                  7500,  5, 50),
  ('Finish touch-up',     'Chip and ding repair. Quoted after we see it.',                            null,  10, 60),
  ('Something else',      'Tell us what is going on and we will quote it.',                           null,  null, 90);
