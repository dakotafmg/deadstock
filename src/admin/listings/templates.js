import { PRODUCTS, PICKUPS } from '../../content/data';

export const MODEL_OPTIONS = ['Broadman', 'Wayfarer', 'Monarch', "'52 Tele Set", "'62 Strat Set", 'PAF Set'];

// Format a specs object into plain text sections
export function formatSpecs(specs, type) {
  const LABELS = {
    body: 'BODY', neck: type === 'guitar' ? 'NECK & FINGERBOARD' : 'NECK PICKUP',
    electronics: 'ELECTRONICS', hardware: 'HARDWARE',
    bridge: 'BRIDGE PICKUP', middle: 'MIDDLE PICKUP',
  };
  return Object.entries(specs)
    .map(([key, rows]) => `${LABELS[key] || key.toUpperCase()}\n${rows.map(r => `${r.k}: ${r.v}`).join('\n')}`)
    .join('\n\n');
}

// Pre-built templates from the product pages in data.js
export const MODEL_TEMPLATES = [
  ...Object.values(PRODUCTS).map(p => ({
    id: p.id,
    label: `The ${p.name}`,
    model: p.name,
    type: 'guitar',
    name: `The ${p.name}`,
    lede: [p.lede, p.finish && `Finish: ${p.finish}.`, p.pickups && `Pickups: ${p.pickups}.`].filter(Boolean).join(' '),
    specs: p.specs,
  })),
  ...Object.values(PICKUPS).map(p => ({
    id: p.id,
    label: p.name,
    model: p.name,
    type: 'pickup',
    name: p.name,
    lede: p.lede,
    specs: p.specs,
  })),
];

// Separates the description from the specs in a listing's text
export const SPECS_SEP = '\n\n— SPECIFICATIONS —\n';
