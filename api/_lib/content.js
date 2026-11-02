// ============================================================
// Site content: turns Supabase rows into the shape the site uses
// (the same shape as src/content/data.js), and checks what the
// dashboard sends back.
// ============================================================

export const KINDS = ['guitar', 'pickup'];
export const STATUSES = ['available', 'in_development', 'hidden'];
export const SPEC_SECTIONS = {
  guitar: ['body', 'neck', 'electronics', 'hardware'],
  pickup: ['bridge', 'middle', 'neck'],
};

export function formatPrice(cents) {
  if (cents == null) return '';
  return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

const bySort = (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0);

// rows: { models, images, swatches, specs, hero, partners } straight from Supabase.
export function buildPublicContent(rows) {
  const visible = rows.models.filter(m => m.status !== 'hidden').sort(bySort);
  const ids = new Set(visible.map(m => m.id));
  const group = (list) => {
    const out = {};
    for (const r of list.filter(r => ids.has(r.model_id)).sort(bySort)) (out[r.model_id] ||= []).push(r);
    return out;
  };
  const images = group(rows.images);
  const swatches = group(rows.swatches);
  const specs = group(rows.specs);

  const models = {};
  for (const m of visible) {
    const sections = {};
    for (const s of specs[m.id] || []) (sections[s.section] ||= []).push({ k: s.label, v: s.value });
    models[m.id] = {
      id: m.id,
      kind: m.kind,
      name: m.name,
      archetype: m.archetype || '',
      serial: m.serial_prefix || '',
      year: m.year_label || '',
      price: formatPrice(m.base_price_cents),
      finish: m.finish || '',
      pickups: m.pickups_summary || '',
      magnet: m.magnet || '',
      wind: m.wind || '',
      lede: m.lede || '',
      swatches: (swatches[m.id] || []).map(s => ({ name: s.name, hex: s.hex })),
      images: (images[m.id] || []).map(i => i.url),
      story: {
        heading: m.story?.heading || '',
        problem: m.story?.problem || '',
        solution: m.story?.solution || '',
        pull: m.story?.pull || '',
      },
      specs: sections,
      build: { run: m.build_note || '' },
      foundIn: m.found_in_model_id || null,
    };
  }

  const lineup = visible.filter(m => m.kind === 'guitar').map(m => ({
    id: m.id,
    name: m.name,
    archetype: m.archetype || '',
    serial: m.serial_prefix || '',
    price: formatPrice(m.base_price_cents),
    blurb: m.blurb || '',
    status: m.status === 'available' ? 'AVAILABLE' : 'COMING-SOON',
    image: m.card_image_url || models[m.id].images[0] || null,
    imagePos: m.card_image_pos || null,
    headline: m.card_headline || '',
    cardFinish: m.card_finish || '',
    cardPickups: m.card_pickups || '',
    cardConstruction: m.card_construction || '',
  }));

  return {
    models,
    lineup,
    hero: rows.hero.filter(h => h.active).sort(bySort)
      .map(h => ({ src: h.image_url, pos: h.crop_pos || 'center', scale: Number(h.scale) || 1 })),
    partners: rows.partners.slice().sort(bySort).map(p => ({
      name: p.name, role: p.role || '', logo: p.logo_url || '', description: p.description || '', url: p.website_url || '',
    })),
  };
}

// ------------------------------------------------------------
// Validation for dashboard saves. Each returns { value } or { error }.
// ------------------------------------------------------------
const str = (v, max = 4000) => (v == null ? '' : String(v).trim().slice(0, max));
const opt = (v, max) => str(v, max) || null;
const url = (v) => {
  const s = str(v, 2000);
  return s && (s.startsWith('/') || /^https:\/\//.test(s)) ? s : null;
};

export function cleanModel(input, { isNew }) {
  const m = input || {};
  const id = str(m.id, 40).toLowerCase();
  if (isNew && !/^[a-z0-9][a-z0-9-]*$/.test(id)) return { error: 'The page address can only use lowercase letters, numbers and dashes.' };
  if (isNew && ['home', 'letter', 'partners', 'shop', 'repairs', 'admin', 'listing', 'repair', 'api', 'assets'].includes(id)) {
    return { error: `"${id}" is already used by another page.` };
  }
  const name = str(m.name, 80);
  if (!name) return { error: 'Name is required.' };
  const kind = KINDS.includes(m.kind) ? m.kind : null;
  if (!kind) return { error: 'Pick guitar or pickup.' };
  const status = STATUSES.includes(m.status) ? m.status : 'available';
  let price = null;
  if (m.base_price_cents !== null && m.base_price_cents !== undefined && m.base_price_cents !== '') {
    price = Math.round(Number(m.base_price_cents));
    if (!Number.isFinite(price) || price < 0) return { error: 'Price must be a positive number.' };
  }
  const story = m.story || {};
  return {
    value: {
      id,
      kind,
      name,
      archetype: str(m.archetype, 80),
      serial_prefix: opt(m.serial_prefix, 40),
      year_label: opt(m.year_label, 40),
      base_price_cents: price,
      finish: opt(m.finish, 200),
      pickups_summary: opt(m.pickups_summary, 300),
      magnet: opt(m.magnet, 200),
      wind: opt(m.wind, 200),
      lede: str(m.lede, 1000),
      blurb: str(m.blurb, 1000),
      story: {
        heading: str(story.heading, 300),
        problem: str(story.problem),
        solution: str(story.solution),
        pull: str(story.pull, 500),
      },
      build_note: opt(m.build_note, 200),
      found_in_model_id: opt(m.found_in_model_id, 40),
      card_image_url: url(m.card_image_url),
      card_image_pos: opt(m.card_image_pos, 40),
      card_headline: opt(m.card_headline, 80),
      card_finish: opt(m.card_finish, 80),
      card_pickups: opt(m.card_pickups, 120),
      card_construction: opt(m.card_construction, 120),
      status,
      sort_order: Number.isFinite(Number(m.sort_order)) ? Math.round(Number(m.sort_order)) : 0,
    },
  };
}

export function cleanImages(list) {
  return (Array.isArray(list) ? list : []).map(i => ({ url: url(i?.url), alt: str(i?.alt, 200), crop_pos: opt(i?.crop_pos, 40) }))
    .filter(i => i.url).slice(0, 40)
    .map((i, n) => ({ ...i, sort_order: n }));
}

export function cleanSwatches(list) {
  const out = [];
  for (const s of Array.isArray(list) ? list : []) {
    const name = str(s?.name, 60);
    const hex = str(s?.hex, 7);
    if (!name && !hex) continue;
    if (!name) return { error: 'Every color needs a name.' };
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return { error: `"${name}" needs a color like #F2B8BC.` };
    out.push({ name, hex: hex.toUpperCase(), price_delta_cents: Math.round(Number(s.price_delta_cents) || 0), sort_order: out.length });
  }
  return { value: out };
}

export function cleanSpecs(list, kind) {
  const sections = SPEC_SECTIONS[kind];
  const out = [];
  for (const s of Array.isArray(list) ? list : []) {
    const label = str(s?.label, 80);
    const value = str(s?.value, 400);
    if (!label && !value) continue;
    if (!sections.includes(s?.section)) continue;
    if (!label || !value) return { error: 'Every spec row needs both a label and a value.' };
    out.push({ section: s.section, label, value, sort_order: out.length });
  }
  return { value: out };
}

export function cleanHero(list) {
  return (Array.isArray(list) ? list : []).map(h => ({
    image_url: url(h?.image_url),
    crop_pos: str(h?.crop_pos, 40) || 'center',
    scale: Math.min(3, Math.max(1, Number(h?.scale) || 1)),
    active: h?.active !== false,
  })).filter(h => h.image_url).slice(0, 40).map((h, n) => ({ ...h, sort_order: n }));
}

export function cleanPartners(list) {
  const out = [];
  for (const p of Array.isArray(list) ? list : []) {
    const name = str(p?.name, 80);
    if (!name) continue;
    out.push({
      name,
      role: str(p?.role, 80),
      logo_url: url(p?.logo_url),
      description: str(p?.description, 2000),
      website_url: /^https?:\/\//.test(str(p?.website_url)) ? str(p.website_url, 500) : null,
      sort_order: out.length,
    });
  }
  return out.slice(0, 40);
}
