// Writes supabase/seed/site_content.sql from src/content/data.js.
// Run: node scripts/content-seed.mjs
// The SQL only fills empty tables / missing models, so it is safe to re-run
// and never overwrites edits made in the dashboard.
import { writeFileSync, mkdirSync } from 'fs';
import { PRODUCTS, PICKUPS, LINEUP, PICKUP_LINEUP, HERO_SLIDES, PARTNERS } from '../src/content/data.js';

const qs = (v) => `'${String(v ?? '').replace(/'/g, "''")}'`;
const q = (v) => (v == null || v === '' ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const cents = (price) => (price ? Math.round(Number(String(price).replace(/[^0-9.]/g, '')) * 100) : null);
const lines = ['-- Site content seed: copies src/content/data.js into Supabase.', '-- Safe to re-run: skips anything already there.', 'begin;', ''];

const card = Object.fromEntries([...LINEUP, ...PICKUP_LINEUP].map((l, i) => [l.id, { ...l, order: (i + 1) * 10 }]));
const models = [
  ...Object.values(PRODUCTS).map(p => ({ ...p, kind: 'guitar' })),
  ...Object.values(PICKUPS).map(p => ({ ...p, kind: 'pickup' })),
];

// Models first without found_in (it points at other models).
for (const m of models) {
  const c = card[m.id] || {};
  const status = m.kind === 'pickup' ? 'hidden' : c.status === 'AVAILABLE' ? 'available' : 'in_development';
  // Pickup pages aren't linked from the site yet, so they start hidden.
  const story = JSON.stringify(m.story || {});
  lines.push(`insert into models (id, kind, name, archetype, serial_prefix, year_label, base_price_cents, finish, pickups_summary, magnet, wind, lede, blurb, story, build_note, card_image_url, card_image_pos, card_headline, card_finish, card_pickups, card_construction, status, sort_order)
values (${q(m.id)}, '${m.kind}', ${qs(m.name)}, ${qs(m.archetype || m.type)}, ${q(m.serial)}, ${q(m.year)}, ${cents(m.price) ?? 'null'}, ${q(m.finish)}, ${q(m.pickups)}, ${q(m.magnet)}, ${q(m.wind)}, ${qs(m.lede)}, ${qs(c.blurb)}, ${q(story)}::jsonb, ${q(m.build?.run)}, ${q(c.image || c.thumb)}, ${q(c.imagePos)}, ${q(c.headline)}, ${q(c.cardFinish)}, ${q(c.cardPickups)}, ${q(c.cardConstruction)}, '${status}', ${c.order ?? 0})
on conflict (id) do nothing;`);
}
lines.push('');
for (const m of models.filter(m => m.foundIn)) {
  lines.push(`update models set found_in_model_id = ${q(m.foundIn)} where id = ${q(m.id)} and found_in_model_id is null;`);
}
lines.push('');

const childInsert = (table, cols, modelId, rows) => {
  if (!rows.length) return;
  lines.push(`insert into ${table} (model_id, ${cols.join(', ')})
select ${q(modelId)}, v.* from (values
${rows.map(r => '  (' + r.join(', ') + ')').join(',\n')}
) as v(${cols.join(', ')})
where not exists (select 1 from ${table} where model_id = ${q(modelId)});`);
};
for (const m of models) {
  childInsert('model_images', ['url', 'alt', 'sort_order'], m.id, (m.images || []).map((u, i) => [q(u), q(`${m.name} photo ${i + 1}`), i]));
  childInsert('model_swatches', ['name', 'hex', 'sort_order'], m.id, (m.swatches || []).map((s, i) => [q(s.name), q(s.hex.toUpperCase()), i]));
  let n = 0;
  childInsert('model_specs', ['section', 'label', 'value', 'sort_order'], m.id,
    Object.entries(m.specs || {}).flatMap(([section, rows]) => rows.map(r => [q(section), q(r.k), q(r.v), n++])));
  lines.push('');
}

lines.push(`insert into hero_slides (image_url, crop_pos, scale, active, sort_order)
select v.* from (values
${HERO_SLIDES.map((h, i) => `  (${q(h.src)}, ${q(h.pos || 'center')}, ${h.scale || 1}::numeric, true, ${i})`).join(',\n')}
) as v(image_url, crop_pos, scale, active, sort_order)
where not exists (select 1 from hero_slides);`, '');

lines.push(`insert into partners (name, role, logo_url, description, website_url, sort_order)
select v.* from (values
${PARTNERS.map((p, i) => `  (${q(p.name)}, ${qs(p.role)}, ${q(p.logo)}, ${qs(p.description)}, ${q(p.url)}, ${i})`).join(',\n')}
) as v(name, role, logo_url, description, website_url, sort_order)
where not exists (select 1 from partners);`, '');

lines.push('commit;', '');
mkdirSync(new URL('../supabase/seed/', import.meta.url), { recursive: true });
writeFileSync(new URL('../supabase/seed/site_content.sql', import.meta.url), lines.join('\n'));
console.log('Wrote supabase/seed/site_content.sql');
