/* ===========================================================
   MusfirahLoom — AI Agent Platform
   repositories/productRepo.js

   The only seam between the agents and the catalog. In Demo
   Mode (DATA_SOURCE 'local') it reads the bundled mock module.
   In Phase 2 (DATA_SOURCE 'api') the load() body swaps to a
   fetch() against a real store API — call sites do not change.
=========================================================== */
import { RUNTIME } from '../config/runtime.config.js';

let _cache = null;

async function load() {
  if (_cache) return _cache;

  if (RUNTIME.DATA_SOURCE === 'api') {
    // Phase 2:
    // const res = await fetch(`${RUNTIME.API_BASE_URL}/v1/products`);
    // _cache = (await res.json()).products;
    throw new Error('productRepo: DATA_SOURCE "api" not wired in Phase 1');
  }

  const mod = await import('../../data/products.js');
  _cache = mod.PRODUCTS || mod.default || [];
  return _cache;
}

const norm = (s) => String(s || '').toLowerCase().trim();

export async function all() {
  return (await load()).slice();
}

export async function get(id) {
  const key = norm(id);
  return (await load()).find((p) => norm(p.id) === key) || null;
}

/**
 * search({ text, maxPrice, minPrice, category, recipient, occasion, style, limit })
 * Loose scoring — every filter is a soft signal, not a hard gate,
 * so a presenter going off-script still gets sensible results.
 */
export async function search(query = {}) {
  const {
    text = '',
    maxPrice = null,
    minPrice = null,
    category = null,
    recipient = null,
    occasion = null,
    style = [],
    limit = 3,
  } = query;

  const words = norm(text).split(/[^a-z0-9]+/).filter((w) => w.length > 2);
  const styles = (Array.isArray(style) ? style : [style]).map(norm).filter(Boolean);
  const products = await load();

  const scored = products
    .map((p) => {
      let score = 0;
      const hay = norm(
        [p.title, p.category, p.blurb, (p.tags || []).join(' '),
          (p.recipient || []).join(' '), (p.occasion || []).join(' '),
          (p.style || []).join(' ')].join(' '),
      );

      words.forEach((w) => { if (hay.includes(w)) score += 2; });
      if (category && norm(p.category) === norm(category)) score += 3;
      if (recipient && (p.recipient || []).some((r) => norm(r) === norm(recipient))) score += 4;
      if (occasion && (p.occasion || []).some((o) => norm(o).includes(norm(occasion)))) score += 3;
      styles.forEach((s) => { if ((p.style || []).some((x) => norm(x) === s)) score += 2; });

      if (maxPrice != null && p.price <= maxPrice) score += 2;
      if (maxPrice != null && p.price > maxPrice) score -= 5;
      if (minPrice != null && p.price >= minPrice) score += 1;

      if (p.stock > 0) score += 0.5;
      score += (Number(p.rating) || 0) * 0.2;

      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  let list = scored.map((x) => x.p);

  // hard cap on price only if the caller was explicit AND we still
  // have enough matches left to be useful
  if (maxPrice != null) {
    const within = list.filter((p) => p.price <= maxPrice);
    if (within.length >= 2) list = within;
  }

  return list.slice(0, limit);
}

export async function related(id, limit = 3) {
  const base = await get(id);
  if (!base) return [];
  const out = [];
  for (const rid of base.related || []) {
    const p = await get(rid);
    if (p) out.push(p);
  }
  if (out.length < limit) {
    const more = await search({ category: base.category, limit: limit + 2 });
    more.forEach((p) => {
      if (p.id !== base.id && !out.find((x) => x.id === p.id)) out.push(p);
    });
  }
  return out.slice(0, limit);
}

/**
 * cheaperAlternatives(ref, { sameCategory })
 * ref can be a product object, an id, or a numeric price ceiling.
 */
export async function cheaperAlternatives(ref, opts = {}) {
  const { sameCategory = true, limit = 3 } = opts;
  let ceiling = null;
  let base = null;

  if (typeof ref === 'number') {
    ceiling = ref;
  } else {
    base = typeof ref === 'string' ? await get(ref) : ref;
    ceiling = base ? base.price : null;
  }
  if (ceiling == null) return [];

  const products = await load();
  return products
    .filter((p) => p.price < ceiling * 0.98)
    .filter((p) => (base && sameCategory ? p.category === base.category : true))
    .filter((p) => (base ? p.id !== base.id : true))
    .sort((a, b) => b.price - a.price || (b.rating || 0) - (a.rating || 0))
    .slice(0, limit);
}
