import { requireRole, logActivity, ROLES } from './_lib/auth.js';
import { getSupabase, supabaseConfigured, must } from './_lib/supabase.js';
import { parseBody } from './_lib/body.js';
import {
  buildPublicContent, cleanModel, cleanImages, cleanSwatches, cleanSpecs, cleanHero, cleanPartners,
} from './_lib/content.js';

// Site content: model pages, homepage lineup + slideshow, partners.
//   GET                      → public. Everything the site shows (cached ~1 min).
//   GET  ?view=admin         → owner. Every row, hidden models included.
//   POST {action:'model-save', model, images, swatches, specs, isNew}
//   POST {action:'model-delete', id}
//   POST {action:'hero-save', slides}
//   POST {action:'partners-save', partners}

const CHILD_TABLES = ['model_images', 'model_swatches', 'model_specs'];

async function readAll(sb) {
  const [models, images, swatches, specs, hero, partners] = await Promise.all([
    sb.from('models').select('*').order('sort_order'),
    sb.from('model_images').select('*').order('sort_order'),
    sb.from('model_swatches').select('*').order('sort_order'),
    sb.from('model_specs').select('*').order('sort_order'),
    sb.from('hero_slides').select('*').order('sort_order'),
    sb.from('partners').select('*').order('sort_order'),
  ]);
  return {
    models: must(models), images: must(images), swatches: must(swatches),
    specs: must(specs), hero: must(hero), partners: must(partners),
  };
}

// Swap a set of rows for new ones. New rows go in first, so a failed insert
// leaves the old content in place.
async function replaceRows(sb, table, match, rows) {
  const old = must(await (match ? sb.from(table).select('id').match(match) : sb.from(table).select('id')));
  if (rows.length) must(await sb.from(table).insert(rows.map(r => ({ ...r, ...(match || {}) }))));
  const oldIds = old.map(r => r.id);
  if (oldIds.length) must(await sb.from(table).delete().in('id', oldIds));
}

export default async function handler(req, res) {
  if (req.method === 'GET' && req.query?.view !== 'admin') {
    if (!supabaseConfigured()) return res.status(200).json({ models: {}, lineup: [], hero: [], partners: [] });
    try {
      const content = buildPublicContent(await readAll(getSupabase()));
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
      return res.status(200).json(content);
    } catch (err) {
      console.error('Content read failed:', err);
      return res.status(500).json({ error: 'Content unavailable' });
    }
  }

  const staff = await requireRole(req, res, ROLES.OWNER);
  if (!staff) return;

  try {
    const sb = getSupabase();

    if (req.method === 'GET') {
      return res.status(200).json(await readAll(sb));
    }

    if (req.method !== 'POST') return res.status(405).end();
    const body = await parseBody(req);

    if (body.action === 'model-save') {
      const isNew = Boolean(body.isNew);
      const model = cleanModel(body.model, { isNew });
      if (model.error) return res.status(400).json({ error: model.error });
      const m = model.value;
      const swatches = cleanSwatches(body.swatches);
      if (swatches.error) return res.status(400).json({ error: swatches.error });
      const specs = cleanSpecs(body.specs, m.kind);
      if (specs.error) return res.status(400).json({ error: specs.error });
      const images = cleanImages(body.images);
      if (m.found_in_model_id === m.id) m.found_in_model_id = null;

      const existing = must(await sb.from('models').select('id').eq('id', m.id).maybeSingle());
      if (isNew && existing) return res.status(409).json({ error: `There's already a model at /${m.id}.` });
      if (!isNew && !existing) return res.status(404).json({ error: 'Model not found' });

      const row = { ...m, updated_by: staff.id, updated_at: new Date().toISOString() };
      if (isNew) must(await sb.from('models').insert(row));
      else must(await sb.from('models').update(row).eq('id', m.id));

      await replaceRows(sb, 'model_images', { model_id: m.id }, images);
      await replaceRows(sb, 'model_swatches', { model_id: m.id }, swatches.value);
      await replaceRows(sb, 'model_specs', { model_id: m.id }, specs.value);

      await logActivity(staff, isNew ? 'content.model.create' : 'content.model.update', 'model', m.id,
        { name: m.name, status: m.status, price_cents: m.base_price_cents, photos: images.length });
      return res.status(200).json({ ok: true, id: m.id });
    }

    if (body.action === 'model-delete') {
      const id = String(body.id || '');
      const inUse = must(await sb.from('listings').select('id').eq('model_id', id).limit(1));
      if (inUse.length) {
        return res.status(400).json({ error: 'Shop listings point at this model, so it can\'t be deleted. Set it to Hidden instead.' });
      }
      must(await sb.from('models').update({ found_in_model_id: null }).eq('found_in_model_id', id));
      for (const t of CHILD_TABLES) must(await sb.from(t).delete().eq('model_id', id));
      must(await sb.from('models').delete().eq('id', id));
      await logActivity(staff, 'content.model.delete', 'model', id);
      return res.status(200).json({ ok: true });
    }

    if (body.action === 'hero-save') {
      const slides = cleanHero(body.slides);
      await replaceRows(sb, 'hero_slides', null, slides);
      await logActivity(staff, 'content.hero.update', 'hero_slides', 'home', { slides: slides.length });
      return res.status(200).json({ ok: true });
    }

    if (body.action === 'partners-save') {
      const partners = cleanPartners(body.partners);
      await replaceRows(sb, 'partners', null, partners);
      await logActivity(staff, 'content.partners.update', 'partners', 'site', { partners: partners.length });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
