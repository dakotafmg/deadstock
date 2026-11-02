import { useEffect, useState } from 'react';
import { PRODUCTS, PICKUPS, LINEUP, HERO_SLIDES, PARTNERS } from './data';

// ============================================================
// SITE CONTENT — model pages, lineup, homepage photos, partners.
//
// Staff edit this in the dashboard (stored in Supabase, served by
// /api/content). data.js is the fallback: the site shows it until the
// first load finishes, and keeps showing it if Supabase is empty or down.
// The last good copy is kept in the browser so return visits don't flash
// old text.
// ============================================================

export const STATIC_CONTENT = {
  models: {
    ...Object.fromEntries(Object.values(PRODUCTS).map(p => [p.id, { ...p, kind: 'guitar' }])),
    ...Object.fromEntries(Object.values(PICKUPS).map(p => [p.id, { ...p, kind: 'pickup' }])),
  },
  lineup: LINEUP,
  hero: HERO_SLIDES,
  partners: PARTNERS,
};

const CACHE_KEY = 'ds_content_v1';

function cached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

let current = cached() || STATIC_CONTENT;
let ready = false;
let request = null;
const listeners = new Set();

function isUsable(c) {
  return c && c.models && Object.keys(c.models).length > 0 && Array.isArray(c.lineup);
}

function load() {
  if (request) return request;
  request = fetch('/api/content')
    .then(r => (r.ok ? r.json() : null))
    .then(data => {
      if (isUsable(data)) {
        current = {
          ...data,
          // Empty lists in Supabase fall back to the built-in ones.
          hero: data.hero?.length ? data.hero : STATIC_CONTENT.hero,
          partners: data.partners?.length ? data.partners : STATIC_CONTENT.partners,
        };
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(current)); } catch { /* private mode */ }
      } else {
        current = STATIC_CONTENT;
      }
    })
    .catch(() => { /* keep whatever we have */ })
    .finally(() => {
      ready = true;
      listeners.forEach(fn => fn());
    });
  return request;
}

// Returns { content, ready }. `ready` turns true once /api/content answered
// (or failed), so pages can tell "not loaded yet" from "doesn't exist".
export function useContent() {
  const [, bump] = useState(0);
  useEffect(() => {
    const fn = () => bump(n => n + 1);
    listeners.add(fn);
    load();
    return () => listeners.delete(fn);
  }, []);
  return { content: current, ready };
}

// Guitars that get their own page at /<id>.
export function isModelPage(content, id) {
  return content.models[id]?.kind === 'guitar';
}

// "The Broad*man.*" → ["The Broad", <em>man.</em>]
export function splitEmphasis(text) {
  return String(text || '').split(/(\*[^*]+\*)/).filter(Boolean).map(part =>
    part.startsWith('*') && part.endsWith('*') ? { em: part.slice(1, -1) } : { text: part });
}
