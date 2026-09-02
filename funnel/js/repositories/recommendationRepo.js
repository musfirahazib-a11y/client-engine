/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   repositories/recommendationRepo.js  ·  STEP 8 — campaign-agnostic

   Matches configured listings (homes / services / products) to
   a lead's stated answers + free-text interest. It ONLY returns
   items from the active campaign's config — never invents a
   name, price, feature or discount. If nothing fits the stated
   budget it says so and returns an empty set.

   Axis answers are resolved through config.qualification
   (question.maps), so the same code works for real estate,
   salon and e-commerce.
=========================================================== */
import { getConfig } from '../services/funnelConfig.js';

/* which config question feeds a scoring axis */
function axisAnswer(cfg, answers, axis) {
  const q = (cfg.qualification.questions || []).find((x) => x.maps === axis);
  return q ? answers[q.key] : undefined;
}

/* "$50–$100" | "Under $500k" | "$1.2M+" | "around $650k" -> { min, max } */
function budgetBand(answer) {
  const s = String(answer || '').toLowerCase().replace(/,/g, '');
  if (!s) return null;
  const scale = (n, u) => (u === 'm' ? n * 1e6 : u === 'k' ? n * 1e3 : n);
  const nums = [...s.matchAll(/\$?\s*(\d+(?:\.\d+)?)\s*(k|m)?/g)].map((m) => scale(parseFloat(m[1]), m[2]));
  if (!nums.length) return null;
  const head = 1.12; // ~12% headroom so a near-miss still surfaces
  if (nums.length >= 2) return { min: Math.min(...nums) * 0.85, max: Math.max(...nums) * head };
  if (/under|below|less than|max/.test(s)) return { min: 0, max: nums[0] * head };
  if (/\+|over|above|plus/.test(s)) return { min: nums[0] * 0.9, max: Infinity };
  return { min: nums[0] * 0.5, max: nums[0] * head };
}

const STOP = new Set(['with', 'that', 'this', 'have', 'want', 'need', 'some', 'from', 'about', 'under', 'over', 'them', 'they', 'gift', 'for']);

function tokens(...parts) {
  return [...new Set(
    parts.join(' ').toLowerCase().match(/[a-z]{3,}/g) || [],
  )].filter((w) => !STOP.has(w));
}

/**
 * match(answers, interest) -> { items:[{ listing, reason }], note }
 */
export function match(answers = {}, interest = '') {
  const cfg = getConfig();
  const listings = cfg.listings || [];
  const budgetAns = axisAnswer(cfg, answers, 'budget');
  const needAns = axisAnswer(cfg, answers, 'need');
  const styleAns = axisAnswer(cfg, answers, 'fit');
  const catAns = axisAnswer(cfg, answers, 'authority');
  const band = budgetBand(budgetAns);
  const words = tokens(interest || '', needAns || '', styleAns || '', catAns || '');

  const scored = listings.map((L) => {
    let s = 1;
    const reasons = [];
    const hay = [L.title, L.category, L.area, (L.tags || []).join(' '), (L.features || []).join(' '), L.blurb]
      .join(' ').toLowerCase();

    if (words.length) {
      const hits = words.filter((w) => hay.includes(w));
      if (hits.length) {
        s += hits.length * 1.6;
        reasons.push(`matches "${hits.slice(0, 3).join(', ')}"`);
      }
    }

    if (band) {
      if (L.price <= band.max && L.price >= band.min * 0.6) {
        s += 4;
        reasons.push(`within your ${budgetAns} budget at ${L.priceLabel || `$${L.price}`}`);
      } else if (L.price <= band.max) {
        s += 2;
        reasons.push(`comfortably under your ${budgetAns} budget`);
      } else {
        s -= 6; // over budget — never recommend
      }
    }

    // category answer nudges its own category
    if (catAns && L.category && String(catAns).toLowerCase().includes(L.category.toLowerCase())) {
      s += 2;
      reasons.push(`in ${L.category.toLowerCase()}, as you asked`);
    }

    return { listing: L, score: s, reason: reasons.length ? cap(reasons.join(' · ')) : L.blurb };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const items = scored.slice(0, 3).map(({ listing, reason }) => ({ listing, reason }));

  if (!items.length) {
    return {
      items: [],
      note: band && band.max < Infinity
        ? `Nothing in the current catalog sits inside a ${budgetAns || 'that'} budget. A human can widen the search.`
        : 'I could not confidently match that yet — a human can take it from here.',
    };
  }
  return { items, note: '' };
}

export function byId(id) {
  return (getConfig().listings || []).find((L) => L.id === id) || null;
}

/* ---------- STEP 9 — active offer ---------- */

export function activeOffer() {
  const cfg = getConfig();
  const nowT = Date.now();
  const offer = (cfg.offers || []).find((o) =>
    o.active
    && (!o.startsAt || new Date(o.startsAt).getTime() <= nowT)
    && (!o.endsAt || new Date(o.endsAt).getTime() >= nowT));
  if (!offer) return null;
  const daysLeft = offer.endsAt ? Math.ceil((new Date(offer.endsAt).getTime() - nowT) / 86400000) : null;
  const expiry = offer.endsAt
    ? new Date(offer.endsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';
  return {
    ...offer,
    daysLeft,
    urgency: (offer.urgencyText || '').replace('{expiry}', expiry),
    expiryLabel: expiry,
  };
}

function cap(s) {
  return String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);
}
